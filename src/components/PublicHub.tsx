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
} from "@mui/material"; // Import Button and ButtonGroup from MUI
import PublicInventory from "./PublicInventory";
import FAQ from "./FAQ";
import DensityMediumIcon from "@mui/icons-material/DensityMedium";
import ColorLogoWhite from "../Images/Color_Logo_White.png";
import TextLogo from "../Images/Text_Logo.png";
import MenuButton from "@mui/joy/MenuButton";
import Menu from "@mui/joy/Menu";
import MenuItem from "@mui/joy/MenuItem";
import Dropdown from "@mui/joy/Dropdown";

function PublicHub() {
  const theme = useTheme();
  const isMobile = !useMediaQuery(theme.breakpoints.up("md"));
  // const [activeTab, setActiveTab] = useState("faq"); // Default active tab

  const course = process.env.REACT_APP_COURSE_NAME;

  // const switchTab = (tabName: string) => {
  //   setActiveTab(tabName);
  // };

  const [selectedIndex, setSelectedIndex] = React.useState<number>(1);

  const createHandleClose = (index: number) => () => {
    if (typeof index === "number") {
      setSelectedIndex(index);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="Header-content">
          <div className="Logo-Container">
            <img src={ColorLogoWhite} alt="DRN-Logo" className="logo" />
            <img src={TextLogo} alt="DRN-Logo" className="logo-text" />
          </div>
          <h1 className="header">{course}</h1>
          {!isMobile && (
            <Dropdown>
              <MenuButton
                startDecorator={
                  <DensityMediumIcon className="Navbar-menu-icon" />
                }
              >
                <Typography className="navButtonText">
                  {selectedIndex === 0 ? "FAQ" : "Inventory"}
                </Typography>
              </MenuButton>
              <Menu>
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
            </Dropdown>
          )}
        </div>
        {isMobile && (
          <Dropdown>
            <MenuButton
              startDecorator={
                <DensityMediumIcon className="Navbar-menu-icon" />
              }
            >
              <Typography className="navButtonText">
                {selectedIndex === 0 ? "FAQ" : "Inventory"}
              </Typography>
            </MenuButton>
            <Menu>
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
          </Dropdown>
        )}

        {/* <nav className="Menu-responsive">
          <ButtonGroup variant="contained" color="primary">
            <Button
              onClick={() => switchTab("faq")}
              color={activeTab === "faq" ? "primary" : "inherit"}
              className={activeTab === "faq" ? "active" : ""}
              sx={{ fontSize: isMobile ? ".60rem" : ".68rem" }}
            >
              FAQ Page
            </Button>
            <Button
              onClick={() => switchTab("inventory")}
              color={activeTab === "inventory" ? "primary" : "inherit"}
              className={activeTab === "inventory" ? "active" : ""}
              sx={{ fontSize: isMobile ? ".60rem" : ".68rem" }}
            >
              Inventory
            </Button>
          </ButtonGroup>
          <div className="Navbar-menu">
            <DensityMediumIcon className="Navbar-menu-icon" />
          </div>
          <div className="Mobile-menu">
            <ul>
              <li
                className="nav-item"
                onClick={() => switchTab("enterLostDisc")}
              >
                Enter Lost Disc
              </li>
              <li className="nav-item" onClick={() => switchTab("inventory")}>
                Inventory
              </li>
              <li
                className="nav-item"
                onClick={() => switchTab("forSaleInventory")}
              >
                For Sale
              </li>
            </ul>
          </div>
        </nav> */}
      </header>
      <main className="container">
        {selectedIndex === 0 && <FAQ />}
        {selectedIndex === 1 && <PublicInventory />}

        {/* {activeTab === "faq" && <FAQ />}
        {activeTab === "inventory" && <PublicInventory />} */}
      </main>
    </div>
  );
}

export default PublicHub;
