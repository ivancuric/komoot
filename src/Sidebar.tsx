import produce, { original } from "immer";
import React, { useState } from "react";
import { MarkerWithId } from "./App";
import { ListItem } from "./ListItem";

interface SidebarInterface {
  markers: MarkerWithId[];
  setMarkers: React.Dispatch<React.SetStateAction<MarkerWithId[]>>;
}

interface ItemRefs {
  [key: string]: HTMLLIElement;
}

export default function Sidebar({ markers, setMarkers }: SidebarInterface) {
  const [listItemRefs, setListItemRefs] = useState<ItemRefs>({});

  // DEBUG
  function shuffleMarkers() {
    setMarkers(
      produce((draft) => {
        draft.sort(() => Math.random() - 0.5);
      })
    );
  }

  function comparePositions() {
    const sortedIds = Object.entries(listItemRefs)
      .sort(
        (a, b) =>
          a[1].getBoundingClientRect().y - b[1].getBoundingClientRect().y
      )
      .map(([id]) => id);

    setMarkers(
      produce((draft) => {
        const newOrder = sortedIds.map((id) =>
          draft.find((entry: MarkerWithId) => entry.id === id)
        );

        return newOrder;
      })
    );
  }

  return (
    <div className="sidebar">
      <button onClick={() => shuffleMarkers()}>Shuffle</button>
      <ul>
        {markers.map((marker, i) => (
          <ListItem
            key={marker.id}
            {...{
              marker,
              i,
              setMarkers,
              comparePositions,
              setListItemRefs,
            }}
          ></ListItem>
        ))}
      </ul>
    </div>
  );
}
