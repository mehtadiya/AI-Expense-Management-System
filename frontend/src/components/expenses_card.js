import React, { useEffect, useState } from "react";
import api from "../api/api";

function ExpensesCard({ fetchExpenses }) {
  const [categories, setCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const getColor = (icon) => {
    const colorMap = {
      "bi bi-cup-hot-fill": "#ffc107",
      "bi bi-bus-front-fill": "#dc3545",
      "bi bi-bag-fill": "#198754",
      "bi bi-heart-pulse-fill": "#dc3545",
      "bi bi-controller": "#0d6efd",
      "bi bi-cash-stack": "#198754",
      "bi bi-airplane-engines-fill": "#0dcaf0",
      "bi bi-basket-fill": "#ffc107",
      "bi bi-journal-bookmark-fill": "#6c757d",
      "bi bi-three-dots": "#212529",
    };

    return colorMap[icon] || "#198754";
  };

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategory(res.data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  return (
    <div className="container-fluid mt-3 mb-3 px-1">
      <div className="row g-2">
        <div className="col-6 col-md-4 col-lg-3">
          <div
            onClick={() => {
              setSelectedCategory("");
              fetchExpenses("");
            }}
            className="card text-center shadow-sm expense-card"
            style={{
              cursor: "pointer",
              border:
                selectedCategory === ""
                  ? "2px solid red"
                  : "1px solid transparent",
            }}
          >
            <div
              className="icon-wrapper mx-auto"
              style={{
                border: "1px solid red",
              }}
            >
              <i
                className="bi bi-three-dots"
                style={{
                  color: "red",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                }}
              ></i>
            </div>

            <h6 className="fw-semibold mb-0" style={{ color: "#0A382B" }}>
              All
            </h6>
          </div>
        </div>

        {categories.length > 0 ? (
          categories.map((data) => (
<div className="col-6 col-md-4 col-lg-3" key={data.categoryID}>              <div
                onClick={() => {
                  setSelectedCategory(data.category);
                  fetchExpenses(data.category);
                }}
                className="card text-center shadow-sm expense-card"
                style={{
                  cursor: "pointer",
                  border:
                    selectedCategory === data.category
                      ? `2px solid ${getColor(data.icon)}`
                      : "1px solid transparent",
                }}
              >
                <div
                  className="icon-wrapper mx-auto"
                  style={{
                    border: `1px solid ${getColor(data.icon)}`,
                  }}
                >
                  <i
                    className={data.icon}
                    style={{
                      color: getColor(data.icon),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                    }}
                  ></i>
                </div>

                <h6 className="fw-semibold mb-0" style={{ color: "#0A382B" }}>
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