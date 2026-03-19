import { createContext, useContext, useEffect, useState } from "react"
import { getToken, getUserData } from "../api/authService";

const AuthContext=createContext(null);

export const AuthProvider=({children})=>{
    const [user,setUser]=useState(null);
    const [loading ,setLoading]=useState(true);
    useEffect(()=>{
        const token=getToken();
        console.log("tokenData",token);
        if(token){
            const userData=getUserData();
            // console.log("usersData",userData);
            setUser(JSON.parse(userData));
            // setUser(userData);
            setLoading(false);
        }
    },[]);
    const loginAuth=(userData)=>{
        // setUser(JSON.parse(userData));
            setUser(userData);

    }

    const logoutAuth=()=>{
        setUser(null);
    }

    return(
    <>
    <AuthContext.Provider 
        value={{
            loading,
            user,
            loginAuth,
            logoutAuth,
            isAuthenticated:user!==null,
            }}>
            {children}
    </AuthContext.Provider>
    </>
);
};



export const useAuth=()=>{
    const context=useContext(AuthContext);

    if(!context){
        throw new Error("useAuth must be within AuthProvider")
    }
    return context;
}