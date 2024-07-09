// import React, { useRef, useEffect, useState } from 'react';
// import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
// import Axios from 'axios'
// import './filter.css'
// import './Mapbox.css'

// mapboxgl.accessToken = 'pk.eyJ1Ijoiam9ic2FudGEiLCJhIjoiY2x4dmM4cmNpMDcyYTJsc2FpMGw0YXhrOSJ9.jEQ-CikwyN4C9yX5xtGUBA';

// function Mapbox() {
//   const mapContainerRef = useRef(null);
//   const map = useRef(null);
//   const [lng, setLng] = useState(100.4687611219814); // default location at ESIC PLUS
//   const [lat, setLat] = useState(13.659278378048691);
//   const [zoom, setZoom] = useState(18);
//   const [queryData, setQueryData] = useState([]);
//   const [selectedIndustry, setSelectedIndustry] = useState('all');
//   const popupRef = useRef(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await Axios.get('http://localhost:1337/api/companies/?populate[0]=Location&populate[1]=Industry');
//         console.log(response)
//         setQueryData(response.data.data)
//       } catch (error) {
//         console.log("Error fetching data: ", error);
//       }
//     };
//     fetchData();
//   }, []); // fetching data
//   useEffect(() => {
//     console.log("query data : ", queryData);
//   }, [queryData]); //log data

//   const filterGeojson = (data, filter) => {
//     if (filter === 'all')
//       return data
//     return data.filter(item => item.properties.industry === filter);
//   }

//   const getGeojsonCompanies = (filter) => {
//     return {
//       type: 'FeatureCollection',
//       features: filterGeojson(queryData.map((item) => ({
//         type: 'Feature',
//         geometry: {
//           type: 'Point',
//           coordinates: [item.attributes.Location.Coor_long, item.attributes.Location.Coor_lat],
//         },
//         properties: {
//           title: item.attributes.Name,
//           description: item.attributes.Description,
//           industry: item.attributes.Industry.data ? item.attributes.Industry.data.attributes.Name : null,
//           cluster: false,
//           id: item.id,
//         },
//       })), filter),
//     }
//   };
//   //console.log("geojsonCompanies : ", geojsonCompanies);

//   useEffect(() => {
//     if (!map.current) {
//       map.current = new mapboxgl.Map({
//         container: mapContainerRef.current,
//         style: 'mapbox://styles/mapbox/light-v11',
//         center: [lng, lat],
//         zoom: zoom,
//       });

//       map.current.on('move', () => {
//         setLng(map.current.getCenter().lng.toFixed(13));
//         setLat(map.current.getCenter().lat.toFixed(13));
//         setZoom(map.current.getZoom().toFixed(2));
//       });
//     } //init map

//     const addDataToMap = () => {
//       const geojsonCompanies = getGeojsonCompanies(selectedIndustry)
//       if (map.current.getSource('companies')) {
//         map.current.getSource('companies').setData(geojsonCompanies); //
//       } else {
//         map.current.addSource('companies', {
//           type: 'geojson',
//           data: geojsonCompanies,
//           cluster: true,
//           clusterMaxZoom: 15,
//           clusterRadius: 50
//         });

//         map.current.addLayer({
//           id: 'companies-clusters',
//           type: 'circle',
//           source: 'companies',
//           filter: ['has', 'point_count'],
//           paint: {
//             // Blue, 20px circles when point count is less than 2
//             // Yellow, 30px circles when point count is between 2 and 3
//             // Pink, 40px circles when point count is greater than or equal to 3
//             'circle-color': '#FF5733',
//             'circle-radius': [
//               'step',
//               ['get', 'point_count'],
//               15,
//               5,
//               20,
//               10,
//               25
//             ],
//             'circle-stroke-width': 3,
//             'circle-stroke-color': '#fff'
//           }
//         });

