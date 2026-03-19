import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useEffect } from "react";
import { isTokenValid } from "../utils/auth";
import { getToken } from "../api/authService";

function ProtectedRoute({ children }) {
    const navigate = useNavigate();
    const { loading, isAuthenticated, logoutAuth } = useAuth();

    useEffect(() => {
        if (!loading) {
            const valid = isTokenValid();
            const token=getToken();

            if (!token) {
                // Clear user data
                logoutAuth();
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                // Redirect to login
                navigate("/login");
            }
        }
    }, [loading, navigate, logoutAuth]);

    if (loading) return <h1>Loading...</h1>;

    // Only render children if authenticated AND token is valid
    if (!isAuthenticated ) return null;

    return children;
}

export default ProtectedRoute;