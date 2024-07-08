import React, { useEffect, useState } from "react";
import Axios from "axios";
import Header from "./Components/Header";
import Mapbox from "./Components/Mapbox";
import Sidebar from "./Components/Sidebar";
import "./App.css";

const App = () => {
  const [queryData, setQueryData] = useState([]);
  const [queryIndustry, setQueryIndustry] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState(0);
  const [selectedProvince, setSelectedProvince] = useState("all");

  const [location, setLocation] = useState({ lng: 100.4687611219814, lat: 13.659278378048691 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const industry_response = await Axios.get(
          "http://localhost:1337/api/industries"
        );
        const company_response = await Axios.get(
          "http://localhost:1337/api/companies/?populate[0]=Location&populate[1]=Industry&populate[2]=Image&pagination[pageSize]=100"
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
        selectedIndustry={selectedIndustry}
        selectedProvince={selectedProvince}
        selectedCompany={selectedCompany}
        setSelectedCompany={setSelectedCompany}
        location={location}
      />
      <Sidebar
        children={queryData}
        selectedCompany={selectedCompany}
      />
    </div>
  );
};

export default App;
