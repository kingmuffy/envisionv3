import { MapProvider } from "../../EditContext";
import { LightProvider } from "../../Components/LightContext";

export default function FabricLayout({ children }) {
  return (
    <MapProvider>
      <LightProvider>{children}</LightProvider>
    </MapProvider>
  );
}
