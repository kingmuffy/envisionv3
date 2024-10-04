// File: app/fabric/layout.js
import "../globals.css";
import { MapProvider } from "../MapContext";
import { LightProvider } from "../Components/LightContext";

export default function FabricLayout({ children }) {
  return (
    <MapProvider>
      <LightProvider>{children}</LightProvider>
    </MapProvider>
  );
}
