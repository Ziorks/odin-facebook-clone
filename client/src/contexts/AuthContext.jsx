import { createContext, useState } from "react";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({});

  const setAuthFromResponse = (response) => {
    const accessToken = response?.data?.accessToken;
    const user = response?.data?.user;
    setAuth({ user, accessToken });
  };

  const clearAuth = () => {
    setAuth({});
  };

  return (
    <AuthContext.Provider value={{ auth, setAuthFromResponse, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
