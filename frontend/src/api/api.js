// import axios from "axios";

// const api=axios.create({
//     baseURL:"http://localhost:3002"
// })

// api.interceptors.request.use((req)=>{
//     const token= localStorage.getItem("token")
    
//     if(token){
//         req.headers.Authorization=`Bearer ${token}`
//     }

//     return req
// })







import axios from "axios";

 const api = axios.create({
  baseURL:"https://expense-management-2-ez4q.onrender.com", 
    headers:{
        "Content-Type":"application/json"
    }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log(token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);


export default api;