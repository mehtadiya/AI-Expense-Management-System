function Reports() {
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
        <i className="bi bi-bar-chart-line-fill me-2"></i>
        Reports Section
      </h2>

      <p style={{ fontSize: "16px", maxWidth: "500px" }}>
        Here you will find detailed insights of your expenses.
        Charts, analytics, and visual breakdowns will be available here
        to help you understand your spending patterns better.
      </p>

      <p style={{ marginTop: "10px", fontStyle: "italic", opacity: 0.7 }}>
        <i className="bi bi-clock-history me-1"></i>
        More features coming soon...
      </p>
    </div>
  );
}

export default Reports;