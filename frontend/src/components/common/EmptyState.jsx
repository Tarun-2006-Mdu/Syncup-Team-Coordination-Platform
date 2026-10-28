import React from "react";

function EmptyState({
  title = "No data found",
  message = "There is nothing to display.",
  actionLabel,
  onAction,
}) {
  return (
    <div className="empty-state">

      <h3>{title}</h3>

      <p>{message}</p>

      {actionLabel && onAction && (
        <button onClick={onAction}>
          {actionLabel}
        </button>
      )}

    </div>
  );
}

export default EmptyState;