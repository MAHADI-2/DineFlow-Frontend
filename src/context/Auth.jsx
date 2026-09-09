import { useState, useEffect } from "react";
import API from './../Api';
import { AuthContext } from "./contexts";

const getSavedUser = () => {
    try {
        return JSON.parse(localStorage.getItem("userInfo") || localStorage.getItem("user")) || null;
    } catch {
        localStorage.removeItem("userInfo");
        return null;
    }
};

const AuthProvider = ({children}) => {
    const [user, setUser] = useState(getSavedUser);
    const [loading] = useState(false);
    const [token, setToken] = useState(() => localStorage.getItem("token") || null);

    const loginUser = (userData, userToken) => {
       setUser(userData);
       setToken(userToken);
       localStorage.setItem("userInfo", JSON.stringify(userData));
    localStorage.setItem("user", JSON.stringify(userData));
       localStorage.setItem("token", userToken);
       API.defaults.headers.common["token"] = userToken;
    };

    // প্রোফাইল এডিট করার পর user data রিফ্রেশ করার জন্য
    const updateUser = (updatedData) => {
        setUser(updatedData);
        localStorage.setItem("userInfo", JSON.stringify(updatedData));
        localStorage.setItem("user", JSON.stringify(updatedData));
    };

    useEffect(() => {
       const savedToken = localStorage.getItem("token");
       if (!savedToken) return;

       API.defaults.headers.common["token"] = savedToken;
       let active = true;
       API.get("/profile")
           .then((response) => {
               if (active && response.data.status === "success") {
                   updateUser(response.data.user);
               }
           })
           .catch((error) => {
               if (error.response?.status === 401) {
                   localStorage.removeItem("userInfo");
                   localStorage.removeItem("user");
                   localStorage.removeItem("token");
                   API.defaults.headers.common["token"] = null;
                   if (active) setUser(null);
               }
           });

       return () => { active = false; };
    }, []);

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("userInfo");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        API.defaults.headers.common["token"] = null;
    };
    
    return (
        <AuthContext.Provider value={{ user, token, loading, loginUser, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;