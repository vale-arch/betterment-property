export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-[#F5EFFF] border-t-[#7B2CBF] rounded-full animate-spin"></div>
      <p className="text-[#2D004F] font-bold text-xs tracking-widest uppercase animate-pulse">
        Synchronizing with Betterment...
      </p>
    </div>
  )
}