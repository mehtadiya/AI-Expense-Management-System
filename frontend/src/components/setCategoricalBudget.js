import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/api";
const API_URL = process.env.REACT_APP_API_URL;

function SetCategoricalBudget() {
    const [categories, setCategories] = useState([]);
    const [duration, setDuration] = useState([]);
    const today = new Date();
    const firstDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const lastDate = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;

    const [form, setForm] = useState({
        fromDate: firstDate,
        toDate: lastDate,
        categoryAmount: {},
    })

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    useEffect(() => {
        api.get("/duration")
            .then(res => setDuration(res.data))
            .catch(error => console.log(error))
    }, [])


    const handleAddBudget = async (e) => {
        e.preventDefault()
        try {
            const amounts = Object.values(form.categoryAmount);
            if (!form.fromDate || !form.toDate || amounts.length === 0 ||
                amounts.some(a => a === "" || a === null)) {
                await Swal.fire({
                    icon: "warning",
                    title: "Missing Fields",
                    text: "Please fill all fields",
                    confirmButtonText: "OK",
                });
                return;
            }
            const toDateOnly = (date) =>
                new Date(date).toISOString().split("T")[0];

            const budgetsForDuration = duration.filter(
                (data) =>
                    toDateOnly(data.fromDate) === form.fromDate &&
                    toDateOnly(data.toDate) === form.toDate
            );

            const duplicateCategory = budgetsForDuration.some(d =>
                d.categoryID !== null &&
                Object.keys(form.categoryAmount).includes(String(d.categoryID))
            );

            if (duplicateCategory) {
                await Swal.fire({
                    icon: "error",
                    title: "Duplicate Category",
                    text: "One or more categories already have a budget for this duration",
                });
                return;
            }

            const totalBudget = budgetsForDuration.find(
                d => d.categoryID === null
            );

            const categoryTotal = Object.values(form.categoryAmount)
                .reduce((sum, val) => sum + Number(val), 0);

           if (totalBudget) {
    if (categoryTotal !== Number(totalBudget.amountLimit)) {
        await Swal.fire({
            icon: "error",
            title: "Budget Mismatch",
            text: `Category total (${categoryTotal}) must exactly match total budget (${totalBudget.amountLimit})`,
            confirmButtonText: "OK",
        });
        return;
    }
}



            await api.post("/budgets/addCategoryWise", {
                fromDate: form.fromDate,
                toDate: form.toDate,
                categoryAmount: form.categoryAmount
            })

            await Swal.fire({
                icon: "success",
                title: "Success",
                text: "Category budgets added successfully",
            });

        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong",
            });
        }
    }

    useEffect(() => {
        api.get("/categories")
            .then(res => { setCategories(res.data) })
            .catch(error => console.log(error))
    }, [])
    console.log("categories", categories)

    //to fetch durations for form
    useEffect(() => {
        api.get("/duration")
            .then(res => setDuration(res.data))
    }, [])

    const handleCategoryAmountChange = (categoryID, value) => {
        setForm(prev => ({
            ...prev,
            categoryAmount: {
                ...prev.categoryAmount,
                [categoryID]: value
            }
        }));
    };
    console.log("form", form)

    return (
        <>

            <div
                className="container-fluid p-3 m-2"
                style={{
                    background: "#F0FFF0",
                    borderRadius: "20px",
                    width: "99%",
                }}
            >
                <h3 className="text-center mb-4 fw-bold" style={{ color: "#0A382B" }}>
                    Set Budget
                </h3>

                <form className="p-2" onSubmit={handleAddBudget}>

                    {/* Duration Time */}
                    <div className="mb-4">
                        <label className="form-label fw-semibold" style={{ color: "#0A382B" }}>
                            From Date
                        </label>

                        <input
                            type="Date"
                            name="fromDate"
                            value={form.fromDate}
                            className="form-control"
                            onChange={handleChange}
                            placeholder="Enter from date"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-semibold" style={{ color: "#0A382B" }}>
                            To Date
                        </label>

                        <input
                            type="Date"
                            name="toDate"
                            value={form.toDate}
                            className="form-control"
                            onChange={handleChange}
                            placeholder="Enter to date"
                        />
                    </div>

                    <div className="table-responsive mb-4 ">
                        <table className="table table-bordered align-middle ">
                            <thead className="" >
                                <tr>
                                    <th style={{ width: "60%" }}>Category</th>
                                    <th style={{ width: "40%" }}>Amount Limit</th>
                                </tr>
                            </thead>

                            <tbody>
                                {categories.length > 0 ? (
                                    categories.map((data) => (
                                        <tr key={data.categoryID}>
                                            <td className="fw-semibold text-dark">
                                                {data.category}
                                            </td>

                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control shadow-sm"
                                                    placeholder="Enter limit"
                                                    value={form.categoryAmount[data.categoryID] || ""}
                                                    onChange={(e) =>
                                                        handleCategoryAmountChange(
                                                            data.categoryID,
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2" className="text-center text-muted">
                                            No categories found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Submit Button */}
                    <div className="text-end">
                        <button
                            type="submit"
                            className="btn btn-success px-4 py-2"
                            style={{
                                borderRadius: "12px",
                                fontWeight: "600",
                                boxShadow: "0 4px 15px rgba(72, 187, 120, 0.3)",
                            }}
                        >
                            <i className="bi bi-plus-circle me-2"></i>
                            Set Budget
                        </button>
                    </div>
                </form>
            </div>

        </>
    )
}
export default SetCategoricalBudget;