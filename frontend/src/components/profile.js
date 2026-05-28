import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import { Navigate, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/api";
const API_URL = process.env.REACT_APP_API_URL;

function Profile() {
    const [userData, setUserData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get(`/usersByID`)
            .then(res => setUserData(res.data))
            .catch(error => console.log(error))
    }, []);

    const handleEdit = (data) => {
        Swal.fire({
            title: "Edit Details",
            html: `
                <div class="container-fluid ">
                <div class="row mb-2">
                    <div class="col-4"><label><b>userName:</b></label></div>
                    <div class="col">
                         <input id="userName" class="form-control" placeholder="userName" value="${data.userName || ""}">

                    </div>
                </div> 
                <div class="row mb-2">
                    <div class="col-4"><label><b>userEmail:</b></label></div>
                    <div class="col">
                    <input id="email" class="form-control" placeholder="userEmail" value="${data.email || ""}">
                    </div>
                </div>  
                
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Update",
            preConfirm: () => {
                const userName = document.getElementById("userName").value;
                const email = document.getElementById("email").value;
                if (!userName || !email) {
                    Swal.showValidationMessage("Please fill out all fields");
                    return false;
                } return { userName, email };
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                const updatedExpense = result.value;

                await api.put("/users/edit", {
                    userName: updatedExpense.userName,
                    email: updatedExpense.email
                })

                    .then(() => {
                        Swal.fire(
                            "Updated!",
                            "Expense updated successfully!",
                            "success"
                        ).then(() => window.location.reload());
                    })
                    .catch((err) => {
                        console.error("Error updating expense:", err);
                        Swal.fire("Error", "Server error occurred", "error");
                    });
            }
        });
    }

    const handleChangePassword = (data) => {
        Swal.fire({
            title: "Change Password ",
            html: `
                <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-4"><label><b>OldPassword:</b></label></div>
                    <div class="col">
                         <input type="password" id="OldPassword" class="form-control" placeholder="OldPassword" ">

                    </div>
                </div> 
                <div class="row mb-2">
                    <div class="col-4"><label><b>NewPassword:</b></label></div>
                    <div class="col">
                    <input type="password" id="NewPassword" class="form-control" placeholder="NewPassword" ">
                    </div>
                </div> 
                <div class="row mb-2">
                    <div class="col-4"><label><b>ConfirmPassword:</b></label></div>
                    <div class="col">
                    <input type="password" id="ConfirmPassword" class="form-control" placeholder="ConfirmPassword" ">
                    </div>
                </div>  
                
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Update",
            preConfirm: () => {
                const password = document.getElementById("OldPassword").value;
                const newPassword = document.getElementById("NewPassword").value;
                const confirmPassword = document.getElementById("ConfirmPassword").value;
                if (!password || !newPassword || !confirmPassword) {
                    Swal.showValidationMessage("Please fill out all fields");
                    return false;
                } 

                if (newPassword != confirmPassword) {
                    Swal.showValidationMessage("Your new password and confirm password doesn't match");
                    return false;
                }
                return { password, newPassword, confirmPassword };
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                const updatedExpense = result.value;

                await api.put("/changePassword", {
                    password: updatedExpense.password,
                    newPassword: updatedExpense.newPassword,
                    confirmPassword: updatedExpense.confirmPassword
                })

                    .then(() => {
                        Swal.fire(
                            "Updated!",
                            "Expense updated successfully!",
                            "success"
                        ).then(() => window.location.reload());
                    })
                    .catch((err) => {
                        console.error("Error updating expense:", err);
                        Swal.fire("Error", "Server error occurred", "error");
                    });
            }
        });
    }



    const handleLogout = () => {
        Swal.fire({
            title: "Logout?",
            text: "Are you sure you want to logout",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, logout"
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                navigate("/login")
            }
        })
    }

    return (
    <>
        <div className="container-fluid py-3">
            <div className="row g-3 align-items-start">

                <div className="col-12 col-lg-9">
                    {userData.length > 0 ? (
                        userData.map((data) => (
                            <div
                                className="card border-0 shadow-sm p-3 p-md-4"
                                style={{
                                    borderRadius: "22px",
                                    backgroundColor: "white",
                                }}
                                key={data.userID}
                            >
                                <div className="row align-items-center g-4">

                                    <div className="col-12 col-md-4 d-flex justify-content-center">
                                        {data.userImage ? (
                                            <img
                                                src={data.userImage}
                                                alt="user"
                                                style={{
                                                    width: "170px",
                                                    height: "170px",
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                    border: "4px solid #F0FFF0",
                                                }}
                                            />
                                        ) : (
                                            <i
                                                className="bi bi-person-circle"
                                                style={{
                                                    fontSize: "140px",
                                                    color: "#0A382B",
                                                }}
                                            ></i>
                                        )}
                                    </div>

                                    <div className="col-12 col-md-8">
                                        <div
                                            className="d-flex flex-column justify-content-center h-100"
                                            style={{ color: "#0A382B" }}
                                        >
                                            <h3
                                                className="fw-bold mb-3"
                                                style={{
                                                    wordBreak: "break-word",
                                                }}
                                            >
                                                {data.userName}
                                            </h3>

                                            <p
                                                className="mb-4 text-muted"
                                                style={{
                                                    fontSize: "16px",
                                                    wordBreak: "break-word",
                                                }}
                                            >
                                                {data.email}
                                            </p>

                                            <div className="d-flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => handleEdit(data)}
                                                    className="btn"
                                                    style={{
                                                        backgroundColor: "#0A382B",
                                                        color: "#F0FFF0",
                                                        borderRadius: "12px",
                                                        padding: "10px 18px",
                                                        fontWeight: "600",
                                                    }}
                                                >
                                                    Edit Details
                                                </button>

                                                <button
                                                    onClick={() => handleChangePassword(data)}
                                                    className="btn"
                                                    style={{
                                                        backgroundColor: "#0A382B",
                                                        color: "#F0FFF0",
                                                        borderRadius: "12px",
                                                        padding: "10px 18px",
                                                        fontWeight: "600",
                                                    }}
                                                >
                                                    Change Password
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No result</p>
                    )}
                </div>

                <div className="col-12 col-lg-3 d-flex justify-content-lg-end justify-content-start">
                    <button
                        onClick={handleLogout}
                        className="btn btn-outline-danger"
                        style={{
                            borderRadius: "12px",
                            padding: "10px 18px",
                            fontWeight: "600",
                        }}
                    >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                    </button>
                </div>

            </div>
        </div>
    </>
)
}
export default Profile;