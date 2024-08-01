import React, { useState, useEffect } from "react";
import "./Sidebar_product.css";
import {
  IoChevronBackSharp,
  IoChevronForwardSharp,
  IoChevronDownSharp,
  IoCloseSharp,
  IoChevronUpSharp,
} from "react-icons/io5";
import PDCoverPic from "../images/EatlabCoverPic.png";
import { motion, useAnimation } from "framer-motion";

const ProductSidebar = ({ onClose, children }) => {
  const [isVisibleSidebar, setVisibleSidebar] = useState(true);
  const [hasSidebar, setHasSidebar] = useState(true);

  const handleSidebar = () => {
    setVisibleSidebar(!isVisibleSidebar);
  };

  const handleHasSidebar = () => {
    setHasSidebar(!hasSidebar);
  };

  const controls = useAnimation();

  const onDragEnd = (event, info) => {
    if (info.velocity.y > 20 || (info.velocity.y >= 0 && info.point.y > 150)) {
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

  const ProductInfo = () => {
    <>
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
          Restaurants with an Interactive Menu to serve as a data center for
          studying consumer behavior. To analyze data and use it in the product
          design process to meet consumer needs as much as possible.
        </p>
        {/* <p>{children.attributes.About}</p> */}
      </div>
      <div className="view-pd-detail">
        View Product <IoChevronForwardSharp />
      </div>
    </>;
  };

  return (
    <>
      {isVisibleSidebar ? (
        <div className="pdsidebar ">
          <div className="pdsidebar-content">
            <div className="pdsidebar-header">
              <div className="pd-btn">
                <button className="pd-close-btn" onClick={handleHasSidebar}>
                  {/* <button className="pd-close-btn"> */}
                  <IoCloseSharp />
                </button>
              </div>
              <div className="pd-pic">
                <img
                  src={PDCoverPic}
                  alt="pdcover-image"
                  className="pdcover-image"
                />
                {/* <img src={children.attributes.Image} alt="cover-image" className="cover-image" /> */}
              </div>
            </div>
            <div className="pdsidebar-body">
              <ProductInfo/>
            </div>
          </div>
          <div className="pdhide-button">
            <button className="pdhide-icon" onClick={handleSidebar}>
              <IoChevronBackSharp />
            </button>
          </div>
        </div>
      ) : (
        <div className="pdh-sidebar">
          <div className="pdshow-button">
            <button className="pdshow-icon" onClick={handleSidebar}>
              <IoChevronForwardSharp />
            </button>
          </div>
        </div>
      )}
      <motion.div
        className={`pdsidebar_res ${isVisibleSidebar ? "visible" : ""}`}
        drag="y"
        onDragEnd={onDragEnd}
        initial="hidden"
        animate={controls}
        onAnimationStart={handleAnimation}
        transition={{
          type: "spring",
          damping: 40,
          stiffness: 300,
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
        <div className="pdsidebar_res-content">
          <div className="pdsidebar_res-header">
            <div className="pd-dragedge">
              <div className="pd-edge" />
            </div>
            <div className="pd-btn">
              <button className="pd-expand-btn" onClick={handleSidebar}>
                {isVisibleSidebar ? (
                  <IoChevronUpSharp />
                ) : (
                  <IoChevronDownSharp />
                )}
              </button>
              <button className="pd-close-btn" onClick={handleHasSidebar}>
                {/* <button className="pd-close-btn"> */}
                <IoCloseSharp />
              </button>
            </div>
          </div>
          <div className="pdsidebar-body">
            <ProductInfo/>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ProductSidebar;
