export function Slop(props) {
  return (
    <div>
      <h1>Title</h1>
      <h3>Skipped</h3>
      <div className="card">
        <div className="card">Nested</div>
      </div>
      <button className="btn" type="button">
        On
      </button>
      <button className="btn" type="button" disabled>
        Off
      </button>
    </div>
  );
}
