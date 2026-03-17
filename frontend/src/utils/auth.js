import { jwtDecode } from "jwt-decode";



export const isTokenValid = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);

    if (!decoded.exp) return false; 

    const currentTime = Math.floor(Date.now() / 1000);

    return decoded.exp > currentTime;
  } catch (err) {
    return false;
  }
};



const getUserFromToken =()=>{
    const token=localStorage.getItem("token");
    if (!token) return null;

    try{
        return jwtDecode(token);
    }catch{
        return null;
    }
}

export default getUserFromToken