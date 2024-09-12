export function createConcurrencyLimiter(limit: number) {
  const queue: (() => void)[] = [];
  let runningCount = 0;

  return async function run<T>(fn: () => Promise<T>): Promise<T> {
    if (runningCount >= limit) {
      await new Promise<void>((resolve) => queue.push(resolve));
    }
    runningCount++;
    try {
      return await fn();
    } finally {
      runningCount--;
      if (queue.length > 0) {
        const next = queue.shift();
        next!();
      }
    }
  };
}
