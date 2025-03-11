import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { useNavigate } from "react-router-dom";
import { ApiResponse } from "../types/api.types";
import localStorageService from "../services/localStorage.service";
import { useUser } from "../context/UserContext";

export const API_URL = "http://localhost:3000/api/";

const useApiInstance = (contentType: string): AxiosInstance => {
  const { token, refreshToken, login, logout, user } = useUser();
  const navigate = useNavigate();

  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": contentType,
    },
  });

  instance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig | undefined;

      if (
        (error.response?.status === 401 || error.response?.status === 403) &&
        originalRequest
      ) {
        try {
          const refreshResponse = await axios.post<ApiResponse<any>>(
            `${API_URL}auth/refresh`,
            {
              refreshToken,
            }
          );

          login(
            { ...user! },
            refreshResponse.data.data.accessToken,
            refreshResponse.data.data.refreshToken
          );

          localStorageService.setItem(
            "accessToken",
            refreshResponse.data.data.accessToken
          );
          localStorageService.setItem(
            "refreshToken",
            refreshResponse.data.data.refreshToken
          );

          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${refreshResponse.data.data.accessToken}`,
          };

          return axios(originalRequest);
        } catch (refreshError) {
          logout();
          localStorageService.clear();
          navigate("/welcome-page");
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export const useApiJson = () => useApiInstance("application/json");
export const useApiMultipart = () => useApiInstance("multipart/form-data");
export const useApi = () => useApiInstance("");
