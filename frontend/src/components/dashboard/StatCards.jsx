import React from "react";

function StatCards({
  stats = [],
}) {
  return (
    <div className="stat-cards">

      {stats.map((stat) => (
        <div
          className="stat-card"
          key={stat.label}
        >
          <div className="stat-card-label">
            {stat.label}
          </div>

          <div className="stat-card-value">
            {stat.value}
          </div>

          {stat.description && (
            <div className="stat-card-description">
              {stat.description}
            </div>
          )}
        </div>
      ))}

    </div>
  );
}

export default StatCards;