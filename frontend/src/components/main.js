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
    <div className="container-fluid p-0">
      
      <div className="main-header shadow-sm fixed-top-header">
        <div className="row g-0 align-items-center px-3 py-2">

          <div className="col-2 col-md-1 d-flex align-items-center ">
            <h4 className="fw-bold mb-0 app-title d-flex align-items-center gap-2">
              <img src="/spending.png" alt="logo" width={35} />
            </h4>
          </div>

          <div className="col d-flex align-items-center " style={{paddingLeft:"5%"}}>
            <h4 className="fw-bold mb-0 welcome-text" style={{ color: "#006400" }}>
              Hello,{" "}
              <span className="fw-bold">
                {user?.user?.userName || storedID}
              </span>
            </h4>
          </div>

          <div className="col-3 col-md-2 d-flex justify-content-end align-items-center gap-2">

            <Link
              to={`/main/about`}
              className="d-flex justify-content-center align-items-center icon-box"
            >
              <i className="bi bi-bell-fill fs-5"></i>
            </Link>

            <Link
              to={`/main/profile`}
              className="d-flex justify-content-center align-items-center icon-box"
            >
              <i className="bi bi-person-fill fs-5"></i>
            </Link>
          </div>

        </div>
      </div>

      <div className="main-layout">

        <div className="sidebar-col fixed-sidebar">
          <Sidebar />
        </div>

        <div className="content-wrapper">
          <div className="content-box">
            <Outlet />
          </div>
        </div>

      </div>
    </div>
  );
}

export default Main;