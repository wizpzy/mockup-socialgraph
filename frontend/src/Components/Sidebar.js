import React from "react";
import "./Sidebar.css"; // Import CSS for styling

import { IoChevronForwardSharp } from "react-icons/io5";

const Sidebar = ({ onClose, children }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-header">
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="sidebar-body">{children}</div>
      </div>
      <div className="show-hide-button">
          <div><IoChevronForwardSharp /></div>
      </div>
    </div>
  );
};

export default Sidebar;
