import api from "./api";



export const loginService=async (data)=>{
    const response=await api.post("/users/login",data);
    console.log("response",response.data);
    if(response.data){
        localStorage.setItem("token",response.data.token);
        localStorage.setItem("user",JSON.stringify(response.data.user));
  
    }
    // console.log(response.data.token,response.data.user);
    return response.data;
}

export const logoutService=()=>{
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

export const getUserData= ()=>{
    // return JSON.parse(localStorage.getItem("user"))
    // console.log("u",JSON.parse(localStorage.getItem("user")));
    return localStorage.getItem("user")
}

export const getToken=()=>{
    return localStorage.getItem("token");
}