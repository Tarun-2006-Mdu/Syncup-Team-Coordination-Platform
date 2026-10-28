import api from "./api";

const projectService = {

  // Get projects
  async getProjects() {
    const response = await api.get(
      "/api/projects"
    );

    return response.data;
  },

  // Get all projects
  async getAll() {
    const response = await api.get(
      "/api/projects"
    );

    return response.data;
  },

  // Get project by ID
  async getById(id) {
    const response = await api.get(
      `/api/projects/${id}`
    );

    return response.data;
  },

  // Get projects assigned to a user
  async getByUser(userId) {
    const response = await api.get(
      `/api/projects/user/${userId}`
    );

    return response.data;
  },

  // Create project
  async create(projectData) {
    const response = await api.post(
      "/api/projects",
      projectData
    );

    return response.data;
  },

  // Update project
  async update(id, projectData) {
    const response = await api.put(
      `/api/projects/${id}`,
      projectData
    );

    return response.data;
  },

  // Delete project
  async delete(id) {
    const response = await api.delete(
      `/api/projects/${id}`
    );

    return response.data;
  },

  // Archive project
  async archiveProject(id) {
    const response = await api.patch(
      `/api/projects/${id}/archive`
    );

    return response;
  },

  // Archive project - alternate method
  async archive(id) {
    const response = await api.patch(
      `/api/projects/${id}/archive`
    );

    return response;
  },

  // =====================================================
  // GET PROJECT COMPLETION PROGRESS
  // =====================================================

  async getProgress(id) {
    const response = await api.get(
      `/api/projects/${id}/completion`
    );

    return response.data;
  },
};

export default projectService;