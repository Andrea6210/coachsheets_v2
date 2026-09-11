import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "https://coach-sheets-java-mysql.onrender.com";
export const API = `${BACKEND_URL}/api`;
export const WS_URL = BACKEND_URL ? BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://') : "wss://coach-sheets-java-mysql.onrender.com";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const decodeJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    if (token && token !== "undefined" && token !== "null") {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      const payload = decodeJwt(token);
      if (payload && payload.exp * 1000 > Date.now()) {
        // Fast init local-first (0 latenza)
        setUser({
          id: payload.userId,
          role: payload.role,
          name: payload.name || "Utente"
        });
        setLoading(false);
      } else {
        // Token scaduto o invalido
        logout();
        setLoading(false);
      }
    } else {
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];

    const res = await axios.post(`${API}/auth/login`, { email, password });
    
    const validToken = res.data.token || res.data.accessToken || res.data.access_token;
    
    if (validToken) {
      localStorage.setItem("token", validToken);
      setToken(validToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${validToken}`;
    }
    
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (email, password, name, role) => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];

    const res = await axios.post(`${API}/auth/register`, { email, password, name, role });
    
    const validToken = res.data.token || res.data.accessToken || res.data.access_token;
    
    if (validToken) {
      localStorage.setItem("token", validToken);
      setToken(validToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${validToken}`;
    }
    
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
