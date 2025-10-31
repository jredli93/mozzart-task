export default function LoaderSkeleton() {
  return (
    <div className="bg-[#1e253b] border border-white/10 rounded-xl p-4 space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="h-3 w-1/3 rounded bg-[#2a314b]" />
        <div className="h-3 w-10 rounded bg-[#2a314b]" />
      </div>
      <div className="h-4 w-3/4 rounded bg-[#2a314b]" />
      <div className="h-4 w-2/3 rounded bg-[#2a314b]" />
      <div className="flex justify-between mt-3">
        <div className="h-3 w-1/4 rounded bg-[#2a314b]" />
        <div className="h-3 w-1/5 rounded bg-[#2a314b]" />
      </div>
    </div>
  );
}
