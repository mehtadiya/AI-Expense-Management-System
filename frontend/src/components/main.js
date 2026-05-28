import { Link, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

import Sidebar from "./sidebar";
import api from "../api/api";
import "./main.css";
import { useAuth } from "../context/AuthProvider";

function Main() {
  const [userdata, setUserData] = useState([]);

  const user = useAuth();
  const storedID = user?.user?.userID;

  useEffect(() => {
    api
      .get("/users")
      .then((res) => setUserData(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="container-fluid">

<div className="row main-header shadow-sm px-3 py-2 fixed-top-header">
        <div className="col-2 d-flex align-items-center">
          <h4 className="fw-bold mb-0 app-title d-flex align-items-center gap-2">
            <img src="/spending.png" alt="logo" width={35} />
            <span className="logo-text">ExpensePro</span>
          </h4>
        </div>

        <div className="col d-flex align-items-center">
          <h4 className="fw-bold mb-0" style={{ color: "#006400" }}>
            Hello,{" "}
            <span className="fw-bold">
              {user?.user?.userName || storedID}
            </span>{" "}
          </h4>
        </div>

        <div className="col-2 d-flex justify-content-end align-items-center gap-3">

          <Link
            to={`/main/about`}
            className="d-flex justify-content-center align-items-center mx-2 icon-box"
            style={{
              width: "45px",
              height: "45px",
              borderRadius: "50%",
              border: "3px solid #006400",
              color: "#006400",
              cursor: "pointer",
              transition: "0.3s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#e8f5e9")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <i className="bi bi-bell-fill fs-5"></i>
          </Link>

          <Link
            to={`/main/profile`}
            className="d-flex justify-content-center align-items-center mx-2 icon-box"
            style={{
              width: "45px",
              height: "45px",
              borderRadius: "50%",
              border: "3px solid #006400",
              color: "#006400",
              cursor: "pointer",
              transition: "0.3s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#e8f5e9")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <i className="bi bi-person-fill fs-5"></i>
          </Link>
        </div>
      </div>

      <div className="row">

        <div
  className="col-2 sidebar-col fixed-sidebar"
          style={{ backgroundColor: "#0A382B", minHeight: "100vh" }}
        >
          <Sidebar />
        </div>

        <div
          className="col m-2 p-3 content-box main-content"
          style={{
            backgroundColor: "#F0FFF0",
            borderRadius: "20px",
            minHeight: "730px",
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Main;