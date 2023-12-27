import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import EditIcon from "@mui/icons-material/Edit";
import "../styles/EnterLostDisc.css"; // Import the CSS file
import { API_BASE_URL } from "../App";
import { Typography } from "@mui/material";
import CameraComponent from "./CameraComponent";
import ImageDetectionPopup from "./ImageDetectionPopup";

interface DiscData {
  course: string;
  name: string;
  disc: string;
  phoneNumber: string;
  bin: string;
  comments: string;
  dateFound: string;
  color: string;
  brand: string;
}

function EnterLostDisc() {
  const [discData, setDiscData] = useState<DiscData>({
    course: "Stafford Woods",
    name: "",
    disc: "",
    phoneNumber: "",
    bin: "",
    comments: "",
    dateFound: new Date().toISOString().split("T")[0],
    color: "",
    brand: "",
  });

  const MAX_RETRY_ATTEMPTS = 3; // Maximum number of retry attempts
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [selection, setSelection] = useState("");
  const [side, setSide] = useState<"front" | "back">("front");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [apiResponseData, setApiResponseData] = useState<
    Array<{ text: string; category: string }>
  >([]);
  // Define the predefined categories
  const predefinedCategories: string[] = [
    "SELECT",
    "Name",
    "Disc Brand",
    "Disc Name",
    "Phone Number",
    "Color",
    "Comments",
  ];

  // Define a function to map the incoming category to the predefined categories
  function mapToPredefinedCategory(category: string): string {
    if (predefinedCategories.includes(category)) {
      return category; // Matched a predefined category
    } else {
      return ""; // Default to an empty string
    }
  }

  const handlePlaceholderClick = (side: string) => {
    if (side === "front") setSide("front");
    else setSide("back");
    setShowCamera(true);
  };

  const toggleSide = () => {
    setSide((prevSide) => (prevSide === "front" ? "back" : "front"));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Enforce numbers-only input for the phone number and bin fields
    if ((name === "phoneNumber" || name === "bin") && !/^\d*$/.test(value)) {
      return;
    }

    setDiscData({ ...discData, [name]: value });
  };

  const handleUpdateCategory = (index: number, category: string) => {
    const updatedData = [...apiResponseData];
    updatedData[index].category = category;
    setApiResponseData(updatedData);
    console.log("Updated data:", updatedData);
  };

  const handleUpdateText = (index: number, text: string) => {
    const updatedData = [...apiResponseData];
    updatedData[index].text = text;
    setApiResponseData(updatedData);
    console.log("Updated data:", updatedData);
  };

  const handleDeleteRow = (index: number) => {
    const updatedData = [...apiResponseData];
    updatedData.splice(index, 1);
    setApiResponseData(updatedData);
    console.log("Updated data:", updatedData);
  };

  const handleImageCapture = async (
    imageData: string,
    side: string,
    retryCount = 0
  ) => {
    setSuccessMessage(""); // Clear success message
    setErrorMessage(""); // Clear error message
    console.log(`Captured ${side} image:`, imageData);
    if (side === "front") {
      setFrontImage(imageData);
    } else if (side === "back") {
      setBackImage(imageData);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/detect-text`, {
        imageBase64: imageData,
      });
      const data = response.data;
      console.log("Data:", data);

      if (!data || data.length === 0) {
        // Handle no text detected
        console.log("No text detected.");
        setErrorMessage("No text detected.");
        return;
      }

      // Map the categories
      const mappedResponse = data.map(
        (item: { text: any; category: string }) => ({
          text: item.text,
          category: mapToPredefinedCategory(item.category),
        })
      );

      console.log("Mapped response:", mappedResponse);

      setApiResponseData(mappedResponse);
      setShowPopup(true); // Show popup when data is received
    } catch (error) {
      console.error("Error processing image:", error);

      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        // Check if the error status is 500 and retry if within the maximum retry attempts
        if (
          axiosError.response?.status === 500 &&
          retryCount < MAX_RETRY_ATTEMPTS
        ) {
          console.log(`Retrying API call (Attempt ${retryCount + 1})...`);
          await new Promise<void>((resolve) => setTimeout(resolve, 1000)); // Wait for a moment before retrying
          await handleImageCapture(imageData, side, retryCount + 1);
        } else if (axiosError.response?.status === 204) {
          // Handle no text detected
          console.log("No text detected.");
          setErrorMessage("No text detected.");
        } else {
          // Handle other errors or reach maximum retry attempts
          console.error("Max retry attempts reached or non-retryable error.");
        }
      }
    }
  };

  const prefillForm = () => {
    console.log("Prefilling form with data:", apiResponseData);
    // Iterate through the APIResponseData and map categories to input fields
    apiResponseData.forEach((item) => {
      switch (item.category) {
        case "Disc Brand":
          setDiscData((prevData) => ({
            ...prevData,
            brand: item.text,
          }));
          break;
        case "Phone Number":
          setDiscData((prevData) => ({
            ...prevData,
            phoneNumber: item.text,
          }));
          break;
        case "Name":
          setDiscData((prevData) => ({
            ...prevData,
            name: item.text,
          }));
          break;
        case "Disc Name":
          setDiscData((prevData) => ({
            ...prevData,
            disc: item.text,
          }));
          break;
        case "Color":
          setDiscData((prevData) => ({
            ...prevData,
            color: item.text,
          }));
          break;
        default:
          // If there is no match, do nothing
          break;
      }
    });

    // Close the popup after prefilling the form
    setShowPopup(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!frontImage || !backImage) {
      // Display an error message to the user or prevent form submission
      // Example: setError("Please capture both front and back images.");
      return;
    }

    setSuccessMessage(""); // Clear success message
    setErrorMessage(""); // Clear error message
    setIsLoading(true); // Set loading to true when the request is initiated

    const formData = new FormData();
    Object.entries(discData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    if (frontImage) formData.append("frontImage", frontImage);
    if (backImage) formData.append("backImage", backImage);

    axios
      .post(`${API_BASE_URL}/api/found-discs`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        console.log("Disc added:", response.data);

        // Set success message with the ID of the row from the DB
        setSuccessMessage(`Disc added with ID ${response.data.id}`);

        // Clear the form and loading state
        setDiscData({
          course: "Stafford Woods",
          name: "",
          disc: "",
          phoneNumber: "",
          bin: discData.bin, //don't overwrite the bin number
          comments: "",
          dateFound: new Date().toISOString().split("T")[0],
          color: "",
          brand: discData.brand, //don't overwrite the brand
        });
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error adding disc:", error);
        setIsLoading(false); // Clear loading state on error
      });
  };

  const handleCameraButtonClick = () => {
    setSelection("camera");
    setShowCamera(true);
  };

  const handleManualButtonClick = () => {
    setSelection("manual");
    setShowCamera(false);
  };

  return (
    <div className="lost-disc-container">
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <h1>Enter Lost Disc</h1>
      <div className="button-container">
        <button
          className={showCamera ? "button active" : "button"}
          onClick={handleCameraButtonClick}
        >
          <CameraAltIcon className="button-icon" />
          <span className="button-text">Use Camera</span>
        </button>
        <button className="button" onClick={handleManualButtonClick}>
          <EditIcon className="button-icon" />
          <span className="button-text">Enter Manually</span>
        </button>
      </div>

      {selection && (
        <div className="image-placeholder-row">
          {/* Front Image */}
          <div
            className="image-container"
            onClick={() => handlePlaceholderClick("front")}
          >
            {frontImage ? (
              <img src={frontImage} alt="Front" />
            ) : (
              <div className="image-placeholder">
                <CameraAltIcon className="camera-icon" />
                <span>Capture Front</span>
              </div>
            )}
          </div>

          {/* Back Image */}
          <div
            className="image-container"
            onClick={() => handlePlaceholderClick("back")}
          >
            {backImage ? (
              <img src={backImage} alt="Back" />
            ) : (
              <div className="image-placeholder">
                <CameraAltIcon className="camera-icon" />
                <span>Capture Back</span>
              </div>
            )}
          </div>
        </div>
      )}

      {showCamera && (
        <CameraComponent
          onCapture={(imageData, side) => handleImageCapture(imageData, side)}
          side={side}
          switchToManual={handleManualButtonClick}
        />
      )}

      {showPopup && (
        <ImageDetectionPopup
          data={apiResponseData}
          onClose={() => setShowPopup(false)}
          onUpdateCategory={handleUpdateCategory}
          onUpdateText={handleUpdateText}
          prefillForm={prefillForm}
          onDelete={handleDeleteRow}
          categories={predefinedCategories}
        />
      )}

      {/* {selection === "camera" && (
        <Typography
          sx={{
            color: "black",
            fontSize: "1.5rem",
            marginBottom: "10px",
          }}
        >
          Use Camera will be available soon. Please check back later.
        </Typography>
      )} */}

      {selection === "manual" && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={discData.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number:</label>
            <input
              type="tel" // Use type="tel" to display the numeric keyboard on mobile
              id="phoneNumber"
              name="phoneNumber"
              value={discData.phoneNumber}
              onChange={handleChange}
              placeholder="xxx-xxx-xxxx"
            />
          </div>
          <div className="form-group">
            <label htmlFor="brand">Brand:</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={discData.brand}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="disc">Disc:</label>
            <input
              type="text"
              id="disc"
              name="disc"
              value={discData.disc}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="color">Color:</label>
            <input
              type="text"
              id="color"
              name="color"
              value={discData.color}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="bin">Bin:</label>
            <input
              type="number" // Use type="number" to display the numeric keyboard on mobile
              id="bin"
              name="bin"
              value={discData.bin}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="bin">Comments:</label>
            <input
              type="text" // Use type="number" to display the numeric keyboard on mobile
              id="comments"
              name="comments"
              value={discData.comments}
              onChange={handleChange}
            />
          </div>
          <button
            type="submit"
            className={`submit-button ${isLoading ? "loading" : ""}`}
          >
            {isLoading ? <CircularProgress /> : "Submit"}
            {successMessage && (
              <p className="success-message">{successMessage}</p>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default EnterLostDisc;
