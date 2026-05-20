import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";



function ExpensesCard({ fetchExpenses }) {
  const [categories, setCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const getColor = (icon) => {
    const colorMap = {
      "bi bi-cup-hot-fill": "#ffc107",     // warning
      "bi bi-bus-front-fill": "#dc3545",   // danger
      "bi bi-bag-fill": "#198754",         // success
      "bi bi-heart-pulse-fill": "#dc3545", // danger
      "bi bi-controller": "#0d6efd",       // primary
      "bi bi-cash-stack": "#198754",       // success
      "bi bi-airplane-engines-fill": "#0dcaf0", // info
      "bi bi-basket-fill": "#ffc107",      // warning
      "bi bi-journal-bookmark-fill": "#6c757d", // secondary
      "bi bi-three-dots": "#212529",       // dark
    };
    return colorMap[icon] || "#198754"; // default: green
  };

  useEffect(() => {
    api.get("/categories")
      .then(res => setCategory(res.data))
      .catch((err) => console.error("Error fetching categories:", err));

  }, []);

  return (
    <div className="container mt-4 mb-4">
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-4">

        {/* --- ALL CATEGORY CARD --- */}
        <div className="col">
          <div
            onClick={() => {
              setSelectedCategory("");
              fetchExpenses("")
            }}
            className="card text-center shadow-sm  p-4"
            style={{
              borderRadius: "20px",
              backgroundColor: "white",
              transition: "all 0.3s ease",
              cursor: "pointer",
              border:
                selectedCategory === ""
                  ? "2px solid red"
                  : "1px solid transparent",
            }}
          >
            <div
              className="icon-wrapper mx-auto mb-3 d-flex justify-content-center align-items-center"
              style={{
                backgroundColor: "white",
                border: "1px solid red",
                borderRadius: "50%",
                width: "60px",
                height: "60px",
                fontSize: "24px",
              }}
            >
              <i className="bi bi-three-dots" style={{ color: "red" }}></i>
            </div>
            <h6 className="fw-semibold" style={{ color: "#0A382B" }}>
              All
            </h6>
          </div>
        </div>

        {/* --- CATEGORY CARDS --- */}
        {categories.length > 0 ?
          (
            categories.map((data) => (
              <div className="col" key={data.categoryID}>
                <div
                  onClick={() => {
                    setSelectedCategory(data.category)
                    fetchExpenses(data.category)
                  }}
                  className="card text-center shadow-sm  p-4"
                  style={{
                    borderRadius: "20px",
                    backgroundColor: "white",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    border:
                      selectedCategory === data.category
                        ? `2px solid ${getColor(data.icon)}`
                        : "1px solid transparent",
                  }}
                >
                  <div
                    className="icon-wrapper mx-auto mb-3 d-flex justify-content-center align-items-center"
                    style={{
                      backgroundColor: "white",
                      border: `1px solid ${getColor(data.icon)}`,
                      borderRadius: "50%",
                      width: "60px",
                      height: "60px",
                      fontSize: "24px",
                    }}
                  >
                    <i
                      className={data.icon}
                      style={{ color: getColor(data.icon) }}
                    ></i>
                  </div>
                  <h6 className="fw-semibold" style={{ color: "#0A382B" }}>
                    {data.category}
                  </h6>
                </div>
              </div>
            ))
          ) : (
            <p>No result found</p>
          )}

      </div>
    </div>
  );
}

export default ExpensesCard;
