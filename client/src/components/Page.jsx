export default function Page({ title, desc, children }) {
  return (
    <div className="page-content">

      {(title || desc) && (
        <div className="page-header">
          {title && <h1 className="page-title">{title}</h1>}
          {desc && <p className="page-desc">{desc}</p>}
        </div>
      )}

      <div className="page-inner">
        {children}
      </div>

    </div>
  );
}