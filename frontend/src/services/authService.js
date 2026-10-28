import api from "./api";

const authService = {
  async login(credentials) {
    const response = await api.post(
      "/api/auth/login",
      credentials
    );

    return response;
  },

  async register(userData) {
    const response = await api.post(
      "/api/auth/register",
      userData
    );

    return response;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export default authService;