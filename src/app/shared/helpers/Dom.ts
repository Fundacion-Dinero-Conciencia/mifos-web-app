type InfiniteScrollOptions = {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
};

export function createInfiniteScroll(
  element: Element,
  callback: () => void | Promise<void>,
  options: InfiniteScrollOptions = {}
) {
  let isLoading = false;

  const observer = new IntersectionObserver(
    async ([entry]) => {
      if (!entry.isIntersecting) return;
      if (isLoading) return;

      isLoading = true;

      try {
        await callback();
      } finally {
        isLoading = false;
      }
    },
    {
      root: options.root || null,
      rootMargin: options.rootMargin || '0px',
      threshold: options.threshold ?? 1.0
    }
  );

  observer.observe(element);

  return {
    disconnect: () => observer.disconnect(),
    observe: () => observer.observe(element),
    unobserve: () => observer.unobserve(element)
  };
}
