import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  loading: false,
  error: null,
  searchQuery: "",
};

const taskSlice = createSlice({
  name: "tasks",

  initialState,

  reducers: {
    fetchTasksStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    fetchTasksSuccess: (state, action) => {
      state.loading = false;
      state.items = action.payload;
      state.error = null;
    },

    fetchTasksFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },

    addTask: (state, action) => {
      state.items.push(action.payload);
    },

    updateTask: (state, action) => {
      const index = state.items.findIndex(
        (task) => task.id === action.payload.id
      );

      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          ...action.payload,
        };
      }
    },

    updateTaskStatus: (state, action) => {
      const { id, status } = action.payload;

      const task = state.items.find(
        (task) => task.id === id
      );

      if (task) {
        task.status = status;
      }
    },

    removeTask: (state, action) => {
      state.items = state.items.filter(
        (task) => task.id !== action.payload
      );
    },

    clearTasksError: (state) => {
      state.error = null;
    },

    clearSearchQuery: (state) => {
      state.searchQuery = "";
    },
  },
});

export const {
  fetchTasksStart,
  fetchTasksSuccess,
  fetchTasksFailure,
  setSearchQuery,
  addTask,
  updateTask,
  updateTaskStatus,
  removeTask,
  clearTasksError,
  clearSearchQuery,
} = taskSlice.actions;

export default taskSlice.reducer;