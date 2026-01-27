import { createContext, useState } from "react";
import axios from "axios";
import useApiPrivate from "../hooks/useApiPrivate";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const api = useApiPrivate();
  const [auth, setAuth] = useState({});
  const [logoutError, setLogoutError] = useState(null);

  const setAuthFromResponse = (response) => {
    const accessToken = response?.data?.accessToken;
    const user = response?.data?.user;
    setAuth({ user, accessToken });
  };

  const clearAuth = () => {
    setAuth({});
  };

  const logout = (onSuccess) => {
    api
      .post("/auth/logout", {}, { withCredentials: true })
      .then((resp) => {
        clearAuth();
        onSuccess?.(resp.data);
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;

        console.error("logout failed", err);
        setLogoutError(err.response?.data?.message || "Something went wrong.");
      });
  };

  return (
    <AuthContext.Provider
      value={{ auth, setAuthFromResponse, clearAuth, logout, logoutError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
