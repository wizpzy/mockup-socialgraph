import React from 'react';
import './Header.css';
import logo from '../images/SocialGraphLogo2.png';
import { IoSearchSharp } from 'react-icons/io5';

const Header = () => {
    return (
        <header className="header">
          <div className="header-content">
            <img src={logo} alt="Social Graph Logo" className="logo" />
             {/* Search bar */}
             <div className="header-search">
              <input type="text" placeholder="Search..." className="search-input" />
              <IoSearchSharp className="search-icon" />
            </div>
            <div className="header-filters">
              <select className="filter-dropdown">
                <option>All Industries</option>
                <option>Industry 1</option>
                <option>Industry 2</option>
              </select>
              <select className="filter-dropdown">
                <option>All Provinces</option>
                <option>Province 1</option>
                <option>Province 2</option>
              </select>
            </div>
          </div>
        </header>
      );
};

export default Header;
