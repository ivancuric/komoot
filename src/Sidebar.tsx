import produce from "immer";
import React from "react";
import { MarkerWithId } from "./App";

interface SidebarInterface {
  markers: MarkerWithId[];
  setMarkers: React.Dispatch<React.SetStateAction<MarkerWithId[]>>;
}

export default function Sidebar({ markers, setMarkers }: SidebarInterface) {
  // DEBUG
  function shuffleMarkers() {
    setMarkers(
      produce((draft) => {
        draft.sort(() => Math.random() - 0.5);
      })
    );
  }

  function deleteMarker(id: string) {
    //immerjs.github.io/immer/docs/update-patterns#array-mutations
    const updateMarkers = produce((draft) => {
      const index = draft.findIndex((item: MarkerWithId) => item.id === id);
      if (index !== -1) draft.splice(index, 1);
    });

    setMarkers(updateMarkers);
  }

  return (
    <div className="sidebar">
      <button onClick={() => shuffleMarkers()}>Shuffle</button>
      <ul>
        {markers.map((marker, i) => (
          <li key={marker.id}>
            <span>Waypoint {i + 1}</span>
            <button onClick={() => deleteMarker(marker.id)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
