import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import authService from "../services/authService";

import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../store/slices/authSlice";

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector(
    (state) => state.auth
  );

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [role, setRole] =
    useState("TEAM_MEMBER");

  // =========================
  // PASSWORD VALIDATION
  // =========================

  const passwordRules = {
    minLength: password.length >= 8,
    maxLength:
      password.length <= 72,
    uppercase:
      /[A-Z]/.test(password),
    lowercase:
      /[a-z]/.test(password),
    number:
      /[0-9]/.test(password),
    special:
      /[^a-zA-Z0-9]/.test(password),
  };

  // =========================
  // EMAIL VALIDATION
  // =========================

  const isValidEmail = (value) => {
    return /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
      .test(value);
  };

  // =========================
  // USERNAME VALIDATION
  // =========================

  const isValidUsername = (value) => {
    return /^[a-zA-Z0-9_]+$/.test(value);
  };

  // =========================
  // FORM VALIDATION
  // =========================

  const validateForm = () => {

    const trimmedUsername =
      username.trim();

    const trimmedEmail =
      email.trim();

    // Username required
    if (!trimmedUsername) {
      return "Username is required.";
    }

    // Username length
    if (trimmedUsername.length < 3) {
      return "Username must contain at least 3 characters.";
    }

    if (trimmedUsername.length > 30) {
      return "Username must not exceed 30 characters.";
    }

    // Username characters
    if (!isValidUsername(trimmedUsername)) {
      return "Username can contain only letters, numbers, and underscores.";
    }

    // Email required
    if (!trimmedEmail) {
      return "Email is required.";
    }

    // Email format
    if (!isValidEmail(trimmedEmail)) {
      return "Please enter a valid email address.";
    }

    // Email length
    if (trimmedEmail.length > 100) {
      return "Email must not exceed 100 characters.";
    }

    // Password required
    if (!password) {
      return "Password is required.";
    }

    // Password length
    if (!passwordRules.minLength) {
      return "Password must contain at least 8 characters.";
    }

    if (!passwordRules.maxLength) {
      return "Password must not exceed 72 characters.";
    }

    // Uppercase
    if (!passwordRules.uppercase) {
      return "Password must contain at least one uppercase letter.";
    }

    // Lowercase
    if (!passwordRules.lowercase) {
      return "Password must contain at least one lowercase letter.";
    }

    // Number
    if (!passwordRules.number) {
      return "Password must contain at least one number.";
    }

    // Special character
    if (!passwordRules.special) {
      return "Password must contain at least one special character.";
    }

    // Role
    const validRoles = [
      "TEAM_MEMBER",
      "PROJECT_COORDINATOR",
      "STAKEHOLDER",
    ];

    if (!validRoles.includes(role)) {
      return "Please select a valid workspace role.";
    }

    return null;
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      dispatch(
        loginFailure(validationError)
      );
      return;
    }

    dispatch(loginStart());

    try {

      const response =
        await authService.register({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
        });

      const data =
        response?.data || response;

      // =========================
      // AUTO LOGIN
      // =========================

      if (data?.token) {

        const user = {
          username:
            data.username ||
            username.trim(),

          role:
            data.role ||
            role,
        };

        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );

        dispatch(
          loginSuccess({
            user,
            token: data.token,
          })
        );

        navigate("/");

      } else {

        navigate("/login");
      }

    } catch (error) {

      dispatch(
        loginFailure(
          error?.message ||
            "Unable to create account."
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
            +
          </div>

          <h1>
            Build something
            <br />
            great together.
          </h1>

          <p>
            Create a workspace where
            projects stay organized,
            tasks stay visible and
            everyone stays aligned.
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
          REGISTER PANEL
          ========================= */}

      <section className="auth-panel">

        <div className="auth-card register-card">

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
              GET STARTED
            </span>

            <h2>
              Create your account
            </h2>

            <p>
              Set up your SyncUp workspace
              profile.
            </p>

          </div>

          {/* =========================
              ERROR MESSAGE
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

              <label htmlFor="register-username">
                Username
              </label>

              <input
                id="register-username"
                type="text"
                placeholder="Pick a unique username"
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

              <small>
                3–30 characters. Letters,
                numbers and underscores only.
              </small>

            </div>

            {/* =========================
                EMAIL
                ========================= */}

            <div className="form-group">

              <label htmlFor="register-email">
                Email
              </label>

              <input
                id="register-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(
                    e.target.value
                  );
                  clearError();
                }}
                disabled={loading}
                autoComplete="email"
              />

            </div>

            {/* =========================
                PASSWORD
                ========================= */}

            <div className="form-group">

              <label htmlFor="register-password">
                Password
              </label>

              <input
                id="register-password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => {
                  setPassword(
                    e.target.value
                  );
                  clearError();
                }}
                disabled={loading}
                autoComplete="new-password"
              />

              {/* Password requirements */}

              {password && (
                <div className="password-rules">

                  <div
                    className={
                      passwordRules.minLength &&
                      passwordRules.maxLength
                        ? "rule valid"
                        : "rule"
                    }
                  >
                    {passwordRules.minLength &&
                    passwordRules.maxLength
                      ? "✓"
                      : "○"}{" "}
                    8–72 characters
                  </div>

                  <div
                    className={
                      passwordRules.uppercase
                        ? "rule valid"
                        : "rule"
                    }
                  >
                    {passwordRules.uppercase
                      ? "✓"
                      : "○"}{" "}
                    Uppercase letter
                  </div>

                  <div
                    className={
                      passwordRules.lowercase
                        ? "rule valid"
                        : "rule"
                    }
                  >
                    {passwordRules.lowercase
                      ? "✓"
                      : "○"}{" "}
                    Lowercase letter
                  </div>

                  <div
                    className={
                      passwordRules.number
                        ? "rule valid"
                        : "rule"
                    }
                  >
                    {passwordRules.number
                      ? "✓"
                      : "○"}{" "}
                    Number
                  </div>

                  <div
                    className={
                      passwordRules.special
                        ? "rule valid"
                        : "rule"
                    }
                  >
                    {passwordRules.special
                      ? "✓"
                      : "○"}{" "}
                    Special character
                  </div>

                </div>
              )}

            </div>

            {/* =========================
                ROLE
                ========================= */}

            <div className="form-group">

              <label htmlFor="register-role">
                Workspace Role
              </label>

              <select
                id="register-role"
                value={role}
                onChange={(e) => {
                  setRole(
                    e.target.value
                  );
                  clearError();
                }}
                disabled={loading}
              >

                <option value="TEAM_MEMBER">
                  Team Member
                </option>

                <option value="PROJECT_COORDINATOR">
                  Project Coordinator
                </option>

                <option value="STAKEHOLDER">
                  Stakeholder
                </option>

              </select>

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
                ? "Creating..."
                : "Create Account"}
            </button>

          </form>

          {/* =========================
              LOGIN LINK
              ========================= */}

          <div className="auth-switch">

            <span>
              Already have an account?
            </span>

            <Link to="/login">
              Sign in
            </Link>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Register;