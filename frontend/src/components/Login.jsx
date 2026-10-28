import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import authService from "../services/authService";

import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../store/slices/authSlice";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector(
    (state) => state.auth
  );

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  // =========================
  // FORM SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // =========================
    // USERNAME VALIDATION
    // =========================

    const trimmedUsername =
      username.trim();

    if (!trimmedUsername || !password) {
      dispatch(
        loginFailure(
          "Username and password are required."
        )
      );
      return;
    }

    // =========================
    // USERNAME FORMAT
    // =========================

    if (trimmedUsername.length < 3) {
      dispatch(
        loginFailure(
          "Username must contain at least 3 characters."
        )
      );
      return;
    }

    if (trimmedUsername.length > 30) {
      dispatch(
        loginFailure(
          "Username must not exceed 30 characters."
        )
      );
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      dispatch(
        loginFailure(
          "Username can contain only letters, numbers, and underscores."
        )
      );
      return;
    }

    dispatch(loginStart());

    try {

      // =========================
      // LOGIN API
      // =========================

      const response =
        await authService.login({
          username: trimmedUsername,
          password,
        });

      const data =
        response?.data || response;

      // =========================
      // VALIDATE RESPONSE
      // =========================

      if (!data?.token) {
        throw new Error(
          "Invalid login response."
        );
      }

      const user = {
        username:
          data.username ||
          trimmedUsername,

        role:
          data.role || "",
      };

      // =========================
      // STORE AUTH DATA
      // =========================

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // =========================
      // REDUX
      // =========================

      dispatch(
        loginSuccess({
          user,
          token: data.token,
        })
      );

      // =========================
      // DASHBOARD
      // =========================

      navigate("/");

    } catch (error) {

      dispatch(
        loginFailure(
          error?.message ||
            "Invalid username or password."
        )
      );
    }
  };

  // =========================
  // CLEAR ERROR
  // =========================

  const clearError = () => {
    if (error) {
      dispatch(loginFailure(""));
    }
  };

  return (
    <div className="auth-page">

      {/* =========================
          VISUAL PANEL
          ========================= */}

      <section className="auth-visual">

        <div className="auth-brand">

          <div className="auth-brand-icon">
            ✦
          </div>

          <div>

            <strong>
              SyncUp
            </strong>

            <span>
              Tasks. People. Together.
            </span>

          </div>

        </div>

        <div className="auth-visual-content">

          <div className="auth-orbit orbit-one" />
          <div className="auth-orbit orbit-two" />
          <div className="auth-orbit orbit-three" />

          <div className="auth-visual-icon">
            →
          </div>

          <h1>
            Welcome
            <br />
            back to SyncUp.
          </h1>

          <p>
            Pick up where you left off.
            Your projects, tasks and team
            are waiting for you.
          </p>

        </div>

        <div className="auth-visual-footer">

          <span>
            Simple
          </span>

          <span>
            •
          </span>

          <span>
            Focused
          </span>

          <span>
            •
          </span>

          <span>
            Connected
          </span>

        </div>

      </section>

      {/* =========================
          LOGIN PANEL
          ========================= */}

      <section className="auth-panel">

        <div className="auth-card">

          <div className="auth-mobile-brand">

            <div className="auth-brand-icon">
              ✦
            </div>

            <strong>
              SyncUp
            </strong>

          </div>

          <div className="auth-heading">

            <span className="auth-eyebrow">
              WELCOME BACK
            </span>

            <h2>
              Sign in to your account
            </h2>

            <p>
              Enter your credentials to
              continue to your workspace.
            </p>

          </div>

          {/* =========================
              ERROR
              ========================= */}

          {error && (
            <div
              className="error-message auth-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            {/* =========================
                USERNAME
                ========================= */}

            <div className="form-group">

              <label htmlFor="login-username">
                Username
              </label>

              <input
                id="login-username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => {
                  setUsername(
                    e.target.value
                  );
                  clearError();
                }}
                disabled={loading}
                autoComplete="username"
              />

            </div>

            {/* =========================
                PASSWORD
                ========================= */}

            <div className="form-group">

              <label htmlFor="login-password">
                Password
              </label>

              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(
                    e.target.value
                  );
                  clearError();
                }}
                disabled={loading}
                autoComplete="current-password"
              />

            </div>

            {/* =========================
                SUBMIT
                ========================= */}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>

          </form>

          {/* =========================
              REGISTER LINK
              ========================= */}

          <div className="auth-switch">

            <span>
              Don't have an account?
            </span>

            <Link to="/register">
              Create account
            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Login;