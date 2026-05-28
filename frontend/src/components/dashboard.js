import React, { useEffect, useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import ExpensesCard from "./expenses_card";
import Calendar from "./calender";
import { useParams } from "react-router-dom";
import api from "../api/api";
import "./dashboard.css";

function Dashboard() {
    const [categories, setCategories] = useState([]);
    const [categoriesBudget, setCategoriesBudget] = useState([]);
    const [expenses, setExpense] = useState([]);
    const [expenseData, setExpenseData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());


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

    //see category.js
    useEffect(() => {
        api.get("/categories")
            .then(res => setCategories(res.data))
            .catch((err) => console.error("Error fetching categories:", err));
    }, []);

    //see category.js
    useEffect(() => {
        api.get("/categoriesBudgets")
            .then(res => setCategoriesBudget(res.data))
            .catch((err) => console.error("Error fetching categories:", err));
    }, []);

    //see expense.js
    useEffect(() => {
        api.get("/expenseData")
            .then(res => setExpenseData(res.data))
    }, [])



    //see expense.js
    useEffect(() => {
        api.get("/recentExpenses")
            .then(res => setExpense(res.data))
    }, [])



    const filteredExpenseData = expenseData.filter((data) => {
        const expenseDate = new Date(data.expenseDate);

        return (

            expenseDate.getMonth() === selectedDate.getMonth() &&
            expenseDate.getFullYear() === selectedDate.getFullYear()
        );
    });

    //category wise final expense
    const expenseMap = filteredExpenseData.reduce((acc, curr) => {
        acc[curr.categoryID] =
            (acc[curr.categoryID] || 0) + Number(curr.expenseAmount);
        return acc;
    }, {});

    const newCategoryData = categoriesBudget.filter((data) => {
        const from = new Date(data.fromDate);
        const to = new Date(data.toDate);

        return (
            from.getMonth() === selectedDate.getMonth() &&
            from.getFullYear() === selectedDate.getFullYear() &&
            to.getMonth() === selectedDate.getMonth() &&
            to.getFullYear() === selectedDate.getFullYear()
        );
    });


    const limitMap = newCategoryData.reduce((acc, curr) => {
        acc[curr.categoryID] = Number(curr.amountLimit);
        return acc;
    }, {});


    const totalExpense = filteredExpenseData.reduce((sum, val) => {
        return sum + Number(val.expenseAmount);
    }, 0);

    const monthlyBudget = newCategoryData.find(
        (b) => b.categoryID === null
    );

    const totalBudget = monthlyBudget
        ? Number(monthlyBudget.amountLimit)
        : newCategoryData.reduce(
            (sum, b) => sum + Number(b.amountLimit || 0),
            0
        );

    const remaining = totalBudget - totalExpense;


    return (
        <div className="container-fluid py-3">
            {/* HEADER */}
            <div className="row mb-4">
                <div className="col">
                    <h2 className="fw-bolder dashboard-title" style={{ color: "#0A382B" }}>
                        Dashboard
                    </h2>
                    <p className="text-muted mb-0">
                        Track your expenses and manage your budget easily.
                    </p>
                </div>
            </div>

            {/* SUMMARY CARDS */}
            <div className="row g-2 mb-4">

                <div className="col-4">
                    <div className="card summary-card border-0 shadow-sm text-center p-2">
                        <div className="fs-6 text-secondary">Budget</div>
                        <h6 className="fw-bold text-success mt-1">
                            ₹{totalBudget.toLocaleString("en-IN")}
                        </h6>
                    </div>
                </div>

                <div className="col-4">
                    <div className="card summary-card border-0 shadow-sm text-center p-2">
                        <div className="fs-6 text-secondary">Expenses</div>
                        <h6 className="fw-bold text-danger mt-1">
                            ₹{totalExpense.toLocaleString("en-IN")}
                        </h6>
                    </div>
                </div>

                <div className="col-4">
                    <div className="card summary-card border-0 shadow-sm text-center p-2">
                        <div className="fs-6 text-secondary">Remaining</div>
                        <h6 className="fw-bold text-primary mt-1">
                            ₹{remaining.toLocaleString("en-IN")}
                        </h6>
                    </div>
                </div>

            </div>


            <div className="row g-3 mb-4 dashboard-section">
                {/* BUDGET OVERVIEW CARD */}
                <div
                    className="col-12 col-lg-9 budget-card"
                    style={{
                        height: "370px",
                    }}
                >                    <div
                    className="card shadow-sm ps-4 pt-4 pb-4 pe-2 border-0"
                    style={{ borderRadius: "20px", color: "#0A382B", height: "100%" }}
                >
                        <h5 className="fw-bold mb-4">Budget Overview</h5>

                        <div className="pe-3 " style={{
                            borderRadius: "20px",
                            color: "#0A382B",
                            height: "80%",
                            width: "99%",
                            overflowY: "auto",

                            scrollbarWidth: "thin",

                        }}>
                            {categories.length > 0 ? (
                                categories.map((data, index) => {

                                    const spent = expenseMap[data.categoryID] || 0;
                                    const limit = limitMap[data.categoryID] || 0;

                                    const percent = limit > 0
                                        ? Math.min((spent / limit) * 100, 100)
                                        : 0;

                                    return (
                                        <div className="mb-4" key={index}>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <div className="d-flex align-items-center">
                                                    <i
                                                        className={`${data.icon} fs-5 me-2`}
                                                        style={{ color: getColor(data.icon) }}
                                                    ></i>
                                                    <span className="fw-semibold">{data.category}</span>
                                                </div>

                                                <span className="text-muted small fw-semibold pe-1">
                                                    ₹{spent} / ₹{limit}
                                                </span>
                                            </div>

                                            <div className="progress" style={{ height: "6px" }}>
                                                <div
                                                    className="progress-bar"
                                                    role="progressbar"
                                                    style={{
                                                        width: `${percent}%`,
                                                        backgroundColor: getColor(data.icon),
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-muted">No categories found</p>
                            )}



                        </div>



                    </div>
                </div>

                {/* CALENDER */}
                <div
  className="col-12 col-lg-3 calendar-card"
  style={{
    height: "370px",
  }}
>
                    <Calendar
                        initialDate={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                    />

                </div>

            </div>

            <div className="row">
                <div className="col">
                    <div
                        className="card shadow-sm p-4 border-0"
                        style={{ borderRadius: "20px", height: "", color: "#0A382B" }}
                    >
                        <h5 className="fw-bold mb-4">Recent Expenses</h5>

                        <div className="table-responsive pe-4" style={{
                            height: "auto",
                            width: "100%",
                            overflowY: "auto",
                        }}>
                            <table className="table align-middle">
                                <thead
                                    className="table-light"
                                    style={{ borderBottom: "2px solid #e9ecef" }}
                                >
                                    <tr style={{ color: "#0A382B" }}>
                                        <th scope="col">Category</th>
                                        <th scope="col">Note</th>
                                        <th scope="col">Amount</th>
                                        <th scope="col">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenses.length > 0 ? (
                                        expenses.map((data, index) => {
                                            const expenseDate = new Date(data.expenseDate);

                                            return (
                                                <tr key={data.expenseID || index}>
                                                    <td>
                                                        <i
                                                            className={`${data.icon} fs-5 me-2`}
                                                            style={{ color: data.color }}
                                                        ></i>
                                                        {data.category}
                                                    </td>

                                                    <td>{data.note}</td>

                                                    <td className="fw-semibold text-danger">
                                                        ₹{data.expenseAmount}
                                                    </td>

                                                    <td>
                                                        {expenseDate.toISOString().split("T")[0]}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center text-muted py-3">
                                                No results found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                            </table>
                        </div>
                    </div>
                </div>


            </div>


        </div>
    );
}

export default Dashboard;
