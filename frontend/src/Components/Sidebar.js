import React, { useMemo, useEffect } from "react";
import "./Sidebar.css";
import {
  IoChevronBackSharp,
  IoChevronForwardSharp,
  IoMailOpenSharp,
  IoGlobeOutline,
  IoLocationSharp,
  IoChevronDownSharp,
  IoCloseSharp,
  IoChevronUpSharp,
} from "react-icons/io5";
import { MdLocalPhone } from "react-icons/md";
import CoverPic from "../images/Esicbackgroundpic.png";
import LogoPic from "../images/Logo-Responsive.png";
import { motion, useAnimation } from "framer-motion";

const Sidebar = ({
  children,
  selectedCompany,
  isVisibleSidebar,
  setVisibleSidebar,
  hasSidebar,
  setHasSidebar,
}) => {
  const handleSidebar = () => {
    setVisibleSidebar(!isVisibleSidebar);
  };

  const handleHasSidebar = () => {
    setHasSidebar(!hasSidebar);
  };

  console.log(children);

  const controls = useAnimation();

  const onDragEnd = (event, info) => {
    if (info.velocity.y > 200 || (info.velocity.y >= 0 && info.point.y > 150)) {
      controls.start("hidden");
    } else {
      controls.start("visible");
    }
    console.log("Velocity:", info.velocity.y);
    console.log("Point:", info.point.y);
  };

  console.log(isVisibleSidebar);

  const handleAnimation = (state) => {
    if (state === "hidden") {
      setVisibleSidebar(false);
    } else if (state === "visible") {
      setVisibleSidebar(true);
    }
  };

  useEffect(() => {
    if (!hasSidebar) {
      controls.start("close");
    } else if (hasSidebar && isVisibleSidebar) {
      controls.start("visible");
    } else if (hasSidebar && !isVisibleSidebar) {
      controls.start("hidden");
    }
  }, [controls, hasSidebar, isVisibleSidebar]);

  const company = useMemo(() => {
    return children.find((child) => child.id === selectedCompany);
  }, [children, selectedCompany]);
  console.log(company);

  const ComapnyInfo = () => (
    <>
      <div className="company-name">
        <p>
          {selectedCompany !== 0 && company
            ? company.attributes.Name
            : "company name"}
        </p>
      </div>

      <div className="company-industry">
        <p>
          {selectedCompany !== 0 && company.attributes.Industry.data
            ? company.attributes.Industry.data.attributes.Name
            : "industry"}
        </p>
      </div>
      <div className="company-about">
        <b>About</b>
        <p>
          {selectedCompany !== 0 && company.attributes.Description
            ? company.attributes.Description
            : "Company Description"}
        </p>
      </div>
      <div className="company-allpic">
        <div className="pic">
          {selectedCompany !== 0 && company.attributes.Image.data ? (
            <img
              src={
                "http://localhost:1337" +
                company.attributes.Image.data.attributes.url
              }
            />
          ) : (
            <img src={LogoPic} />
          )}
        </div>
        <div className="pic">
          <img src={CoverPic} />
        </div>
      </div>

      <div className="company-contact">
        <b>Contact</b>
        <div className="company-info">
          <MdLocalPhone />
          <p>
            {selectedCompany !== 0 && company.attributes.Tel
              ? company.attributes.Tel
              : "Company Tel"}
          </p>
        </div>
        <div className="company-info">
          <IoMailOpenSharp />
          <p>
            {selectedCompany !== 0 && company.attributes.Email
              ? company.attributes.Email
              : "Company Email"}
          </p>
        </div>
        <div className="company-info">
          <IoGlobeOutline />

          {selectedCompany !== 0 && company.attributes.Website ? (
            <a href={company.attributes.Website}>
              {" "}
              {company.attributes.Website}{" "}
            </a>
          ) : (
            <p>Company Website</p>
          )}
        </div>
        <div className="company-info">
          <IoLocationSharp />
          <p>
            {selectedCompany !== 0 && company.attributes.Address
              ? company.attributes.Address
              : "Company Address"}
          </p>
        </div>
      </div>
      <div className="view-company-detail">
        View Company <IoChevronForwardSharp />
      </div>
    </>
  );

  return (
    <>
      {isVisibleSidebar ? (
        <div className="sidebar">
          <div className="sidebar-content">
            <div className="sidebar-header">
              <div className="btn">
                <button className="close-btn" onClick={handleHasSidebar}>
                  <IoCloseSharp />
                </button>
              </div>
              <div className="company-pic">
                <img src={CoverPic} alt="cover-image" className="cover-image" />
              </div>
              <div className="company-logo">
                {selectedCompany !== 0 && company.attributes.Image.data ? (
                  <img
                    src={
                      "http://localhost:1337" +
                      company.attributes.Image.data.attributes.url
                    }
                    alt="logo-image"
                    className="logo-image"
                  />
                ) : (
                  <img src={LogoPic} alt="logo-image" className="logo-image" />
                )}
              </div>
            </div>
            <div className="sidebar-body">
              <ComapnyInfo/>
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
      <motion.div
        className={`sidebar-res ${isVisibleSidebar ? "visible" : ""}`}
        drag="y"
        onDragEnd={onDragEnd}
        initial="hidden"
        animate={controls}
        onAnimationStart={handleAnimation}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 100,
        }}
        variants={{
          visible: { y: 0 },
          hidden: { y: "65%" },
          closed: { display: "none" },
        }}
        dragConstraints={{ top: 56 }}
        dragElastic={0.4}
        style={{
          display: "none",
          width: "100%",
          height: "100%",
          justifyContent: "center",
          zIndex: 1,
          position: "absolute",
        }}
      >
        <div className="sidebar-res-content">
          <div className="sidebar-res-header">
            <div className="dragedge">
              <div className="edge" />
            </div>
            <div className="btn">
              <button className="expand-btn" onClick={handleSidebar}>
                {isVisibleSidebar ? (
                  <IoChevronDownSharp />
                ) : (
                  <IoChevronUpSharp />
                )}
              </button>
              <button className="close-btn" onClick={handleHasSidebar}>
                <IoCloseSharp />
              </button>
            </div>
          </div>
          <div className="sidebar-body">
            <ComapnyInfo/>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
