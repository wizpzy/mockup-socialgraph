import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import Axios from 'axios'
import * as turf from '@turf/turf'
import './filter.css'
import './Mapbox.css'
import provinces from '../data/provinces.json'

mapboxgl.accessToken =
  "pk.eyJ1Ijoiam9ic2FudGEiLCJhIjoiY2x4dmM4cmNpMDcyYTJsc2FpMGw0YXhrOSJ9.jEQ-CikwyN4C9yX5xtGUBA";

const Mapbox = ({ selectedIndustry, selectedProvince, location }) => {
  const mapContainerRef = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(location.lng); // default location
  const [lat, setLat] = useState(location.lat);
  const [zoom, setZoom] = useState(18);
  const [queryData, setQueryData] = useState([]);
  const popupRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Axios.get(
          "http://localhost:1337/api/companies/?populate[0]=Location&populate[1]=Industry&populate[2]=Image"
        );
        //console.log(response);
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
            imageUrl: item.attributes.Image.data ? item.attributes.Image.data.attributes.url : null,
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
        console.log('Source companies existed')
        map.current.getSource("companies").setData(geojsonCompanies);
        map.current.setPaintProperty('provinces-layer', 'fill-color', selectedProvince === 'all' ? 'rgba(0, 0, 0, 0)' : [
          'case',
          ['==', ['get', 'pro_en'], selectedProvince],
          'rgba(255, 150, 0, 0.15)',
          'rgba(0, 0, 0, 0)'
        ]);
        if (selectedProvince !== 'all') {
          const province_feat = provinces.features.find(feature => feature.properties.pro_en === selectedProvince);
          //console.log(province_feat)
          map.current.easeTo({
            center: [province_feat.properties.center_long, province_feat.properties.center_lat],
            zoom: 8
          })
          const screen_center = turf.point([map.current.getCenter().lng, map.current.getCenter().lat]);
          const provincePolygon = province_feat.geometry.type === 'Polygon' ? turf.polygon(province_feat.geometry.coordinates) : turf.multiPolygon(province_feat.geometry.coordinates);
          if (zoom <= 8 || !turf.booleanPointInPolygon(screen_center, provincePolygon)) {
            map.current.easeTo({
              center: [province_feat.properties.center_long, province_feat.properties.center_lat],
              zoom: 8,
              duration: 750,
            });
          } else {
            map.current.easeTo({});
          }
        }

      } else {
        map.current.addSource("companies", {
          type: "geojson",
          data: geojsonCompanies,
          cluster: true,
          clusterMaxZoom: 15,
          clusterRadius: 50
        }); // company source

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
            'circle-stroke-width': 3,
            'circle-stroke-color': '#fff'
          }
        }); // layer cluster

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
        }); // layer company node

        map.current.addSource('provinces', {
          type: 'geojson',
          data: provinces,
        })
        map.current.addLayer({
          id: 'provinces-layer',
          type: 'fill',
          source: 'provinces',
          paint: {
            'fill-color': 'rgba(0, 0, 0, 0)',
            'fill-outline-color': 'rgba(255, 0, 0, 0.7)'
          }
        });
        map.current.moveLayer('companies-clusters', 'unclustered-point')
        map.current.moveLayer('companies-clusters', 'cluster-count')
        map.current.moveLayer('provinces-layer', 'companies-clusters')
      }
    };

    if (map.current.isStyleLoaded()) {
      console.log('Style loaded');
      addDataToMap();
    } else {
      console.log('Loading style');
      map.current.on("load", addDataToMap); //load data to map
    }

    // map.current.on('click', 'provinces-layer', (e) => {
    //   const features = map.current.queryRenderedFeatures(e.point, {
    //     layers: ['provinces-layer']
    //   });
    //   map.current.setPaintProperty('provinces-layer', 'fill-color', [
    //     'case',
    //     ['==', ['get', 'pro_en'], features[0].properties.pro_en], // Adjust the property name if it's different in your GeoJSON
    //     'rgba(200, 50, 0, 0.15)',
    //     'rgba(0, 0, 0, 0)' // Transparent for other provinces
    //   ]);
    //   //console.log(features[0])
    //   const screen_center = turf.point([map.current.getCenter().lng, map.current.getCenter().lat]);
    //   const provincePolygon = features[0].geometry.type === 'Polygon' ? turf.polygon(features[0].geometry.coordinates):turf.multiPolygon(features[0].geometry.coordinates);
    //     if (zoom < 8 || !turf.booleanPointInPolygon(screen_center, provincePolygon)) {
    //       map.current.easeTo({
    //         center: [features[0].properties.center_long, features[0].properties.center_lat],
    //         zoom: 8,
    //         duration: 750,
    //       });
    //     } else {
    //       map.current.easeTo({});
    //     }
    // });

    map.current.on('click', 'companies-clusters', (e) => {
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

    map.current.on('click', 'unclustered-point', (event) => {
      // If the user clicked on one of your markers, get its information.
      const features = map.current.queryRenderedFeatures(event.point, {
        layers: ["unclustered-point"],
      });
      map.current.easeTo({})
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
          `<h2> ${feature.properties.title} </h2>
          <h3> ${feature.properties.industry} </h3>
          <p> ${feature.properties.description} </p>
          ${feature.properties.imageUrl ? `<img src="${'http://localhost:1337'+feature.properties.imageUrl}" alt="${feature.properties.title}" style="max-width:100%;">` : ''}`
        )
        .addTo(map.current);
      popupRef.current = popup;
    }); //click to show popup

    map.current.on("mouseenter", "companies-clusters", () => {
      map.current.getCanvas().style.cursor = "pointer";
    });
    map.current.on("mouseleave", "companies-clusters", () => {
      map.current.getCanvas().style.cursor = "";
    });

  }, [queryData, selectedIndustry, selectedProvince]);
  useEffect(() => {
    map.current.flyTo({
      center: [location.lng, location.lat],
      essential: true,
      zoom: 16,
      speed: 4
    });
  }, [location])

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