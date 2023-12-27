import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import "../styles/CameraComponent.css";
import "../styles/EnterLostDisc.css"; // Import the CSS file
import { API_BASE_URL } from "../App";

interface CameraComponentProps {
  onCapture: (imageData: string, side: string) => void;
  side: string;
  switchToManual: () => void;
}

const CameraComponent: React.FC<CameraComponentProps> = ({
  onCapture,
  side,
  switchToManual,
}) => {
  const webcamRef = useRef<Webcam>(null); // Use a generic type for better type checking
  const intervalRef = useRef<number | null>(null);
  const [isDark, setIsDark] = useState(false); // State to track lighting condition

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      console.log("Image:", imageSrc);
      if (imageSrc) {
        onCapture(imageSrc, side);
      }
    }
  };

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

  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      checkImage();
    }, 1000); // Adjust the interval as needed

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div>
      <div style={{ position: "relative" }}>
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="webcam"
        />
        <div className="circle-guide"></div>
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
          onClick={capture}
          className="button-blue"
          style={{
            height: "50px",
            width: "100%",
          }}
        >
          Capture {side} photo
        </button>
        <button
          onClick={switchToManual}
          className="button"
          style={{
            height: "50px",
            width: "100%",
          }}
        >
          Done Captures
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
