export function Header() {
  return (
    <div
      className="animate-fade-in no-print"
      style={{ marginBottom: "2rem", marginTop: "1.5rem", textAlign: "center" }}
    >
      <h1
        className="nomameshi-logo"
        style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}
      >
        noma<span className="accent">meshi</span>
      </h1>
      <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem" }}>
        Your local meal companion
      </p>
    </div>
  );
}
