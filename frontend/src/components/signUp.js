import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import api from "../api/api";
import { Link, useNavigate } from "react-router-dom";

function SignupPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState([]);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    userImage: null,
  });

  useEffect(() => {
    api.get("/users")
      .then(res => setUserData(res.data))
      .catch(error => console.log(error))
  }, [])

  const handleImage = (e) => {
  setFormData({
    ...formData,
    userImage: e.target.files[0], // store file
  });
};


  const handleChange = (e) => {
   
      setFormData({ ...formData,[ e.target.name]: e.target.value });

    
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.userName || !formData.email || !formData.password) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all fields",
      })
      return;
    }
    const userExists = userData.some(user =>
      user.email === formData.email || user.userName === formData.userName
    )

    if (userExists) {
      Swal.fire({
        icon: "error",
        title: "Not Available",
        text: "Email or Username already exists",
      })
      return;

    }

    try {
      await api.post("/signup", {
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
        userImage: formData.userImage,   
      }, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });


      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Signup successful",
      }).then(() => {
        navigate("/login", { replace: true });
      });

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Signup Failed",
        text: error.response?.data?.message || "Cannot sign up",
      });
    }
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#F0FFF0" }}
    >
      <div
        className="p-4 rounded shadow-lg"
        style={{ width: "400px", background: "white", borderRadius: "20px" }}
      >
        <h3 className="text-center fw-bold mb-4" style={{ color: "#0A382B" }}>
          Sign Up
        </h3>
        <form autoComplete="off" onSubmit={handleSignup}>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="userName"
              className="form-control shadow-sm"
              placeholder="Enter your name"
              autoComplete="off"
              value={formData.userName}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control shadow-sm"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="off"
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
              autoComplete="new-password"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Image</label>
            <input
              type="file"
              name="userImage"
              className="form-control shadow-sm"
              placeholder="Enter your password"
              onChange={handleImage}
            />
          </div>

          <button
            type="submit"
            className="btn btn-success w-100 fw-semibold"
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(25, 135, 84, 0.4)",
            }}
          >
            Sign Up
          </button>
        </form>

        <p className="text-center mt-3 mb-0">
          Already have an account?{" "}
          <Link to="/login" className="text-success fw-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