//         map.current.addLayer({
//           id: 'cluster-count',
//           type: 'symbol',
//           source: 'companies',
//           filter: ['has', 'point_count'],
//           layout: {
//             'text-field': ['get', 'point_count_abbreviated'],
//             'text-font': ['Poppins SemiBold'],
//             'text-size': 12,
//           },
//           paint:{
//             'text-color':'#FFF'
//           }
//         });

//         map.current.addLayer({
//           id: 'unclustered-point',
//           type: 'circle',
//           source: 'companies',
//           filter: ['!', ['has', 'point_count']],
//           paint: {
//             'circle-color': '#FF5733',
//             'circle-radius': 8,
//             'circle-stroke-width': 5,
//             'circle-stroke-color': 'rgba(255, 87, 51, 0.5)'
//           }
//         });
//       }
//     };

//     if (map.current.isStyleLoaded()) {
//       console.log('Style loaded')
//       addDataToMap();
//     } else {
//       console.log('Loading style');
//       map.current.on('load', addDataToMap);
//     } //load data to map

//     map.current.on('click', 'companies-clusters', (e) => {
//       const features = map.current.queryRenderedFeatures(e.point, {
//         layers: ['companies-clusters']
//       });
//       const clusterId = features[0].properties.cluster_id;
//       map.current.getSource('companies').getClusterExpansionZoom(
//         clusterId,
//         (err, zoom) => {
//           if (err) return;

//           map.current.easeTo({
//             center: features[0].geometry.coordinates,
//             zoom: zoom
//           });
//         }
//       );
//     }); //click clusters to zoom in

//     map.current.on('click', (event) => {
//       // If the user clicked on one of your markers, get its information.
//       const features = map.current.queryRenderedFeatures(event.point, {
//         layers: ['unclustered-point']
//       });
//       if (!features.length) {
//         return;
//       }
//       const feature = features[0];

//       if (popupRef.current) {
//         popupRef.current.remove();
//       }
//       const popup = new mapboxgl.Popup({ offset: [0, -20] })
//         .setLngLat(feature.geometry.coordinates)
//         .setHTML(
//           `<h2> ${feature.properties.title} </h2>
//           <h3> ${feature.properties.industry} </h3>
//           <p> ${feature.properties.description} </p>`
//         )
//         .addTo(map.current);
//       popupRef.current = popup;
//     }); //click to show popup

//     map.current.on('mouseenter', 'companies-clusters', () => {
//       map.current.getCanvas().style.cursor = 'pointer';
//     });
//     map.current.on('mouseleave', 'companies-clusters', () => {
//       map.current.getCanvas().style.cursor = '';
//     });

//   }, [queryData, selectedIndustry]);

//   useEffect(() => {
//     const filterSelect = document.getElementById('filter-group');
//     const uniqueIndustries = new Set(queryData.map(item => item.attributes.Industry.data ? item.attributes.Industry.data.attributes.Name : null));
//     const addedIndustries = new Set();
//     filterSelect.innerHTML = '';
//     const Option_All = document.createElement('option');
//     Option_All.value = 'all';
//     Option_All.textContent = 'All';
//     filterSelect.appendChild(Option_All);
//     for (const industry of uniqueIndustries) {
//       if (industry != null && !addedIndustries.has(industry)) {
//         console.log(addedIndustries, ' and ', industry)
//         const option = document.createElement('option');
//         option.value = industry;
//         option.textContent = industry;
//         filterSelect.appendChild(option);
//         addedIndustries.add(industry);
//       }
//     }

//     filterSelect.addEventListener('change', (e) => {
//       // const selectedValue = e.target.value;
//       // const filter = selectedValue === 'all' ? ['has', 'industry'] : ['==', ['get', 'industry'], selectedValue];
//       // map.current.setFilter('unclustered-point', filter);
//       setSelectedIndustry(e.target.value);
//     });
//   }, [queryData])

