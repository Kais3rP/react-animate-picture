import { useRef, useEffect } from "react"
import AnimatePixels from "./animatePixels"

const AnimatedPicture = ({pic}) => {

    const canvasRef = useRef(null)

    useEffect(()=>{
  
  const animatePixels = new AnimatePixels(pic, canvasRef)
  animatePixels.init()
  
    },[])

    return <canvas ref={canvasRef} />
}

export default AnimatedPicture
