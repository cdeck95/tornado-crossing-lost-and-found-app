import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import EnterLostDisc from "./EnterLostDisc";
import Inventory from "./Inventory";
import ForSaleInventory from "./ForSaleInventory";
import "../styles/App.css";
import {
  Button,
  ButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"; // Import Button and ButtonGroup from MUI
import ExpiredPickups from "./ExpiredPickups";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

function AdminPanel() {
  const REACT_APP_ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD;
  const [activeTab, setActiveTab] = useState("enterLostDisc"); // Default active tab
  const [isPasswordEntered, setIsPasswordEntered] = useState(false); // Track whether the password is entered
  const theme = useTheme();
  const isMobile = !useMediaQuery(theme.breakpoints.up("md"));

  const hashPassword = (password: string) => {
    return CryptoJS.SHA256(password).toString();
  };

  const hashedAdminPassword: string = hashPassword(
    REACT_APP_ADMIN_PASSWORD!
  ).toString();

  const switchTab = (tabName: string) => {
    setActiveTab(tabName);
  };

  useEffect(() => {
    checkCookie();
  }, []);

  // Function to handle password submission
  const handlePasswordSubmit = () => {
    const enteredPassword = prompt("Please enter the password:"); // Prompt for the password

    if (hashPassword(enteredPassword!) === hashedAdminPassword) {
      setIsPasswordEntered(true); // Set the flag to true if the password is correct
      Cookies.set("admin_auth", hashedAdminPassword, { expires: 7 }); // expires in 7 days
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  // Function to check the hashed password from the cookie
  const checkCookie = () => {
    const hashedPasswordInCookie = Cookies.get("admin_auth");
    if (hashedPasswordInCookie) {
      if (hashedAdminPassword === hashedPasswordInCookie!) {
        setIsPasswordEntered(true);
      } else {
        setIsPasswordEntered(false);
      }
    }
  };

  const handleLogout = () => {
    Cookies.remove("admin_auth");
    setIsPasswordEntered(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <Typography
          sx={{
            color: "white",
            padding: "5px",
            margin: "0px",
            fontSize: isMobile ? "2rem" : "3rem",
            marginBottom: "15px",
          }}
        >
          Stafford Woods Lost and Found
        </Typography>
        <nav>
          <ButtonGroup variant="contained" color="primary">
            <Button
              onClick={() => switchTab("enterLostDisc")}
              color={activeTab === "enterLostDisc" ? "primary" : "inherit"}
              className={activeTab === "enterLostDisc" ? "active" : ""}
              sx={{ fontSize: isMobile ? ".75rem" : "1rem" }}
            >
              Enter Lost Disc
            </Button>
            <Button
              onClick={() => switchTab("inventory")}
              color={activeTab === "inventory" ? "primary" : "inherit"}
              className={activeTab === "inventory" ? "active" : ""}
              sx={{ fontSize: isMobile ? ".75rem" : "1rem" }}
            >
              Inventory
            </Button>
            <Button
              onClick={() => switchTab("forSaleInventory")}
              color={activeTab === "forSaleInventory" ? "primary" : "inherit"}
              className={activeTab === "forSaleInventory" ? "active" : ""}
              sx={{ fontSize: isMobile ? ".75rem" : "1rem" }}
            >
              For Sale
            </Button>
          </ButtonGroup>
        </nav>
      </header>
      {isPasswordEntered ? ( // Render secret content if the password is entered
        <main className="container">
          {activeTab === "enterLostDisc" && <EnterLostDisc />}
          {activeTab === "inventory" && <Inventory />}
          {activeTab === "forSaleInventory" && <ForSaleInventory />}
        </main>
      ) : (
        // Render password form if the password is not entered
        <div id="password-form">
          {/* <p className="password-text">If you have the password, please click the button below.</p> */}
          <button onClick={handlePasswordSubmit} className="green-button">
            Enter Password
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
