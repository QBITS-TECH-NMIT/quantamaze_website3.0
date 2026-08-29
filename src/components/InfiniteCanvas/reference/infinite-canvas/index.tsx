import * as React from "react";

const LazyInfiniteCanvasScene = React.lazy(() => import("./scene").then((mod) => ({ default: mod.InfiniteCanvasScene })));

export function InfiniteCanvas(props: React.ComponentProps<typeof LazyInfiniteCanvasScene>) {
  return (
    <React.Suspense fallback={null}>
      <LazyInfiniteCanvasScene {...props} />
    </React.Suspense>
  );
}
