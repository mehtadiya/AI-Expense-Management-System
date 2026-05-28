import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ExpensesCard from "./expenses_card";
import Swal from "sweetalert2";
import api from "../api/api";
import "./expense.css"

function Expense() {
    const [expenses, setExpense] = useState([]);
    const [category, setCategory] = useState([]);

    //see category.js
    useEffect(() => {
        api.get("/categories")
            .then(res => setCategory(res.data))
            .catch((err) => console.error("Error fetching categories:", err));

    }, []);

    const fetchExpenses = (category = "") => {
        const url = category
            ? `/expenses?category=${encodeURIComponent(category)}`//encodeURIComponent will convert special characters into URL-safe format. "Food & drinks"
            : `/expenses`;

        api.get(url)
            .then(res => {
                setExpense(res.data);

            })
            .catch(err => console.error("Error fetching expenses:", err));
    };



    useEffect(() => {
        fetchExpenses("")
    }, [])

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

    return (
        <>
            <div className="container-fluid py-3">
                <div className="row">
                    <div className="col-9">
                        <h2 className="fw-bolder" style={{ color: "#0A382B" }}>
                            Your Expenses
                        </h2>
                    </div>
                    <div className="col  d-flex justify-content-end me-1 align-items-center" >
                        <Link to={`/main/addExpense`}>
  <button
    type="button"
    className="btn btn-success add-expense-btn"
  >
    <i className="bi bi-plus-circle"></i>
    <span className="add-btn-text ms-2">Add Expense</span>
  </button>
</Link>
                    </div>
                </div>

                <div className="row">
                    <ExpensesCard fetchExpenses={fetchExpenses} />
                </div>

                <div className="row">
                    <div className="table-responsive pe-4" style={{
                        height: "40vh",
                        width: "100%",
                        borderRadius: "40px"

                    }}>
                        <table className="table align-middle " style={{ borderRadius: "40px" }}>
                            <thead
                                className="sticky-top"
                                style={{ borderBottom: "2px solid #e9ecef" }}

                            >
                                <tr style={{ backgroundColor: "#48BB78" }}>
                                    <th scope="col" style={{ color: "#0A382B", backgroundColor: "#C6F6D5" }}>Category</th>
                                    <th scope="col" style={{ color: "#0A382B", backgroundColor: "#C6F6D5" }}>Note</th>
                                    <th scope="col" style={{ color: "#0A382B", backgroundColor: "#C6F6D5" }}>Amount</th>
                                    <th scope="col" style={{ color: "#0A382B", backgroundColor: "#C6F6D5" }}>Date</th>
                                    <th scope="col" style={{ color: "#0A382B", backgroundColor: "#C6F6D5" }}>Edit</th>
                                    <th scope="col" style={{ color: "#0A382B", backgroundColor: "#C6F6D5" }}>Delete</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.length == 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 fw-semibold text-muted">
                                            No Results Found
                                        </td>
                                    </tr>
                                ) : (expenses.map((data) => (
                                    <tr>
                                        <td>
                                            <i className={`${data.icon?.trim()} fs-5 me-2`}
                                                style={{ color: `${getColor(data.icon?.trim())}` }}
                                            ></i>{data.category}

                                        </td>
                                        <td style={{ color: "#0A382B" }}>{data.note}</td>
                                        <td className="fw-semibold text-danger">Rs.{data.expenseAmount}</td>
                                        <td style={{ color: "#0A382B" }}>{new Date(data.expenseDate).toISOString().split("T")[0]}</td>
                                        <td style={{ color: "#0A382B" }}>
                                            <button
                                                className="btn btn-sm btn-outline-warning me-2"
                                                title="Edit"
                                                onClick={() => {
                                                    const categoryOptions = category.map(
                                                            (cat) => `
                                                                <option value="${cat.categoryID}" ${cat.categoryID === data.categoryID ? "selected" : ""}>
                                                                ${cat.category}
                                                                </option>`
                                                        )
                                                        .join("");

           
                                                    Swal.fire({
  title: "Edit Expense",
  customClass: {
    popup: "swal-popup",
    title: "swal-title",
    htmlContainer: "swal-html",
    confirmButton: "swal-confirm-btn",
    cancelButton: "swal-cancel-btn",
  },
  html: `
    <div class="container-fluid">
      <div class="row mb-3 align-items-center">
        <div class="col-4"><b>Category</b></div>
        <div class="col">
          <select id="category" class="form-select swal-select-custom">
            ${categoryOptions}
          </select>
        </div>
      </div>

      <div class="row mb-3 align-items-center">
        <div class="col-4"><b>Note</b></div>
        <div class="col">
          <input id="note" class="form-control swal-input-custom" value="${data.note || ""}">
        </div>
      </div>

      <div class="row mb-3 align-items-center">
        <div class="col-4"><b>Amount</b></div>
        <div class="col">
          <input id="amount" type="number" class="form-control swal-input-custom" value="${data.expenseAmount}">
        </div>
      </div>

      <div class="row mb-2 align-items-center">
        <div class="col-4"><b>Date</b></div>
        <div class="col">
          <input
            id="date"
            type="date"
            class="form-control swal-input-custom"
            value="${new Date(data.expenseDate).toISOString().split("T")[0]}"
          >
        </div>
      </div>
    </div>
  `,
  showCancelButton: true,
  confirmButtonText: "Update",
  focusConfirm: false,
  preConfirm: () => {
    const categoryID = document.getElementById("category").value;
    const note = document.getElementById("note").value;
    const expenseAmount = document.getElementById("amount").value;
    const expenseDate = document.getElementById("date").value;

    if (!categoryID || !note || !expenseAmount || !expenseDate) {
      Swal.showValidationMessage("Please fill all fields");
      return false;
    }

    return { categoryID, note, expenseAmount, expenseDate };
  },
}).then(async (result) => {

                                                        if (!result.isConfirmed) return;

                                                        try {
                                                            const updatedExpense = result.value;
                                                            await api.put(
                                                                `/expense/${data.expenseID}`, {
                                                                categoryID: updatedExpense.categoryID,
                                                                note: updatedExpense.note,
                                                                expenseAmount: updatedExpense.expenseAmount,
                                                                expenseDate: updatedExpense.expenseDate
                                                            }
                                                            );

                                                            Swal.fire("Updated!", "Expense updated successfully!", "success");

                                                            setExpense((prev) =>
                                                                prev.map((e) =>
                                                                    e.expenseID === data.expenseID
                                                                        ? { ...e, ...updatedExpense }
                                                                        : e
                                                                )
                                                            );

                                                        } catch (err) {
                                                            console.error("Error updating expense:", err);
                                                            Swal.fire("Error", "Server error occurred", "error");
                                                        }
                                                    });
                                                }}
                                            >
                                                <i className="bi bi-pencil-square"></i>
                                            </button>


                                        </td>

                                        <td style={{ color: "#0A382B" }}>
                                            <button
                                                onClick={() => {
                                                    Swal.fire({
                                                        title: "Are you sure?",
                                                        text: "This expense will be permanently deleted!",
                                                        icon: "warning",
                                                        showCancelButton: true,
                                                        confirmButtonColor: "#d33",
                                                        cancelButtonColor: "#3085d6",
                                                        confirmButtonText: "Yes, delete it!",
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            api.delete(`/expenses/${data.expenseID}`)
                                                                .then(() => {
                                                                    Swal.fire({
                                                                        title: "Deleted!",
                                                                        text: "Expense deleted successfully.",
                                                                        icon: "success",

                                                                    });
                                                                    setExpense(prev =>
                                                                        prev.filter(e => e.expenseID !== data.expenseID)
                                                                    );
                                                                })
                                                                .catch((err) => {
                                                                    console.error("Error deleting expense:", err);
                                                                    Swal.fire("Error", "Server error occurred.", "error");
                                                                });
                                                        }
                                                    });
                                                }}
                                                className="btn btn-sm btn-outline-danger"
                                                title="Delete"
                                            >
                                                <i className="bi bi-trash3"></i>
                                            </button>

                                        </td>

                                    </tr>
                                )))}



                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Expense;

