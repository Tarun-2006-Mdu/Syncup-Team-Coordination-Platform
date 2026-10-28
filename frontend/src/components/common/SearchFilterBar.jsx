import { useState } from "react";

import teamService from "../../services/teamService";

function AssignmentModal({
  task,
  onSuccess,
  onCancel,
}) {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setError("Please enter a user ID.");
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
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div>
            <label>User ID</label>

            <input
              type="number"
              value={userId}
              onChange={(e) =>
                setUserId(e.target.value)
              }
              placeholder="Enter user ID"
              min="1"
              required
            />
          </div>

          <div className="form-actions">

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Assigning..."
                : "Assign Task"}
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