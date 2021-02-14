import { useRef, useEffect } from "react"
import { data } from "./data/base64"
import './App.css';
import AnimatedPicture from "./components/AnimatedPicture/AnimatedPicture"
import pic from "./data/js.jpg"
import txt2 from "./data/txt2.png"
import txt3 from "./data/txt3.png"
import reactLogo from "./data/reactgr2.png"

function App() {

  return (
    <div className="App">
      <header className="App-header">
       <AnimatedPicture pic={reactLogo} />
       <AnimatedPicture pic={data} />
      </header>
    </div>
  );
}

export default App;
