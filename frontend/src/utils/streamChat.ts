export function streamChat(
  message: string,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
  onBeforeRetry?: () => void,
  maxRetries = 2,
): AbortController {
  const controller = new AbortController();

  async function attempt(retryCount: number) {
    const token = localStorage.getItem('satoken');
    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { satoken: token } : {}),
        },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) { onDone(); return; }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data:')) {
            onToken(line.slice(5).replace(/^ /, ''));
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      if (retryCount < maxRetries) {
        onBeforeRetry?.();
        await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
        return attempt(retryCount + 1);
      }
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  attempt(0);
  return controller;
}

export function streamDeepAnalysis(
  submitId: string,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
  onBeforeRetry?: () => void,
  maxRetries = 2,
): AbortController {
  const controller = new AbortController();

  async function attempt(retryCount: number) {
    const token = localStorage.getItem('satoken');
    try {
      const response = await fetch('/api/chat/analysis/deep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { satoken: token } : {}),
        },
        body: JSON.stringify({ submitId }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) { onDone(); return; }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data:')) {
            onToken(line.slice(5).replace(/^ /, ''));
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      if (retryCount < maxRetries) {
        onBeforeRetry?.();
        await new Promise(r => setTimeout(r, 1000 * (retryCount + 1)));
        return attempt(retryCount + 1);
      }
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }

  attempt(0);
  return controller;
}
