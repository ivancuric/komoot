import produce from "immer";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerImg from "leaflet/dist/images/marker-icon.png";
import React, { useEffect, useRef, useState } from "react";
import "./App.scss";
import { nanoid } from "nanoid";

interface Marker {
  id: string;
  instance: L.Marker;
}

function App() {
  const mapRef = useRef<L.Map | null>(null);
  const mapElementRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef(L.polyline([], { color: "red" }));
  const markerLayerRef = useRef(L.layerGroup());
  const routeLayerRef = useRef(L.layerGroup());

  const [markers, setMarkers] = useState<Marker[]>([]);

  // setup leaflet
  useEffect(() => {
    if (mapRef.current || !mapElementRef.current) {
      return;
    }

    mapRef.current = L.map(mapElementRef.current);

    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    const routeLayer = routeLayerRef.current;
    const route = routeRef.current;

    map.setView([46.3792134, 13.8251619], 13);

    L.tileLayer(
      "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
      {
        attribution:
          'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox/streets-v11",
        tileSize: 512,
        zoomOffset: -1,
        accessToken:
          "pk.eyJ1IjoiYmF4dXoiLCJhIjoiY2pqajJuZDRsMHBhOTNwbTB3cGt3ZzJ6dCJ9.dMfTHE5NQKl-8kuxluXkDw",
      }
    ).addTo(map);

    route.addTo(routeLayer);
    routeLayer.addTo(map);
    markerLayer.addTo(map);

    // ADD CLICK HANDLERS
    const onMapClick = (e: L.LeafletMouseEvent) => {
      const icon = L.icon({
        iconUrl: markerImg,
        iconAnchor: [12, 40],
      });

      const marker: Marker = {
        id: nanoid(),
        instance: L.marker(e.latlng, { draggable: true, icon }),
      };

      marker.instance.on("drag", (e) => {
        // const latlng: L.LatLngExpression = (e as any).latlng;
        // const markerCoords = markers.map((marker) =>
        //   marker.instance.getLatLng()
        // );
        // console.log(markers);
        // console.log(marker.instance);
      });
      marker.instance.addTo(markerLayer);

      setMarkers(
        produce((draft) => {
          draft.push(marker);
        })
      );
    };

    map.on("click", onMapClick);

    return function cleanup() {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  // MODIFY ROUTE
  useEffect(() => {
    const map = mapRef.current;
    const route = routeRef.current;

    const markerCoords = markers.map((marker) => marker.instance.getLatLng());

    if (!map || !route) {
      return;
    }

    route.setLatLngs(markerCoords);
  }, [markers]);

  return (
    <div className="App">
      <div className="sidebar"></div>
      <div className="map" ref={mapElementRef}></div>
    </div>
  );
}

export default App;
