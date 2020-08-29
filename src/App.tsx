import { Marker } from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useState } from "react";
import "./App.scss";
import Map from "./Map";
import Sidebar from "./Sidebar";

export interface MarkerWithId {
  id: string;
  instance: Marker;
}

function App() {
  const [markers, setMarkers] = useState<MarkerWithId[]>([]);

  return (
    <div className="App">
      <Sidebar {...{ markers, setMarkers }} />
      <Map {...{ markers, setMarkers }} />
    </div>
  );
}

export default App;
