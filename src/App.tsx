import React, { useRef, useEffect } from "react";
import "./App.scss";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function App() {
  const leafletInstance = useRef<L.Map | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (leafletInstance.current || !mapRef.current) {
      return;
    }

    leafletInstance.current = L.map(mapRef.current).setView(
      [46.3792134, 13.8251619],
      13
    );

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
    ).addTo(leafletInstance.current);

    return function cleanup() {
      leafletInstance.current?.remove();
    };
  }, []);

  return (
    <div className="App">
      <div className="sidebar"></div>
      <div className="map" ref={mapRef}></div>
    </div>
  );
}

export default App;
