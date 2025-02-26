import Lottie from "lottie-react";
import animationData from "./loading-animation.json"; // Lottie JSON 파일

export default function LottieLoader() {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  return (
    <div className="flex justify-center items-center">
      {/* <Lottie options={defaultOptions} height={200} width={200} /> */}
    </div>
  );
}
