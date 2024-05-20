import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL, Disc, DiscStateString } from "../App";
import "../styles/Inventory.css"; // Import the CSS file
import { DateTime } from "luxon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle,
  faSquareCaretUp,
  faSquareCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
  Paper,
  Popover,
  TextField,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/Info";
import BackToTopButton from "./BackToTopButton";

// Define a type for row IDs, assuming it's a number
type RowId = number;

interface InventoryProps {
  setSelectedIndex: (tabName: number) => void;
}

function PublicInventory(props: InventoryProps) {
  const { setSelectedIndex } = props;
  const [inventory, setInventory] = useState<Disc[]>([]); // Provide the type 'Disc[]'
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInventory, setFilteredInventory] = useState(inventory); // Initialize with inventory data
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [claimedDisc, setClaimedDisc] = useState<number>(0); // Provide the type 'Disc | null'
  const theme = useTheme();
  const isMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const isMediumLarge = useMediaQuery(theme.breakpoints.down("lg"));
  const isLarge = useMediaQuery(theme.breakpoints.down("xl"));
  const [sortOption, setSortOption] = useState<keyof Disc>("dateFound"); // Set initial sort option
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc"); // Set initial sort direction to DESC
  const course = process.env.REACT_APP_COURSE_NAME;

  const [expandedRows, setExpandedRows] = useState<RowId[]>([]);

  const [anchorElPopover, setAnchorElPopover] =
    useState<HTMLButtonElement | null>(null);

  const handleClickPopover = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log("filter button clicked");
    setAnchorElPopover(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorElPopover(null);
  };

  const openPopover = Boolean(anchorElPopover);
  const idPopover = openPopover ? "simple-popover" : undefined;
  const [isNewFilter, setIsNewFilter] = useState(false);
  const [isUnclaimedFilter, setIsUnclaimedFilter] = useState(false);
  const [isOverdueFilter, setIsOverdueFilter] = useState(false);

  const setFilter = (filterIn: string) => {
    switch (filterIn) {
      case "New":
        setIsNewFilter(!isNewFilter);
        setIsUnclaimedFilter(false);
        setIsOverdueFilter(false);
        break;
      case "Unclaimed":
        setIsNewFilter(false);
        setIsUnclaimedFilter(!isUnclaimedFilter);
        setIsOverdueFilter(false);
        break;
      case "Overdue":
        setIsNewFilter(false);
        setIsUnclaimedFilter(false);
        setIsOverdueFilter(!isOverdueFilter);
        break;
      default:
        setIsNewFilter(false);
        setIsUnclaimedFilter(false);
        setIsOverdueFilter(false);
        break;
    }
  };

  const toggleRow = (rowId: RowId) => {
    if (expandedRows.includes(rowId)) {
      setExpandedRows(expandedRows.filter((id) => id !== rowId));
    } else {
      setExpandedRows([...expandedRows, rowId]);
    }
  };

  // const convertToEST = (utcTimestamp: string) => {
  //   const dateUTC = DateTime.fromISO(utcTimestamp, { zone: "utc" });
  //   // const dateEST = dateUTC.setZone('America/New_York');

  //   // Format the date to display only the date (without time)
  //   //return dateEST.toFormat('yyyy-MM-dd');
  //   return dateUTC.toFormat("yyyy-MM-dd");
  // };

  const convertToEST = (httpTimestamp: string) => {
    const dateUTC = DateTime.fromHTTP(httpTimestamp, { zone: "utc" });

    // Format the date to display only the date (without time)
    return dateUTC.toFormat("yyyy-MM-dd");
  };

  function maskPhoneNumber(phoneNumber: string): string {
    const last4Digits = phoneNumber.slice(-4);
    const maskedNumber = "****-****-" + last4Digits;
    return maskedNumber;
  }

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/inventory`, {
        params: {
          course: course,
        },
      })
      .then((response) => {
        // Convert UTC timestamps to EST
        const convertedInventory = response.data.map((disc: Disc) => ({
          ...disc,
          dateFound: convertToEST(disc.dateFound),
          dateTexted: disc.dateTexted ? convertToEST(disc.dateTexted) : null,
          dateClaimed: disc.dateClaimed ? convertToEST(disc.dateClaimed) : null,
          claimBy: disc.claimBy ? convertToEST(disc.claimBy) : null,
        }));
        //console.log('Inventory:', convertedInventory);

        setInventory(convertedInventory);

        const sortedInventory = [...convertedInventory].sort(
          (a: Disc, b: Disc) => {
            const aValue = a[sortOption] as string; // Cast to string
            const bValue = b[sortOption] as string; // Cast to string

            if (sortDirection === "asc") {
              return aValue.localeCompare(bValue);
            } else {
              return bValue.localeCompare(aValue);
            }
          }
        );

        // setFilteredInventory(filtered);
        const filteredInventory = sortedInventory.filter((disc: Disc) => {
          const isMatch =
            disc.phoneNumber.includes(searchQuery) ||
            disc.disc.toLowerCase().includes(searchQuery.toLowerCase()) ||
            disc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            disc.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            disc.comments?.toLowerCase().includes(searchQuery.toLowerCase());

          // Check for New status
          if (isNewFilter) {
            return isMatch && disc.status === DiscStateString.New;
          }

          // Check for Overdue
          if (isOverdueFilter) {
            return isMatch && new Date(disc.claimBy!) < new Date();
          }

          // Check for Unclaimed
          if (isUnclaimedFilter) {
            const isNotNew = disc.status !== DiscStateString.New;
            const isNotOverdue = new Date(disc.claimBy!) >= new Date();
            return isMatch && isNotNew && isNotOverdue;
          }

          // Default return if no filter is applied
          return isMatch;
        });
        setFilteredInventory(filteredInventory);
      })
      .catch((error) => {
        console.error("Error fetching inventory:", error);
      });
  }, [
    course,
    isNewFilter,
    isOverdueFilter,
    isUnclaimedFilter,
    searchQuery,
    sortDirection,
    sortOption,
  ]);

  function maskFirstName(name: string): string {
    // Extract the first and last name (assuming names are separated by a space)
    const names = name.split(" ");
    if (names.length >= 2) {
      const firstName = names[0];
      const lastName = names[names.length - 1];

      // Mask the first name and keep the last name intact
      const maskedName = `${firstName.charAt(0)}. ${lastName}`;
      return maskedName;
    }

    // Return the original name if it doesn't contain a last name
    return name;
  }

  const handleSort = (selectedOption: keyof Disc) => {
    if (selectedOption === sortOption) {
      // Toggle sort direction
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortDirection("asc"); // Default to ascending if a new option is selected
    }
    setSortOption(selectedOption);
  };

  // Define a function to render the header with sorting indicator
  const renderColumnHeader = (column: keyof Disc, label: string) => {
    const isSorted = column === sortOption;
    const isAscending = sortDirection === "asc";
    const arrow = isSorted ? (isAscending ? "▲" : "▼") : null;

    return (
      <th className="table-header" onClick={() => handleSort(column)}>
        {label} {arrow}
      </th>
    );
  };

  const openFAQ = () => {
    setSelectedIndex(0);
  };

  return (
    <div className="page-container">
      <h1 className="header">{course} L & F</h1>
      <div className="col-center">
        <Paper
          component="form"
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            marginTop: "5px",
            width: isMobile ? "85%" : "700px",
          }}
        >
          {/* <IconButton
            sx={{ p: "10px" }}
            aria-label="menu"
            onClick={handleClickPopover}
          >
            <FilterListOutlinedIcon />
          </IconButton>
          <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" /> */}
          <InputBase
            sx={{ ml: 1, flex: 1, fontSize: "12px" }}
            placeholder="Search by your name, last 4 digits of phone number, or disc"
            onChange={(e) => {
              const inputQuery = e.target.value;

              // Check if the input matches a phone number pattern (e.g., XXXX-XXXX-1234)
              const isPhoneNumber = /^\d{4}-\d{4}-\d{4}$/.test(inputQuery);

              // If it's a phone number, use the last 4 digits; otherwise, use the entire query
              const filteredQuery = isPhoneNumber
                ? inputQuery.slice(-4)
                : inputQuery;

              setSearchQuery(filteredQuery);
            }}
            value={searchQuery}
            type="text"
          />
          <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>
        {/* <Popover
          id={idPopover}
          open={openPopover}
          anchorEl={anchorElPopover}
          onClose={handleClosePopover}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Box className={isMobile ? "filter-row-mobile" : "filter-row"}>
            <Chip
              variant="outlined"
              label="New"
              className={
                isNewFilter ? "filter-button-selected" : "filter-button"
              }
              avatar={
                <FontAwesomeIcon
                  icon={faCircle}
                  style={{ color: "orange", width: "20px", height: "20px" }}
                />
              }
              onClick={() => setFilter("New")}
            />
            <Chip
              variant="outlined"
              label="Unclaimed"
              className={
                isUnclaimedFilter ? "filter-button-selected" : "filter-button"
              }
              avatar={
                <FontAwesomeIcon
                  icon={faCircle}
                  style={{ color: "yellow", width: "20px", height: "20px" }}
                />
              }
              onClick={() => setFilter("Unclaimed")}
            />
            <Chip
              variant="outlined"
              label="Expired"
              className={
                isOverdueFilter ? "filter-button-selected" : "filter-button"
              }
              avatar={
                <FontAwesomeIcon
                  icon={faCircle}
                  style={{ color: "red", width: "20px", height: "20px" }}
                />
              }
              onClick={() => setFilter("Overdue")}
            />
          </Box>
        </Popover>
        <Legend /> */}
      </div>
      <div className="container">
        <div className="table-container">
          <button className="blue-italics" onClick={openFAQ}>
            How do I claim my disc?
          </button>
          <table className="inventory-table">
            <colgroup>
              <col style={{ width: "30px" }} />
              <col style={{ width: "33%" }} />
              <col style={{ width: "33%", minWidth: "150px" }} />
              <col style={{ width: "33%" }} />
            </colgroup>
            <thead>
              <tr>
                <th className="table-header" />
                {renderColumnHeader("name", "Name")}
                {renderColumnHeader("dateFound", "Date Found")}
                {renderColumnHeader("disc", "Disc")}
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((disc) => (
                <React.Fragment key={disc.id}>
                  <tr onClick={() => toggleRow(disc.id!)}>
                    <td className="table-cell">
                      {expandedRows.includes(disc.id!) ? (
                        <FontAwesomeIcon
                          icon={faSquareCaretUp}
                          className="icon"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faSquareCaretDown}
                          className="icon"
                        />
                      )}
                    </td>
                    <td className="table-cell">
                      {maskFirstName(disc.name).length > 0
                        ? maskFirstName(disc.name)
                        : "No Name"}
                    </td>
                    <td className="table-cell">{disc.dateFound}</td>
                    <td className="table-cell">{disc.disc}</td>
                  </tr>
                  {expandedRows.includes(disc.id!) && (
                    <tr>
                      <td colSpan={8}>
                        <div className="column-table">
                          <p className="detailed-text">
                            <strong>ID:</strong> {disc.id}
                          </p>
                          <p className="detailed-text">
                            <strong>Course: </strong>
                            {disc.course}
                          </p>
                          <p className="detailed-text">
                            <strong>Name: </strong>

                            {maskFirstName(disc.name).length > 0
                              ? maskFirstName(disc.name)
                              : "No Name"}
                          </p>
                          <p className="detailed-text">
                            <strong>Phone Number: </strong>
                            {maskPhoneNumber(disc.phoneNumber)}
                          </p>
                          <p className="detailed-text">
                            <strong>Brand: </strong>
                            {disc.brand}
                          </p>
                          <p className="detailed-text">
                            <strong>Disc: </strong>
                            {disc.disc}
                          </p>
                          <p className="detailed-text">
                            <strong>Color: </strong>
                            {disc.color}
                          </p>
                          <p className="detailed-text">
                            <strong>Bin: </strong>
                            {disc.bin}
                          </p>
                          <p className="detailed-text">
                            <strong>Date Found: </strong>
                            {disc.dateFound}
                          </p>
                          <p className="detailed-text">
                            <strong>Date Texted: </strong>
                            {disc.dateTexted}
                          </p>
                          {/* <p className="detailed-text">
                            <strong>Date Claimed: </strong>
                            {disc.dateClaimed}
                          </p> */}
                          {/* <p className="detailed-text">
                            <strong>Status: </strong>
                            {disc.status}
                          </p> */}
                          {/* <p className="detailed-text">
                            <strong>Claim By: </strong>
                            {disc.claimBy}
                          </p> */}
                          <p className="detailed-text">
                            <strong>Comments: </strong>
                            {disc.comments}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <BackToTopButton />
      </div>
    </div>
  );
}

export default PublicInventory;
