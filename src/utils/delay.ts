/** Tiny promise-based delay used to simulate network latency in the demo. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
