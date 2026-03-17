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
  baseURL:"http://localhost:3002", 
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

export default api;