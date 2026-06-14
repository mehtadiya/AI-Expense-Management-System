import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../api/api";
import { useAuth } from "../context/AuthProvider";

function SetTotalBudget() {
    const today = new Date();
    const firstDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const lastDate = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;

    const auth = useAuth();
    const userID = auth?.user?.userID;

    const [duration, setDuration] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        amountLimit: 0,
        fromDate: firstDate,
        toDate: lastDate
    });

    useEffect(() => {
        api.get("/duration")
            .then(res => setDuration(res.data))
            .catch(console.log);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddBudget = async (e) => {
    e.preventDefault();

    try {
        setLoading(true);

        if (!formData.fromDate || !formData.toDate || !formData.amountLimit) {
            await Swal.fire({ icon: "warning", title: "Missing Fields" });
            return;
        }

        const from = new Date(formData.fromDate);
        const to = new Date(formData.toDate);

        if (from > to) {
            await Swal.fire({ icon: "error", title: "Invalid Date Range" });
            return;
        }

        // STEP 1: get remaining budget info
        const res = await api.get(`/budget-remaining/${userID}`);
        const data = res.data;

        const remaining = Number(data?.remaining || 0);

        let action = null;

        // STEP 2: ask user only if needed (NO CHANGE IN UI)
        if (remaining > 0) {
            const choice = await Swal.fire({
                title: "Carry Forward Amount?",
                text: `₹${remaining} last month remaining found`,
                icon: "question",
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: "Carry Forward",
                denyButtonText: "Savings",
                cancelButtonText: "Cancel"
            });

            if (choice.isDismissed) return;
            if (choice.isConfirmed) action = "carry_forward";
            if (choice.isDenied) action = "savings";
        }

        // STEP 3: calculate final budget
        let finalAmount = Number(formData.amountLimit);

        if (action === "carry_forward") {
            finalAmount += remaining;
        }

        // STEP 4: create budget
        const budgetRes = await api.post("/budgets/add", {
            fromDate: formData.fromDate,
            toDate: formData.toDate,
            categoryID: null,
            amountLimit: finalAmount
        });

        if (action) {

            if (!data.budgetid || !data.fromdate || !data.todate) {
                console.log("Rollover skipped due to missing budget metadata");
            } else {
                await api.post("/budget-rollover/action", {
                    budgetid: data.budgetid,
                    fromdate: data.fromdate,
                    todate: data.todate,
                    remainingamount: remaining,
                    action
                });
            }
        }

        await Swal.fire({
            icon: "success",
            title: "Done",
            text: "Budget created successfully"
        });

    } catch (err) {
        console.log(err);
        await Swal.fire({
            icon: "error",
            title: "Error",
            text: err.response?.data?.message || "Server error"
        });
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="container-fluid p-2 m-2" style={{ background: "#F0FFF0", borderRadius: "20px", width: "99%" }}>
            <h3 className="text-center mb-4 fw-bold" style={{ color: "#0A382B" }}>
                Set Total Budget
            </h3>

            <form className="p-1" onSubmit={handleAddBudget}>
                <div className="mb-3">
                    <label className="form-label fw-semibold">From Date</label>
                    <input type="date" name="fromDate" value={formData.fromDate} onChange={handleChange} className="form-control shadow-sm" />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold">To Date</label>
                    <input type="date" name="toDate" value={formData.toDate} onChange={handleChange} className="form-control shadow-sm" />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold">Amount Limit</label>
                    <input type="number" name="amountLimit" value={formData.amountLimit} onChange={handleChange} className="form-control shadow-sm" />
                </div>

                <div className="text-end">
                    <button type="submit" disabled={loading} className="btn btn-success px-4 py-2">
                        {loading ? "Processing..." : "Set Budget"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default SetTotalBudget;