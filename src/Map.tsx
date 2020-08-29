import produce from "immer";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { nanoid } from "nanoid";
import React, { useEffect, useRef, useCallback } from "react";
import { MarkerWithId } from "./App";

interface MapInterface {
  markers: MarkerWithId[];
  setMarkers: React.Dispatch<React.SetStateAction<MarkerWithId[]>>;
}

function Map({ markers, setMarkers }: MapInterface) {
  const mapRef = useRef<L.Map | null>(null);
  const mapElementRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef(L.polyline([], { color: "#039be5", weight: 4 }));

  /**
   * workaround to fix a bug where click triggers after mouseup
  while dragging a marker
   */
  const isDraggingRef = useRef(false);
  const markerLayerRef = useRef(L.layerGroup());
  const routeLayerRef = useRef(L.layerGroup());

  const mutableMarkersRef = useRef<MarkerWithId[]>([]);
  mutableMarkersRef.current = markers;

  function createIcon(label: string | number) {
    return L.divIcon({
      className: "custom-icon",
      iconSize: [40, 40],
      html: `<span>${label}</span>`,
    });
  }

  const createMarker = useCallback(
    (latlng: L.LatLng) => {
      const id = nanoid(5);

      const marker: MarkerWithId = {
        id: id,
        instance: L.marker(latlng, {
          draggable: true,
          icon: createIcon(id),
        }),
      };

      /* BIND EVENTS TO MARKER */

      // prevent bubbling to map
      marker.instance.on("click", () => {});

      // doubleclick wokraround
      marker.instance.on("dragstart", () => {
        isDraggingRef.current = true;
      });

      // iterate on mutable array during dragging for live route update
      marker.instance.on("drag", () => {
        const markerCoords = mutableMarkersRef.current.map((marker) =>
          marker.instance.getLatLng()
        );
        routeRef.current.setLatLngs(markerCoords);
      });

      // replace old marker instance with new one when done dragging
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
        setTimeout(() => (isDraggingRef.current = false), 0);
      });

      // add the marker
      setMarkers(
        produce((draft) => {
          draft.push(marker);
        })
      );
    },
    [setMarkers]
  );

  // Setup leaflet map
  useEffect(() => {
    if (!mapElementRef.current) {
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

    function onMapClick(e: L.LeafletMouseEvent) {
      if (isDraggingRef.current) {
        return;
      }

      createMarker(e.latlng);
    }

    mapRef.current?.on("click", onMapClick);

    return function cleanup() {
      map.remove();
    };
  }, [createMarker, setMarkers]);

  // Draw the markers and route
  useEffect(() => {
    const route = routeRef.current;
    const markerLayer = markerLayerRef.current;

    // Map has side-effects, but it's a single-pass
    const markerCoords = markers.map((marker, i) => {
      marker.instance.addTo(markerLayer);
      marker.instance.setIcon(createIcon(i + 1));
      return marker.instance.getLatLng();
    });

    route.setLatLngs(markerCoords);

    return function cleanup() {
      markerLayer.clearLayers();
    };
  }, [markers]);

  return <div className="map" ref={mapElementRef}></div>;
}

export default Map;
