import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/api";
import { useLocation } from "react-router-dom";

function Manual() {
    
const location = useLocation();
const voiceData = location.state?.voiceData;

    const [category, setCategory] = useState([]);
    const navigate = useNavigate();
    const [form, setForm] = useState({
        categoryID: "",
        note: "",
        expenseAmount: "",
        expenseDate: new Date().toISOString().split("T")[0],
    });


    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleAddExpense = async () => {
        if(
        !form.categoryID ||
        !form.note ||
        !form.expenseAmount ||
        !form.expenseDate
    ) {
        Swal.fire({
            icon:"warning",
            title:"Warning",
             text: "Please fill all required fields",
             confirmButtonColor: "#f0ad4e",
        })
        return;
    }
  try {
    
    await api.post("/expenses/add", form);

    Swal.fire({
      icon: "success",
      title: "Expense Added!",
      text: "Your expense has been added successfully.",
    }).then(() => navigate("/main/expenses"));

  } catch (error) {
    Swal.fire(
      "Error",
      error.response?.data?.message || "Failed to add expense",
      "error"
    );
  }
};




   useEffect(() => {
    api.get("/categories")
        .then(res => {
            setCategory(res.data);

            // Voice thi data aavyo hoy to auto fill
            if (voiceData) {
                const found = res.data.find(
                    c => c.category.toLowerCase() === voiceData.category.toLowerCase()
                );

                if (found) {
                    setForm(prev => ({
                        ...prev,
                        categoryID: found.categoryID,
                        note: voiceData.category,
                        expenseAmount: voiceData.amount
                    }));
                }
            }
        })
        .catch((err) => console.error("Error fetching categories:", err));
}, []);

    return (
        <>
            <div
                className="container-fluid p-2 m-2"
                style={{
                    background: "#F0FFF0",
                    borderRadius: "20px",
                    width: "99%",
                }}
            >
                <h3 className="text-center mb-4 fw-bold" style={{ color: "#0A382B" }}>
                    Add New Expense
                </h3>

                <form className="p-1">




                    {/* Category */}
                    <div className="mb-3 ">
                        <label className="form-label fw-semibold" style={{ color: "#0A382B" }}>
                            Category
                        </label>
                        <select className="form-select shadow-sm"
                            name="categoryID"
                            value={form.categoryID}
                            onChange={handleChange}>
                            <option value="">Select Category</option>
                            {category.length > 0 ? (
                                category.map((data) => (
                                    <option key={data.categoryID} value={data.categoryID}>{data.category}</option>
                                ))
                            ) : (
                                <p>No result found</p>
                            )
                            }
                           

                        </select>
                    </div>

                    {/* Note */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold" style={{ color: "#0A382B" }}>
                            Note
                        </label>
                        <input
                            type="text"
                            name="note"
                            value={form.note}
                            onChange={handleChange}
                            className="form-control shadow-sm"
                            placeholder="Enter a note (e.g., Coffee at Starbucks)"
                        />
                    </div>

                    {/* Expense Amount */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold" style={{ color: "#0A382B" }}>
                            Expense Amount
                        </label>
                        <input
                            type="number"
                            name="expenseAmount"
                            value={form.expenseAmount}
                            onChange={handleChange}
                            className="form-control shadow-sm"
                            placeholder="Enter amount"
                        />
                    </div>

                    {/* Expense Date */}
                    <div className="mb-4">
                        <label className="form-label fw-semibold" style={{ color: "#0A382B" }}>
                            Expense Date
                        </label>
                        <input type="date"
                            name="expenseDate"
                            value={form.expenseDate}
                            onChange={handleChange}
                            className="form-control shadow-sm" />
                    </div>

                    {/* Add Button */}
                    <div className="text-end">
                        <button
                            onClick={handleAddExpense}
                            type="button"
                            className="btn btn-success px-4 py-2"
                            style={{
                                borderRadius: "12px",
                                fontWeight: "600",
                                boxShadow: "0 4px 15px rgba(72, 187, 120, 0.3)",
                            }}
                        >
                            <i className="bi bi-plus-circle me-2"></i>Add Expense
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}
export default Manual;


