import React from "react";
import { MarkerWithId } from "./App";

interface DownloadProps {
  markers: MarkerWithId[];
}

const makeGpx = (markers: MarkerWithId[]) => `
<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.0">
  <trk>
  <name>Komoot Demo</name>
  <trkseg>
    ${markers
      .map(
        (marker) =>
          `<trkpt lat="${marker.instance.getLatLng().lat}" lon="${
            marker.instance.getLatLng().lng
          }"></trkpt>`
      )
      .join("\n")}
  </trkseg>
  </trk>
</gpx>`;

export function Download({ markers }: DownloadProps) {
  const data = new Blob([makeGpx(markers)], {
    type: "gpx=application/gpx+xml",
  });
  const url = window.URL.createObjectURL(data);

  return (
    <a className="download" download="Your Route.gpx" href={url}>
      Download your Route
    </a>
  );
}
