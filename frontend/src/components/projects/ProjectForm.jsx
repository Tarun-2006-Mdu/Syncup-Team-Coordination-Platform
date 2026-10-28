import { useState } from "react";

import projectService from "../../services/projectService";

function ProjectForm({
  project,
  onSuccess,
  onCancel,
}) {
  const isEdit = Boolean(project);

  const [formData, setFormData] = useState({
    name: project?.name || "",
    description: project?.description || "",
    startDate: project?.startDate || "",
    endDate: project?.endDate || "",
    priority: project?.priority || "MEDIUM",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const dataToSubmit = {
        ...formData,
        priority: formData.priority || "MEDIUM",
      };

      if (isEdit) {
        await projectService.update(
          project.id,
          dataToSubmit
        );

        setSuccess("Project updated successfully.");
      } else {
        await projectService.create(
          dataToSubmit
        );

        setSuccess("Project created successfully.");
      }

      onSuccess();
    } catch (error) {
      const message =
        error?.response?.data ||
        error?.message ||
        "Unable to save project.";

      setError(
        typeof message === "string"
          ? message
          : "Unable to save project."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-form">

      <h3>
        {isEdit
          ? "Edit Project"
          : "Create Project"}
      </h3>

      {error && (
        <div
          className="error-message"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="success-message"
          role="status"
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* Project Name */}
        <div>
          <label htmlFor="project-name">
            Name
          </label>

          <input
            id="project-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter project name"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="project-description">
            Description
          </label>

          <textarea
            id="project-description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter project description"
          />
        </div>

        {/* Start Date */}
        <div>
          <label htmlFor="project-start-date">
            Start Date
          </label>

          <input
            id="project-start-date"
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
          />
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="project-end-date">
            End Date
          </label>

          <input
            id="project-end-date"
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
          />
        </div>

        {/* Priority */}
        <div>
          <label htmlFor="project-priority">
            Priority
          </label>

          <select
            id="project-priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="HIGH">
              High
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="LOW">
              Low
            </option>
          </select>
        </div>

        {/* Actions */}
        <div className="form-actions">

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : isEdit
                ? "Update Project"
                : "Create Project"}
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

export default ProjectForm;