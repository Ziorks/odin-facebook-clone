import { useContext, useEffect } from "react";
import api from "../api";
import AuthContext from "../contexts/AuthContext";
import useRefreshToken from "./useRefreshToken";

const useApiPrivate = () => {
  const { auth, clearAuth } = useContext(AuthContext);
  const refresh = useRefreshToken();

  useEffect(() => {
    const reqInterceptor = api.interceptors.request.use(
      (config) => {
        if (auth?.accessToken) {
          config.headers.Authorization = `Bearer ${auth.accessToken}`;
        }
        return config;
      },
      (err) => Promise.reject(err),
    );

    const resInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url.includes("/refresh")
        ) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await refresh();
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          } catch (refreshError) {
            console.error("token refresh error", refreshError);
            clearAuth();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      },
    );

    return () => {
      api.interceptors.request.eject(reqInterceptor);
      api.interceptors.response.eject(resInterceptor);
    };
  }, [auth, clearAuth, refresh]);

  return api;
};

export default useApiPrivate;
