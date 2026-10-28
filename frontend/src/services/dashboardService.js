import api from "./api";

const dashboardService = {
  async getStats() {
    const response = await api.get("/dashboard/stats");
    return response.data;
  },

  async getWorkload() {
    const response = await api.get("/team/workload");
    return response.data;
  },

  async getMemberDashboard() {
    const response = await api.get(
      "/dashboard/member"
    );
    return response.data;
  },

  async getStakeholderDashboard() {
    const response = await api.get(
      "/dashboard/stakeholder"
    );
    return response.data;
  },
};

export default dashboardService;