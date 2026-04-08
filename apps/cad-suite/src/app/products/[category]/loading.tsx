export default function Loading() {
  return (
    <div className="w-full bg-hover min-h-screen">
      {/* Hero skeleton */}
      <div className="w-full h-[50vh] min-h-[400px] bg-hover animate-pulse" />
      {/* Toolbar skeleton */}
      <div className="container px-6 2xl:px-0 py-5 border-b border-soft bg-panel">
        <div className="h-10 w-full max-w-lg bg-hover animate-pulse rounded-sm" />
      </div>
      {/* Grid skeleton */}
      <div className="container px-6 2xl:px-0 py-8 flex gap-8">
        {/* Sidebar */}
        <div className="hidden lg:block w-56 shrink-0">
          <div className="bg-panel border border-soft rounded-sm p-5 space-y-3">
            <div className="h-3 w-20 bg-hover animate-pulse rounded" />
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-8 bg-hover animate-pulse rounded-sm"
              />
            ))}
          </div>
        </div>
        {/* Product cards */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-px bg-hover">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-panel">
              <div className="aspect-square bg-hover animate-pulse" />
              <div className="px-4 pt-3 pb-5 space-y-2">
                <div className="h-2 w-16 bg-hover animate-pulse rounded" />
                <div className="h-4 w-28 bg-hover animate-pulse rounded" />
                <div className="h-3 w-full bg-hover animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

