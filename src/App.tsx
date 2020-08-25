import produce from "immer";
import L from "leaflet";
import markerImg from "leaflet/dist/images/marker-icon.png";
import "leaflet/dist/leaflet.css";
import { nanoid } from "nanoid";
import React, { useEffect, useRef, useState } from "react";
import "./App.scss";

interface MarkerWithId {
  id: string;
  instance: L.Marker;
}

const icon = L.icon({
  iconUrl: markerImg,
  iconAnchor: [12, 40],
});

function App() {
  const mapRef = useRef<L.Map | null>(null);
  const mapElementRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef(L.polyline([], { color: "red" }));
  const markerLayerRef = useRef(L.layerGroup());
  const routeLayerRef = useRef(L.layerGroup());

  const [updateTrigger, forceUpdate] = useState(0);
  const [markers, setMarkers] = useState<MarkerWithId[]>([]);
  const mutableMarkersRef = useRef<MarkerWithId[]>([]);

  // ADD MAP MARKER
  function onMapClick(e: L.LeafletMouseEvent) {
    // const markerLayer = markerLayerRef.current;
    const mutableMarkers = mutableMarkersRef.current;
    const route = routeRef.current;

    const marker: MarkerWithId = {
      id: nanoid(5),
      instance: L.marker(e.latlng, { draggable: true, icon }),
    };

    marker.instance.bindTooltip(marker.id, { permanent: true });

    marker.instance.on("drag", () => {
      const markerCoords = markers.map((marker) => marker.instance.getLatLng());
      route.setLatLngs(markerCoords);
    });

    marker.instance.on("dragend", (e) => {
      const newMarker: L.Marker = e.target;

      //immerjs.github.io/immer/docs/update-patterns#array-mutations
      const updateMarkers = produce((draft) => {
        const index = draft.findIndex(
          (item: MarkerWithId) => item.id === marker.id
        );
        if (index !== -1) draft[index].instance = newMarker;
      });

      setMarkers(updateMarkers);
      forceUpdate((prev) => prev + 1);
    });

    setMarkers(
      produce((draft) => {
        draft.push(marker);
      })
    );
  }

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

    map.on("click", onMapClick);

    return function cleanup() {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [onMapClick]);

  // DRAW ROUTE AND MARKERS
  useEffect(() => {
    const route = routeRef.current;
    const markerLayer = markerLayerRef.current;

    const markerCoords = markers.map((marker) => {
      marker.instance.addTo(markerLayer);
      return marker.instance.getLatLng();
    });

    route.setLatLngs(markerCoords);

    return () => {
      markerLayer.clearLayers();
    };
  }, [markers, updateTrigger]);

  // DEBUG
  function shuffleMarkers() {
    setMarkers(
      produce((draft) => {
        draft.sort(() => Math.random() - 0.5);
      })
    );
  }

  return (
    <div className="App">
      <div className="sidebar">
        <button onClick={() => shuffleMarkers()}>Shuffle</button>
        <ul>
          {markers.map((marker) => (
            <li key={marker.id}>{marker.id}</li>
          ))}
        </ul>
      </div>
      <div className="map" ref={mapElementRef}></div>
    </div>
  );
}

export default App;
