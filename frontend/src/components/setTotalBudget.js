import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/api";
import { useAuth } from "../context/AuthProvider";
const API_URL = process.env.REACT_APP_API_URL;

function SetTotalBudget() {
    const today = new Date();
    const firstDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const lastDate = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
    const user = useAuth()
    const userID = user?.userID;

    const [duration, setDuration] = useState([]);
    const [formData, setFormData] = useState({
        amountLimit: 0,
        fromDate: firstDate,
        toDate: lastDate
    })




    useEffect(() => {
        api.get("/duration")
            .then(res => setDuration(res.data))
            .catch(error => console.log(error))
    }, [])
    // console.log(duration)

    const handleAddBudget = async (e) => {
        e.preventDefault();

        try {
            if (!formData.fromDate || !formData.toDate || !formData.amountLimit) {
                await Swal.fire({
                    icon: "warning",
                    title: "Missing Fields",
                    text: "Please fill all fields",
                    confirmButtonText: "OK",
                });
                return;
            }

            const from = new Date(formData.fromDate);
            const to = new Date(formData.toDate);

            if (from > to) {
                await Swal.fire({
                    icon: "error",
                    title: "Invalid Date Range",
                    text: "From Date cannot be after To Date",
                    confirmButtonText: "OK",
                });
                return;
            }



            const exists = duration.some((data) => {

                const dbFrom = new Date(data.fromDate);
                const dbTo = new Date(data.toDate);

                return data.categoryID == null && from <= dbTo && to >= dbFrom && data.userID == userID;
            });
            if (exists) {
                await Swal.fire({
                    icon: "info",
                    title: "Budget Exists",
                    text: "A total budget already exists for this date range",
                    confirmButtonText: "OK",
                });
                return;
            }

            const categoryItems = duration.filter((data) => {
                const dbFrom = data.fromDate.split("T")[0];
                const dbTo = data.toDate.split("T")[0];

                return (
                    data.categoryID !== null &&
                    dbFrom === formData.fromDate &&
                    dbTo === formData.toDate
                );
            });

            console.log("categoryItems", categoryItems)

            const categoryTotal = categoryItems.reduce(
                (sum, item) => sum + Number(item.amountLimit),
                0
            );

            if (categoryItems.length > 0 && categoryTotal !== Number(formData.amountLimit)) {
                await Swal.fire({
                    icon: "error",
                    title: "Budget Mismatch",
                    text: `Category total (${categoryTotal}) must exactly match total budget (${formData.amountLimit})`,
                    confirmButtonText: "OK",
                });
                return;
            }






            await api.post("/budgets/add", {
                fromDate: formData.fromDate,
                toDate: formData.toDate,
                categoryID: null, // total budget
                amountLimit: Number(formData.amountLimit),
            });

            await Swal.fire({
                icon: "success",
                title: "Success",
                text: "Total budget added successfully",
                confirmButtonText: "OK",
            });

        } catch (error) {
            await Swal.fire({
                icon: "error",
                title: "Cannot Add Budget",
                text:
                    error.response?.data?.message ||
                    "Budget overlaps with an existing one",
                confirmButtonText: "OK",
            });
        }
    };


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

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
                    Set Total Budget
                </h3>

                <form className="p-1" onSubmit={handleAddBudget}>

                    <div className="mb-3">
                        <label className="form-label fw-semibold" style={{ color: "#0A382B" }}>
                            From Date
                        </label>
                        <input
                            type="Date"
                            name="fromDate"
                            value={formData.fromDate}
                            onChange={handleChange}
                            className="form-control shadow-sm"
                            placeholder="Enter a starting Date you want to set"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold" style={{ color: "#0A382B" }}>
                            To Date
                        </label>
                        <input
                            type="Date"
                            name="toDate"
                            value={formData.toDate}
                            onChange={handleChange}
                            className="form-control shadow-sm"
                            placeholder="Enter a last date you want to set"
                        />
                    </div>

                    {/* Amount Limit */}
                    <div className="mb-3">
                        <label className="form-label fw-semibold" style={{ color: "#0A382B" }}>
                            Amount Limit
                        </label>
                        <input
                            type="text"
                            name="amountLimit"
                            value={formData.amountLimit}
                            onChange={handleChange}
                            className="form-control shadow-sm"
                            placeholder="Enter a limit you want to set"
                        />
                    </div>




                    {/* Add Button */}
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
                            <i className="bi bi-plus-circle me-2"></i>Set Budget
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}
export default SetTotalBudget;