import { useEffect, useState } from "react";

import teamService from "../../services/teamService";

function AssignmentModal({
  task,
  onSuccess,
  onCancel,
}) {
  const [members, setMembers] = useState([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] =
    useState(true);
  const [error, setError] = useState("");

  // Load team members
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoadingMembers(true);
        setError("");

        const data =
          await teamService.getTeamMembers();

        setMembers(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        setError(
          error?.message ||
            "Unable to load team members."
        );
      } finally {
        setLoadingMembers(false);
      }
    };

    loadMembers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setError("Please select a team member.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await teamService.assignTask(
        task.id,
        Number(userId)
      );

      onSuccess();
    } catch (error) {
      setError(
        error?.message ||
          "Unable to assign task."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assignment-modal">
      <div className="assignment-modal-content">

        <h3>Assign Task</h3>

        <p>
          Task:{" "}
          {task?.title ||
            task?.name ||
            `Task #${task?.id}`}
        </p>

        {error && (
          <div
            className="error-message"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div>
            <label htmlFor="team-member">
              Team Member
            </label>

            <select
              id="team-member"
              value={userId}
              onChange={(e) =>
                setUserId(e.target.value)
              }
              disabled={
                loading ||
                loadingMembers
              }
            >
              <option value="">
                {loadingMembers
                  ? "Loading members..."
                  : "-- Choose Member --"}
              </option>

              {members.map((member) => (
                <option
                  key={member.id}
                  value={member.id}
                >
                  {member.username}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">

            <button
              type="submit"
              disabled={
                loading ||
                loadingMembers ||
                !userId
              }
            >
              {loading
                ? "Assigning..."
                : "Confirm Assignment"}
            </button>

            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default AssignmentModal;