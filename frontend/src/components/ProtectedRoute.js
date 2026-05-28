import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useEffect } from "react";

function ProtectedRoute({ children }) {
    const { loading, user } = useAuth();

    useEffect(() => {
        const handlePopState = () => {
            if (!localStorage.getItem("token")) {
                window.history.pushState(null, "", "/login");
                window.location.replace("/login");
            }
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    if (loading) return <h1>Loading...</h1>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;