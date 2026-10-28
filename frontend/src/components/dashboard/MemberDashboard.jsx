import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import teamService from "../../services/teamService";

import {
  fetchTasksStart,
  fetchTasksSuccess,
  fetchTasksFailure,
} from "../../store/slices/taskSlice";

import StatCards from "./StatCards";
import CapacityBar from "../common/CapacityBar";
import EmptyState from "../common/EmptyState";

function MemberDashboard() {
  const dispatch = useDispatch();

  const user = useSelector(
    (state) => state.auth.user
  );

  const {
    items: tasks,
    loading,
    error,
  } = useSelector((state) => state.tasks);

  useEffect(() => {
    const loadTasks = async () => {
      dispatch(fetchTasksStart());

      try {
        const data =
          await teamService.getMyTasks();

        dispatch(
          fetchTasksSuccess(
            Array.isArray(data) ? data : []
          )
        );
      } catch (error) {
        dispatch(
          fetchTasksFailure(
            error?.message ||
              "Unable to load your tasks"
          )
        );
      }
    };

    loadTasks();
  }, [dispatch]);

  // Active tasks = everything except DONE
  const activeTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        task.status !== "DONE" &&
        task.status !== "COMPLETED"
    );
  }, [tasks]);

  const completedTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        task.status === "DONE" ||
        task.status === "COMPLETED"
    );
  }, [tasks]);

  const inProgressTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        task.status === "IN_PROGRESS"
    );
  }, [tasks]);

  const stats = useMemo(() => {
    return [
      {
        label: "Total Tasks",
        value: tasks.length,
      },
      {
        label: "Completed",
        value: completedTasks.length,
      },
      {
        label: "In Progress",
        value: inProgressTasks.length,
      },
      {
        label: "Pending",
        value: activeTasks.length,
      },
    ];
  }, [
    tasks,
    completedTasks,
    inProgressTasks,
    activeTasks,
  ]);

  // Get first 3 tasks with upcoming due dates
  const upcomingTasks = useMemo(() => {
    return [...activeTasks]
      .sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        return (
          new Date(a.dueDate) -
          new Date(b.dueDate)
        );
      })
      .slice(0, 3);
  }, [activeTasks]);

  if (loading && tasks.length === 0) {
    return (
      <main className="dashboard">
        <h2>My Workbench</h2>
        <p>Loading your tasks...</p>
      </main>
    );
  }

  return (
    <main className="dashboard">

      <div className="dashboard-header">
        <h2>My Workbench</h2>

        <p>
          Welcome,{" "}
          {user?.username || "Team Member"}.
        </p>
      </div>

      {error && (
        <div
          className="error-message"
          role="alert"
        >
          {error}
        </div>
      )}

      <StatCards stats={stats} />

      <CapacityBar
        used={activeTasks.length}
        capacity={5}
        label="Task Capacity"
      />

      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks assigned"
          message="You currently have no tasks to display."
        />
      ) : (
        <section className="dashboard-tasks">

          <h3>Upcoming Deadlines</h3>

          {upcomingTasks.length === 0 ? (
            <p>
              No active tasks currently have
              upcoming deadlines.
            </p>
          ) : (
            upcomingTasks.map((task) => (
              <div
                className="dashboard-task"
                key={task.id}
              >

                <div>
                  <strong>
                    {task.title ||
                      task.name ||
                      `Task #${task.id}`}
                  </strong>

                  {task.dueDate && (
                    <p>
                      Due:{" "}
                      {new Date(
                        task.dueDate
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <span>
                  {task.status ||
                    "BACKLOG"}
                </span>

              </div>
            ))
          )}

        </section>
      )}

    </main>
  );
}

export default MemberDashboard;