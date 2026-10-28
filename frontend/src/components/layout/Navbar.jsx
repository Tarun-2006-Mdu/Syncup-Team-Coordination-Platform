import { useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import {
  useNavigate,
  Link,
  useLocation,
} from "react-router-dom";

import { logout } from "../../store/slices/authSlice";

import projectService from "../../services/projectService";
import taskService from "../../services/taskService";
import teamService from "../../services/teamService";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector(
    (state) => state.auth.user
  );

  /* =========================================
     STATE
     ========================================= */

  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem("syncup-theme") === "dark"
    );
  });

  const [globalSearch, setGlobalSearch] = useState("");

  const [showSearchResults, setShowSearchResults] =
    useState(false);

  const [searchResults, setSearchResults] =
    useState([]);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [showNotifications, setShowNotifications] =
    useState(false);

  /* =========================================
     REFS
     ========================================= */

  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  /* =========================================
     THEME
     ========================================= */

  useEffect(() => {
    document.body.classList.toggle(
      "dark-mode",
      darkMode
    );

    localStorage.setItem(
      "syncup-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  /* =========================================
     CLOSE POPUPS OUTSIDE CLICK
     ========================================= */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setShowNotifications(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target
        )
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* =========================================
     ESCAPE KEY
     ========================================= */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowNotifications(false);
        setShowSearchResults(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /* =========================================
     LOGOUT
     ========================================= */

  const handleLogout = () => {
    dispatch(logout());

    setShowNotifications(false);
    setShowSearchResults(false);

    navigate("/login");
  };

  /* =========================================
     THEME TOGGLE
     ========================================= */

  const toggleTheme = () => {
    setDarkMode(
      (previous) => !previous
    );
  };

  /* =========================================
     ROLE LABEL
     ========================================= */

  const getRoleLabel = (role) => {
    switch (role) {
      case "TEAM_MEMBER":
        return "Member";

      case "PROJECT_COORDINATOR":
        return "Project Coordinator";

      case "STAKEHOLDER":
        return "Stakeholder";

      default:
        return "";
    }
  };

  /* =========================================
     ACTIVE ROUTE
     ========================================= */

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  /* =========================================
     ROLE
     ========================================= */

  const isTeamMember =
    user?.role === "TEAM_MEMBER";

  const isStakeholder =
    user?.role === "STAKEHOLDER";

  /* =========================================
     GLOBAL SEARCH
     ========================================= */

  const performGlobalSearch = async (value) => {
    const searchValue =
      value.trim().toLowerCase();

    if (!searchValue) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    setShowSearchResults(true);

    try {
      const [
        projectsResult,
        tasksResult,
        membersResult,
      ] = await Promise.allSettled([
        projectService.getAll(),
        taskService.getAll(),
        !isTeamMember
          ? teamService.getTeamMembers()
          : Promise.resolve([]),
      ]);

      const projects =
        projectsResult.status === "fulfilled" &&
        Array.isArray(projectsResult.value)
          ? projectsResult.value
          : [];

      const tasks =
        tasksResult.status === "fulfilled" &&
        Array.isArray(tasksResult.value)
          ? tasksResult.value
          : [];

      const members =
        membersResult.status === "fulfilled" &&
        Array.isArray(membersResult.value)
          ? membersResult.value
          : [];

      const results = [];

      /* =========================
         PROJECT SEARCH
         ========================= */

      projects
        .filter((project) => {
          const text = `
            ${project.name || ""}
            ${project.description || ""}
            ${project.status || ""}
          `.toLowerCase();

          return text.includes(searchValue);
        })
        .slice(0, 5)
        .forEach((project) => {
          results.push({
            type: "project",
            id: project.id,
            title:
              project.name ||
              "Unnamed Project",
            description:
              project.description ||
              "Project",
            status:
              project.status ||
              "PLANNING",
          });
        });

      /* =========================
         TASK SEARCH
         ========================= */

      tasks
        .filter((task) => {
          const text = `
            ${task.title || ""}
            ${task.name || ""}
            ${task.description || ""}
            ${task.status || ""}
          `.toLowerCase();

          return text.includes(searchValue);
        })
        .slice(0, 5)
        .forEach((task) => {
          results.push({
            type: "task",
            id: task.id,
            title:
              task.title ||
              task.name ||
              `Task #${task.id}`,
            description:
              task.description ||
              "Task",
            status:
              task.status ||
              "BACKLOG",
            projectId:
              task.projectId ||
              task.project?.id,
          });
        });

      /* =========================
         MEMBER SEARCH
         ========================= */

      members
        .filter((member) => {
          const text = `
            ${member.username || ""}
            ${member.email || ""}
          `.toLowerCase();

          return text.includes(searchValue);
        })
        .slice(0, 5)
        .forEach((member) => {
          results.push({
            type: "member",
            id: member.id,
            title:
              member.username ||
              "Unknown Member",
            description:
              member.email ||
              "Team Member",
          });
        });

      setSearchResults(
        results.slice(0, 10)
      );
    } catch (error) {
      console.error(
        "Global search failed:",
        error
      );

      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  /* =========================================
     SEARCH INPUT CHANGE
     ========================================= */

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setGlobalSearch(value);

    if (!value.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    performGlobalSearch(value);
  };

  /* =========================================
     SEARCH RESULT CLICK
     ========================================= */

  const handleSearchResultClick = (result) => {
    setShowSearchResults(false);
    setGlobalSearch("");

    if (result.type === "project") {
      navigate(
        `/projects?search=${encodeURIComponent(
          result.title
        )}`
      );

      return;
    }

    if (result.type === "task") {
      navigate(
        `/tasks?search=${encodeURIComponent(
          result.title
        )}`
      );

      return;
    }

    if (
      result.type === "member" &&
      !isTeamMember &&
      !isStakeholder
    ) {
      navigate(
        `/team?search=${encodeURIComponent(
          result.title
        )}`
      );
    }
  };

  /* =========================================
     ENTER SEARCH
     ========================================= */

  const handleGlobalSearch = (event) => {
    event.preventDefault();

    const value =
      globalSearch.trim();

    if (!value) {
      return;
    }

    if (searchResults.length > 0) {
      handleSearchResultClick(
        searchResults[0]
      );

      return;
    }

    navigate(
      `/projects?search=${encodeURIComponent(
        value
      )}`
    );

    setShowSearchResults(false);
  };

  /* =========================================
     NOTIFICATIONS
     ========================================= */

  const toggleNotifications = () => {
    setShowNotifications(
      (previous) => !previous
    );
  };

  /* =========================================
     AUTH CHECK
     ========================================= */

  if (!user) {
    return null;
  }

  return (
    <div className="app-shell">

      {/* =====================================
          TOP NAVBAR
          ===================================== */}

      <nav
        className="top-navbar"
        aria-label="Main navigation"
      >

        {/* =================================
            BRAND
            ================================= */}

        <div className="navbar-brand">
          <Link to="/">
            <div className="brand-icon">
              <span>✦</span>
            </div>

            <div className="brand-content">
              <strong>SyncUp</strong>

              <small>
                Tasks. People. Together.
              </small>
            </div>
          </Link>
        </div>

        {/* =================================
            GLOBAL SEARCH
            ================================= */}

        <div
          className="global-search-wrapper"
          ref={searchRef}
        >
          <form
            className="global-search"
            onSubmit={
              handleGlobalSearch
            }
          >
            <span className="search-icon">
              ⌕
            </span>

            <input
              type="search"
              placeholder="Search projects, tasks, or members..."
              aria-label="Global search"
              value={globalSearch}
              onChange={
                handleSearchChange
              }
              onFocus={() => {
                if (
                  globalSearch.trim()
                ) {
                  setShowSearchResults(
                    true
                  );
                }
              }}
            />

            {globalSearch && (
              <button
                type="button"
                className="global-search-clear"
                aria-label="Clear search"
                onClick={() => {
                  setGlobalSearch("");
                  setSearchResults([]);
                  setShowSearchResults(
                    false
                  );
                }}
              >
                ×
              </button>
            )}

            <button
              type="submit"
              className="global-search-button"
              aria-label="Search"
            >
              Search
            </button>
          </form>

          {/* =================================
              SEARCH RESULTS
              ================================= */}

          {showSearchResults && (
            <div
              className="global-search-results"
              role="listbox"
              aria-label="Search results"
            >
              {searchLoading ? (
                <div className="global-search-loading">
                  <span className="search-result-spinner" />
                  Searching...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="global-search-empty">
                  <div className="search-empty-icon">
                    ⌕
                  </div>

                  <strong>
                    No results found
                  </strong>

                  <span>
                    Try a different project,
                    task, or member name.
                  </span>
                </div>
              ) : (
                <>
                  <div className="search-results-heading">
                    Search results
                  </div>

                  {searchResults.map(
                    (result) => (
                      <button
                        type="button"
                        className="global-search-result"
                        key={`${result.type}-${result.id}`}
                        onClick={() =>
                          handleSearchResultClick(
                            result
                          )
                        }
                      >
                        <div
                          className={`search-result-icon ${result.type}`}
                        >
                          {result.type ===
                          "project"
                            ? "▰"
                            : result.type ===
                              "task"
                            ? "✓"
                            : "♙"}
                        </div>

                        <div className="search-result-content">
                          <strong>
                            {result.title}
                          </strong>

                          <span>
                            {result.type ===
                            "project"
                              ? "Project"
                              : result.type ===
                                "task"
                              ? "Task"
                              : "Team Member"}
                          </span>
                        </div>

                        <span className="search-result-arrow">
                          →
                        </span>
                      </button>
                    )
                  )}

                  <div className="search-results-footer">
                    Press Enter to open the
                    first result
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* =================================
            RIGHT SIDE
            ================================= */}

        <div className="navbar-right">

          {/* =================================
              THEME TOGGLE
              ================================= */}

          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            title={
              darkMode
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            <span className="theme-icon sun">
              ☀
            </span>

            <span className="theme-switch">
              <span
                className={`theme-switch-thumb ${
                  darkMode
                    ? "dark"
                    : ""
                }`}
              />
            </span>

            <span className="theme-icon moon">
              ☾
            </span>
          </button>

          {/* =================================
              NOTIFICATIONS
              ================================= */}

          <div
            className="notification-wrapper"
            ref={notificationRef}
          >
            <button
              type="button"
              className="notification-button"
              aria-label="Notifications"
              aria-expanded={
                showNotifications
              }
              onClick={
                toggleNotifications
              }
            >
              🔔

              <span className="notification-badge">
                3
              </span>
            </button>

            {showNotifications && (
              <div
                className="notification-panel"
                role="dialog"
                aria-label="Notifications"
              >
                <div className="notification-header">
                  <div className="notification-header-content">
                    <strong>
                      Notifications
                    </strong>

                    <small>
                      3 new updates
                    </small>
                  </div>

                  <button
                    type="button"
                    className="notification-close"
                    onClick={() =>
                      setShowNotifications(
                        false
                      )
                    }
                    aria-label="Close notifications"
                  >
                    ×
                  </button>
                </div>

                <div className="notification-item">
                  <div className="notification-item-icon">
                    ✓
                  </div>

                  <div className="notification-item-content">
                    <strong>
                      Project update
                    </strong>

                    <p>
                      A project has been
                      updated.
                    </p>

                    <small>
                      Recently
                    </small>
                  </div>
                </div>

                <div className="notification-item">
                  <div className="notification-item-icon">
                    !
                  </div>

                  <div className="notification-item-content">
                    <strong>
                      Task activity
                    </strong>

                    <p>
                      A task status was
                      changed.
                    </p>

                    <small>
                      Recently
                    </small>
                  </div>
                </div>

                <div className="notification-item">
                  <div className="notification-item-icon">
                    +
                  </div>

                  <div className="notification-item-content">
                    <strong>
                      Workspace activity
                    </strong>

                    <p>
                      Your workspace has
                      new activity.
                    </p>

                    <small>
                      Recently
                    </small>
                  </div>
                </div>

                <div className="notification-footer">
                  <button
                    type="button"
                    onClick={() =>
                      setShowNotifications(
                        false
                      )
                    }
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* =================================
              DIVIDER
              ================================= */}

          <div className="navbar-divider" />

          {/* =================================
              USER PROFILE
              ================================= */}

          <div className="navbar-user">
            <div className="user-avatar">
              {(user.username || "U")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="user-details">
              <span className="welcome-text">
                Welcome back!
              </span>

              <strong>
                {user.username}
              </strong>

              <small>
                {getRoleLabel(
                  user.role
                )}
              </small>
            </div>

            <span className="user-arrow">
              ▾
            </span>
          </div>

          {/* =================================
              LOGOUT
              ================================= */}

          <button
            type="button"
            className="navbar-logout"
            onClick={
              handleLogout
            }
          >
            Logout
          </button>
        </div>
      </nav>

      {/* =====================================
          SIDEBAR
          ===================================== */}

      <aside
        className="sidebar"
        aria-label="Sidebar navigation"
      >
        <div className="sidebar-navigation">

          {/* DASHBOARD */}

          <Link
            to="/"
            className={`sidebar-link ${
              isActive("/")
                ? "active"
                : ""
            }`}
          >
            <span className="sidebar-icon">
              ▦
            </span>

            <span>
              Dashboard
            </span>
          </Link>

          {/* PROJECTS */}

          <Link
            to="/projects"
            className={`sidebar-link ${
              isActive("/projects") &&
              !location.pathname.includes(
                "/tasks"
              )
                ? "active"
                : ""
            }`}
          >
            <span className="sidebar-icon">
              ▰
            </span>

            <span>
              Projects
            </span>
          </Link>

          {/* TASKS
              Hidden for STAKEHOLDER */}

          {!isStakeholder && (
            <Link
              to="/tasks"
              className={`sidebar-link ${
                location.pathname.includes(
                  "/tasks"
                )
                  ? "active"
                  : ""
              }`}
            >
              <span className="sidebar-icon">
                ✓
              </span>

              <span>
                Tasks
              </span>
            </Link>
          )}

          {/* TEAM
              Visible only for PROJECT_COORDINATOR */}

          {!isTeamMember &&
            !isStakeholder && (
              <Link
                to="/team"
                className={`sidebar-link ${
                  isActive("/team")
                    ? "active"
                    : ""
                }`}
              >
                <span className="sidebar-icon">
                  ♙
                </span>

                <span>
                  Team
                </span>
              </Link>
            )}
        </div>

        {/* SIDEBAR BOTTOM CARD */}

        <div className="sidebar-bottom-card">
          <div className="sidebar-team-icon">
            ♟
          </div>

          <h4>
            Better work
            <br />

            <strong>
              builds brighter
              <br />
              tomorrows.
            </strong>
          </h4>

          <span>
            Work smarter. Stay connected.
          </span>

          <div className="sidebar-accent-line" />
        </div>
      </aside>
    </div>
  );
}

export default Navbar;