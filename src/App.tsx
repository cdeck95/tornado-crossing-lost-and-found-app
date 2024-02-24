import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import "./styles/App.css";
import { Box, Button, ButtonGroup, Typography } from "@mui/material"; // Import Button and ButtonGroup from MUI
import PublicInventory from "./components/PublicHub";
import PublicHub from "./components/PublicHub";
import "./styles/App.css";

// Define a Disc interface
export interface Disc {
  id?: number;
  course: string;
  name: string;
  disc: string;
  phoneNumber: string;
  bin: string;
  dateFound: string;
  dateTexted?: string | null;
  dateClaimed?: string | null;
  status: DiscStateString;
  comments?: string | null;
  color: string;
  claimBy?: string | null;
  brand?: string | null;
  dateSold?: string | null;
}
export enum DiscStateString {
  New = "NEW",
  Unclaimed = "UNCLAIMED",
  PendingDropoff = "PENDING_DROPOFF",
  PendingStorePickup = "PENDING_STORE_PICKUP",
  PendingCoursePickup = "PENDING_COURSE_PICKUP",
  Claimed = "CLAIMED",
  PickupOverdue = "PICKUP_OVERDUE",
  ForSale = "FOR_SALE",
  Sold = "SOLD",
  SoldOffline = "SOLD_OFFLINE",
  Surrendered = "SURRENDERED",
}

//export const API_BASE_URL = "https://api.discrescuenetwork.com"; //production URL
//export const API_BASE_URL = "http://127.0.0.1:3001"; // local testing
//export const API_BASE_URL = `https://api-drn-env.eba-6jyxgrtu.us-east-1.elasticbeanstalk.com`;
export const API_BASE_URL = `https://lost-and-found-api-gl8z.onrender.com`;

function App() {
  const course = process.env.REACT_APP_COURSE_NAME;

  return (
    <Box
      sx={{
        height: "auto",
        width: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Routes>
        <Route path="/" element={<PublicHub />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <p className="copywrite">Copyright 2024 Disc Rescue Network LLC</p>
    </Box>
  );
}

export default App;
