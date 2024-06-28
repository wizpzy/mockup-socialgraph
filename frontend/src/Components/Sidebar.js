import React from "react";
import "./Sidebar.css"; // Import CSS for styling

const Sidebar = ({ onClose, children }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
      </div>
      <div className="sidebar-content">
        {children}
      </div>
    </div>
  );
};

export default Sidebar;
