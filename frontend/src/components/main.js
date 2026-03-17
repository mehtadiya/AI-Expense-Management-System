import { Link, Outlet, useParams } from "react-router-dom";

import Sidebar from "./sidebar";
import { useEffect, useState } from "react";
import api from "../api/api";
import "./main.css";
function Main() {
  const storedID = localStorage.getItem("userID");
  useEffect(() => {
  console.log("localStorage userID:", localStorage.getItem("userID"));
}, []);
  const [userdata,setUserData]=useState([]);
  

  useEffect(()=>{
    api.get("/users")
    .then(res=>setUserData(res.data))
    .catch(err=>console.log(err));
    
  },[])

console.log("userData",userdata)

    return (
        <>
            <div className="container-fluid">
                <div className="row main-header " style={{backgroundColor:""}}>
                    <div className="main-col" > <h4 className="fw-bold mb-0 app-title" >
                        💸 ExpensePro
                    </h4></div>
                    <div className="col d-flex align-items-center justify-content-start ps-4 ">
                        <h4 className="fw-bold mb-0 app-title" style={{ color: "#006400" }}>
                            Hello, <span className="fw-bold">{userdata[0]?.userName || storedID}</span> 👋
                        </h4>
                    </div> 
                    <div className="col-3 d-flex justify-content-end align-items-center">
            <div
              className="d-flex justify-content-center align-items-center m-1 icon-box"
              style={{
                width: "45px",
                height: "45px",
                borderRadius: "50%",
                border: "3px solid #006400",
                color: "#006400",
                cursor: "pointer",
                transition: "0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e8f5e9")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <i className="bi bi-bell-fill fs-5"></i>
            </div>

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
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e8f5e9")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <i className="bi bi-person-fill fs-5"></i>
            </Link>
          </div>
        </div>


                <div className="row">
                    <div className="col-2 sidebar-col " style={{ backgroundColor: "#0A382B"  }}>
                        <Sidebar userID={storedID}/>
                    </div>
                    <div className="col  m-2  icon-box" style={{ backgroundColor: "#F0FFF0",borderRadius:"20px",minHeight:"730px"}}>
                        <Outlet />
                    </div>
                </div>
            </div>
        </>
    )
}
export default Main;