import { useState } from "react";
import taskService from "../../services/taskService";

function TaskForm({ projectId, task, onSuccess, onCancel }) {
  const isEdit = Boolean(task);

  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    priority: task?.priority || "MEDIUM",
    dueDate: task?.dueDate || "",
    projectId:
      task?.projectId ||
      task?.project?.id ||
      projectId ||
      "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (!formData.projectId) {
      setError("Project ID is required.");
      return;
    }

    setLoading(true);

    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        projectId: Number(formData.projectId),
      };

      if (isEdit) {
        // Update support can be added when the backend
        // provides a task update endpoint.
        setError("Task editing is not available yet.");
        return;
      }

      await taskService.create(taskData);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setError(
        error?.message ||
          "Unable to create task."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="task-form">

      <div className="task-form-header">
        <h3>
          {isEdit ? "Edit Task" : "Create Task"}
        </h3>
      </div>

      {error && (
        <div
          className="error-message"
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label htmlFor="task-title">
            Title
          </label>

          <input
            id="task-title"
            type="text"
            name="title"
            placeholder="e.g. Implement Auth Filter"
            value={formData.title}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="task-description">
            Description
          </label>

          <textarea
            id="task-description"
            name="description"
            placeholder="What needs to be done?"
            value={formData.description}
            onChange={handleChange}
            disabled={loading}
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="task-priority">
            Priority
          </label>

          <select
            id="task-priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="LOW">
              LOW
            </option>

            <option value="MEDIUM">
              MEDIUM
            </option>

            <option value="HIGH">
              HIGH
            </option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="task-due-date">
            Due Date
          </label>

          <input
            id="task-due-date"
            type="date"
            name="dueDate"
            value={formData.dueDate || ""}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="task-project">
            Project ID
          </label>

          <input
            id="task-project"
            type="number"
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            disabled={loading || Boolean(projectId)}
            required
          />
        </div>

        <div className="form-actions">

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : isEdit
              ? "Update Task"
              : "Create Task"}
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
  );
}

export default TaskForm;