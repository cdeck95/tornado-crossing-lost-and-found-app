import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from "react-router-dom";
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
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material"; // Import Button and ButtonGroup from MUI
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import DensityMediumIcon from "@mui/icons-material/DensityMedium";
import ColorLogoWhite from "../Images/Color_Logo_White.png";
import TextLogo from "../Images/Text_Logo.png";
import MenuButton from "@mui/joy/MenuButton";
// import Menu from "@mui/joy/Menu";
// import MenuItem from "@mui/joy/MenuItem";
import Dropdown from "@mui/joy/Dropdown";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

function AdminPanel() {
  const REACT_APP_ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD;
  const [activeTab, setActiveTab] = useState("enterLostDisc"); // Default active tab
  const [isPasswordEntered, setIsPasswordEntered] = useState(false); // Track whether the password is entered
  const course = process.env.REACT_APP_COURSE_NAME;
  // const location = useLocation();
  const location = window.location;
  const theme = useTheme();
  const isMobile = !useMediaQuery(theme.breakpoints.up("md"));

  const { login, register, logout, user, isAuthenticated, isLoading } =
    useKindeAuth();

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

  const navigate = useNavigate();

  const [selectedIndex, setSelectedIndex] = React.useState<number>(1);

  const createHandleClose = (index: number) => () => {
    if (typeof index === "number") {
      setSelectedIndex(index);
    }
    if (index === 3) {
      navigate("/");
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
              Report Lost Disc
            </MenuItem>
            <MenuItem
              selected={selectedIndex === 1}
              onClick={createHandleClose(1)}
            >
              Inventory
            </MenuItem>
            <MenuItem
              selected={selectedIndex === 2}
              onClick={createHandleClose(2)}
            >
              For Sale
            </MenuItem>
            <MenuItem
              {...(selectedIndex === 3 && {
                selected: true,
                variant: "soft",
              })}
              onClick={createHandleClose(3)}
            >
              Public View
            </MenuItem>
          </Menu>
          {isAuthenticated && user ? (
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
              <button
                onClick={() =>
                  login({
                    app_state: {
                      redirectTo: location
                        ? location.pathname + location.search
                        : null,
                    },
                  })
                }
                type="button"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </header>
      {isPasswordEntered ? ( // Render secret content if the password is entered
        <main className="container">
          <h1 className="header">{course} L & F</h1>
          {selectedIndex === 0 && <EnterLostDisc />}
          {selectedIndex === 1 && <Inventory />}
          {selectedIndex === 2 && <ForSaleInventory />}
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
