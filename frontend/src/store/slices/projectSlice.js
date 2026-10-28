import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const projectsSlice = createSlice({
  name: "projects",

  initialState,

  reducers: {
    setProjects: (state, action) => {
      state.items = Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    fetchProjectsStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    fetchProjectsSuccess: (state, action) => {
      state.loading = false;
      state.items = Array.isArray(action.payload)
        ? action.payload
        : [];
      state.error = null;
    },

    fetchProjectsFailure: (state, action) => {
      state.loading = false;
      state.error =
        action.payload || "Failed to load projects";
    },

    addProject: (state, action) => {
      state.items.push(action.payload);
    },

    updateProject: (state, action) => {
      const updatedProject = action.payload;

      const index = state.items.findIndex(
        (project) =>
          project.id === updatedProject.id
      );

      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          ...updatedProject,
        };
      }
    },

    updateProjectStatus: (state, action) => {
      const { id, status } = action.payload;

      const project = state.items.find(
        (project) => project.id === id
      );

      if (project) {
        project.status = status;
      }
    },

    removeProject: (state, action) => {
      state.items = state.items.filter(
        (project) =>
          project.id !== action.payload
      );
    },

    clearProjectsError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setProjects,
  fetchProjectsStart,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  addProject,
  updateProject,
  updateProjectStatus,
  removeProject,
  clearProjectsError,
} = projectsSlice.actions;

export default projectsSlice.reducer;