import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import * as turf from '@turf/turf'
import './filter.css'
import './Mapbox.css'
import provinces from '../data/provinces.json'

mapboxgl.accessToken =
  "pk.eyJ1Ijoiam9ic2FudGEiLCJhIjoiY2x4dmM4cmNpMDcyYTJsc2FpMGw0YXhrOSJ9.jEQ-CikwyN4C9yX5xtGUBA";

const Mapbox = ({ queryData, selectedIndustry, selectedProvince, setSelectedCompany, isVisibleSidebar, setVisibleSidebar, location }) => {
  const mapContainerRef = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(location.lng); // default location
  const [lat, setLat] = useState(location.lat);
  const [zoom, setZoom] = useState(18);
  const popupRef = useRef(null);

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
      console.log("geojson: ",geojsonCompanies)
      //reset company data
      if (map.current.getSource("companies")) { 
        console.log('Source companies existed')
        map.current.getSource("companies").setData(geojsonCompanies);

      } else {
        // company source
        map.current.addSource("companies", {
          type: "geojson",
          data: geojsonCompanies,
          cluster: true,
          clusterMaxZoom: 15,
          clusterRadius: 50
        }); 

        // layer cluster
        map.current.addLayer({
          id: "companies-clusters",
          type: "circle",
          source: "companies",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "#FF5733",
            "circle-radius": [
              "step",
              ["get", "point_count"],
              15,
              10,
              20,
              20,
              25,
              30,
              30
            ],
            'circle-stroke-width': 3,
            'circle-stroke-color': '#fff'
          }
        }); 

        // layer cluster count
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

        // layer company node
        map.current.addLayer({
          id: "unclustered-point",
          type: "circle",
          source: "companies",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": [
              'match',
              ['get', 'industry'],
              'Festival',
              '#AF147A',
              'Food',
              '#FFB800',
              'Travel',
              '#42BEFF',
              'Book',
              '#0065AA',
              'Film',
              '#2C2727',
              'Sport',
              '#E80002',
              'Thai Art',
              '#78FF00',
              'Educational Game',
              '#22A51A',
              'Fashion',
              '#A400DE',
              'Music',
              '#E17000',
              'Design',
              '#FF6E6D',
              '#ccc'
            ],
            "circle-radius": 8,
            "circle-stroke-width": 5,
            // "circle-stroke-color": "rgba(255, 87, 51, 0.5)",
            "circle-stroke-color": [
              'match',
              ['get', 'industry'],
              'Festival',
              'rgba(175, 20, 122, 0.5)',
              'Food',
              'rgba(255, 184, 0, 0.5)',
              'Travel',
              'rgba(66, 190, 255, 0.5)',
              'Book',
              'rgba(0, 101, 170, 0.5)',
              'Film',
              'rgba(44, 39, 39, 0.5)',
              'Sport',
              'rgba(232, 0, 2, 0.5)',
              'Thai Art',
              'rgba(120, 255, 0, 0.5)',
              'Educational Game',
              'rgba(34, 165, 26, 0.5)',
              'Fashion',
              'rgba(164, 0, 222, 0.5)',
              'Music',
              'rgba(225, 112, 0, 0.5)',
              'Design',
              'rgba(255, 110, 109, 0.5)',
              'rgba(204, 204, 204, 0.5)'
            ],
          },
        }); 

        // provinces source
        map.current.addSource('provinces', {
          type: 'geojson',
          data: provinces,
        }); 

        // layer province
        map.current.addLayer({
          id: 'provinces-layer',
          type: 'fill',
          source: 'provinces',
          paint: {
            'fill-color': 'rgba(0, 0, 0, 0)',
            // 'fill-outline-color': 'rgba(255, 0, 0, 0.7)'
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

    //click to show company information in the sidebar
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

      console.log(feature)
      setSelectedCompany(feature.properties ? feature.properties.id: 0)
      setVisibleSidebar(true)
    }); 

    map.current.on('mouseenter', 'unclustered-point', (event) => {
      const features = map.current.queryRenderedFeatures(event.point, {
        layers: ["unclustered-point"],
      });

      const feature = features[0];

      if (popupRef.current) {
        popupRef.current.remove();
      }
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setLngLat(feature.geometry.coordinates)
        .setHTML(
          `
          ${feature.properties.imageUrl ? `<img src="${'http://localhost:1337'+feature.properties.imageUrl}" alt="${feature.properties.title} Image" class=companyimg style="max-width:100%; height:auto;">` : ''}
          <h2>${feature.properties.title}</h2>
          <h3>${feature.properties.industry}</h3>
          <p>${feature.properties.description}</p>
          `
        )
        .addTo(map.current);
      popupRef.current = popup;
    })

    map.current.on('mouseleave', 'unclustered-point', () => {
      if (popupRef.current) {
        popupRef.current.remove();
      }
    })

    map.current.on("mouseenter", "companies-clusters", () => {
      map.current.getCanvas().style.cursor = "pointer";
    });
    map.current.on("mouseleave", "companies-clusters", () => {
      map.current.getCanvas().style.cursor = "";
    });

  }, [queryData, selectedIndustry]);

  useEffect(() => {
    if (map.current.isStyleLoaded()) {
      map.current.setPaintProperty('provinces-layer', 'fill-color', selectedProvince === 'all' ? 'rgba(0, 0, 0, 0)' : [
      'case',
      ['==', ['get', 'pro_en'], selectedProvince],
      'rgba(255, 150, 0, 0.15)',
      'rgba(0, 0, 0, 0)'
    ]);
    map.current.setPaintProperty('provinces-layer', 'fill-outline-color', selectedProvince === 'all' ? 'rgba(0, 0, 0, 0)' : [
      'case',
      ['==', ['get', 'pro_en'], selectedProvince],
      'rgba(255, 0, 0, 0.7)',
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
    }
    
  },[selectedProvince]) // highlight and pan to the selected province

  useEffect(() => {
    map.current.flyTo({
      center: [location.lng, location.lat],
      essential: true,
      zoom: 16,
      speed: 4
    });
  }, [location]) // pan to selected company (searched)

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