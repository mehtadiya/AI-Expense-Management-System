import { createContext, useContext, useEffect, useState } from "react"
import { getToken, getUserData } from "../api/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const token = getToken();

        if (token) {
            const userData = getUserData();
            setUser(JSON.parse(userData));
        }

        setLoading(false);
    }, []);
    
    const loginAuth = (userData) => {
        setUser(userData);

    }

    const logoutAuth = () => {
        setUser(null);
    }

    return (
        <>
            <AuthContext.Provider
                value={{
                    loading,
                    user,
                    loginAuth,
                    logoutAuth,
                    isAuthenticated: user !== null,
                }}>
                {children}
            </AuthContext.Provider>
        </>
    );
};



export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be within AuthProvider")
    }
    return context;
}