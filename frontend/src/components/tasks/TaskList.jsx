import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useLocation,
  useParams,
} from "react-router-dom";

import taskService from "../../services/taskService";
import teamService from "../../services/teamService";

import {
  fetchTasksStart,
  fetchTasksSuccess,
  fetchTasksFailure,
  updateTask,
} from "../../store/slices/taskSlice";

import TaskForm from "./TaskForm";
import AssignmentModal from "./AssignmentModal";


function TaskList() {

  const dispatch = useDispatch();
  const location = useLocation();

  // =========================================================
  // GET PROJECT ID FROM URL
  // =========================================================

  const { projectId } = useParams();


  // =========================================================
  // REDUX STATE
  // =========================================================

  const {
    items: tasks,
    loading,
    error,
  } = useSelector(
    (state) => state.tasks
  );


  const user = useSelector(
    (state) => state.auth.user
  );


  // =========================================================
  // LOCAL STATE
  // =========================================================

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  const [showForm, setShowForm] =
    useState(false);

  const [showAssignment, setShowAssignment] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState(null);


  // =========================================================
  // ACCESS DENIED POPUP STATE
  // =========================================================

  const [accessDenied, setAccessDenied] =
    useState(false);

  const [accessDeniedMessage, setAccessDeniedMessage] =
    useState("");


  // =========================================================
  // ROLE CHECKS
  // =========================================================

  const isCoordinator =
    user?.role === "PROJECT_COORDINATOR";

  const isTeamMember =
    user?.role === "TEAM_MEMBER";


  // =========================================================
  // LOAD TASKS
  // =========================================================

  const loadTasks = async () => {

    dispatch(fetchTasksStart());

    try {

      let data;


      // =====================================================
      // TEAM MEMBER
      // =====================================================

      if (isTeamMember) {

        /*
         * Team members should only receive tasks
         * assigned to the currently logged-in user.
         */

        data =
          await teamService.getMyTasks();


        /*
         * If the user opened:
         *
         * /projects/{projectId}/tasks
         *
         * show only their assigned tasks
         * belonging to that project.
         */

        if (projectId) {

          data =
            Array.isArray(data)
              ? data.filter(
                  (task) =>
                    String(
                      task?.project?.id ??
                      task?.projectId
                    ) === String(projectId)
                )
              : [];
        }

      }


      // =====================================================
      // COORDINATOR + SPECIFIC PROJECT
      // =====================================================

      else if (projectId) {

        data =
          await taskService.getByProject(
            projectId
          );

      }


      // =====================================================
      // COORDINATOR + NORMAL TASK PAGE
      // =====================================================

      else {

        data =
          await taskService.getAll();

      }


      // =====================================================
      // STORE TASKS
      // =====================================================

      dispatch(
        fetchTasksSuccess(
          Array.isArray(data)
            ? data
            : []
        )
      );

    } catch (error) {

      dispatch(
        fetchTasksFailure(
          error?.message ||
            "Failed to load tasks"
        )
      );
    }
  };


  // =========================================================
  // LOAD WHEN PROJECT OR ROLE CHANGES
  // =========================================================

  useEffect(() => {

    loadTasks();

  }, [
    projectId,
    isTeamMember,
  ]);


  // =========================================================
  // READ SEARCH FROM HEADER URL
  // =========================================================

  useEffect(() => {

    const params =
      new URLSearchParams(
        location.search
      );

    const searchValue =
      params.get("search") || "";

    setSearch(searchValue);

  }, [
    location.search,
  ]);


  // =========================================================
  // FILTER TASKS
  // =========================================================

  const filteredTasks = useMemo(() => {

    const searchValue =
      search
        .toLowerCase()
        .trim();


    return tasks.filter(
      (task) => {

        const matchesSearch =
          !searchValue ||
          `${task.title || ""} ${
            task.name || ""
          } ${
            task.description || ""
          }`
            .toLowerCase()
            .includes(searchValue);


        const matchesStatus =
          statusFilter === "ALL" ||
          task.status === statusFilter;


        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );

  }, [
    tasks,
    search,
    statusFilter,
  ]);


  // =========================================================
  // UPDATE TASK STATUS
  // =========================================================

  const handleStatusChange = async (
    taskId,
    status
  ) => {

    try {

      const updatedTask =
        await taskService.updateStatus(
          taskId,
          status
        );


      // =====================================================
      // UPDATE REDUX STATE
      // =====================================================

      if (updatedTask) {

        dispatch(
          updateTask({
            ...updatedTask,

            id:
              updatedTask.id ??
              taskId,

            status:
              updatedTask.status ??
              status,
          })
        );

      } else {

        dispatch(
          updateTask({
            id: taskId,
            status,
          })
        );
      }


      // =====================================================
      // SUCCESS
      // =====================================================

    } catch (error) {

      // =====================================================
      // 403 ACCESS DENIED
      // =====================================================

      if (error?.status === 403) {

        setAccessDeniedMessage(
          error?.message ||
            "You are not assigned to this task."
        );

        setAccessDenied(true);

        return;
      }


      // =====================================================
      // OTHER ERROR
      // =====================================================

      setAccessDeniedMessage(
        error?.message ||
          "Unable to update task status."
      );

      setAccessDenied(true);
    }
  };


  // =========================================================
  // ASSIGN TASK
  // =========================================================

  const handleAssign = (task) => {

    setSelectedTask(task);

    setShowAssignment(true);
  };


  // =========================================================
  // CREATE TASK
  // =========================================================

  const handleCreate = () => {

    setSelectedTask(null);

    setShowForm(true);
  };


  // =========================================================
  // FORM SUCCESS
  // =========================================================

  const handleFormSuccess = () => {

    setShowForm(false);

    setSelectedTask(null);

    loadTasks();
  };


  // =========================================================
  // ASSIGNMENT SUCCESS
  // =========================================================

  const handleAssignmentSuccess = () => {

    setShowAssignment(false);

    setSelectedTask(null);

    loadTasks();
  };


  // =========================================================
  // CLOSE ACCESS DENIED POPUP
  // =========================================================

  const closeAccessDenied = () => {

    setAccessDenied(false);

    setAccessDeniedMessage("");
  };


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="task-page">


      {/* =====================================================
          ACCESS DENIED POPUP
          ===================================================== */}

      {accessDenied && (

        <div
          className="access-denied-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="access-denied-title"
        >

          <div className="access-denied-modal">

            <div className="access-denied-icon">
              🔒
            </div>


            <h3 id="access-denied-title">
              Action Not Allowed
            </h3>


            <p>
              {accessDeniedMessage}
            </p>


            <button
              type="button"
              onClick={
                closeAccessDenied
              }
            >
              OK
            </button>

          </div>

        </div>

      )}


      {/* =====================================================
          TASK HEADER
          ===================================================== */}

      <div className="task-header">

        <div>

          <h2>

            {projectId
              ? "Project Tasks"
              : isTeamMember
                ? "My Tasks"
                : "Tasks"}

          </h2>


          <p>

            {projectId
              ? isTeamMember
                ? "View your assigned tasks for this project."
                : "Manage and track tasks for this project."

              : isTeamMember
                ? "View and manage the tasks assigned to you."
                : "Manage and track project tasks."}

          </p>

        </div>


        {/* ===================================================
            CREATE TASK
            COORDINATOR ONLY
            =================================================== */}

        {isCoordinator && (

          <button
            type="button"
            onClick={handleCreate}
          >
            Create Task
          </button>

        )}

      </div>


      {/* =====================================================
          PROJECT INDICATOR
          ===================================================== */}

      {projectId && (

        <div
          className="project-task-context"
          aria-label={`Project ${projectId}`}
        >
          Project #{projectId}
        </div>

      )}


      {/* =====================================================
          TASK FILTERS
          ===================================================== */}

      <div className="task-filters">

        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          aria-label="Search tasks"
        />


        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          aria-label="Filter tasks by status"
        >

          <option value="ALL">
            All Statuses
          </option>

          <option value="BACKLOG">
            Backlog
          </option>

          <option value="IN_PROGRESS">
            In Progress
          </option>

          <option value="TESTING">
            Testing
          </option>

          <option value="DONE">
            Done
          </option>

        </select>

      </div>


      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (

        <div
          className="error-message"
          role="alert"
        >
          {error}
        </div>

      )}


      {/* =====================================================
          TASK FORM
          ===================================================== */}

      {showForm && (

        <TaskForm
          task={selectedTask}

          onSuccess={
            handleFormSuccess
          }

          onCancel={() => {

            setShowForm(false);

            setSelectedTask(null);

          }}
        />

      )}


      {/* =====================================================
          ASSIGNMENT MODAL
          ===================================================== */}

      {showAssignment &&
        selectedTask && (

          <AssignmentModal
            task={selectedTask}

            onSuccess={
              handleAssignmentSuccess
            }

            onCancel={() => {

              setShowAssignment(false);

              setSelectedTask(null);

            }}
          />

        )}


      {/* =====================================================
          LOADING
          ===================================================== */}

      {loading &&
      tasks.length === 0 ? (

        <div className="task-loading">

          <p>
            Loading tasks...
          </p>

        </div>

      ) : filteredTasks.length === 0 ? (

        /* ===================================================
           EMPTY STATE
           =================================================== */

        <div className="empty-state">

          <h3>
            No tasks found
          </h3>


          <p>

            {search ||
            statusFilter !== "ALL"

              ? "Try changing your filters."

              : projectId
                ? isTeamMember
                  ? "You have no assigned tasks for this project."
                  : "There are no tasks assigned to this project."

                : isTeamMember
                  ? "You do not have any tasks assigned to you."
                  : "There are no tasks available."}

          </p>

        </div>

      ) : (

        /* ===================================================
           TASK LIST
           =================================================== */

        <div className="task-list">

          {filteredTasks.map(
            (task) => (

              <div
                className="task-card"
                key={task.id}
              >


                {/* =========================================
                    TASK HEADER
                    ========================================= */}

                <div className="task-card-header">

                  <h3>

                    {task.title ||
                      task.name ||
                      `Task #${task.id}`}

                  </h3>


                  <span>
                    {task.status ||
                      "BACKLOG"}
                  </span>

                </div>


                {/* =========================================
                    DESCRIPTION
                    ========================================= */}

                <p>

                  {task.description ||
                    "No description available."}

                </p>


                {/* =========================================
                    DETAILS
                    ========================================= */}

                <div className="task-details">

                  {task.priority && (

                    <span>

                      Priority:{" "}

                      {task.priority}

                    </span>

                  )}


                  {/* =======================================
                      PROJECT
                      ======================================= */}

                  {task.project && (

                    <span>

                      Project:{" "}

                      {task.project.name}

                    </span>

                  )}


                  {task.projectId && (

                    <span>

                      Project:{" "}

                      {task.projectId}

                    </span>

                  )}

                </div>


                {/* =========================================
                    TASK ACTIONS
                    ========================================= */}

                <div className="task-actions">


                  {/* =======================================
                      STATUS DROPDOWN

                      Coordinator:
                      Can update any task.

                      Team Member:
                      Can update tasks returned by
                      /api/team/my-tasks.

                      Backend still validates assignment.
                      ======================================= */}

                  <select
                    value={
                      task.status ||
                      "BACKLOG"
                    }

                    onChange={(e) =>
                      handleStatusChange(
                        task.id,
                        e.target.value
                      )
                    }

                    aria-label={`Status for task ${
                      task.title ||
                      task.name ||
                      task.id
                    }`}
                  >

                    <option value="BACKLOG">
                      Backlog
                    </option>

                    <option value="IN_PROGRESS">
                      In Progress
                    </option>

                    <option value="TESTING">
                      Testing
                    </option>

                    <option value="DONE">
                      Done
                    </option>

                  </select>


                  {/* =======================================
                      ASSIGN BUTTON

                      COORDINATOR ONLY
                      ======================================= */}

                  {isCoordinator && (

                    <button
                      type="button"
                      onClick={() =>
                        handleAssign(task)
                      }
                    >
                      Assign
                    </button>

                  )}

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}


export default TaskList;