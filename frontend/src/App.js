import React, { useEffect, useState } from "react";
import Axios from "axios";
import Header from "./Components/Header";
import Mapbox from "./Components/Mapbox";
import Sidebar from "./Components/Sidebar";
// import ProductSidebar from "./Components/Sidebar_product";
import { qs_main } from "./utils/queryString";
import "./App.css";

const App = () => {
  const [queryData, setQueryData] = useState([]);
  const [queryIndustry, setQueryIndustry] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState({ value: "all", label: "All Industries" });
  const [selectedCompany, setSelectedCompany] = useState(0);
  const [selectedProvince, setSelectedProvince] = useState({ value: "all", label: "All Provinces" });
  const [hasSidebar, setHasSidebar] = useState(true);
  const [isVisibleSidebar, setVisibleSidebar] = useState(false);

  const [location, setLocation] = useState({ lng: 100.4687611219814, lat: 13.659278378048691 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const industry_response = await Axios.get(
          "http://localhost:1337/api/industries"
        );
        const company_response = await Axios.get(
          `http://localhost:1337/api/companies/?${qs_main}`
        );
        //console.log(response);
        setQueryIndustry(industry_response.data.data);
        setQueryData(company_response.data.data);
      } catch (error) {
        console.log("Error fetching data: ", error);
      }
    };
    fetchData();
  }, []);

  const handleLocationSelect = (lng, lat) => {
    setLocation({ lng, lat });
  };


  return (
    <div className="App">
      <Header
        queryIndustry={queryIndustry}
        selectedIndustry={selectedIndustry}
        setSelectedIndustry={setSelectedIndustry}
        handleLocationSelect={handleLocationSelect}
        selectedProvince={selectedProvince}
        setSelectedProvince={setSelectedProvince}
      />
      <Mapbox
        queryData={queryData}
        selectedIndustry={selectedIndustry.value}
        selectedProvince={selectedProvince.value}
        selectedCompany={selectedCompany}
        setSelectedCompany={setSelectedCompany}
        location={location}
        isVisibleSidebar={isVisibleSidebar}
        setVisibleSidebar={setVisibleSidebar}
        setHasSidebar={setHasSidebar}
      />
      { hasSidebar &&
      <Sidebar
        children={queryData}
        selectedCompany={selectedCompany}
        isVisibleSidebar={isVisibleSidebar}
        setVisibleSidebar={setVisibleSidebar}
        hasSidebar={hasSidebar}
        setHasSidebar={setHasSidebar}
      />}
      {/* <ProductSidebar/> */}
    </div>
  );
};

export default App;
