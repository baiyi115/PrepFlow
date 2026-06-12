interface SseParserOptions {
  onToken: (token: string) => void;
  onError: (error: Error) => void;
}

export interface SseParser {
  feed: (chunk: string) => boolean;
}

export function createSseParser({ onToken, onError }: SseParserOptions): SseParser {
  let buffer = '';
  let eventName = '';
  let stopped = false;

  function handleLine(rawLine: string) {
    const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;

    if (line === '') {
      eventName = '';
      return;
    }

    if (line.startsWith('event:')) {
      eventName = line.slice(6).trimStart();
      return;
    }

    if (!line.startsWith('data:')) {
      return;
    }

    const data = line.slice(5).replace(/^ /, '');
    if (eventName === 'error') {
      stopped = true;
      onError(new Error(data));
      return;
    }

    onToken(data);
  }

  return {
    feed(chunk: string) {
      if (stopped) {
        return false;
      }

      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        handleLine(line);
        if (stopped) {
          return false;
        }
      }

      return true;
    },
  };
}
