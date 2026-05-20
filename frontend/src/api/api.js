import axios from "axios";
const API_URL = process.env.REACT_APP_API_URL;

 const api = axios.create({
  baseURL:`${API_URL}`, 
    headers:{
        "Content-Type":"application/json"
    }
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    // console.log(token)
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
    if (error.response && error.response.status === 403) {
      console.log("token Expired")
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.replace("/login");
    }

    return Promise.reject(error);
  }
);


export default api;