import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import EnterLostDisc from "./EnterLostDisc";
import Inventory from "./Inventory";
import "../styles/App.css";
import {
  Button,
  ButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
} from "@mui/material"; // Import Button and ButtonGroup from MUI
import PublicInventory from "./PublicInventory";
import FAQ from "./FAQ";
import DensityMediumIcon from "@mui/icons-material/DensityMedium";
import ColorLogoWhite from "../Images/Color_Logo_White.png";
import TextLogo from "../Images/Text_Logo.png";
import MenuButton from "@mui/joy/MenuButton";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

function PublicHub() {
  const theme = useTheme();
  const isMobile = !useMediaQuery(theme.breakpoints.up("md"));
  // const [activeTab, setActiveTab] = useState("faq"); // Default active tab

  const course = process.env.REACT_APP_COURSE_NAME;
  const { login, register, logout, user, isAuthenticated, isLoading } =
    useKindeAuth();
  // const switchTab = (tabName: string) => {
  //   setActiveTab(tabName);
  // };

  const [selectedIndex, setSelectedIndex] = React.useState<number>(1);

  const createHandleClose = (index: number) => () => {
    if (typeof index === "number") {
      setSelectedIndex(index);
    }
    setAnchorEl(null);
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="Header-content">
          <div className="Logo-Container">
            <img src={ColorLogoWhite} alt="DRN-Logo" className="logo" />
            <img src={TextLogo} alt="DRN-Logo" className="logo-text" />
          </div>
          <Button
            id="basic-button"
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
          >
            <DensityMediumIcon className="Navbar-menu-icon" />
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <MenuItem
              {...(selectedIndex === 0 && {
                selected: true,
                variant: "soft",
              })}
              onClick={createHandleClose(0)}
            >
              FAQ
            </MenuItem>
            <MenuItem
              selected={selectedIndex === 1}
              onClick={createHandleClose(1)}
            >
              Inventory
            </MenuItem>
          </Menu>
          {/* {isAuthenticated && user ? (
            <div>
              <div>
                <h2>
                  {user.given_name} {user.family_name}
                </h2>
                <p>{user.email}</p>
              </div>
              <button onClick={() => logout()} type="button">
                Sign out
              </button>
            </div>
          ) : (
            <div>
              <button onClick={() => register()} type="button">
                Sign up
              </button>
              <button onClick={() => login()} type="button">
                Sign In
              </button>
            </div>
          )} */}
        </div>
      </header>
      <main className="container">
        <h1 className="header">{course} L & F</h1>
        {selectedIndex === 0 && <FAQ />}
        {selectedIndex === 1 && <PublicInventory />}
      </main>
    </div>
  );
}

export default PublicHub;
