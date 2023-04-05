import { useRef, useEffect } from "react";
import AnimatePicture from "./animatePicture";
import { string, object } from "prop-types";

const AnimatedPicture = ({ src, color, reactCanvasStateRef, ...props }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const animatePicture = new AnimatePicture({
      src,
      canvasRef,
      canvasStateRef: reactCanvasStateRef,
      color,
    });
    animatePicture.init();
    return () => animatePicture.cancel();
  }, [src, color, reactCanvasStateRef]);

  return <canvas {...props} ref={canvasRef} />;
};

AnimatedPicture.propTypes = {
  src: string,
  color: string,
  reactCanvasStateRef: object,
};

export default AnimatedPicture;
