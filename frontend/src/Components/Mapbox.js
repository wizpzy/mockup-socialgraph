import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import * as turf from "@turf/turf";
import "./filter.css";
import "./Mapbox.css";
import provinces from "../data/provinces.json";
import { createCircularImage } from '../utils/manageImage';
import tempPic from '../images/smile.png'

mapboxgl.accessToken =
  "pk.eyJ1Ijoiam9ic2FudGEiLCJhIjoiY2x4dmM4cmNpMDcyYTJsc2FpMGw0YXhrOSJ9.jEQ-CikwyN4C9yX5xtGUBA";

const Mapbox = ({
  queryData,
  selectedIndustry,
  selectedProvince,
  setSelectedCompany,
  setSelectedProduct,
  location,
  setVisibleSidebar,
  setHasSidebar,
  setVisibleProductSidebar,
  setHasProductSidebar,
}) => {
  const mapContainerRef = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(location.lng); // default location
  const [lat, setLat] = useState(location.lat);
  const [zoom, setZoom] = useState(18);
  const popupRef = useRef(null);


  useEffect(() => {
    console.log("query data : ", queryData);
  }, [queryData]); //log data

  let activeFeature = null;

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
            imageUrl: item.attributes.Image.data
              ? item.attributes.Image.data.attributes.url
              : null,
            cluster: false,
            id: item.id,
            projects: item.attributes.Projects.data
          },
        })),
        filter
      ),
    };
  };

  const showSidebar = (type) => {
    if (type === 1) { // 1 for showing company sidebar
      setVisibleProductSidebar(false);
      setHasProductSidebar(false);
      setVisibleSidebar(true);
      setHasSidebar(true);
    } else { // 2 for showing product sidebar
      setVisibleSidebar(false);
      setHasSidebar(false);
      setVisibleProductSidebar(true);
      setHasProductSidebar(true);
    }

  }

  const createProductOverlays = (feature) => {
    const compData = queryData.find((company) => {
      return company.id === feature.properties.id
    });

    if (compData) {
      console.log("selected company data: ", compData);
      setSelectedCompany(feature.properties ? feature.properties.id : 0); // set selected company to show in the sidebar
      showSidebar(1);
      const base_offset = 0.0003;
      const scale = Math.pow(2, 18 - map.current.getZoom());
      const overlays_ = [
        {
          geometry: {
            type: 'Point',
            coordinates: [
              feature.geometry.coordinates[0] - (base_offset * scale),
              feature.geometry.coordinates[1]
            ]
          },
          properties: {
            parent_node: feature,
            position: 'Left'
          }
        },
        {
          geometry: {
            type: 'Point',
            coordinates: [
              feature.geometry.coordinates[0] + (base_offset * scale),
              feature.geometry.coordinates[1]
            ]
          },
          properties: {
            parent_node: feature,
            position: 'Right'
          }
        },
        {
          geometry: {
            type: 'Point',
            coordinates: [
              feature.geometry.coordinates[0],
              feature.geometry.coordinates[1] + (base_offset * scale)
            ]
          },
          properties: {
            parent_node: feature,
            position: 'Above'
          }
        }
      ];
      const project_amount = compData.attributes.Projects.data.length
      const overlays = overlays_.slice(0, project_amount) // handling for different amount of projects
      clearOverlays();

      // create company logo layer
      if (!map.current.getSource('selected-company')) {
        map.current.addSource('selected-company', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: feature._geometry,
          }
        })
        if (!map.current.getLayer('company-logo-overlay')) {
          map.current.addLayer({
            id: 'company-logo-overlay',
            type: 'circle',
            source: 'selected-company',
            paint: {
              'circle-color': 'rgba(255,255,255,1)',
              'circle-radius': 60,
              "circle-stroke-width": 4,
              "circle-stroke-color": "#FF7E00",
            }
          })
          createImageLayer('company-logo-image', 'company-logo-image-layer', 0.5, 'selected-company', feature.properties.imageUrl, 240)
        }
      }

      // create each project layer (source + circle + image)
      overlays.forEach(async (overlay, index) => {
        // if project data is loaded
        if (compData.attributes.Projects.data[index]) {
          // project source
          if (!map.current.getSource(`project-${index}`)) {
            map.current.addSource(`project-${index}`, {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: overlay.geometry,
                properties: {
                  position: overlay.properties.position,
                  parent_node: feature,
                  id: compData.attributes.Projects.data[index].id,
                  compId: compData.id
                }
              }
            });
          }
          // project circle layer
          if (!map.current.getLayer(`project-overlays-${index}`)) {
            map.current.addLayer({
              id: `project-overlays-${index}`,
              type: 'circle',
              source: `project-${index}`,
              paint: {
                'circle-color': 'rgba(255,255,255,1)',
                'circle-radius': 24,
                "circle-stroke-width": 4,
                "circle-stroke-color": "#FF7E00",
              }
            });
          }
          const imagePath = compData.attributes.Projects.data[index].attributes.Project.data.attributes.Image.data.attributes.formats.thumbnail.url;
          createImageLayer(`project-image-${index}`, `project-image-layer-${index}`, 0.5, `project-${index}`, imagePath, 100);
        }
      });
    }
  };

  const clearOverlays = () => {
    if (map.current.getLayer('Cooperate-line-layer'))
      map.current.removeLayer('Cooperate-line-layer');
    if (map.current.getSource('Cooperate-line'))
      map.current.removeSource('Cooperate-line');
    if (map.current.getLayer('Cooperate-circle'))
      map.current.removeLayer('Cooperate-circle');
    if (map.current.getSource('Cooperate-point'))
      map.current.removeSource('Cooperate-point');

    for (let i = 0; i < 3; i++) {
      if (map.current.hasImage(`project-image-${i}`))
        map.current.removeImage(`project-image-${i}`)
      if (map.current.getLayer(`project-image-layer-${i}`))
        map.current.removeLayer(`project-image-layer-${i}`);
      if (map.current.getLayer(`project-overlays-${i}`))
        map.current.removeLayer(`project-overlays-${i}`);
      if (map.current.getSource(`project-${i}`))
        map.current.removeSource(`project-${i}`);
    }
    if (map.current.getLayer('offscreen-circle')) {
      map.current.removeLayer('offscreen-circle')
      map.current.removeSource('offscreen-point')
    }
    if (map.current.hasImage('company-logo-image'))
      map.current.removeImage('company-logo-image')
    if (map.current.getLayer('company-logo-image-layer'))
      map.current.removeLayer('company-logo-image-layer')
    if (map.current.getLayer('company-logo-overlay'))
      map.current.removeLayer('company-logo-overlay')
    if (map.current.getSource('selected-company'))
      map.current.removeSource('selected-company')
  };

  const createImageLayer = async (imgId, layerId, iconSize, sourceId, imgUrl, imgSize = 60) => {
    let circularImageData
    if (imgUrl) {
      circularImageData = await createCircularImage('http://localhost:1337' + imgUrl, imgSize);
    } else {
      circularImageData = await createCircularImage(tempPic, imgSize);
    }
    map.current.loadImage(circularImageData, (err, image) => {
      if (err) throw err;
      if (!map.current.hasImage(imgId))
        map.current.addImage(imgId, image);
    });
    // company image layer
    if (!map.current.getLayer(layerId)) { // if layer is not existed then add layer, this condition only for preventing redundant adding layer
      map.current.addLayer({
        id: layerId,
        type: 'symbol',
        source: sourceId,
        layout: {
          'icon-image': imgId,
          'icon-size': iconSize,
        }
      });
    }
  }

  const pixelToMeter = (pixel) => {
    const zoomLevel = map.current.getZoom();
    let mpp;
    mpp = 156543.03 * Math.cos(map.current.getCenter().lat) / Math.pow(2, zoomLevel); // source: https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale
    return (pixel * mpp)
  }

  useEffect(() => {
    // init map
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
      console.log("geojson: ", geojsonCompanies);
      // reset company data
      if (map.current.getSource("companies")) {
        console.log("Source companies existed");
        map.current.getSource("companies").setData(geojsonCompanies);
      } else {
        // company source
        map.current.addSource("companies", {
          type: "geojson",
          data: geojsonCompanies,
          cluster: true,
          clusterMaxZoom: 15,
          clusterRadius: 50,
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
              30,
            ],
            "circle-stroke-width": 3,
            "circle-stroke-color": "#fff",
          },
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
              "match",
              ["get", "industry"],
              "Festival",
              "#AF147A",
              "Food",
              "#FFB800",
              "Travel",
              "#42BEFF",
              "Book",
              "#0065AA",
              "Film",
              "#2C2727",
              "Sport",
              "#E80002",
              "Thai Art",
              "#78FF00",
              "Educational Game",
              "#22A51A",
              "Fashion",
              "#A400DE",
              "Music",
              "#E17000",
              "Design",
              "#FF6E6D",
              "#ccc",
            ],
            "circle-radius": 8,
            "circle-stroke-width": 5,
            "circle-stroke-color": [
              "match",
              ["get", "industry"],
              "Festival",
              "rgba(175, 20, 122, 0.5)",
              "Food",
              "rgba(255, 184, 0, 0.5)",
              "Travel",
              "rgba(66, 190, 255, 0.5)",
              "Book",
              "rgba(0, 101, 170, 0.5)",
              "Film",
              "rgba(44, 39, 39, 0.5)",
              "Sport",
              "rgba(232, 0, 2, 0.5)",
              "Thai Art",
              "rgba(120, 255, 0, 0.5)",
              "Educational Game",
              "rgba(34, 165, 26, 0.5)",
              "Fashion",
              "rgba(164, 0, 222, 0.5)",
              "Music",
              "rgba(225, 112, 0, 0.5)",
              "Design",
              "rgba(255, 110, 109, 0.5)",
              "rgba(204, 204, 204, 0.5)",
            ],
          },
        });

        // provinces source
        map.current.addSource("provinces", {
          type: "geojson",
          data: provinces,
        });

        // layer province
        map.current.addLayer({
          id: "provinces-layer",
          type: "fill",
          source: "provinces",
          paint: {
            "fill-color": "rgba(0, 0, 0, 0)",
          },
        });

        map.current.moveLayer("companies-clusters", "unclustered-point");
        map.current.moveLayer("companies-clusters", "cluster-count");
        map.current.moveLayer("provinces-layer", "companies-clusters");
      }
      // clear project layers on industry changed
      clearOverlays();
    };

    if (map.current.isStyleLoaded()) {
      console.log("Style loaded");
      addDataToMap();
    } else {
      console.log("Loading style");
      map.current.on("load", addDataToMap); //load data to map
    }

    // click clusters to zoom in
    map.current.on('click', "companies-clusters", (event) => {
      const features = map.current.queryRenderedFeatures(event.point, {
        layers: ["companies-clusters"],
      });
      const clusterId = features[0].properties.cluster_id;
      map.current.getSource("companies")
        .getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) throw err;
          map.current.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom,
          });
        });
    });

    // click to show company information in the sidebar & show project overlays
    map.current.on('click', "unclustered-point", async (event) => {
      const feature = map.current.queryRenderedFeatures(event.point, {
        layers: ["unclustered-point"],
      })[0];
      console.log(feature)
      activeFeature = feature;
      createProductOverlays(feature)
    });

    // click to highlight project layer & show cooperated company
    for (let i = 0; i < 3; i++) {
      map.current.on('click', `project-overlays-${i}`, () => {
        // reset stroke color for all overlays
        for (let j = 0; j < 3; j++) {
          if (map.current.getLayer(`project-overlays-${j}`))
            map.current.setPaintProperty(`project-overlays-${j}`, 'circle-stroke-color', '#FF7E00')
        }
        map.current.setPaintProperty(`project-overlays-${i}`, 'circle-stroke-color', '#FFCE00') // highlight selected overlay

        const project_source = map.current.getSource(`project-${i}`);
        console.log(project_source)
        const compData = queryData.find((data) => {
          return data.id === project_source._data.properties.compId
        })
        if (compData) {
          const parent_location = turf.point([compData.attributes.Location.Coor_long, compData.attributes.Location.Coor_lat])
          const project = compData.attributes.Projects.data.find((data) => {
            return data.id === project_source._data.properties.id
          });
          const bounds = map.current.getBounds();
          const screenBorder = turf.polygon([
            [
              [bounds._ne.lng, bounds._ne.lat],
              [bounds._sw.lng, bounds._ne.lat],
              [bounds._sw.lng, bounds._sw.lat],
              [bounds._ne.lng, bounds._sw.lat],
              [bounds._ne.lng, bounds._ne.lat]
            ]
          ])
          const borderLine = turf.polygonToLine(screenBorder)

          // wait until project is loaded then draw line to cooperated company
          if (project) {
            const project_data = project.attributes.Project.data
            const cooperation = project_data.attributes.Companies.data
            let coop_company = []
            cooperation.forEach((data) => {
              coop_company.push(queryData.find((data2) => {
                return data.attributes.Company.data.id === data2.id
              }))
            })
            const line_features = [];
            const point_features = [];
            coop_company.forEach((data) => {
              const company_location = turf.point([data.attributes.Location.Coor_long, data.attributes.Location.Coor_lat])
              console.log(company_location)
              // if the company is shown off screen
              if (!turf.booleanPointInPolygon(company_location, screenBorder)) {
                const lineToCompany = turf.lineString([
                  [map.current.getCenter().lng, map.current.getCenter().lat],
                  company_location.geometry.coordinates
                ])
                const offScreenIntersection = turf.lineIntersect(borderLine, lineToCompany).features[0];
                const direction = turf.bearing(offScreenIntersection, turf.point(project_source._data.geometry.coordinates))
                const offScreenPoint = turf.destination(offScreenIntersection, pixelToMeter(75) / 1000, direction)
                offScreenPoint.properties = {
                  company_lng: company_location.geometry.coordinates[0],
                  company_lat: company_location.geometry.coordinates[1],
                  company_logo: data.attributes.Image.data ? data.attributes.Image.data.attributes.formats.thumbnail.url : null,
                  offscreen: true
                }
                point_features.push({
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: offScreenPoint.geometry.coordinates
                  },
                  properties: offScreenPoint.properties
                })

                line_features.push({
                  type: 'Feature',
                  geometry: {
                    coordinates: [
                      project_source._data.geometry.coordinates,
                      offScreenPoint.geometry.coordinates
                    ],
                    type: 'LineString'
                  },
                  properties: {
                    offscreen: true,
                    company: data,
                    project: project_data,
                    overlay_id: project_source.id
                  }
                })
              } else {
                point_features.push({
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates: [
                      data.attributes.Location.Coor_long,
                      data.attributes.Location.Coor_lat
                    ]
                  },
                  properties: {
                    company_lng: company_location.geometry.coordinates[0],
                    company_lat: company_location.geometry.coordinates[1],
                    company_logo: data.attributes.Image.data ? data.attributes.Image.data.attributes.formats.thumbnail.url : null,
                    offscreen: false
                  }
                })
                line_features.push({
                  type: 'Feature',
                  geometry: {
                    coordinates: [
                      project_source._data.geometry.coordinates,
                      [
                        data.attributes.Location.Coor_long,
                        data.attributes.Location.Coor_lat
                      ]
                    ],
                    type: 'LineString'
                  },
                  properties: {
                    offscreen: false,
                    company: data,
                    project: project_data,
                    overlay_id: project_source.id
                  }
                })
              }

            })

            if (map.current.getLayer('Cooperate-circle')) {
              map.current.removeLayer('Cooperate-circle')
              map.current.removeSource('Cooperate-point')
            }
            map.current.addSource('Cooperate-point', {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: point_features
              }
            });
            map.current.addLayer({
              id: 'Cooperate-circle',
              type: 'circle',
              source: 'Cooperate-point',
              paint: {
                'circle-color': 'rgba(255,255,255,1)',
                'circle-radius': 24,
                "circle-stroke-width": 4,
                "circle-stroke-color": "#FF7E00",
              },
              filter: ['==', ['get', 'offscreen'], true]
            });

            if (map.current.getLayer('Cooperate-line-layer')) {
              map.current.removeLayer('Cooperate-line-layer');
              map.current.removeSource('Cooperate-line');
            }
            map.current.addSource('Cooperate-line', {
              type: 'geojson',
              data: {
                type: "FeatureCollection",
                features: line_features,
                properties: {
                  overlay_id: project_source.id,
                }
              }
            });
            map.current.addLayer({
              id: 'Cooperate-line-layer',
              type: 'line',
              source: 'Cooperate-line',
              paint: {
                'line-color': '#F00',
                'line-blur': 1,
                'line-width': 3
              },
              layout: {
                'line-join': 'round'
              },
              filter: ['==', ['get', 'offscreen'], false]
            });
            map.current.moveLayer("Cooperate-line-layer", "unclustered-point");
            setSelectedProduct(project_data ? project_data.id : 0);
            showSidebar(2)
          }
        }
      });
    }

    map.current.on('click', 'Cooperate-circle', (e) => {
      const feature = map.current.queryRenderedFeatures(e.point, {
        layers: ['Cooperate-circle']
      })[0]
      map.current.easeTo({
        center: [
          feature.properties.company_lng,
          feature.properties.company_lat,
        ],
      });
    })

    // always reset overlays position
    map.current.on('move', () => {
      const base_offset = 0.0003;
      const scale = Math.pow(2, 18 - map.current.getZoom());
      if (map.current.getSource('project-0')) {
        const feature = map.current.getSource('project-0')._data.properties.parent_node
        // retrieve selected company data
        const selected_company_data = queryData.find((data) => {
          return data.id === feature.properties.id
        })
        if (selected_company_data) {
          const overlays = [
            {
              geometry: {
                type: 'Point',
                coordinates: [
                  feature.geometry.coordinates[0] - (base_offset * scale),
                  feature.geometry.coordinates[1]
                ]
              },
              properties: {
                parent_node: feature,
                position: 'Left',
              }
            },
            {
              geometry: {
                type: 'Point',
                coordinates: [
                  feature.geometry.coordinates[0] + (base_offset * scale),
                  feature.geometry.coordinates[1]
                ]
              },
              properties: {
                parent_node: feature,
                position: 'Right',
              }
            },
            {
              geometry: {
                type: 'Point',
                coordinates: [
                  feature.geometry.coordinates[0],
                  feature.geometry.coordinates[1] + (base_offset * scale)
                ]
              },
              properties: {
                parent_node: feature,
                position: 'Above',
              }
            }
          ]
          overlays.forEach((overlay, index) => {
            if (map.current.getSource(`project-${index}`)) {
              const project_source = map.current.getSource(`project-${index}`);
              map.current.getSource(`project-${index}`).setData({
                type: 'Feature',
                geometry: overlay.geometry,
                properties: {
                  position: overlay.properties.position,
                  parent_node: overlay.properties.parent_node,
                  id: selected_company_data.attributes.Projects.data[index].id,
                  compId: project_source._data.properties.compId
                }
              });
            }
          });

          const bounds = map.current.getBounds()
          const screenBorder = turf.polygon([
            [
              [bounds._ne.lng, bounds._ne.lat],
              [bounds._sw.lng, bounds._ne.lat],
              [bounds._sw.lng, bounds._sw.lat],
              [bounds._ne.lng, bounds._sw.lat],
              [bounds._ne.lng, bounds._ne.lat]
            ]
          ])
          const borderLine = turf.polygonToLine(screenBorder)
          const point_source = map.current.getSource('Cooperate-point');
          const line_source = map.current.getSource('Cooperate-line');
          if (point_source && line_source) {
            const point_features = point_source._data.features
            const line_features = line_source._data.features
            const project_source = map.current.getSource(line_source._data.properties.overlay_id)
            point_features.forEach((feature, i) => {
              const company_location = turf.point([feature.properties.company_lng, feature.properties.company_lat]);
              if (turf.booleanPointInPolygon(company_location, screenBorder)) {
                feature.geometry = company_location.geometry;
                feature.properties.offscreen = false;
                line_features[i].geometry.coordinates = [
                  project_source._data.geometry.coordinates,
                  company_location.geometry.coordinates
                ];
                line_features[i].properties.offscreen = false;
              } else {
                const lineToCompany = turf.lineString([
                  [map.current.getCenter().lng, map.current.getCenter().lat],
                  company_location.geometry.coordinates
                ])
                const offScreenIntersection = turf.lineIntersect(borderLine, lineToCompany).features[0];
                const direction = turf.bearing(offScreenIntersection, turf.point([map.current.getCenter().lng, map.current.getCenter().lat]));
                const offScreenPoint = turf.destination(offScreenIntersection, pixelToMeter(50) / 1000, direction);
                feature.geometry = offScreenPoint.geometry;
                feature.properties.offscreen = true;
                line_features[i].geometry.coordinates = [
                  [map.current.getCenter().lng, map.current.getCenter().lat],
                  offScreenPoint.geometry.coordinates
                ];
                line_features[i].properties.offscreen = true
              }
            });
            point_source.setData({
              type: "FeatureCollection",
              features: point_features
            });
            line_source.setData({
              type: "FeatureCollection",
              features: line_features,
              properties: {
                overlay_id: line_source._data.properties.overlay_id,
              }
            });
          }
        }
      }
    });

    // remove project overlays if company node becomes invisible (not visible on screen)
    map.current.on('zoom', () => {
      if (activeFeature) {
        const features = map.current.queryRenderedFeatures(
          map.current.project(activeFeature.geometry.coordinates),
          { layers: ['unclustered-point'] }
        );
        const feature = features[0];
        if (!feature)
          clearOverlays();
      }
    })

    // hover company node to show info popup
    map.current.on('mouseenter', 'unclustered-point', (event) => {
      map.current.getCanvas().style.cursor = "pointer";
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
          <div class="custom-popup">
            ${feature.properties.imageUrl
            ? `<div class="coverimg">
                <img src="${"http://localhost:1337" + feature.properties.imageUrl
            }" alt="${feature.properties.title} Image" class="companyimg">
                   </div>`
            : ""
          }
            <h2 class="title">${feature.properties.title}</h2>
            <h3 class="industry">${feature.properties.industry}</h3>
            <h3 class="location">Provinces, Country</h3>
          </div>
          `
        )
        .addTo(map.current);
      popupRef.current = popup;
    });
    map.current.on("mouseleave", "unclustered-point", () => {
      map.current.getCanvas().style.cursor = "";
      if (popupRef.current) {
        popupRef.current.remove();
      }
    });
    map.current.on("mouseenter", "companies-clusters", () => {
      map.current.getCanvas().style.cursor = "pointer";
    });
    map.current.on("mouseleave", "companies-clusters", () => {
      map.current.getCanvas().style.cursor = "";
    });
    for (let i = 0; i < 3; i++) {
      map.current.on("mouseenter", `project-overlays-${i}`, () => {
        map.current.getCanvas().style.cursor = "pointer";
      });
      map.current.on("mouseleave", `project-overlays-${i}`, () => {
        map.current.getCanvas().style.cursor = "";
      });
    }
    map.current.on("mouseenter", "Cooperate-circle", () => {
      map.current.getCanvas().style.cursor = "pointer";
    });
    map.current.on("mouseleave", "Cooperate-circle", () => {
      map.current.getCanvas().style.cursor = "";
    });

  }, [queryData, selectedIndustry]);

  // highlight and pan to the selected province on selected
  useEffect(() => {
    if (map.current.isStyleLoaded()) {
      map.current.setPaintProperty(
        "provinces-layer",
        "fill-color",
        selectedProvince === "all"
          ? "rgba(0, 0, 0, 0)"
          : [
            "case",
            ["==", ["get", "pro_en"], selectedProvince],
            "rgba(255, 150, 0, 0.15)",
            "rgba(0, 0, 0, 0)",
          ]
      );
      map.current.setPaintProperty(
        "provinces-layer",
        "fill-outline-color",
        selectedProvince === "all"
          ? "rgba(0, 0, 0, 0)"
          : [
            "case",
            ["==", ["get", "pro_en"], selectedProvince],
            "rgba(255, 0, 0, 0.7)",
            "rgba(0, 0, 0, 0)",
          ]
      );
      if (selectedProvince !== "all") {
        const province_feat = provinces.features.find(
          (feature) => feature.properties.pro_en === selectedProvince
        );
        //console.log(province_feat)
        map.current.easeTo({
          center: [
            province_feat.properties.center_long,
            province_feat.properties.center_lat,
          ],
          zoom: 8,
        });
        const screen_center = turf.point([
          map.current.getCenter().lng,
          map.current.getCenter().lat,
        ]);
        const provincePolygon =
          province_feat.geometry.type === "Polygon"
            ? turf.polygon(province_feat.geometry.coordinates)
            : turf.multiPolygon(province_feat.geometry.coordinates);
        if (
          zoom <= 8 ||
          !turf.booleanPointInPolygon(screen_center, provincePolygon)
        ) {
          map.current.easeTo({
            center: [
              province_feat.properties.center_long,
              province_feat.properties.center_lat,
            ],
            zoom: 8,
            duration: 750,
          });
        } else {
          map.current.easeTo({});
        }
      }
    }
  }, [selectedProvince]);

  // pan to selected company on searched
  useEffect(() => {
    map.current.flyTo({
      center: [location.lng, location.lat],
      essential: true,
      zoom: 16,
      speed: 4,
    });
  }, [location]);

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
