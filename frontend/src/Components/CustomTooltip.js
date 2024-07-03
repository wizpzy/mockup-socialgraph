import React from 'react';
import './CustomTooltip.css';
import image from '../images/Esicwallpaper.png';

const CustomTooltip = ({ companyName }) => {
    return (
        <div className="custom-tooltip">
            <img src={image} alt="tooltip-image" className="tooltip-image" />
            <h2 className="tooltip-text">{companyName}</h2>
          <p className="tooltip-description">Software Company</p>
          <p className="tooltip-location">Bangkok, Thailand</p>
          <p className="tooltip-start-date">Started in 2022</p>
        </div>
      );
};

export default CustomTooltip;