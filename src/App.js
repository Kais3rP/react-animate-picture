import { useRef } from "react";
import "./App.css";
import AnimatedPicture from "./components/AnimatedPicture/AnimatedPicture";
import reactLogo from "./data/reactgr2.png";

function App() {
  const reactCanvasStateRef = useRef({ visible: true });
  return (
    <div className="App">
      <header className="App-header">
        <AnimatedPicture
          reactCanvasStateRef={reactCanvasStateRef}
          id="react-canvas-element"
          src={reactLogo}
          color="rgba(255,255,255,1)"
        />
      </header>
    </div>
  );
}

export default App;
