import api from "./api";

const teamService = {
  async assignTask(taskId, userId) {
    const response = await api.post("/api/team/assign", null, {
      params: {
        taskId,
        userId,
      },
    });

    return response;
  },

  async getTeamWorkload() {
    const response = await api.get("/api/team/workload");
    return response;
  },

  async getWorkload() {
    const response = await api.get("/api/team/workload");
    return response.data;
  },

  async getTeamMembers() {
    const response = await api.get("/api/team/members");
    return response.data;
  },

  async getMyTasks() {
    const response = await api.get("/api/team/my-tasks");
    return response.data;
  },
};

export default teamService;