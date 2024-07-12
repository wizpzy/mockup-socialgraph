import React, { useEffect, useState } from "react";
import Axios from "axios";
import "./Header.css";
import logo from "../images/SocialGraphLogo2.png";
import Provinces from "../data/provinces.json";
import { IoSearchSharp } from "react-icons/io5";
import Select from "react-select";

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

  const provinces = [
    { value: "all", label: "All Provinces" },
    ...Provinces.features
      .map((province) => ({
        value: province.properties.pro_en,
        label: province.properties.pro_en,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];

  const industries = [
    { value: "all", label: "All Industries" },
    ...queryIndustry
      .map((industry) => ({
        value: industry.attributes.Name,
        label: industry.attributes.Name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  ];

  const customStyles = {
    control: () => ({
      display: "flex",
      width: 215,
      height: 30,
      background: "white",
      borderRadius: 10,
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: 14,
      fontWeight: 400,
      boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)",
    }),

    placeholder: (provided, state) => ({
      ...provided,
      color: "#fa4616",
        opacity:state.isFocused ? 0.7 : 1,
      
    }),
    input: (provided, state) => ({
      ...provided,
      color: "#fa4616",
    }),
    
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      color: "#fa4616",
    }),
    menu: (provided, state) => 
      ({ 
      ...provided, 
      borderRadius:10 ,
      width:215,
      maxHeight:300,
    }),
    menuList: (provided, state) => ({
      ...provided,
      color: "7D8288",
      borderRadius:10 ,
       width:'inherit',
      height:'inherit',
      overflow:'auto',
      fontSize: 14,
      fontWeight: 300,
    }),
    option:(provided,state) =>({
      ...provided,
      backgroundColor: state.isFocused ? '#FFD4C8' : 'white',
      color: state.isFocused ? 'black' : 'black',
      '&:active': {
        backgroundColor: '#fa4616',
        color: 'white'
      },
    }),
    singleValue:(provided,state) => ({
      ...provided,
      color: '#fa4616',
    })
  };

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
          <Select
          classNamePrefix="react-select"
            options={industries}
            value={selectedIndustry}
            onChange={setSelectedIndustry}
            placeholder="All Industries"
            defaultValue={{ value: "all", label: "All Industries" }}
            styles={customStyles}
          />
          <Select
          classNamePrefix="react-select"
            options={provinces}
            value={selectedProvince}
            onChange={setSelectedProvince}
            placeholder="All Provinces"
            defaultValue={{ value: "all", label: "All Provinces" }}
            styles={customStyles}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;

// import React, { useEffect, useState } from "react";
// import Axios from "axios";
// import "./Header.css";
// import logo from "../images/SocialGraphLogo2.png";
// import Provinces from "../data/provinces.json";
// import { IoSearchSharp } from "react-icons/io5";

// const Header = ({
//   queryIndustry,
//   selectedIndustry,
//   setSelectedIndustry,
//   handleLocationSelect,
//   selectedProvince,
//   setSelectedProvince,
// }) => {
//   const [queryData, setQueryData] = useState([]);
//   const [suggestions, setSuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [searchInput, setSearchInput] = useState("");

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await Axios.get(
//           "http://localhost:1337/api/companies/?populate[0]=Location&populate[1]=Industry"
//         );
//         console.log(response);
//         setQueryData(response.data.data);
//       } catch (error) {
//         console.log("Error fetching data: ", error);
//       }
//     };
//     fetchData();
//   }, []);

//   const handleInputChange = (e) => {
//     const input = e.target.value;
//     setSearchInput(input);
//     if (input) {
//       const filteredSuggestions = queryData.filter((company) =>
//         company.attributes.Name.toLowerCase().startsWith(input.toLowerCase())
//       );
//       setSuggestions(filteredSuggestions);
//       setShowSuggestions(true);
//     } else {
//       setSuggestions([]);
//       setShowSuggestions(false);
//     }
//   };

//   const handleSuggestionClick = (company) => {
//     setSearchInput(company.attributes.Name);
//     setSuggestions([]);
//     setShowSuggestions(false);
//     handleLocationSelect(
//       company.attributes.Location.Coor_long,
//       company.attributes.Location.Coor_lat
//     );
//   };

//   const provinces = Provinces.features;

//   return (
//     <header className="header">
//       <div className="header-content">
//         <img src={logo} alt="Social Graph Logo" className="logo" />
//         {/* Search bar */}
//         <div className="header-search">
//           <IoSearchSharp className="search-icon" />
//           <input
//             type="text"
//             placeholder="Search Company Name...."
//             className="search-input"
//             value={searchInput}
//             onChange={handleInputChange}
//           />
//           {showSuggestions && (
//             <ul className="companySuggestion">
//               {suggestions.length > 0 ? (
//                 suggestions.map((company, index) => (
//                   <li
//                     key={index}
//                     onClick={() => handleSuggestionClick(company)}
//                   >
//                     {company.attributes.Name}
//                   </li>
//                 ))
//               ) : (
//                 <li className="no-suggestions">No companies found</li>
//               )}
//             </ul>
//           )}
//         </div>
//         <div className="header-filters">
//           <select
//             className="filter-dropdown"
//             value={selectedIndustry}
//             onChange={(e) => setSelectedIndustry(e.target.value)}
//           >
//             <option value="all">All Industries</option>
//             {queryIndustry
//               .sort((a, b) =>
//                 a.attributes.Name.localeCompare(b.attributes.Name)
//               )
//               .map((industry) => (
//                 <option key={industry.id} value={industry.attributes.Name}>
//                   {industry.attributes.Name}
//                 </option>
//               ))}
//           </select>
//           <select
//             className="filter-dropdown"
//             value={selectedProvince}
//             onChange={(e) => setSelectedProvince(e.target.value)}
//           >
//             <option value="all">All Provinces</option>
//             {provinces
//               .sort((a, b) =>
//                 a.properties.pro_en.localeCompare(b.properties.pro_en)
//               )
//               .map((province) => (
//                 <option
//                   key={province.properties.pro_code}
//                   value={province.properties.pro_en}
//                 >
//                   {province.properties.pro_en}
//                 </option>
//               ))}
//           </select>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;
