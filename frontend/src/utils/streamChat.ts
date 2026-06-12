import { getToken } from './request';
import { createSseParser } from './sseParser';

type StreamCallbacks = {
  onToken: (token: string) => void;
  onDone: () => void;
  onError: (err: Error) => void;
  onBeforeRetry?: () => void;
};

async function readSseResponse(
  response: Response,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
) {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('响应内容为空');
  }

  const decoder = new TextDecoder();
  const parser = createSseParser({ onToken, onError });

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      onDone();
      return;
    }

    const shouldContinue = parser.feed(decoder.decode(value, { stream: true }));
    if (!shouldContinue) {
      await reader.cancel();
      return;
    }
  }
}

function startSseStream(
  url: string,
  body: Record<string, unknown>,
  callbacks: StreamCallbacks,
  maxRetries = 2,
): AbortController {
  const controller = new AbortController();

  async function attempt(retryCount: number) {
    const token = getToken();
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { satoken: token } : {}),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      await readSseResponse(response, callbacks.onToken, callbacks.onDone, callbacks.onError);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      if (retryCount < maxRetries) {
        callbacks.onBeforeRetry?.();
        await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
        return attempt(retryCount + 1);
      }
      callbacks.onError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  attempt(0);
  return controller;
}

export function streamChat(
  message: string,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
  onBeforeRetry?: () => void,
  maxRetries = 2,
): AbortController {
  return startSseStream('/api/chat/stream', { message }, { onToken, onDone, onError, onBeforeRetry }, maxRetries);
}

export function streamDeepAnalysis(
  submitId: string,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
  onBeforeRetry?: () => void,
  maxRetries = 2,
): AbortController {
  return startSseStream('/api/chat/analysis/deep', { submitId }, { onToken, onDone, onError, onBeforeRetry }, maxRetries);
}
