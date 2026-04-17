export function Header() {
  return (
    <div
      className="animate-fade-in no-print"
      style={{ marginBottom: "2rem", marginTop: "1.5rem", textAlign: "center" }}
    >
      <h1
        className="nomameshi-logo"
        style={{ fontSize: "1.75rem", marginBottom: "0.35rem" }}
      >
        noma<span className="accent">meshi</span>
      </h1>
      <p style={{ color: "var(--secondary)", fontSize: "0.85rem", letterSpacing: "0.02em" }}>
        Your local meal companion
      </p>
    </div>
  );
}
