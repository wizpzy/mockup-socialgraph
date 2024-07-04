import React, { useState } from "react";
import "./Sidebar.css"; // Import CSS for styling
import { IoChevronBackSharp, IoChevronForwardSharp } from "react-icons/io5";

const Sidebar = ({ onClose, children }) => {
  const [isVisibleSidebar, setVisibleSidebar] = useState(true);

  const handleSidebar = () => {
    setVisibleSidebar(!isVisibleSidebar);
  };

  return (
    <>
      {isVisibleSidebar && (
        <div className="sidebar">
          <div className="sidebar-content">
            <div className="sidebar-header">
              <button className="close-btn" onClick={onClose}>
                &times;
              </button>
              <div className="company-pic">
                <div></div>
              </div>
              <div className="company-logo">
                <div></div>
              </div>
            </div>
            <div className="sidebar-body">{children}</div>
          </div>
          <div className="hide-button">
            <button className="hide-icon" onClick={handleSidebar}>
              <IoChevronBackSharp />
            </button>
          </div>
        </div>
      )}
      {!isVisibleSidebar && (
        <div className="show-button">
          <button className="show-icon" onClick={handleSidebar}>
            <IoChevronForwardSharp />
          </button>
        </div>
      )}
    </>
  );
};

export default Sidebar;
