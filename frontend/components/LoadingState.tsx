"use client";

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 sm:p-5 animate-pulse">
      <div className="h-3 w-20 bg-white/10 rounded mb-3" />
      <div className="h-6 w-32 bg-white/10 rounded" />
    </div>
  );
}

function SkeletonSector() {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] animate-pulse">
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="h-4 w-36 bg-white/10 rounded" />
        <div className="h-4 w-20 bg-white/10 rounded" />
      </div>
      <div className="border-t border-white/5 px-5 py-3 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-3 w-24 bg-white/10 rounded" />
            <div className="h-3 w-16 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoadingState() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonSector key={i} />
        ))}
      </div>
    </div>
  );
}
