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
  useNavigate,
  useLocation,
} from "react-router-dom";

import projectService from "../../services/projectService";
import teamService from "../../services/teamService";

import {
  fetchProjectsStart,
  fetchProjectsSuccess,
  fetchProjectsFailure,
} from "../../store/slices/projectSlice";

import ProjectForm from "./ProjectForm";


function ProjectList() {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();


  // =========================================================
  // REDUX STATE
  // =========================================================

  const {
    items: projects,
    loading,
    error,
  } = useSelector(
    (state) => state.projects
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

  const [sortBy, setSortBy] =
    useState("DEFAULT");

  const [showForm, setShowForm] =
    useState(false);

  const [selectedProject, setSelectedProject] =
    useState(null);


  // =========================================================
  // DYNAMIC PROJECT PROGRESS
  // =========================================================

  const [projectProgress, setProjectProgress] =
    useState({});


  // =========================================================
  // THREE-DOT MENU
  // =========================================================

  const [openProjectMenu, setOpenProjectMenu] =
    useState(null);


  // =========================================================
  // ROLE CHECKS
  // =========================================================

  const isCoordinator =
    user?.role === "PROJECT_COORDINATOR";

  const isTeamMember =
    user?.role === "TEAM_MEMBER";

  const isStakeholder =
    user?.role === "STAKEHOLDER";


  // =========================================================
  // LOAD PROJECTS
  // =========================================================

  const loadProjects = async () => {

    dispatch(fetchProjectsStart());

    try {

      let projectList = [];


      // =====================================================
      // TEAM MEMBER
      // =====================================================

      if (isTeamMember) {

        /*
         * Team members should only see projects
         * where they have at least one assigned task.
         *
         * We first get the authenticated user's
         * assigned tasks from the backend.
         */

        const myTasks =
          await teamService.getMyTasks();


        const assignedTasks =
          Array.isArray(myTasks)
            ? myTasks
            : [];


        /*
         * Extract project IDs from assigned tasks.
         */

        const assignedProjectIds =
          new Set(
            assignedTasks
              .map(
                (task) =>
                  task?.project?.id ??
                  task?.projectId
              )
              .filter(
                (id) =>
                  id !== null &&
                  id !== undefined
              )
              .map(
                (id) =>
                  String(id)
              )
          );


        /*
         * Get projects.
         *
         * We still use getAll() here because the existing
         * project endpoint returns project information.
         *
         * The final displayed list is filtered using the
         * user's real assigned task/project relationship.
         */

        const allProjects =
          await projectService.getAll();


        const allProjectList =
          Array.isArray(allProjects)
            ? allProjects
            : [];


        projectList =
          allProjectList.filter(
            (project) =>
              assignedProjectIds.has(
                String(project.id)
              )
          );

      }


      // =====================================================
      // COORDINATOR / OTHER ROLES
      // =====================================================

      else {

        const data =
          await projectService.getAll();


        projectList =
          Array.isArray(data)
            ? data
            : [];

      }


      // =====================================================
      // STORE PROJECTS
      // =====================================================

      dispatch(
        fetchProjectsSuccess(
          projectList
        )
      );


      // =====================================================
      // LOAD PROGRESS FOR EACH PROJECT
      // =====================================================

      const progressEntries =
        await Promise.all(
          projectList.map(
            async (project) => {

              try {

                const progress =
                  await projectService.getProgress(
                    project.id
                  );


                const numericProgress =
                  Number(progress);


                return [
                  project.id,

                  Number.isFinite(
                    numericProgress
                  )
                    ? Math.min(
                        100,
                        Math.max(
                          0,
                          numericProgress
                        )
                      )
                    : 0,
                ];

              } catch (progressError) {

                console.error(
                  `Unable to load progress for project ${project.id}`,
                  progressError
                );


                return [
                  project.id,
                  0,
                ];

              }

            }
          )
        );


      setProjectProgress(
        Object.fromEntries(
          progressEntries
        )
      );


    } catch (error) {

      dispatch(
        fetchProjectsFailure(
          error?.message ||
            "Failed to load projects"
        )
      );

    }
  };


  // =========================================================
  // LOAD WHEN USER ROLE IS AVAILABLE
  // =========================================================

  useEffect(() => {

    loadProjects();

  }, [
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
      params.get("search") ||
      "";


    setSearch(searchValue);

  }, [
    location.search,
  ]);


  // =========================================================
  // FILTER + SORT PROJECTS
  // =========================================================

  const filteredProjects =
    useMemo(() => {

      const value =
        search
          .toLowerCase()
          .trim();


      let result =
        projects.filter(
          (project) => {

            const matchesSearch =
              !value ||
              `${project.name || ""} ${
                project.description || ""
              } ${
                project.status || ""
              }`
                .toLowerCase()
                .includes(value);


            const matchesStatus =
              statusFilter === "ALL" ||
              project.status ===
                statusFilter;


            return (
              matchesSearch &&
              matchesStatus
            );

          }
        );


      // =====================================================
      // SORT BY NAME ASC
      // =====================================================

      if (
        sortBy === "NAME_ASC"
      ) {

        result = [
          ...result,
        ].sort(
          (a, b) =>
            (a.name || "")
              .localeCompare(
                b.name || ""
              )
        );

      }


      // =====================================================
      // SORT BY NAME DESC
      // =====================================================

      if (
        sortBy === "NAME_DESC"
      ) {

        result = [
          ...result,
        ].sort(
          (a, b) =>
            (b.name || "")
              .localeCompare(
                a.name || ""
              )
        );

      }


      // =====================================================
      // SORT BY START DATE
      // =====================================================

      if (
        sortBy === "START_DATE"
      ) {

        result = [
          ...result,
        ].sort(
          (a, b) =>
            new Date(
              a.startDate || 0
            ) -
            new Date(
              b.startDate || 0
            )
        );

      }


      return result;

    }, [
      projects,
      search,
      statusFilter,
      sortBy,
    ]);


  // =========================================================
  // CREATE PROJECT
  // =========================================================

  const handleCreate = () => {

    setOpenProjectMenu(null);

    setSelectedProject(null);

    setShowForm(true);

  };


  // =========================================================
  // EDIT PROJECT
  // =========================================================

  const handleEdit = (
    project
  ) => {

    setOpenProjectMenu(null);

    setSelectedProject(
      project
    );

    setShowForm(true);

  };


  // =========================================================
  // FORM SUCCESS
  // =========================================================

  const handleFormSuccess = () => {

    setShowForm(false);

    setSelectedProject(null);

    setOpenProjectMenu(null);

    loadProjects();

  };


  // =========================================================
  // ARCHIVE PROJECT
  // =========================================================

  const handleArchive = async (
    project
  ) => {

    setOpenProjectMenu(null);


    const confirmed =
      window.confirm(
        `Are you sure you want to archive "${project.name}"?`
      );


    if (!confirmed) {
      return;
    }


    try {

      await projectService.archiveProject(
        project.id
      );


      await loadProjects();

    } catch (error) {

      alert(
        error?.message ||
          "Unable to archive the project."
      );

    }

  };


  // =========================================================
  // VIEW TASKS
  // =========================================================

  const handleViewTasks = (
    projectId
  ) => {

    setOpenProjectMenu(null);


    navigate(
      `/projects/${projectId}/tasks`
    );

  };


  // =========================================================
  // PROJECT INITIALS
  // =========================================================

  const getProjectInitials = (
    name
  ) => {

    if (!name) {
      return "PR";
    }


    const words =
      name
        .trim()
        .split(/\s+/);


    if (
      words.length === 1
    ) {

      return words[0]
        .substring(0, 2)
        .toUpperCase();

    }


    return (
      words[0].charAt(0) +
      words[1].charAt(0)
    ).toUpperCase();

  };


  // =========================================================
  // PROJECT THEME
  // =========================================================

  const getProjectTheme = (
    project,
    index
  ) => {

    const themes = [
      "project-theme-purple",
      "project-theme-green",
      "project-theme-blue",
      "project-theme-orange",
    ];


    return themes[
      index % themes.length
    ];

  };


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="project-page">


      {/* =====================================================
          PROJECT HEADER
          ===================================================== */}

      <div className="project-header">

        <div className="project-title-area">

          <div className="project-title-icon">
            ▰
          </div>


          <div>

            <h2>
              Project Registry
            </h2>


            <p>

              {isTeamMember
                ? "View and track projects connected to your assigned work."
                : "Manage and track your projects. Create, edit, and monitor progress all in one place."}

            </p>

          </div>

        </div>


        {/* ===================================================
            NEW PROJECT
            COORDINATOR ONLY
            =================================================== */}

        {isCoordinator && (

          <button
            type="button"
            className="primary-action"
            onClick={handleCreate}
          >

            <span>
              +
            </span>

            New Project

          </button>

        )}

      </div>


      {/* =====================================================
          FILTER BAR
          ===================================================== */}

      <div className="project-toolbar">

        <div className="project-search">

          <span className="project-search-icon">
            ⌕
          </span>


          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            aria-label="Search projects"
          />

        </div>


        <select
          className="project-filter"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          aria-label="Filter projects by status"
        >

          <option value="ALL">
            All Statuses
          </option>

          <option value="PLANNING">
            Planning
          </option>

          <option value="ACTIVE">
            Active
          </option>

          <option value="COMPLETED">
            Completed
          </option>

          <option value="ARCHIVED">
            Archived
          </option>

        </select>


        <select
          className="project-sort"
          value={sortBy}
          onChange={(e) =>
            setSortBy(
              e.target.value
            )
          }
          aria-label="Sort projects"
        >

          <option value="DEFAULT">
            Sort by
          </option>

          <option value="NAME_ASC">
            Name A-Z
          </option>

          <option value="NAME_DESC">
            Name Z-A
          </option>

          <option value="START_DATE">
            Start Date
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
          PROJECT FORM
          ===================================================== */}

      {showForm && (

        <ProjectForm
          project={selectedProject}

          onSuccess={
            handleFormSuccess
          }

          onCancel={() => {

            setShowForm(false);

            setSelectedProject(null);

            setOpenProjectMenu(null);

          }}
        />

      )}


      {/* =====================================================
          LOADING
          ===================================================== */}

      {loading &&
      projects.length === 0 ? (

        <div className="project-loading">

          <div className="loading-spinner" />

          <p>
            Loading projects...
          </p>

        </div>

      ) : filteredProjects.length ===
        0 ? (

        /* ===================================================
           EMPTY STATE
           =================================================== */

        <div className="empty-state">

          <div className="empty-state-icon">
            ▰
          </div>


          <h3>
            No projects found
          </h3>


          <p>

            {search ||
            statusFilter !== "ALL"

              ? "Try a different search or filter."

              : isTeamMember
                ? "You don't have any projects with assigned tasks yet."
                : "There are no projects available."}

          </p>


          {isCoordinator &&
            !search &&
            statusFilter === "ALL" && (

            <button
              type="button"
              onClick={handleCreate}
            >
              Create Project
            </button>

          )}

        </div>

      ) : (

        /* ===================================================
           PROJECT CARDS
           =================================================== */

        <div className="project-list">

          {filteredProjects.map(
            (
              project,
              index
            ) => {

              const theme =
                getProjectTheme(
                  project,
                  index
                );


              const initials =
                getProjectInitials(
                  project.name
                );


              const progress =
                Math.round(
                  projectProgress[
                    project.id
                  ] ?? 0
                );


              return (

                <div
                  className={`project-card ${theme}`}
                  key={project.id}
                >


                  <div className="project-card-main">


                    <div className="project-avatar">
                      {initials}
                    </div>


                    <div className="project-card-content">


                      <div className="project-card-title-row">

                        <h3>
                          {project.name}
                        </h3>


                        {/* =================================
                            THREE DOT MENU
                            ================================= */}

                        <div className="project-menu-wrapper">

                          <button
                            type="button"
                            className="project-menu-button"
                            aria-label={`More options for ${project.name}`}
                            onClick={() =>
                              setOpenProjectMenu(
                                openProjectMenu ===
                                  project.id
                                  ? null
                                  : project.id
                              )
                            }
                          >
                            ⋮
                          </button>


                          {openProjectMenu ===
                            project.id && (

                            <div className="project-menu">

                              {/* View Tasks - hidden for Stakeholder */}

                              {!isStakeholder && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleViewTasks(
                                      project.id
                                    )
                                  }
                                >
                                  View Tasks
                                </button>

                              )}


                              {isCoordinator && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEdit(
                                      project
                                    )
                                  }
                                >
                                  Edit Project
                                </button>

                              )}


                              {isCoordinator &&
                                project.status !==
                                  "ARCHIVED" && (

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleArchive(
                                      project
                                    )
                                  }
                                >
                                  Archive Project
                                </button>

                              )}

                            </div>

                          )}

                        </div>

                      </div>


                      <span
                        className={`status-badge ${
                          project.status
                            ?.toLowerCase()
                            .replace(
                              "_",
                              "-"
                            ) ||
                          "planning"
                        }`}
                      >
                        {project.status ||
                          "PLANNING"}
                      </span>


                      <p className="project-description">

                        {project.description ||
                          "No description available."}

                      </p>


                      <div className="project-dates">

                        <span>

                          <strong>

                            <span className="date-icon start-icon">
                              ●
                            </span>

                            Start:

                          </strong>{" "}

                          {project.startDate ||
                            "-"}

                        </span>


                        <span>

                          <strong>

                            <span className="date-icon end-icon">
                              ●
                            </span>

                            End:

                          </strong>{" "}

                          {project.endDate ||
                            "-"}

                        </span>

                      </div>


                      {/* =================================
                          PROJECT PROGRESS
                          ================================= */}

                      <div className="project-progress">

                        <div className="project-progress-header">

                          <span>
                            Progress
                          </span>


                          <strong>
                            {progress}%
                          </strong>

                        </div>


                        <div
                          className="project-progress-track"
                          role="progressbar"
                          aria-valuenow={
                            progress
                          }
                          aria-valuemin="0"
                          aria-valuemax="100"
                          aria-label={`Progress for ${project.name}`}
                        >

                          <div
                            className="project-progress-fill"
                            style={{
                              width:
                                `${progress}%`,
                            }}
                          />

                        </div>

                      </div>

                    </div>

                  </div>


                  {/* =================================================
                      PROJECT FOOTER
                      ================================================= */}

                  <div className="project-card-footer">

                    <div className="project-actions">


                      {/* View Tasks - hidden for Stakeholder */}

                      {!isStakeholder && (

                        <button
                          type="button"
                          className="project-action view-action"
                          onClick={() =>
                            handleViewTasks(
                              project.id
                            )
                          }
                        >

                          <span>
                            ◉
                          </span>

                          View Tasks

                        </button>

                      )}


                      {isCoordinator && (

                        <>

                          <button
                            type="button"
                            className="project-action edit-action"
                            onClick={() =>
                              handleEdit(
                                project
                              )
                            }
                          >

                            <span>
                              ✎
                            </span>

                            Edit

                          </button>


                          {project.status !==
                            "ARCHIVED" && (

                            <button
                              type="button"
                              className="project-action archive-action"
                              onClick={() =>
                                handleArchive(
                                  project
                                )
                              }
                            >

                              <span>
                                ▣
                              </span>

                              Archive

                            </button>

                          )}

                        </>

                      )}

                    </div>

                  </div>

                </div>

              );

            }
          )}

        </div>

      )}


      {/* =====================================================
          FOOTER
          ===================================================== */}

      {filteredProjects.length > 0 && (

        <div className="project-list-footer">

          <span>

            Showing{" "}

            <strong>
              {filteredProjects.length}
            </strong>{" "}

            of{" "}

            <strong>
              {projects.length}
            </strong>{" "}

            projects

          </span>


          <div className="pagination">

            <button
              type="button"
              disabled
              aria-label="Previous page"
            >
              ‹
            </button>


            <button
              type="button"
              className="pagination-active"
            >
              1
            </button>


            <button
              type="button"
              disabled
              aria-label="Next page"
            >
              ›
            </button>

          </div>

        </div>

      )}

    </div>
  );
}


export default ProjectList;