import produce from "immer";
import React, { useLayoutEffect, useRef, useState } from "react";
import { MarkerWithId } from "./App";

interface ListItemInterface {
  marker: MarkerWithId;
  i: number;
  setMarkers: React.Dispatch<React.SetStateAction<MarkerWithId[]>>;
  comparePositions: Function;
  setListItemRefs: Function;
}

export function ListItem({
  marker,
  i,
  setMarkers,
  comparePositions,
  setListItemRefs,
}: ListItemInterface) {
  const itemRef = useRef<HTMLLIElement>(null);
  const originalPosY = useRef<number | null>(null);
  const diff = useRef<number | null>(null);

  const [isDragged, setIsDragged] = useState(false);

  // bit convoluted, could've probably  used forwarded refs
  useLayoutEffect(() => {
    setListItemRefs(
      produce((draft) => {
        draft[marker.id] = itemRef.current;
      })
    );

    return () => {
      setListItemRefs(
        produce((draft) => {
          delete draft[marker.id];
        })
      );
    };
  }, [marker.id, setListItemRefs]);

  function handleMouseDown(e: React.MouseEvent) {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    if (!itemRef.current) {
      return;
    }

    const position = itemRef.current.getBoundingClientRect();

    originalPosY.current = position.y;
    diff.current = e.clientY - position.y;

    setIsDragged(true);
  }

  function handleMouseUp() {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    if (!itemRef.current) {
      return;
    }

    itemRef.current.style.transform = "";
    originalPosY.current = null;

    setIsDragged(false);
  }

  function handleMouseMove(e: MouseEvent) {
    if (!itemRef.current || !originalPosY.current || !diff.current) {
      return;
    }

    const newPosition = e.y - originalPosY.current - diff.current;

    itemRef.current.style.transform = `translateY(${newPosition}px)`;

    comparePositions();
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
    <li
      ref={itemRef}
      className="list-item"
      onMouseDown={handleMouseDown}
      style={{
        zIndex: isDragged ? 1 : 0,
      }}
    >
      {/* <span>Waypoint {i + 1}</span> */}
      <span>{marker.id}</span>
      <button onClick={() => deleteMarker(marker.id)}>X</button>
    </li>
  );
}
