import React from "react";

function CapacityBar({
  used = 0,
  capacity = 100,
  label = "Capacity",
}) {
  const safeCapacity =
    Number(capacity) > 0
      ? Number(capacity)
      : 100;

  const safeUsed =
    Number(used) >= 0
      ? Number(used)
      : 0;

  const percentage = Math.min(
    100,
    Math.round(
      (safeUsed / safeCapacity) * 100
    )
  );

  return (
    <div className="capacity-container">

      <div className="capacity-header">
        <span>{label}</span>

        <span>
          {safeUsed} / {safeCapacity}
        </span>
      </div>

      <div
        className="capacity-bar"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          className="capacity-fill"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <small>
        {percentage}% utilized
      </small>

    </div>
  );
}

export default CapacityBar;