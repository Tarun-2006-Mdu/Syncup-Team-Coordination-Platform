import { createSlice } from "@reduxjs/toolkit";

const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("token");

let parsedUser = null;

try {
  parsedUser = storedUser
    ? JSON.parse(storedUser)
    : null;
} catch (error) {
  parsedUser = null;
}

const initialState = {
  user: parsedUser,
  token: storedToken || null,
  isAuthenticated: !!(
    storedUser && storedToken
  ),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    loginSuccess: (state, action) => {
      const payload = action.payload || {};

      state.loading = false;
      state.error = null;

      state.user = payload.user || null;
      state.token = payload.token || null;

      state.isAuthenticated = !!(
        payload.user &&
        payload.token
      );

      if (payload.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(payload.user)
        );
      }

      if (payload.token) {
        localStorage.setItem(
          "token",
          payload.token
        );
      }
    },

    loginFailure: (state, action) => {
      state.loading = false;
      state.error =
        action.payload || "Login failed";

      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },

    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    registerSuccess: (state, action) => {
      const payload = action.payload || {};

      state.loading = false;
      state.error = null;

      state.user = payload.user || null;
      state.token = payload.token || null;

      state.isAuthenticated = !!(
        payload.user &&
        payload.token
      );

      if (payload.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(payload.user)
        );
      }

      if (payload.token) {
        localStorage.setItem(
          "token",
          payload.token
        );
      }
    },

    registerFailure: (state, action) => {
      state.loading = false;
      state.error =
        action.payload ||
        "Registration failed";

      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;