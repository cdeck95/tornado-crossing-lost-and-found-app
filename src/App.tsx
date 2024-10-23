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
import { Analytics } from "@vercel/analytics/react";

// Define a Disc interface
export interface Disc {
  id: number;
  BrandID: number;
  BrandName: string;
  MoldID: number;
  MoldName: string;
  PlasticType?: string | null;
  bin?: string | null;
  bottomImage?: string | null;
  category?: string | null;
  color: string;
  comments?: string | null;
  course: string;
  claimBy?: string | null;
  dateClaimed?: string | null;
  dateFound: string;
  dateOfReminderText?: string | null;
  dateSold?: string | null;
  dateTexted?: string | null;
  deleted: number;
  discId: number;
  name: string;
  orgCode: string;
  phoneNumber?: string | null;
  status: DiscStateString;
  subcategory?: string | null;
  topImage?: string | null;
}

// Update enum if needed based on the response
export enum DiscStateString {
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

export const API_BASE_URL = "https://api.discrescuenetwork.com"; //production URL
//export const API_BASE_URL = "http://127.0.0.1:5000"; // local testing

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
      <Analytics />
      <Routes>
        <Route path="/" element={<PublicHub />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <p className="copywrite">Copyright 2024 Disc Rescue Network LLC</p>
    </Box>
  );
}

export default App;
