const LoadingState = ({ label = 'Loading...', fullHeight = false }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-slate-500 ${
        fullHeight ? 'min-h-[70vh]' : 'py-16'
      }`}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export default LoadingState
