function Alerts() {
  return (
    <div
      style={{
        height: "70vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        textAlign: "center",
        color: "#0A382B",
      }}
    >
      <h2 style={{ fontWeight: "bold", marginBottom: "10px" }}>
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        Alerts Section
      </h2>

      <p style={{ fontSize: "16px", maxWidth: "500px" }}>
        This section will notify you when your spending exceeds your budget limit.
        You will receive alerts for high expenses and unusual spending activity
        to help you stay financially aware.
      </p>

      <p style={{ marginTop: "10px", fontStyle: "italic", opacity: 0.7 }}>
        <i className="bi bi-shield-exclamation me-1"></i>
        Smart spending alerts will appear here
      </p>
    </div>
  );
}

export default Alerts;