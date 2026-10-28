import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import projectService from "../../services/projectService";

import {
  fetchProjectsStart,
  fetchProjectsSuccess,
  fetchProjectsFailure,
} from "../../store/slices/projectSlice";

import StatCards from "./StatCards";
import EmptyState from "../common/EmptyState";

function StakeholderDashboard() {
  const dispatch = useDispatch();

  const {
    items: projects,
    loading,
    error,
  } = useSelector(
    (state) => state.projects
  );

  const [progressMap, setProgressMap] =
    useState({});

  const [progressLoading, setProgressLoading] =
    useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      dispatch(fetchProjectsStart());

      try {
        const data =
          await projectService.getAll();

        const projectData =
          Array.isArray(data) ? data : [];

        dispatch(
          fetchProjectsSuccess(projectData)
        );

        // Load progress for each project
        setProgressLoading(true);

        const progressResults =
          await Promise.all(
            projectData.map(async (project) => {
              try {
                const progress =
                  await projectService.getProgress(
                    project.id
                  );

                return {
                  id: project.id,
                  progress: Number(progress) || 0,
                };
              } catch (error) {
                return {
                  id: project.id,
                  progress: 0,
                };
              }
            })
          );

        const mappedProgress = {};

        progressResults.forEach((item) => {
          mappedProgress[item.id] =
            item.progress;
        });

        setProgressMap(mappedProgress);

      } catch (error) {
        dispatch(
          fetchProjectsFailure(
            error?.message ||
              "Unable to load projects"
          )
        );
      } finally {
        setProgressLoading(false);
      }
    };

    loadProjects();
  }, [dispatch]);

  const stats = useMemo(() => {
    return [
      {
        label: "Total Projects",
        value: projects.length,
      },
      {
        label: "Planning",
        value: projects.filter(
          (project) =>
            project.status === "PLANNING"
        ).length,
      },
      {
        label: "Active",
        value: projects.filter(
          (project) =>
            project.status === "ACTIVE"
        ).length,
      },
      {
        label: "Completed",
        value: projects.filter(
          (project) =>
            project.status === "COMPLETED"
        ).length,
      },
    ];
  }, [projects]);

  // Calculate health status
  const calculateHealth = (
    project,
    progress
  ) => {
    if (
      project.status === "COMPLETED" ||
      progress >= 80
    ) {
      return "Healthy";
    }

    if (
      project.status === "ACTIVE" &&
      progress >= 40
    ) {
      return "On Track";
    }

    if (
      project.status === "ACTIVE" &&
      progress < 40
    ) {
      return "At Risk";
    }

    return "Planned";
  };

  if (
    loading &&
    projects.length === 0
  ) {
    return (
      <main className="dashboard">
        <h2>
          Strategic Portfolio Overview
        </h2>

        <p>
          Loading portfolio...
        </p>
      </main>
    );
  }

  return (
    <main className="dashboard">

      <div className="dashboard-header">

        <h2>
          Strategic Portfolio Overview
        </h2>

        <p>
          Monitor project progress and status.
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

      {projects.length === 0 ? (
        <EmptyState
          title="No projects"
          message="There are currently no projects available."
        />
      ) : (
        <section className="dashboard-projects">

          <h3>
            Portfolio Overview
          </h3>

          {progressLoading && (
            <p>
              Loading project progress...
            </p>
          )}

          <div className="portfolio-table-wrapper">

            <table className="portfolio-table">

              <thead>
                <tr>
                  <th>Initiative</th>
                  <th>Health Status</th>
                  <th>Overall Progress</th>
                  <th>Current Status</th>
                  <th>Target Date</th>
                </tr>
              </thead>

              <tbody>

                {projects.map((project) => {

                  const progress =
                    progressMap[
                      project.id
                    ] ?? 0;

                  const health =
                    calculateHealth(
                      project,
                      progress
                    );

                  return (
                    <tr
                      key={project.id}
                    >

                      <td>
                        <strong>
                          {project.name}
                        </strong>
                      </td>

                      <td>
                        {health}
                      </td>

                      <td>
                        {Math.round(
                          progress
                        )}
                        %
                      </td>

                      <td>
                        {project.status ||
                          "PLANNING"}
                      </td>

                      <td>
                        {project.endDate
                          ? new Date(
                              project.endDate
                            ).toLocaleDateString()
                          : "Not specified"}
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        </section>
      )}

    </main>
  );
}

export default StakeholderDashboard;