import api from "./api";

const taskService = {
  async getAll() {
    const response = await api.get("/api/tasks");
    return response.data;
  },

  async getByProject(projectId) {
    const response = await api.get(
      `/api/tasks/project/${projectId}`
    );
    return response.data;
  },

  async create(taskData) {
    const response = await api.post(
      "/api/tasks",
      taskData
    );
    return response.data;
  },

  async updateTaskStatus(taskId, status) {
    const response = await api.patch(
      `/api/tasks/${taskId}/status`,
      null,
      {
        params: {
          status,
        },
      }
    );

    return response; // full response so callers can read .status (HTTP code)
  },

  async updateStatus(taskId, status) {
  const response = await api.patch(
    `/api/tasks/${taskId}/status`,
    null,
    {
      params: {
        status,
      },
    }
  );

  return response.data;
},
  async assignTask(taskId, userId) {
    const response = await api.post(
      "/api/team/assign",
      null,
      {
        params: {
          taskId,
          userId,
        },
      }
    );

    return response;
  },
};

export default taskService;