// import { Navigate } from "react-router-dom";
// import { isTokenValid } from "../utils/auth";

// const ProtectedRoute = ({ children }) => {
//   if (!isTokenValid()) {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     return <Navigate to="/login" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useEffect } from "react";

function ProtectedRoute({children}){
     const navigate=useNavigate();
    const {loading,isAuthenticated,user}=useAuth();
    if(loading){
        return <h1>Loading....</h1>
    }

    if(!isAuthenticated){
        navigate("/login");
    }
   

   

    return children;
}

export default ProtectedRoute
