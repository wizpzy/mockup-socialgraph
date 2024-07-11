import React, { useEffect, useState } from "react";
import Axios from "axios";
import "./Header.css";
import logo from "../images/SocialGraphLogo2.png";
import Provinces from "../data/provinces.json";
import { IoSearchSharp } from "react-icons/io5";

const Header = ({
  queryIndustry,
  selectedIndustry,
  setSelectedIndustry,
  handleLocationSelect,
  selectedProvince,
  setSelectedProvince,
}) => {
  const [queryData, setQueryData] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Axios.get(
          "http://localhost:1337/api/companies/?populate[0]=Location&populate[1]=Industry"
        );
        console.log(response);
        setQueryData(response.data.data);
      } catch (error) {
        console.log("Error fetching data: ", error);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const input = e.target.value;
    setSearchInput(input);
    if (input) {
      const filteredSuggestions = queryData.filter((company) =>
        company.attributes.Name.toLowerCase().startsWith(input.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (company) => {
    setSearchInput(company.attributes.Name);
    setSuggestions([]);
    setShowSuggestions(false);
    handleLocationSelect(
      company.attributes.Location.Coor_long,
      company.attributes.Location.Coor_lat
    );
  };

  const provinces = Provinces.features;

  return (
    <header className="header">
      <div className="header-content">
        <img src={logo} alt="Social Graph Logo" className="logo" />
        {/* Search bar */}
        <div className="header-search">
          <IoSearchSharp className="search-icon" />
          <input
            type="text"
            placeholder="Search Company Name...."
            className="search-input"
            value={searchInput}
            onChange={handleInputChange}
          />
          {showSuggestions && (
            <ul className="companySuggestion">
              {suggestions.length > 0 ? (
                suggestions.map((company, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(company)}
                  >
                    {company.attributes.Name}
                  </li>
                ))
              ) : (
                <li className="no-suggestions">No companies found</li>
              )}
            </ul>
          )}
        </div>
        <div className="header-filters">
          <select
            className="filter-dropdown"
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
          >
            <option value="all">All Industries</option>
            {queryIndustry
              .sort((a, b) =>
                a.attributes.Name.localeCompare(b.attributes.Name)
              )
              .map((industry) => (
                <option key={industry.id} value={industry.attributes.Name}>
                  {industry.attributes.Name}
                </option>
              ))}
          </select>
          <select
            className="filter-dropdown"
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
          >
            <option value="all">All Provinces</option>
            {provinces
              .sort((a, b) =>
                a.properties.pro_en.localeCompare(b.properties.pro_en)
              )
              .map((province) => (
                <option
                  key={province.properties.pro_code}
                  value={province.properties.pro_en}
                >
                  {province.properties.pro_en}
                </option>
              ))}
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;
