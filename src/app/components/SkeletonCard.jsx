export default function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border shadow p-4 bg-white space-y-4">
      <div className="h-32 bg-gray-200 rounded" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-full" />
    </div>
  );
}
