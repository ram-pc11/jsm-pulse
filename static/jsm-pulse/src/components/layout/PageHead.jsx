const PageHead = ({ title, description }) => {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-semibold text-black">{title}</h1>
      {description && <p className="mt-1 text-sm text-black">{description}</p>}
    </div>
  )
}

export default PageHead
