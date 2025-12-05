// src/components/generic/LoaderOverlay.jsx
import { ClipLoader } from "react-spinners";

export default function LoaderOverlay({
  size = 32,
  color = "var(--color-white)",
}) {
  return (
    <div className="loader-overlay">
      <ClipLoader size={size} color={color} />
    </div>
  );
}