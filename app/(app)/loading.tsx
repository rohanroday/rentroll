export default function Loading() {
  return (
    <div className="content" role="status" aria-label="Loading">
      <div className="skeleton" style={{ width: 200, height: 32, marginBottom: 20 }} />
      <div className="kpis">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton skeleton-kpi" />)}
      </div>
      <div className="skeleton" style={{ height: 240, marginTop: 16 }} />
    </div>
  );
}
