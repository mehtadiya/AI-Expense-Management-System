import React from "react";
import { Link } from "react-router-dom";
import "./sidebar.css";

function Sidebar({userID}) {
    return (
        <>

            <Link
                to={`/main/dashboard`}
                className="nav-item d-flex align-items-center my-3 px-2 fs-5"
                style={{ textDecoration: "none", color: "#F3FBF3" }}
            >
                <i className="bi bi-speedometer2 fs-5 me-2 " style={{color: "#F3FBF3"}}></i>
                <span className="fw-semibold sidebar-text">Dashboard</span>
            </Link>

            <Link
                to={`/main/expenses`}
                className="nav-item d-flex align-items-center my-3 px-2 fs-5"
                style={{ textDecoration: "none", color: "#F3FBF3" }}
            >
                <i className="bi bi-wallet fs-5 me-2 " style={{color: "#F3FBF3"}}></i>
                <span className="fw-semibold sidebar-text">Expenses</span>
            </Link>

             <Link
                to={`/main/category`}
                className="nav-item d-flex align-items-center my-3 px-2 fs-5"
                style={{ textDecoration: "none", color: "#F3FBF3" }}
            >
                <i className="bi bi-tags-fill fs-5 me-2 " style={{color: "#F3FBF3"}}></i>
                <span className="fw-semibold sidebar-text">Categories</span>
            </Link>

             <Link
                to={`/main/budget`}
                className="nav-item d-flex align-items-center my-3 px-2 fs-5"
                style={{ textDecoration: "none", color: "#F3FBF3" }}
            >
                <i className="bi bi-pie-chart-fill fs-5 me-2 " style={{color: "#F3FBF3"}}></i>
                <span className="fw-semibold sidebar-text">setBudget</span>
            </Link>

             {/* <Link
                to={`/main/budget/1`}
                className="nav-item d-flex align-items-center my-3 px-2 fs-5"
                style={{ textDecoration: "none", color: "#F3FBF3" }}
            >
                <i className="bi bi-tags-fill fs-5 me-2 " style={{color: "#F3FBF3"}}></i>
                <span className="fw-semibold sidebar-text">Budgets</span>
            </Link> */}
            
            <Link
                to={`/main/profile`}
                className="nav-item d-flex align-items-center my-3 px-2 fs-5"
                style={{ textDecoration: "none", color: "#F3FBF3" }}
            >
                <i className="bi bi-graph-up-arrow fs-5 me-2 " style={{color: "#F3FBF3"}}></i>
                <span className="fw-semibold sidebar-text">Reports</span>
            </Link>

            <Link
                to={`/main/dashboard/${userID}`}
                className="nav-item d-flex align-items-center my-3 px-2 fs-5"
                style={{ textDecoration: "none", color: "#F3FBF3" }}
            >
                <i className="bi bi-bell-fill fs-5 me-2 " style={{color: "#F3FBF3"}}></i>
                <span className="fw-semibold sidebar-text">Alerts</span>
            </Link>

            <Link
                to={`/main/chatbot`}
                className="nav-item d-flex align-items-center my-3 px-2 fs-5"
                style={{ textDecoration: "none", color: "#F3FBF3" }}
            >
                <i className="bi bi-robot fs-5 me-2 " style={{color: "#F3FBF3"}}></i>
                <span className="fw-semibold sidebar-text">Chatbot</span>
            </Link>

            <Link
                to={`/main/profile`}
                className="nav-item d-flex align-items-center my-3 px-2 fs-5"
                style={{ textDecoration: "none", color: "#F3FBF3" }}
            >
                <i className="bi bi-person-circle fs-5 me-2 " style={{color: "#F3FBF3"}}></i>
                <span className="fw-semibold sidebar-text">Profile</span>
            </Link>

            <Link
                to={`/main/dashboard/${userID}`}
                className="nav-item d-flex align-items-center my-3 px-2 fs-5"
                style={{ textDecoration: "none", color: "#F3FBF3" }}
            >
                <i className="bi bi-info-circle-fill fs-5 me-2 " style={{color: "#F3FBF3"}}></i>
                <span className="fw-semibold sidebar-text">About</span>
            </Link>

           


        </>
    )
}
export default Sidebar;