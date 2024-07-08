import React, { useState, useEffect } from "react";
import "./Sidebar.css"; // Import CSS for styling
import Axios from "axios";
import {
  IoChevronBackSharp,
  IoChevronForwardSharp,
  IoMailOpenSharp,
  IoGlobeOutline,
  IoLocationSharp 
} from "react-icons/io5";
import { MdLocalPhone } from "react-icons/md";
import CoverPic from "../images/Esicbackgroundpic.png";
import LogoPic from "../images/Logo-Responsive.png";

const Sidebar = ({ onClose, children }) => {
  const [isVisibleSidebar, setVisibleSidebar] = useState(true);

  const handleSidebar = () => {
    setVisibleSidebar(!isVisibleSidebar);
  };

  return (
    <>
      {isVisibleSidebar ? (
        <div className="sidebar">
          <div className="sidebar-content">
            <div className="sidebar-header">
              <button className="close-btn" onClick={onClose}>
                &times;
              </button>
              <div className="company-pic">
                <img src={CoverPic} alt="cover-image" className="cover-image" />
                {/* <img src={children.attributes.Image} alt="cover-image" className="cover-image" /> */}
              </div>
              <div className="company-logo">
                <img src={LogoPic} alt="logo-image" className="logo-image" />
                {/* <img src={children.attributes.Image} alt="logo-image" className="logo-image" /> */}
              </div>
            </div>
            <div className="sidebar-body">
              <div className="company-name">
                <p>Esic Plus</p>
                {/* <p>{children.attributes.Name}</p> */}
              </div>
              <div className="company-cover-letter">
                <p>
                  ESIC is a research group that enhance interactivity between
                  digital media and human beings
                </p>
                {/* <p>{children.attributes.Description}</p> */}
              </div>
              <div className="company-industry">
                <p>Design</p>
                {/* <p>{children.attributes.Industry}</p> */}
              </div>
              <div className="company-about">
                <b>About</b>
                <p>
                  ESIC Lab is EDUTAINMENT & SOCIO-INTERACTION COMPUTING Research
                  Group at Computer Engineering Department, King Mongkut's
                  University of technology Thonburi , Thailand.
                </p>
                {/* <p>{children.attributes.About}</p> */}
              </div>
              <div className="company-contact">
                <b>Contact</b>
                <div className="company-info">
                  <MdLocalPhone />
                  <p>(+66)2 115 1010</p>
                  {/* <p>{children.attributes.Tel}</p> */}
                </div>
                <div className="company-info">
                  <IoMailOpenSharp />
                  <p>info@esicplus.co.th</p>
                  {/* <p>{children.attributes.Email}</p> */}
                </div>
                <div className="company-info">
                  <IoGlobeOutline />
                  <p>https://esiclab.tech/esiclab</p>
                  {/* <p>{children.attributes.Website}</p> */}
                </div>
                <div className="company-info">
                  <IoLocationSharp  />
                  <p>
                    1346 Soi Anamai Ngam Charoen 25, Tha Kam, Bangkhuntien
                    District, Bangkok, Thailand 10150
                  </p>
                  {/* <p>{children.attributes.Address}</p> */}
                </div>
              </div>
              <div className="view-company-detail">
                  View Company <IoChevronForwardSharp />
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
