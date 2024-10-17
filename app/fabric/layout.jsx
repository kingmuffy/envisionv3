// File: app/fabric/layout.js
import "../globals.css";
import { MapProvider } from "../MapContext";

import { CameraProvider } from "../Components/CameraContext";
import { LightProvider } from "../Components/LightContext";
export const dynamicParams = true;
export default function FabricLayout({ children }) {
  return (
    <MapProvider>
      <CameraProvider>
        <LightProvider>{children}</LightProvider>
      </CameraProvider>
    </MapProvider>
  );
}
