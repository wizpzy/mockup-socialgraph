import React, { useState, useEffect } from "react";
import "./Sidebar_product.css"; // Import CSS for styling
import Axios from "axios";
import {
  IoChevronBackSharp,
  IoChevronForwardSharp,
} from "react-icons/io5";
import PDCoverPic from "../images/EatlabCoverPic.png";

const Sidebar = ({ onClose, children }) => {
  const [isVisibleSidebar, setVisibleSidebar] = useState(true);

  const handleSidebar = () => {
    setVisibleSidebar(!isVisibleSidebar);
  };

  return (
    <>
      {isVisibleSidebar ? (
        <div className="pdsidebar">
          <div className="pdsidebar-content">
            <div className="pdsidebar-header">
              <button className="close-btn" onClick={onClose}>
                &times;
              </button>
              <div className="pd-pic">
                <img src={PDCoverPic} alt="pdcover-image" className="pdcover-image" />
                {/* <img src={children.attributes.Image} alt="cover-image" className="cover-image" /> */}
              </div>
            </div>
            <div className="pdsidebar-body">
              <div className="pd-name">
                <p>EatLab</p>
                {/* <p>{children.attributes.Name}</p> */}
              </div>
              <div className="pd-type">
                <p>Interactive Art</p>
                {/* <p>{children.attributes.Category}</p> */}
              </div>
              <div className="pd-about">
                <b>About</b>
                <p>
                Restaurants with an Interactive Menu to serve as a data center for studying consumer behavior. To analyze data and use it in the product design process to meet consumer needs as much as possible.
                </p>
                {/* <p>{children.attributes.About}</p> */}
              </div>
              <div className="view-pd-detail">
                  View Product <IoChevronForwardSharp />
              </div>
            </div>
          </div>
          <div className="hide-button">
            <button className="hide-icon" onClick={handleSidebar}>
              <IoChevronBackSharp />
            </button>
          </div>
        </div>
      ) : (
        <div className="h-sidebar">
          <div className="show-button">
            <button className="show-icon" onClick={handleSidebar}>
              <IoChevronForwardSharp />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
