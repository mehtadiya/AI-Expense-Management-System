
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import { loginService } from "../api/authService";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 

  const handleLogin = async (e)=>{
    e.preventDefault()
    const response = await loginService(formData);
        if (response.error) {
            setError(response.error);
        } else {
            navigate("/main/dashboard");
        }
    
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#F0FFF0" }}
    >
      <div
        className="p-4 rounded shadow-lg "
        style={{ width: "400px", background: "white", borderRadius: "20px" }}
      >
        <h3 className="text-center fw-bold mb-4 login-title" style={{ color: "#0A382B" }}>
          Login
        </h3>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control shadow-sm"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control shadow-sm"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <p className="text-danger text-center small fw-semibold">{error}</p>
          )}

          <button
            type="submit"
            className="btn btn-success w-100 fw-semibold"
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(25, 135, 84, 0.4)",
            }}
            
          >
            Login
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-success fw-semibold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  
  );
}

export default LoginPage;
