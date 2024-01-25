import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Webcam from "react-webcam";
import axios from "axios";
import "../styles/CameraComponent.css";
import "../styles/EnterLostDisc.css"; // Import the CSS file
// import { API_BASE_URL } from "../App";

interface CameraComponentProps {
  onCapture: (imageData: string, side: string) => void;
  side: string;
  setSide: Dispatch<SetStateAction<string>>;
  switchToManual: () => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({
  onCapture,
  side,
  setSide,
  switchToManual,
}) => {
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  const [videoConstraints, setVideoConstraints] =
    useState<MediaTrackConstraints>({ facingMode: "environment" });
  const [webcamAvailable, setWebcamAvailable] = useState(true);

  useMemo(() => {
    setVideoConstraints({
      facingMode: isMobileDevice() ? { exact: "environment" } : "user",
    });
  }, []);

  const handleUserMediaError = (error: any) => {
    console.error("Webcam error:", error);
    setWebcamAvailable(false);
  };

  const webcamRef = useRef<Webcam>(null); // Use a generic type for better type checking
  const intervalRef = useRef<number | null>(null);
  const [isDark, setIsDark] = useState(false); // State to track lighting condition

  const toggleSide = () => {
    console.log("Toggling side...");
    if (side === "front") {
      setSide("back");
    } else {
      setSide("front");
    }
    console.log("Side:", side);
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      console.log("Image:", imageSrc);
      if (imageSrc) {
        // If imageSrc is not null/undefined, proceed with the capture
        onCapture(imageSrc, side);
      } else {
        // If imageSrc is null, handle the error
        console.error("Webcam image is null");
        // You can also set some state here to show an error message to the user
      }
      toggleSide();
    }
  }, [webcamRef, side]);

  const checkImage = () => {
    const thresholdBrightness = 110; // Define thresholdBrightness as per your need
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();

      // Convert imageSrc to a canvas to analyze
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        context!.drawImage(image, 0, 0);

        // Analyze brightness
        const imageData = context!.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        let totalBrightness = 0;
        for (let i = 0; i < imageData.data.length; i += 4) {
          // Convert to grayscale
          const brightness =
            0.34 * imageData.data[i] +
            0.5 * imageData.data[i + 1] +
            0.16 * imageData.data[i + 2];
          totalBrightness += brightness;
        }
        const averageBrightness = totalBrightness / (imageData.data.length / 4);

        console.log("Average brightness:", averageBrightness);
        console.log("Is dark:", averageBrightness < thresholdBrightness);

        // Check if the image is well-lit
        if (averageBrightness < thresholdBrightness) {
          setIsDark(true); // Update state if the image is dark
        } else {
          setIsDark(false); // Update state if the lighting is adequate
        }
      };
      image.src = imageSrc!;
    }
  };

  useEffect(
    () => {
      console.log("Setting up interval");
      intervalRef.current = window.setInterval(() => {
        checkImage();
      }, 1000);

      return () => {
        console.log("Clearing interval");
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    },
    [
      /* dependencies */
    ]
  );

  useEffect(() => {
    console.log(`Is mobile device: ${isMobileDevice()}`);
    console.log(`Video constraints: ${JSON.stringify(videoConstraints)}`);
  }, [videoConstraints]);

  return (
    <div className="camera-component-container">
      <div style={{ position: "relative" }}>
        {webcamAvailable ? (
          <div>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="webcam"
              videoConstraints={videoConstraints}
              onUserMediaError={handleUserMediaError}
            />
            <div className="circle-guide" />
            {isDark && (
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  color: "white",
                }}
              >
                Please try to get better lighting.
              </div>
            )}
          </div>
        ) : (
          <div
            className="no-webcam"
            style={{ width: "100%", height: "100%", backgroundColor: "white" }}
          >
            {/* You can add any message or icon here to indicate that the webcam is not available */}
            <p>No webcam available</p>
          </div>
        )}
      </div>
      <div
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "row",
          margin: "auto",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <button
          onClick={switchToManual}
          className="button-done"
          style={{
            height: "50px",
            width: "100%",
          }}
        >
          Done Captures
        </button>

        <button
          onClick={capture}
          className="button-blue"
          style={{
            height: "50px",
            width: "100%",
          }}
        >
          Capture {side}
        </button>
        {/* <button
          onClick={toggleSide}
          className="button-switch"
          style={{
            height: "50px",
          }}
        >
          Switch to {side === "front" ? "Back" : "Front"}
        </button> */}
      </div>
    </div>
  );
};

export default CameraComponent;
