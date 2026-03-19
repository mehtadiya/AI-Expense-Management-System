import React, { useEffect, useState } from "react";
// import { Card } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import Manual from "./addManual";
import Multiple from "./addMultiple";
import Online from "./addOnline";
import Scan from "./addScan";
import RecordAudio from "./addAudio";
import { Link, useParams } from "react-router-dom";
import getUserFromToken from "../utils/auth";

const user=getUserFromToken();
const userID=user ?.userID;

function AddExpense() {
    const [selectedOption,setSelectedOption]=useState(null);

  const options = [
    { title: "Manual", icon: "bi bi-pencil-square", color: "#198754" ,option:"Manual" },
    { title: "Add Multiple Records", icon: "bi bi-collection-fill", color: "#0dcaf0" ,option:"Multiple"},
    { title: "Add Online Payments", icon: "bi bi-credit-card-2-front-fill", color: "#ffc107" ,option:"Online"},
    { title: "Scan Receipt", icon: "bi bi-upc-scan", color: "#6f42c1" ,option:"Scan"},
    { title: "Record Audio", icon: "bi bi-mic-fill", color: "#dc3545",option:"Audio" },
  ];

  const renderComponent=()=>{
    switch(selectedOption){
        case "Manual":
            return <Manual />
        case "Multiple":
            return <Multiple />
        case "Online":
            return <Online userID={userID}/>
        case "Scan":
            return <Scan userID={userID}/>
        case "Audio":
            return <RecordAudio userID={userID}/>
        default:
            return <Manual userID={userID}/>
    }
  }

  return (
    <div className="container-fluid py-3">
      {/* Header */}                                        
      <div className="row mb-4">
        <div className="col-8">
          <h2 className="fw-bolder" style={{ color: "#0A382B" }}>
            Add Expense
          </h2>
          <p style={{ color: "#6c757d" }}>
            Choose how you want to add your expense details.
          </p>

        </div>
        <div className="col">
          <Link to={`/main/setbudget/${userID}`}>Set Budget</Link>
        </div>
      </div>

        {/* Boxes*/}
      <div className="row mb-4 d-flex justify-content-between">
        {options.map((opt, index) => (
          <div className="  col-lg-2" key={index}>
            <div
            onClick={()=>setSelectedOption(opt.option)}
              className="card text-center border-0 shadow-sm"
              style={{
                borderRadius: "20px",
                padding: "20px",
                height:"180px",
                transition: "all 0.3s ease",
                cursor: "pointer",
                background: "white",
                boxShadow: "0 4px 20px rgba(72, 187, 120, 0.15)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-5px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <div
                className="icon-wrapper d-flex justify-content-center align-items-center mx-auto mb-3 "
                style={{
                  backgroundColor: `${opt.color}15`, //used to make semi-transparent colors in CSS.
                  color: opt.color,
                  borderRadius: "50%",
                  width: "70px",
                  height: "70px",
                  fontSize: "28px",
                }}
              >
                <i className={opt.icon}></i>
              </div>
              <h6 className="fw-semibold" style={{ color: "#0A382B" }}>
                {opt.title}
              </h6>
            </div>
          </div>
        ))}
      </div>

      <div className="row ">
        <div className="col ">
            <div className="card p-2" style={{
                borderRadius: "20px",
                transition: "all 0.3s ease",
                background: "white",
                boxShadow: "0 4px 20px rgba(72, 187, 120, 0.15)",
              }}>
                {renderComponent()}
            </div>
        </div>
      </div>
    </div>
  );
}

export default AddExpense;
