import SetBudget from "./setCategoricalBudget";
import { use } from "react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/api";
const API_URL=process.env.REACT_APP_API_URL;

function Budget(){
    const [duration,setDuration]=useState([]);
    const [categoryHavingBudget,setCategoryHavingBudget]=useState([]);
    const [totalExpense,setTotalExpense]=useState([]);
    const {userID}=useParams();
    
    //to fetch duration for select box
    useEffect(()=>{
        api.get("/duration")
        .then(res=>{setDuration(res)
        })
    },[])

    //to fetch all categories which have budget
    useEffect(()=>{
        fetch(`${API_URL}/budgets/${userID}`)
        .then(res=>res.json())
        .then(res=>{setCategoryHavingBudget(res)
            console.log("setCategoryHavingBudget",res)
        })
    },[])

    //to fetch total expense done by user 
     useEffect(()=>{
        fetch(`${API_URL}/budgets/totalExpense/${userID}`)
        .then(res=>res.json())
        .then(res=>setTotalExpense(res))
    },[])

    const handleAddDuration=()=>{
        Swal.fire({
            title:"Add Duration",
            html:`
                 <div class="container-fluid">
                <div class="row mb-2">
                    <div class="col-4"><label><b>from Date:</b></label></div>
                    <div class="col">
                         <input type="date" id="fromDate" class="form-control" placeholder="From Date" >

                    </div>
                </div> 
                <div class="row mb-2">
                    <div class="col-4"><label><b>to Date:</b></label></div>
                    <div class="col">
                    <input type="date" id="toDate" class="form-control" placeholder="To Date">
                    </div>
                </div> 
                  
                
                </div>
            `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Add",
        preConfirm:()=>{
            const fromDate=document.getElementById('fromDate').value;
            const toDate=document.getElementById('toDate').value;
            if(!fromDate || !toDate){
                Swal.showValidationMessage("please fill out the form");
                return false;
            }
            if (new Date(fromDate) > new Date(toDate)) {
                 Swal.showValidationMessage("From Date cannot be after To Date.");
                return false;
            }
            return {fromDate,toDate}
        }

        }).then((result)=>{
            if(result.isConfirmed){
                const addDuration =result.value;
                fetch(`${API_URL}/duration/add`,{
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify(addDuration)
                })
                .then((res)=>{
                     if (res.ok) {
                            Swal.fire(
                                "Added!",
                                "Duration added successfully!",
                                "success"
                            ).then(() => window.location.reload());
                        } else {
                            Swal.fire("Error", "Failed to add duration", "error");
                        }
                }).catch((err) => {
                                    console.error("Error updating expense:", err);
                                    Swal.fire("Error", "Server error occurred", "error");
                                });
                
            }
        })
    }

    const result=categoryHavingBudget.map((data) => {
  const total = totalExpense.find(t => t.categoryID === data.categoryID)?.total || 0;

  return (
    <>
    
    <div className="col p-2 m-2" key={data.categoryID}>
      <div
        className="card text-center shadow-sm border-0 p-4"
        style={{
          borderRadius: "20px",
          backgroundColor: "white",
          transition: "all 0.3s ease",
        }}
      >

        

        <div
          className="icon-wrapper mx-auto mb-3 d-flex justify-content-center align-items-center "
          style={{
            backgroundColor: "white",
            border: `1px solid ${data.color}`,
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            fontSize: "24px",
          }}
        >
          <i className={data.icon} style={{ color: `${data.color}` }}></i>
        </div>

        <h6 className="fw-semibold" style={{ color: "#0A382B" }}>
          {data.category}
        </h6>

        <div className="d-flex justify-content-center gap-2 mt-2"  >
            <div  style={{color:total>data.amountLimit ? "red" :"#0A382B",
                        fontWeight:total>data.amountLimit ? "bold":"500px"
            }}> {total}</div>
          <div style={{color:"#0A382B"}}>/ {data.amountLimit}</div>
        </div>
      </div>
    </div>
    </>
  );
})



    return(
        <>
        <div className="container-fluid">
        <div className="row mt-3">
                <div className="col-8">
                  <h2 className="fw-bolder" style={{ color: "#0A382B" }}>
                    Add Budget
                  </h2>
                  <p style={{ color: "#6c757d" }}>
                    Choose how you want to add your expense details.
                  </p>
        
                </div>
                <div className="col">
                  
                </div>
        </div>
       
         
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-4 mt-1 ">
            {result}
      </div>
         <div className="p-2 mt-5 border" style={{backgroundColor:"white",borderRadius:"20px"}}>

            <div className="container-fluid p-2 m-2">
                
                <div className="row">
                    <div className="col-3">
                        <select className="form-select" 
                        onChange={(e)=>{
                            if(e.target.value=="add"){
                                handleAddDuration();
                                 e.target.selectedIndex = 0;
                            }
                        }}>
                            <option value="" selected>-- Select duration -- </option>
                            {duration.map((data)=>(
                                <option key={data.durationID} value={data.durationID}>{new Date(data.fromDate).toLocaleDateString()}-{new Date(data.toDate).toLocaleDateString()}</option>
                            ))}
                            <option value="add"> Add new duration</option>
                        </select>
                    </div>
                    <div className="col-1">
                        <button >Go</button>
                    </div>
                     <div className="col-1">
                        <button onClick={handleAddDuration}>Add</button>
                    </div>
                </div>

            </div>
            <SetBudget/>
        </div>
         </div>
        </>
    )
}
export default Budget;