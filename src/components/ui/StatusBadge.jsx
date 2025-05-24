import React from "react";

const StatusBadge = ({ status, className }) => {
  const styles = {
    "in-progress": "bg-blue-200 text-blue-800",
    active: "bg-emerald-200 text-emerald-800",
  };

  const label = status === "in-progress" ? "En cours" : "Actif";

  return (
    <div
      className={`text-sm font-normal pt-1 pb-3.5 px-3 rounded-full ${styles[status]} ${className}`}
    >
      {label}
    </div>
  );
};

export { StatusBadge };
