import React, { useEffect, useState } from "react";
import Axios from "axios";
import Header from "./Components/Header";
import Mapbox from "./Components/Mapbox";
import Sidebar from "./Components/Sidebar";
import "./App.css";

const App = () => {
  const [queryIndustry, setQueryIndustry] = useState([]);
  const [selectedIndustry, setSelectedIndustry] = useState("all");

  const [selectedProvince, setSelectedProvince] = useState("all");

  const [location, setLocation] = useState({ lng: 100.4687611219814, lat: 13.659278378048691 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Axios.get(
          "http://localhost:1337/api/industries"
        );
        console.log(response);
        setQueryIndustry(response.data.data);
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
        queryIndustry={queryIndustry}
        selectedIndustry={selectedIndustry}
        location={location}
      />
      <Sidebar/>
    </div>
  );
};

export default App;
