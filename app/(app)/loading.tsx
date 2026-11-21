export default function Loading() {
  return (
    <div role="status" aria-label="Loading">
      <div className="board-head">
        <div className="board-head-in">
          <div className="skeleton skeleton-on-green" style={{ width: 110, height: 20 }} />
          <div className="skeleton skeleton-on-green" style={{ width: 190, height: 42, marginTop: 28 }} />
          <div className="skeleton skeleton-on-green" style={{ height: 8, marginTop: 20 }} />
        </div>
      </div>
      <div className="content">
        <div className="plates">
          {Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton skeleton-plate" />)}
        </div>
      </div>
    </div>
  );
}
