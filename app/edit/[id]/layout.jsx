// import { MapProvider } from "../../EditContext";
import { MapProvider } from "../../EditContext";
import { LightProvider } from "../../Components/LightContext";
import { CameraProvider } from "../../Components/CameraContext";

export default function FabricLayout({ children }) {
  return (
    <CameraProvider>
      <MapProvider>
        <LightProvider>{children}</LightProvider>
      </MapProvider>
    </CameraProvider>
  );
}
