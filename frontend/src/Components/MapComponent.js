import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  ZoomControl,
  Tooltip,
  CircleMarker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";
import "./MapComponent.css"; // Import custom CSS
import Header from "./Header"; // Import the Header component
import CustomTooltip from "./CustomTooltip";
import Eatlab from "../images/EATLAB.png";
import light from "../images/Thousand of light.png";
import Art from "../images/Art.png";
import Sidebar from "./Sidebar";


// Fix marker icon issue with Leaflet in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const CircleOverlay = ({ position, onCircleClick, selectedCircle }) => {
  useEffect(() => {
    const circles = document.querySelectorAll('.circle');
    circles.forEach(circle => {
      if (circle.id === selectedCircle) {
        circle.style.border = "3px solid orange";
      } else {
        circle.style.border = "none";
      }
    });
  }, [selectedCircle]);

  return (
    <>
      <Marker
        position={position}
        icon={L.divIcon({
          className: "custom-div-icon",
          html: `
                  <div class="circle-container">
                    <img src="${Eatlab}" id="circle1" class="circle left" alt="Green circle" />
                    <img src="${light}" id="circle2" class="circle right" alt="White circle" />
                    <img src="${Art}" id="circle3" class="circle top" alt="Black circle" />
                `,
          iconSize: [60, 60],
          iconAnchor: [30, 60],
        })}
        eventHandlers={{
          click: (e) => {
            e.originalEvent.stopPropagation(); // Prevent event from bubbling up to map
            const target = e.originalEvent.target;
            if (target.classList.contains('circle')) {
              onCircleClick(target.id);
            }
          },
        }}
      />
     
    </>
  );
};


const MapComponent = () => {
  const [zoomlv, setZoomlv] = useState(6); // Initial zoom level
  const position = [13.736717, 100.523186]; // Rough center of Thailand
  const [companyName, setCompanyName] = useState("");
  const [data, setData] = useState([]);

  const [showTooltip, setShowTooltip] = useState(false); // State to manage tooltip visibility
  const [showCircles, setShowCircles] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarContent, setSidebarContent] = useState(""); // State for sidebar content

  const handleMarkerClick = () => {
    setShowCircles(!showCircles);
  };

  const handleCircleClick = (circleId) => {
    setSelectedCircle((prevSelected) =>
      prevSelected === circleId ? null : circleId
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:1337/api/companies/?fields[0]=Name&fields[1]=Description&populate=Location&locale[0]=en",
          {
            headers: {
              "Content-Type": "application/json; charset=utf-8",
            },
          }
        );
        setData(response.data.data);
        console.log(response);
      } catch (error) {
        console.log("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      setCompanyName(data[0].attributes.Name); // Set company name from fetched data
    }
  }, [data]);

  // Define a custom red circle icon using a divIcon
  const CircleIcon = L.divIcon({
    html: `
      <div class="custom-marker">
        <div class="outer-circle"></div>
        <div class="inner-circle"></div>
      </div>
    `,
    className: "custom-div-icon",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });

  return (
    
    <MapContainer center={position} zoom={zoomlv} id="map" zoomControl={false}>
      <Header />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {data.length > 0 && (
        <>
          <Marker
            position={[
              data[0].attributes.Location.Coor_lat,
              data[0].attributes.Location.Coor_long,
            ]}
            icon={CircleIcon}
            eventHandlers={{
              mouseover: () => setShowTooltip(true),
              mouseout: () => setShowTooltip(false),
              click: handleMarkerClick,
            }}
          >
            {showTooltip && (
              <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent>
                <CustomTooltip companyName={companyName} />
              </Tooltip>
            )}
          </Marker>
          {showCircles && (
            <CircleOverlay
              position={[
                data[0].attributes.Location.Coor_lat,
                data[0].attributes.Location.Coor_long,
              ]}
              onCircleClick={handleCircleClick}
              selectedCircle={selectedCircle}
            />
          )}
        </>
      )}
      <ZoomControl position="bottomright" />
    </MapContainer>
  );
};

export default MapComponent;
