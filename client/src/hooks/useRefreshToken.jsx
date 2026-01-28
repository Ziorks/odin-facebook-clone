import { useContext } from "react";
import axios from "axios";
import api from "../api";
import AuthContext from "../contexts/AuthContext";

const useRefreshToken = () => {
  const { setAuthFromResponse } = useContext(AuthContext);

  const refresh = async (signal) => {
    try {
      const response = await api.post(
        "/auth/refresh",
        {},
        { withCredentials: true, signal },
      );
      setAuthFromResponse(response);
      return response?.data?.accessToken;
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error("access token refresh failed", err);
      return Promise.reject(err);
    }
  };

  return refresh;
};

export default useRefreshToken;
