import produce from "immer";
import React from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import { MarkerWithId } from "./App";
import { ReactComponent as DeleteIcon } from "./icons/delete-24px.svg";
import { ReactComponent as DragHandleIcon } from "./icons/drag_handle-24px.svg";
import { Download } from "./Download";

interface SidebarProps {
  markers: MarkerWithId[];
  setMarkers: React.Dispatch<React.SetStateAction<MarkerWithId[]>>;
}

export function Sidebar({ markers, setMarkers }: SidebarProps) {
  function reorder(list: MarkerWithId[], startIndex: number, endIndex: number) {
    const result = [...list];
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  }
  function deleteMarker(id: string) {
    //immerjs.github.io/immer/docs/update-patterns#array-mutations
    const updateMarkers = produce((draft) => {
      const index = draft.findIndex((item: MarkerWithId) => item.id === id);
      if (index !== -1) draft.splice(index, 1);
    });

    setMarkers(updateMarkers);
  }

  function onDragEnd(result: DropResult) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      markers,
      result.source.index,
      result.destination.index
    );

    setMarkers(items);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="sidebar">
        <h1>Route Builder</h1>
        <Droppable droppableId="droppable">
          {(provided) => (
            <ol
              className="list"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {markers.map((marker, i) => (
                <Draggable key={marker.id} draggableId={marker.id} index={i}>
                  {(provided) => (
                    <li
                      className="list-item"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div
                        className="drag-handle"
                        {...provided.dragHandleProps}
                      >
                        <DragHandleIcon />
                      </div>

                      {/* I suppose the numbers shouldn't be stable */}
                      <span>Waypoint {i + 1}</span>
                      <button
                        className="delete-button"
                        onClick={() => deleteMarker(marker.id)}
                      >
                        <DeleteIcon />
                      </button>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ol>
          )}
        </Droppable>
        <Download {...{ markers }} />
      </div>
    </DragDropContext>
  );
}