//   return (
//     <div className="Mapbox">
//       <header className="Map-header">
//         <link href='https://api.mapbox.com/mapbox-gl-js/v3.4.0/mapbox-gl.css' rel='stylesheet' />
//       </header>
//       <div className="Map-info">
//         Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
//       </div>
//       <div ref={mapContainerRef} className="map-container">
//         <select id="filter-group" className="filter-group">
//           <option value="all">All</option>
//         </select>
//       </div>
//     </div>
//   );
// }

// export default Mapbox;








// Mapbox addlayer version

import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import Axios from "axios";
import "./filter.css";
import "./Mapbox.css";
import img from "../images/Esicwallpaper.png" 

mapboxgl.accessToken =
  "pk.eyJ1Ijoiam9ic2FudGEiLCJhIjoiY2x4dmM4cmNpMDcyYTJsc2FpMGw0YXhrOSJ9.jEQ-CikwyN4C9yX5xtGUBA";

const Mapbox = ({ selectedIndustry, location }) => {
  const mapContainerRef = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(location.lng); // default location
  const [lat, setLat] = useState(location.lat);
  const [zoom, setZoom] = useState(18);
  const [queryData, setQueryData] = useState([]);
  const [clickedPoints, setClickedPoints] = useState([]);
  const popupRef = useRef(null);

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

    const addCircles = (e) => {
      console.log("Click event triggered");
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ["unclustered-point"]
      });
      
      if (!features.length) {
        console.log("No features found at click point");
        return;
      }

      const feature = features[0];
      console.log("Clicked feature:", feature);

      const coordinates = feature.geometry.coordinates.slice();
      const point = map.current.project(coordinates);
      console.log("Projected point:", point);

      const mapContainer = map.current.getCanvasContainer();
      const existingGroup = mapContainer.querySelector(`.circle-group-${feature.properties.id}`);

      if (existingGroup) {
        console.log("Removing existing circle group");
        existingGroup.remove();
      } else {
        console.log("Creating new circle group");
        const circleGroup = document.createElement('div');
        circleGroup.className = `circle-group-${feature.properties.id}`;
        circleGroup.style.position = 'absolute';
        circleGroup.style.left = `${point.x}px`;
        circleGroup.style.top = `${point.y}px`;
        circleGroup.style.pointerEvents = 'none';
        circleGroup.style.zIndex = '1000';

        const createCircle = (left, top, color) => {
          const circle = document.createElement('div');
          circle.style.cssText = `
            position: absolute;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: ${color};
            left: ${left}px;
            top: ${top}px;
          `;
          return circle;
        };

        circleGroup.appendChild(createCircle(-30, -10, 'rgba(255, 0, 0, 0.5)'));
        circleGroup.appendChild(createCircle(10, -10, 'rgba(0, 255, 0, 0.5)'));
        circleGroup.appendChild(createCircle(-10, -30, 'rgba(0, 0, 255, 0.5)'));

        mapContainer.appendChild(circleGroup);
        console.log("Circle group added to map container");
      }
    };

    map.current.on('click', 'unclustered-point', addCircles);

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

    return () => {
      if ( map.current){
        map.current.off('click', 'unclustered-point', addCircles);
      }
    }

  }, [queryData, selectedIndustry, location]);

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

// Mapbox addlayer version

import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import Axios from "axios";
import "./filter.css";
import "./Mapbox.css";
import img from "../images/Esicwallpaper.png" 

mapboxgl.accessToken =
  "pk.eyJ1Ijoiam9ic2FudGEiLCJhIjoiY2x4dmM4cmNpMDcyYTJsc2FpMGw0YXhrOSJ9.jEQ-CikwyN4C9yX5xtGUBA";

