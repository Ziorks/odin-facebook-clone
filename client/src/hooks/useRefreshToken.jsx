import { useContext } from "react";
import axios from "axios";
import AuthContext from "../contexts/AuthContext";
import api from "../api";

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
      if (!axios.isCancel(err)) {
        console.error("no valid session", err);
      }
    }
  };

  return refresh;
};

export default useRefreshToken;
