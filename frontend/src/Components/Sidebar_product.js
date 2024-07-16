import React, { useMemo } from "react";
import "./Sidebar_product.css"; // Import CSS for styling
import {
  IoChevronBackSharp,
  IoChevronForwardSharp,
} from "react-icons/io5";
import PDCoverPic from "../images/EatlabCoverPic.png";

const Sidebar = ({ children, selectedCompany, selectedProduct, isVisibleProductSidebar, setVisibleProductSidebar, hasProductSidebar, setHasProductSidebar }) => {
  const handleSidebar = () => {
    setVisibleProductSidebar(!isVisibleProductSidebar);
  };

  const handleHasSidebar = () => {
    setHasProductSidebar(!hasProductSidebar);
  };

  const company = useMemo(() => {
    return children.find(child => child.id === selectedCompany);
  }, [children, selectedCompany]);
    const product = company.attributes.Projects.data.find((data) => {
      return data.attributes.Project.data.id === selectedProduct
    }).attributes.Project.data
  

  return (
    <>
      {isVisibleProductSidebar ? (
        <div className="pdsidebar">
          <div className="pdsidebar-content">
            <div className="pdsidebar-header">
              <button className="close-btn" onClick={handleHasSidebar}>
                &times;
              </button>
              <div className="pd-pic">
                <img src={PDCoverPic} alt="pdcover-image" className="pdcover-image" />
                {/* <img src={children.attributes.Image} alt="cover-image" className="cover-image" /> */}
              </div>
            </div>
            <div className="pdsidebar-body">
              <div className="pd-name">
                {/* <p>EatLab</p> */}
                <p>
                  {
                    selectedProduct !== 0 && product ?
                    product.attributes.Name :
                    "Product Name"
                  }
                </p>
              </div>
              <div className="pd-type">
                <p>Interactive Art</p>
                {/* <p>{children.attributes.Category}</p> */}
              </div>
              <div className="pd-about">
                <b>About</b>
                {/* <p>
                Restaurants with an Interactive Menu to serve as a data center for studying consumer behavior. To analyze data and use it in the product design process to meet consumer needs as much as possible.
                </p> */}
                <p>
                  {
                    selectedProduct !== 0 && product ?
                    product.attributes.Description :
                    "Product Description"
                  }
                </p>
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
