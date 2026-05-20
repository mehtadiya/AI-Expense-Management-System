import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/api";

function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [totalExpense, setTotalExpense] = useState([]);
  const { userID } = useParams();

  // FETCH BUDGETS
  useEffect(() => {
    api.get("/budgets")
      .then(res => setBudgets(res.data))
      .catch(err => console.log(err));
  }, []);

  // FETCH TOTAL EXPENSE
  useEffect(() => {
    api.get(`/budgets/totalExpense/${userID}`)
      .then(res => setTotalExpense(res.data))
      .catch(err => console.log(err));
  }, [userID]);

  // ADD BUDGET
  const handleAddBudget = () => {
    Swal.fire({
      title: "Add Budget",
      html: `
        <input id="amountLimit" class="form-control mb-2" placeholder="Amount Limit">

        <input id="fromDate" type="date" class="form-control mb-2">

        <input id="toDate" type="date" class="form-control">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Add",

      preConfirm: () => {
        const amountLimit = document.getElementById("amountLimit").value;
        const fromDate = document.getElementById("fromDate").value;
        const toDate = document.getElementById("toDate").value;

        if (!amountLimit || !fromDate || !toDate) {
          Swal.showValidationMessage("Please fill all fields");
          return false;
        }

        if (new Date(fromDate) > new Date(toDate)) {
          Swal.showValidationMessage("From Date cannot be after To Date");
          return false;
        }

        return { amountLimit, fromDate, toDate };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.post("/budgets/add", result.value);

          Swal.fire("Success", "Budget added successfully", "success")
            .then(() => window.location.reload());

        } catch (err) {
          console.log(err);
          Swal.fire("Error", "Failed to add budget", "error");
        }
      }
    });
  };

  return (
    <div className="container-fluid">

      {/* HEADER */}
      <div className="row mt-3">
        <div className="col-8">
          <h2 className="fw-bolder" style={{ color: "#0A382B" }}>
            Budget Management
          </h2>
          <p style={{ color: "#6c757d" }}>
            Track your spending against category budgets
          </p>
        </div>

        <div className="col d-flex justify-content-end align-items-center">
          <button
            className="btn"
            style={{ backgroundColor: "#0A382B", color: "white" }}
            onClick={handleAddBudget}
          >
            Add Budget
          </button>
        </div>
      </div>

      {/* BUDGET CARDS */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-4 mt-1">

        {budgets.map((data) => {

          const total =
            totalExpense.find(t => t.categoryID === data.categoryID)?.total || 0;

          const isOver = total > data.amountLimit;

          return (
            <div className="col p-2 m-2" key={data.budgetid}>

              <div
                className="card text-center shadow-sm border-0 p-4"
                style={{
                  borderRadius: "20px",
                  backgroundColor: "white"
                }}
              >

                {/* ICON */}
                <div
                  className="mx-auto mb-3 d-flex justify-content-center align-items-center"
                  style={{
                    backgroundColor: "white",
                    borderRadius: "50%",
                    width: "60px",
                    height: "60px",
                    fontSize: "24px",
                    border: "1px solid #0A382B"
                  }}
                >
                  <i className="bi bi-wallet2" style={{ color: "#0A382B" }}></i>
                </div>

                {/* CATEGORY ID (you can replace with category name if joined) */}
                <h6 className="fw-semibold" style={{ color: "#0A382B" }}>
                  Category {data.categoryID}
                </h6>

                {/* AMOUNT */}
                <div className="d-flex justify-content-center gap-2 mt-2">
                  <div
                    style={{
                      color: isOver ? "red" : "#0A382B",
                      fontWeight: "bold"
                    }}
                  >
                    ₹{total}
                  </div>

                  <div style={{ color: "#0A382B" }}>
                    / ₹{data.amountLimit}
                  </div>
                </div>

                {/* DATE RANGE */}
                <small style={{ opacity: 0.6 }}>
                  {new Date(data.fromdate).toLocaleDateString()} -{" "}
                  {new Date(data.todate).toLocaleDateString()}
                </small>

              </div>
            </div>
          );
        })}

      </div>

    </div>
  );
}

export default Budget;