import axios from "axios";

const axiosConfig = {
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
};

const api =
  typeof axios.create === "function"
    ? axios.create(axiosConfig) || axios
    : axios;

if (api?.interceptors?.request?.use) {
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization =
          `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );
}

if (api?.interceptors?.response?.use) {
  api.interceptors.response.use(
    (response) => response,

    (error) => {
      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

      const normalizedError = {
        message:
          error?.response?.data?.message ||
          (
            typeof error?.response?.data === "string"
              ? error.response.data
              : error?.message
          ) ||
          "An unexpected error occurred",

        status:
          error?.response?.status || 0,

        timestamp:
          new Date().toISOString(),
      };

      return Promise.reject(normalizedError);
    }
  );
}

export default api;