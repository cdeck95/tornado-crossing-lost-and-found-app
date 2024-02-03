import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "../styles/App.css";
import {
  Button,
  ButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  IconButton,
  Divider,
} from "@mui/material"; // Import Button and ButtonGroup from MUI
import PublicInventory from "./PublicInventory";
import FAQ from "./FAQ";
import DensityMediumIcon from "@mui/icons-material/DensityMedium";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import Banner from "./Banner";
import fullTransparentLogo1700 from "../Images/full_logo_transparent_1740x300.png";
import fullTransparentLogoFullSized from "../Images/full_logo_transparent_fullsize.png";
import iconLogoTransparent300 from "../Images/icon_logo_transparent_300x300.png";
import iconLogoTransparentFullSized from "../Images/icon_logo_transparent_fullsize.png";
import textLogoTransparent300 from "../Images/text_logo_transparent_1690x300.png";
import textLogoTransparentFullSized from "../Images/text_logo_transparent_fullsize.png";

function PublicHub() {
  const theme = useTheme();
  const isMobile = !useMediaQuery(theme.breakpoints.up("md"));
  // const [activeTab, setActiveTab] = useState("faq"); // Default active tab
  const [bannerOpen, setBannerOpen] = useState(true); // Banner open state

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

  const adminLogin = () => {
    window.location.href = "https://admin.discrescuenetwork.com";
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
      {/* <Banner open={bannerOpen} setOpen={setBannerOpen} /> */}
      <header className="App-header">
        <img
          src={fullTransparentLogo1700}
          alt="DRN-Logo"
          className="logo-300"
        />
        <IconButton
          id="basic-button"
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          sx={{ position: "absolute", right: "20px" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            // className="Navbar-menu-icon"
            viewBox="0 0 24 24"
            style={{
              fill: "rgba(0, 0, 0, 1)",
              margin: "auto",
            }}
          >
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"></path>
          </svg>
        </IconButton>
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
          <Divider />
          <MenuItem
            {...(selectedIndex === 2 && {
              selected: true,
              variant: "soft",
            })}
            onClick={() => adminLogin()}
          >
            Course Login
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
      </header>
      <main className="container">
        {/* <h1 className="header">{course} L & F</h1> */}
        {selectedIndex === 0 && <FAQ />}
        {selectedIndex === 1 && <PublicInventory />}
      </main>
    </div>
  );
}

export default PublicHub;
