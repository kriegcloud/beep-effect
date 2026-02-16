import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import * as React from "react";
import "ol/ol.css";

// -----------------------------------------------------------------------------
// MapComponent
// -----------------------------------------------------------------------------

function MapComponent(): React.ReactElement {
  const selfRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<Map | null>(null);

  React.useEffect(() => {
    const container = selfRef.current;
    if (!container) return;

    const osmLayer = new TileLayer({
      preload: Number.POSITIVE_INFINITY,
      source: new OSM(),
    });

    mapRef.current = new Map({
      target: container,
      layers: [osmLayer],
      view: new View({
        center: [0, 0],
        zoom: 0,
      }),
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(undefined);
      }
    };
  }, []);

  React.useEffect(() => {
    if (mapRef.current) {
      mapRef.current.updateSize();
    }
  });

  return <div ref={selfRef} style={{ height: "100%", width: "100%" }} id="map" className="map-container" />;
}

export default MapComponent;
