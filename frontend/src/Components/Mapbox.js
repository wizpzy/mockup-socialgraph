import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import Axios from "axios";
import "./filter.css";
import "./Mapbox.css";
import img from "../images/Esicwallpaper.png" 
import leftImage from "../images/EATLAB.png";
import rightImage from "../images/Thousand of light.png";
import topImage from "../images/Art.png";

mapboxgl.accessToken =
  "pk.eyJ1Ijoiam9ic2FudGEiLCJhIjoiY2x4dmM4cmNpMDcyYTJsc2FpMGw0YXhrOSJ9.jEQ-CikwyN4C9yX5xtGUBA";

const Mapbox = ({ selectedIndustry, location, setSelectedCompany }) => {
  const mapContainerRef = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(location.lng); // default location
  const [lat, setLat] = useState(location.lat);
  const [zoom, setZoom] = useState(18);
  const [queryData, setQueryData] = useState([]);
  const [clickedPoints, setClickedPoints] = useState([]);
  const popupRef = useRef(null);
  const [currentZoom, setCurrentZoom] = useState(zoom);

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
  }, []); // fetching data
  useEffect(() => {
    console.log("query data : ", queryData);
  }, [queryData]); //log data

  const filterGeojson = (data, filter) => {
    if (filter === "all") return data;
    return data.filter((item) => item.properties.industry === filter);
  };

  const getGeojsonCompanies = (filter) => {
    return {
      type: "FeatureCollection",
      features: filterGeojson(
        queryData.map((item) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [
              item.attributes.Location.Coor_long,
              item.attributes.Location.Coor_lat,
            ],
          },
          properties: {
            title: item.attributes.Name,
            description: item.attributes.Description,
            industry: item.attributes.Industry.data
              ? item.attributes.Industry.data.attributes.Name
              : null,
            cluster: false,
            id: item.id,
          },
        })),
        filter
      ),
    };
  };

  function createCircularImage(imgSrc, size = 60) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      
      ctx.beginPath();
      ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(img, 0, 0, size, size);

      resolve(canvas.toDataURL());
    };
    img.onerror = reject;
    img.src = imgSrc;
  });
}

  useEffect(() => {
    if (!map.current) return;
  
    let activeFeature = null;
    let activeCircleIds = [];
    let circlesVisible = false;
  
    const updateCircles = () => {
      if (!activeFeature || activeCircleIds.length === 0 || !circlesVisible) return;
    
      const zoom = map.current.getZoom();
      const offsetBase = 0.0003;
      const scale = Math.pow(2, 18 - zoom);
      const offsets = [
        [-offsetBase * scale, 0],
        [offsetBase * scale, 0],
        [0, offsetBase * scale],
      ];
    
      activeCircleIds.forEach((id, index) => {
        const circleCoordinates = [
          activeFeature.geometry.coordinates[0] + offsets[index][0],
          activeFeature.geometry.coordinates[1] + offsets[index][1]
        ];
    
        if (map.current.getSource(id)) {
          map.current.getSource(id).setData({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: circleCoordinates
            }
          });
        }
      });
    };

    const checkAndCloseCircles = () => {
      if (!activeFeature || !circlesVisible) return;
  
      const features = map.current.queryRenderedFeatures(
        map.current.project(activeFeature.geometry.coordinates),
        { layers: ['unclustered-point'] }
      );
  
      if (features.length === 0 || features[0].properties.id !== activeFeature.properties.id) {
        // Our point is no longer visible as an unclustered point, so it must have been clustered
        activeCircleIds.forEach(id => {
          if (map.current.getLayer(id)) {
            map.current.removeLayer(id);
          }
          if (map.current.getSource(id)) {
            map.current.removeSource(id);
          }
        });
        activeFeature = null;
        activeCircleIds = [];
        circlesVisible = false;
        console.log("Closed circles due to clustering");
      }
    };

    const toggleCircles = (e) => {
      console.log("Click event triggered");
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ["unclustered-point"]
      });
      
      if (!features.length) {
        return;
      }
    
      const feature = features[0];  
      const featureId = feature.properties.id;
      const circleIds = [`circle-left-${featureId}`, `circle-right-${featureId}`, `circle-top-${featureId}`];
    
      if (circlesVisible && activeFeature && activeFeature.properties.id === featureId) {
        // Remove existing circles
        circleIds.forEach(id => {
          if (map.current.getLayer(id)) {
            map.current.removeLayer(id);
          }
          if (map.current.getSource(id)) {
            map.current.removeSource(id);
          }
        });
        activeFeature = null;
        activeCircleIds = [];
        circlesVisible = false;
        console.log("Removed existing circles");
      } else {
        // Remove any existing circles first
        if (activeCircleIds.length > 0) {
          activeCircleIds.forEach(id => {
            if (map.current.getLayer(id)) {
              map.current.removeLayer(id);
            }
            if (map.current.getSource(id)) {
              map.current.removeSource(id);
            }
          });
        }
    
        // Add new circles
        activeFeature = feature;
        activeCircleIds = circleIds;
        circlesVisible = true;
    
        const zoom = map.current.getZoom();
        const offsetBase = 0.0003;
        const scale = Math.pow(2, 18 - zoom);
        const offsets = [
          [-offsetBase * scale, 0],
          [offsetBase * scale, 0],
          [0, offsetBase * scale],
        ];
        const images = [leftImage, rightImage, topImage];
    
        circleIds.forEach((id, index) => {
          const circleCoordinates = [
            feature.geometry.coordinates[0] + offsets[index][0],
            feature.geometry.coordinates[1] + offsets[index][1]
          ];
    
          map.current.addSource(id, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: circleCoordinates
              }
            }
          });
    
          // Create circular image and add to map
          createCircularImage(images[index]).then(circularImage => {
            map.current.loadImage(circularImage, (error, image) => {
              if (error) throw error;
              map.current.addImage(id, image);
    
              map.current.addLayer({
                id: id,
                type: 'symbol',
                source: id,
                layout: {
                  'icon-image': id,
                  'icon-size': 1  // Adjust this value to change the size of the image
                }
              });
            });
          });
        });
        console.log("Added new circular image markers");
      }
      updateCircles();
    };
    
    map.current.on('click', 'unclustered-point', toggleCircles);
    map.current.on('zoom', checkAndCloseCircles);
    map.current.on('moveend', updateCircles);
  
    return () => {
      if (map.current) {
        map.current.off('click', 'unclustered-point', toggleCircles);
        map.current.off('zoom', checkAndCloseCircles);
        map.current.off('moveend', updateCircles);
        if (activeCircleIds.length > 0) {
          activeCircleIds.forEach(id => {
            if (map.current.getLayer(id)) {
              map.current.removeLayer(id);
            }
            if (map.current.getSource(id)) {
              map.current.removeSource(id);
            }
          });
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [lng, lat],
        zoom: zoom,
      });

      map.current.on("move", () => {
        setLng(map.current.getCenter().lng.toFixed(13));
        setLat(map.current.getCenter().lat.toFixed(13));
        setZoom(map.current.getZoom().toFixed(2));
        const newZoom = map.current.getZoom().toFixed(2);
        setCurrentZoom(newZoom);
      });

      
    }

    const addDataToMap = () => {
      const geojsonCompanies = getGeojsonCompanies(selectedIndustry);
      if (map.current.getSource("companies")) {
        map.current.getSource("companies").setData(geojsonCompanies);
      } else {
        map.current.addSource("companies", {
          type: "geojson",
          data: geojsonCompanies,
          cluster: true,
          clusterMaxZoom: 15,
          clusterRadius: 50,
        });

        map.current.addLayer({
          id: "companies-clusters",
          type: "circle",
          source: "companies",
          filter: ["has", "point_count"],
          paint: {
            // Blue, 20px circles when point count is less than 2
            // Yellow, 30px circles when point count is between 2 and 3
            // Pink, 40px circles when point count is greater than or equal to 3
            "circle-color": "#FF5733",
            "circle-radius": [
              "step",
              ["get", "point_count"],
              15,
              5,
              20,
              10,
              25,
            ],
            "circle-stroke-width": 3,
            "circle-stroke-color": "#fff",
          },
        });

        map.current.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "companies",
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["Poppins SemiBold"],
            "text-size": 12,
          },
          paint: {
            "text-color": "#FFF",
          },
        });

        map.current.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "companies",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "#FF5733",
            "circle-radius": 8,
            "circle-stroke-width": 5,
            "circle-stroke-color": "rgba(255, 87, 51, 0.5)",
          },
        });
      }
    };

    if (map.current.isStyleLoaded()) {
      addDataToMap();
    } else {
      map.current.on("load", addDataToMap); //load data to map
    }

    map.current.on("click", "companies-clusters", (e) => {
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ["companies-clusters"],
      });
      const clusterId = features[0].properties.cluster_id;
      map.current
        .getSource("companies")
        .getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;

          map.current.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom,
          });
        }); //click clusters to zoom in
    });

    map.current.on('click', 'unclustered-point', (e) => {
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ['unclustered-point']
      });
      if (features.length > 0) {
        const feature = features[0];
        setSelectedCompany({
          name: feature.properties.title,
          description: feature.properties.description,
          industry: feature.properties.industry,
          // Add other properties as needed
        });
      }
    });

    map.current.on("mouseenter", "unclustered-point", (event) => {
      const features = map.current.queryRenderedFeatures(event.point, {
        layers: ["unclustered-point"],
      });
      if (!features.length) {
        return;
      }
      const feature = features[0];

      if (popupRef.current) {
        popupRef.current.remove();
      }

     
    

      const popup = new mapboxgl.Popup({ offset: [0, -20] })
        .setLngLat(feature.geometry.coordinates)
        .setHTML(
          `
          <img src="${img}" class=companyimg alt="CompanyImage" ; height:auto;"/>
          <h2>${feature.properties.title}</h2>
          <h3>${feature.properties.industry}</h3>
          <p>${feature.properties.description}</p>
          `
        )
        .addTo(map.current);
      popupRef.current = popup;
    });

    map.current.on("mouseleave", "unclustered-point", () => {
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    });
            map.current.on("mouseenter", "companies-clusters", () => {
      map.current.getCanvas().style.cursor = "pointer";
    });
    map.current.on("mouseleave", "companies-clusters", () => {
      map.current.getCanvas().style.cursor = "";
    });
    map.current.flyTo({
      center: [location.lng, location.lat],
      essential: true,
      zoom: zoom,
    });


  }, [queryData, selectedIndustry, location, setSelectedCompany]);

   useEffect(() => {
    // Cleanup function for clickedPoints
    return () => {
      clickedPoints.forEach((point) => {
        if (map.current.getLayer(point)) {
          map.current.removeLayer(point);
        }
        if (map.current.getSource(point)) {
          map.current.removeSource(point);
        }
      });
    };
  }, [clickedPoints]);


  return (
    <div className="Mapbox">
      <header className="Map-header">
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css"
          rel="stylesheet"
        />
      </header>
      <div className="Map-info">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainerRef} className="map-container" />
    </div>
  );
};

export default Mapbox;