const Mapbox = ({ selectedIndustry, location }) => {
  const mapContainerRef = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(location.lng); // default location
  const [lat, setLat] = useState(location.lat);
  const [zoom, setZoom] = useState(18);
  const [queryData, setQueryData] = useState([]);
  const [clickedPoints, setClickedPoints] = useState([]);
  const popupRef = useRef(null);

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

  useEffect(() => {
    if (!map.current) return;
  
    const addCircles = (e) => {
      console.log("Click event triggered");
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ["unclustered-point"]
      });
      
      if (!features.length) {
        console.log("No features found at click point");
        return;
      }
  
      const feature = features[0];
      console.log("Clicked feature:", feature);
  
      const featureId = feature.properties.id;
      const circleIds = [`circle-left-${featureId}`, `circle-right-${featureId}`, `circle-top-${featureId}`];
  
      // Check if circles already exist
      const circlesExist = circleIds.some(id => map.current.getLayer(id));
  
      if (circlesExist) {
        // Remove existing circles
        circleIds.forEach(id => {
          if (map.current.getLayer(id)) {
            map.current.removeLayer(id);
          }
          if (map.current.getSource(id)) {
            map.current.removeSource(id);
          }
        });
        console.log("Removed existing circles");
      } else {
        // Add new circles
        const coordinates = feature.geometry.coordinates;
        const offsets = [[-0.0003, 0], [0.0003, 0], [0, 0.0003]];
        const colors = ['rgba(255,0,0,0.5)', 'rgba(0,255,0,0.5)', 'rgba(0,0,255,0.5)'];
  
        circleIds.forEach((id, index) => {
          const circleCoordinates = [
            coordinates[0] + offsets[index][0],
            coordinates[1] + offsets[index][1]
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
  
          map.current.addLayer({
            id: id,
            type: 'circle',
            source: id,
            paint: {
              'circle-radius': 30,
              'circle-color': colors[index],
              'circle-opacity': 0.6,
              'circle-stroke-width': 2,
              'circle-stroke-color': 'white'
            }
          });
        });
        console.log("Added new circles");
      }
    };
  
    map.current.on('click', 'unclustered-point', addCircles);
  
    return () => {
      if (map.current) {
        map.current.off('click', 'unclustered-point', addCircles);
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

    // const addCircles = (e) => {
    //   console.log("Click event triggered");
    //   const features = map.current.queryRenderedFeatures(e.point, {
    //     layers: ["unclustered-point"]
    //   });
      
    //   if (!features.length) {
    //     console.log("No features found at click point");
    //     return;
    //   }

    //   const feature = features[0];
    //   console.log("Clicked feature:", feature);

    //   const coordinates = feature.geometry.coordinates.slice();
    //   const point = map.current.project(coordinates);
    //   console.log("Projected point:", point);

    //   const mapContainer = map.current.getCanvasContainer();
    //   const existingGroup = mapContainer.querySelector(`.circle-group-${feature.properties.id}`);

    //   if (existingGroup) {
    //     console.log("Removing existing circle group");
    //     existingGroup.remove();
    //   } else {
    //     console.log("Creating new circle group");
    //     const circleGroup = document.createElement('div');
    //     circleGroup.className = `circle-group-${feature.properties.id}`;
    //     circleGroup.style.position = 'absolute';
    //     circleGroup.style.left = `${point.x}px`;
    //     circleGroup.style.top = `${point.y}px`;
    //     circleGroup.style.pointerEvents = 'none';
    //     circleGroup.style.zIndex = '1000';

    //     const createCircle = (left, top, color) => {
    //       const circle = document.createElement('div');
    //       circle.style.cssText = `
    //         position: absolute;
    //         width: 20px;
    //         height: 20px;
    //         border-radius: 50%;
    //         background-color: ${color};
    //         left: ${left}px;
    //         top: ${top}px;
    //       `;
    //       return circle;
    //     };

    //     circleGroup.appendChild(createCircle(-30, -10, 'rgba(255, 0, 0, 0.5)'));
    //     circleGroup.appendChild(createCircle(10, -10, 'rgba(0, 255, 0, 0.5)'));
    //     circleGroup.appendChild(createCircle(-10, -30, 'rgba(0, 0, 255, 0.5)'));

    //     mapContainer.appendChild(circleGroup);
    //     console.log("Circle group added to map container");
    //   }
    // };

    // map.current.on('click', 'unclustered-point', addCircles);

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


  }, [queryData, selectedIndustry, location]);

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




