import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Provider } from "react-redux";
import store from "./store";

import Login from "./components/Login";
import Register from "./components/Register";
import Navbar from "./components/layout/Navbar";

import ProjectList from "./components/projects/ProjectList";
import TaskList from "./components/tasks/TaskList";
import TeamWorkload from "./components/team/TeamWorkload";

import MemberDashboard from "./components/dashboard/MemberDashboard";
import StakeholderDashboard from "./components/dashboard/StakeholderDashboard";

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user");

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const RoleDashboard = () => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(storedUser);
  } catch (error) {
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  switch (user?.role) {
    case "TEAM_MEMBER":
      return <MemberDashboard />;

    case "STAKEHOLDER":
      return <StakeholderDashboard />;

    case "PROJECT_COORDINATOR":
      return <ProjectList />;

    default:
      return (
        <div>
          <h2>Unknown Role</h2>
          <p>
            Your account does not have a valid role.
          </p>
        </div>
      );
  }
};

const DashboardPage = () => {
  return (
    <>
      <Navbar />

      <main>
        <RoleDashboard />
      </main>
    </>
  );
};

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>

          {/* Public Routes */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* Dashboard */}

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Projects */}

          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <ProjectList />
                </>
              </ProtectedRoute>
            }
          />

          {/* Tasks */}

          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <TaskList />
                </>
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects/:projectId/tasks"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <TaskList />
                </>
              </ProtectedRoute>
            }
          />

          {/* Team Workload */}

          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <TeamWorkload />
                </>
              </ProtectedRoute>
            }
          />

          {/* Unknown Routes */}

          <Route
            path="*"
            element={
              <Navigate
                to="/login"
                replace
              />
            }
          />

        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;