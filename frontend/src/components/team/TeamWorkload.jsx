import { useEffect, useState } from "react";

import api from "../../services/api";

import EmptyState from "../common/EmptyState";


function TeamWorkload() {

  const [workload, setWorkload] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =========================================================
  // LOAD TEAM WORKLOAD
  // =========================================================

  const loadWorkload = async () => {

    setLoading(true);
    setError("");

    try {

      const response =
        await api.get("/api/team/workload");

      const data =
        response.data;


      const mappedData =
        Array.isArray(data)

          ? data.map(
              (member, index) => ({

                userId:
                  member.userId ??
                  member.id ??
                  index,


                username:
                  member.username ??
                  member.name ??
                  `User ${
                    member.userId ??
                    member.id ??
                    index
                  }`,


                assignedTasks:
                  Number(
                    member.assignedTasks ??
                    member.taskCount ??
                    member.count ??
                    0
                  ),


                capacity:
                  Number(
                    member.capacity ?? 10
                  ),

              })
            )

          : [];


      setWorkload(
        mappedData
      );


    } catch (error) {

      setError(
        error?.message ||
        "Unable to load team workload."
      );


      setWorkload([]);

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    loadWorkload();

  }, []);


  // =========================================================
  // HELPERS
  // =========================================================

  const getUtilization = (
    used,
    capacity
  ) => {

    if (
      !capacity ||
      capacity <= 0
    ) {
      return 0;
    }


    return Math.min(
      Math.round(
        (used / capacity) * 100
      ),
      100
    );

  };


  const getWorkloadStatus = (
    used,
    capacity
  ) => {

    const percentage =
      getUtilization(
        used,
        capacity
      );


    if (
      percentage >= 80
    ) {

      return {
        label: "High",
        className: "workload-high",
      };

    }


    if (
      percentage >= 50
    ) {

      return {
        label: "Moderate",
        className: "workload-medium",
      };

    }


    return {
      label: "Low",
      className: "workload-low",
    };

  };


  const getInitials = (
    username
  ) => {

    if (!username) {
      return "U";
    }


    const words =
      username
        .trim()
        .split(/\s+/);


    if (
      words.length >= 2
    ) {

      return (
        words[0].charAt(0) +
        words[1].charAt(0)
      ).toUpperCase();

    }


    return username
      .substring(0, 2)
      .toUpperCase();

  };


  const getAvatarClass = (
    index
  ) => {

    const classes = [

      "workload-avatar-purple",

      "workload-avatar-blue",

      "workload-avatar-green",

      "workload-avatar-orange",

      "workload-avatar-pink",

      "workload-avatar-cyan",

    ];


    return classes[
      index % classes.length
    ];

  };


  // =========================================================
  // SUMMARY CALCULATIONS
  // =========================================================

  const totalTasks =
    workload.reduce(
      (total, member) =>
        total +
        member.assignedTasks,
      0
    );


  const totalCapacity =
    workload.reduce(
      (total, member) =>
        total +
        member.capacity,
      0
    );


  const overallUtilization =
    totalCapacity > 0

      ? Math.round(
          (totalTasks /
            totalCapacity) *
            100
        )

      : 0;


  const activeMembers =
    workload.filter(
      (member) =>
        member.assignedTasks > 0
    ).length;


  const highWorkloadMembers =
    workload.filter(
      (member) =>
        getUtilization(
          member.assignedTasks,
          member.capacity
        ) >= 80
    ).length;


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <main className="team-workload">

        <div className="team-workload-loading">

          <div className="workload-loading-spinner">
          </div>


          <h3>
            Loading team workload
          </h3>


          <p>
            Fetching the latest team
            capacity information...
          </p>

        </div>

      </main>

    );

  }


  // =========================================================
  // UI
  // =========================================================

  return (

    <main className="team-workload">


      {/* ======================================
          HEADER
          ====================================== */}

      <div className="team-workload-header">

        <div className="workload-title-section">

          <div className="workload-title-icon">
            👥
          </div>


          <div>

            <div className="workload-eyebrow">
              TEAM ANALYTICS
            </div>


            <h2>
              Team Workload
            </h2>


            <p>
              Monitor task assignments and
              capacity across your team.
            </p>

          </div>

        </div>


        <button
          type="button"
          className="workload-refresh-button"
          onClick={loadWorkload}
        >

          <span className="refresh-icon">
            ↻
          </span>

          Refresh

        </button>

      </div>


      {/* ======================================
          ERROR
          ====================================== */}

      {error && (

        <div
          className="error-message workload-error"
          role="alert"
        >

          <span className="workload-error-icon">
            !
          </span>


          <div>

            <strong>
              Unable to load workload
            </strong>


            <p>
              {error}
            </p>

          </div>

        </div>

      )}


      {/* ======================================
          SUMMARY CARDS
          ====================================== */}

      {workload.length > 0 && (

        <div className="workload-summary-grid">


          {/* TOTAL TASKS */}

          <div className="workload-summary-card summary-purple">

            <div className="summary-card-icon">
              ✓
            </div>


            <div>

              <span>
                Total Tasks
              </span>


              <strong>
                {totalTasks}
              </strong>


              <small>
                Assigned across team
              </small>

            </div>

          </div>


          {/* ACTIVE MEMBERS */}

          <div className="workload-summary-card summary-blue">

            <div className="summary-card-icon">
              👤
            </div>


            <div>

              <span>
                Active Members
              </span>


              <strong>
                {activeMembers}
              </strong>


              <small>
                With assigned tasks
              </small>

            </div>

          </div>


          {/* TEAM UTILIZATION */}

          <div className="workload-summary-card summary-green">

            <div className="summary-card-icon">
              %
            </div>


            <div>

              <span>
                Team Utilization
              </span>


              <strong>
                {overallUtilization}%
              </strong>


              <small>
                Current capacity usage
              </small>

            </div>

          </div>


          {/* HIGH WORKLOAD */}

          <div className="workload-summary-card summary-orange">

            <div className="summary-card-icon">
              !
            </div>


            <div>

              <span>
                High Workload
              </span>


              <strong>
                {highWorkloadMembers}
              </strong>


              <small>
                Members needing attention
              </small>

            </div>

          </div>


        </div>

      )}


      {/* ======================================
          TEAM SECTION
          ====================================== */}

      {workload.length === 0 ? (

        <EmptyState
          title="No workload data"
          message="There is currently no team workload information available."
        />

      ) : (

        <section className="workload-team-section">


          {/* SECTION HEADER */}

          <div className="workload-section-header">

            <div>

              <h3>
                Team Capacity
              </h3>


              <p>
                Review individual assignments
                and available capacity.
              </p>

            </div>


            <span className="member-count-badge">
              {workload.length} members
            </span>

          </div>


          {/* TEAM CARDS */}

          <div className="workload-list">

            {workload.map(
              (member, index) => {

                const utilization =
                  getUtilization(
                    member.assignedTasks,
                    member.capacity
                  );


                const status =
                  getWorkloadStatus(
                    member.assignedTasks,
                    member.capacity
                  );


                const remainingCapacity =
                  Math.max(
                    member.capacity -
                    member.assignedTasks,
                    0
                  );


                return (

                  <div
                    className={`workload-card ${status.className}`}
                    key={member.userId}
                  >


                    {/* =================================
                        CARD ACCENT
                        ================================= */}

                    <div className="workload-card-accent">
                    </div>


                    {/* =================================
                        MEMBER HEADER
                        ================================= */}

                    <div className="workload-member-header">

                      <div className="workload-member-info">


                        <div
                          className={`workload-avatar ${getAvatarClass(
                            index
                          )}`}
                        >

                          {getInitials(
                            member.username
                          )}

                        </div>


                        <div>

                          <h3>
                            {member.username}
                          </h3>


                          <span className="workload-member-role">
                            Team Member
                          </span>

                        </div>

                      </div>


                      <span
                        className={`workload-status ${status.className}`}
                      >

                        <span className="status-dot">
                        </span>

                        {status.label}

                      </span>

                    </div>


                    {/* =================================
                        MAIN STATISTICS
                        ================================= */}

                    <div className="workload-stat-row">


                      <div className="workload-stat">

                        <span className="workload-stat-label">
                          Assigned Tasks
                        </span>


                        <strong>
                          {member.assignedTasks}
                        </strong>

                      </div>


                      <div className="workload-stat">

                        <span className="workload-stat-label">
                          Capacity
                        </span>


                        <strong>
                          {member.capacity}
                        </strong>

                      </div>


                      <div className="workload-stat">

                        <span className="workload-stat-label">
                          Utilization
                        </span>


                        <strong>
                          {utilization}%
                        </strong>

                      </div>


                    </div>


                    {/* =================================
                        WORKLOAD
                        ================================= */}

                    <div className="workload-capacity-section">


                      <div className="workload-capacity-header">

                        <span>
                          Workload
                        </span>


                        <strong>
                          {member.assignedTasks}
                          {" / "}
                          {member.capacity}
                        </strong>

                      </div>


                      <div className="workload-progress-track">

                        <div
                          className={`workload-progress-fill ${status.className}`}
                          style={{
                            width:
                              `${utilization}%`,
                          }}
                        >
                        </div>

                      </div>

                    </div>


                    {/* =================================
                        FOOTER
                        ================================= */}

                    <div className="workload-card-footer">

                      <span>

                        {remainingCapacity}{" "}

                        {remainingCapacity === 1
                          ? "task"
                          : "tasks"}{" "}

                        capacity remaining

                      </span>


                      <span>
                        {utilization}% utilized
                      </span>

                    </div>


                  </div>

                );

              }
            )}

          </div>

        </section>

      )}

    </main>

  );

}


export default TeamWorkload;