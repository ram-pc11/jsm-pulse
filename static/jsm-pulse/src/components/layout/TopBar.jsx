const TopBar = () => {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        <span className="text-sm font-semibold text-slate-800">JSM Pulse</span>
      </div>
    </header>
  )
}

export default TopBar
