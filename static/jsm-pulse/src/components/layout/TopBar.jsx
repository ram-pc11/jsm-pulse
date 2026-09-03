const TopBar = () => {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-2">
        <img src="/icons/jsm-pulse.svg" alt="JSM Pulse" className="h-8 w-8" />
        <span className="text-base font-semibold text-black">Service Management Lens</span>
      </div>
    </header>
  )
}

export default TopBar
