function About() {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        textAlign: "center",
        color: "#0A382B",
        padding: "20px",
      }}
    >
      <h2 style={{ fontWeight: "bold", marginBottom: "10px" }}>
        <i className="bi bi-info-circle-fill me-2"></i>
        About This App
      </h2>

      <p style={{ fontSize: "16px", maxWidth: "600px", marginBottom: "20px" }}>
        This is an Expense Management System that helps you track your daily spending.
        You can add expenses, view reports, manage categories, and get alerts when you overspend.
        It is designed to make your financial tracking simple and organized.
      </p>

      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          height: "300px",
          border: "2px dashed #0A382B",
          borderRadius: "12px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <i className="bi bi-play-circle" style={{ fontSize: "40px" }}></i>
        <span style={{ marginLeft: "10px" }}>App Demo Video Coming Soon</span>
      </div>

      <p style={{ fontStyle: "italic", opacity: 0.7 }}>
        <i className="bi bi-rocket-takeoff me-1"></i>
        Built to help you control your expenses better
      </p>
    </div>
  );
}

export default About;