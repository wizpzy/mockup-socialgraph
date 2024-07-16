import React, { useMemo } from "react";
import "./Sidebar.css"; // Import CSS for styling
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

const Sidebar = ({ children, selectedCompany, isVisibleSidebar, setVisibleSidebar, hasSidebar, setHasSidebar }) => {
  const handleSidebar = () => {
    setVisibleSidebar(!isVisibleSidebar);
  };

  const handleHasSidebar = () => {
    setHasSidebar(!hasSidebar);
  };

  const company = useMemo(() => {
    return children.find(child => child.id === selectedCompany);
  }, [children, selectedCompany]);

  return (
    <>
      {isVisibleSidebar ? (
        <div className="sidebar">
          <div className="sidebar-content">
            <div className="sidebar-header">
              <button className="close-btn" onClick={handleHasSidebar}>
                &times;
              </button>
              <div className="company-pic">
                <img src={CoverPic} alt="cover-image" className="cover-image" />
                {/* <img src={children.attributes.Image} alt="cover-image" className="cover-image" /> */}
              </div>
              <div className="company-logo">
                {
                  selectedCompany !== 0 && company.attributes.Image.data ?
                    <img src={'http://localhost:1337' + company.attributes.Image.data.attributes.url} alt="logo-image" className="logo-image" /> :
                    <img src={LogoPic} alt="logo-image" className="logo-image" />
                }

                {/* <img src={LogoPic} alt="logo-image" className="logo-image" /> */}
              </div>
            </div>
            <div className="sidebar-body">
              <div className="company-name">
                {/* <p>Esic Plus</p> */}
                <p>
                  {
                    selectedCompany !== 0 && company ?
                      company.attributes.Name :
                      "company name"}
                </p>
              </div>
              {/* <div className="company-cover-letter">
                <p>{selectedCompany !== 0 && company ? company.attributes.Description : "Company Description"}</p>
              </div> */}
              <div className="company-industry">
                {/* <p>Design</p> */}
                <p>
                  {
                    selectedCompany !== 0 && company.attributes.Industry.data ?
                      company.attributes.Industry.data.attributes.Name :
                      "industry"
                  }
                </p>
              </div>
              <div className="company-about">
                <b>About</b>
                <p>
                  {
                    selectedCompany !== 0 && company.attributes.Description ?
                      company.attributes.Description :
                      "Company Description"
                  }
                </p>
              </div>
              <div className="company-contact">
                <b>Contact</b>
                <div className="company-info">
                  <MdLocalPhone />
                  <p>
                    {
                      selectedCompany !== 0 && company.attributes.Tel ?
                        company.attributes.Tel :
                        "Company Tel"
                    }
                  </p>
                </div>
                <div className="company-info">
                  <IoMailOpenSharp />
                  {/* <p>info@esicplus.co.th</p> */}
                  <p>
                    {
                      selectedCompany !== 0 && company.attributes.Email ?
                        company.attributes.Email :
                        "Company Email"
                    }
                  </p>
                </div>
                <div className="company-info">
                  <IoGlobeOutline />
                  {/* <p>https://esiclab.tech/esiclab</p> */}

                  {
                    selectedCompany !== 0 && company.attributes.Website ?
                      <a href={company.attributes.Website}> {company.attributes.Website} </a> :
                      <p>Company Website</p>
                  }

                </div>
                <div className="company-info">
                  <IoLocationSharp />
                  <p>
                    {
                      selectedCompany !== 0 && company.attributes.Address ?
                        company.attributes.Address :
                        "Company Address"
                    }
                  </p>
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
