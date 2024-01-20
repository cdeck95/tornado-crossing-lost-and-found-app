import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL, Disc, DiscStateString } from "../App";
import "../styles/Inventory.css"; // Import the CSS file
import { DateTime } from "luxon";
import DeleteIcon from "@mui/icons-material/Delete";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle,
  faSquareCaretUp,
  faSquareCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";

import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputBase,
  InputLabel,
  MenuItem,
  Paper,
  Popover,
  Select,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import EditDialog from "./EditDialog";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { SelectChangeEvent } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import BackToTopButton from "./BackToTopButton";
import PullToRefresh from "react-simple-pull-to-refresh";
import DeleteConfirmationPopup from "./DeleteConfirmationPopup";
import Legend from "./Legend";

// Define a type for row IDs, assuming it's a number
type RowId = number;

function Inventory() {
  const [inventory, setInventory] = useState<Disc[]>([]); // Provide the type 'Disc[]'
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInventory, setFilteredInventory] = useState(inventory); // Initialize with inventory data
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState("");
  const [deleteFailureMessage, setDeleteFailureMessage] = useState("");
  const [claimedDisc, setClaimedDisc] = useState<number>(0); // Provide the type 'Disc | null'
  const [sortOption, setSortOption] = useState<keyof Disc>("pickupDeadline"); // Set initial sort option
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc"); // Set initial sort direction to DESC
  const [expandedRows, setExpandedRows] = useState<RowId[]>([]);
  // const [showPastDeadlines, setShowPastDeadlines] = useState(false);
  const theme = useTheme();
  const isMobile = !useMediaQuery(theme.breakpoints.up("md"));
  const [refreshing, setRefreshing] = useState(false);
  const course = process.env.REACT_APP_COURSE_NAME!;

  // const handleRefresh = useCallback(() => {
  //   getInventory();
  //   setRefreshing(false);
  // }, []);

  const handleRefresh = async () => {
    getInventory(course);
  };

  const toggleRow = (rowId: RowId) => {
    if (expandedRows.includes(rowId)) {
      setExpandedRows(expandedRows.filter((id) => id !== rowId));
    } else {
      setExpandedRows([...expandedRows, rowId]);
    }
  };

  const convertToEST = (utcTimestamp: string) => {
    const dateUTC = DateTime.fromISO(utcTimestamp, { zone: "utc" });
    // const dateEST = dateUTC.setZone('America/New_York');

    // Format the date to display only the date (without time)
    //return dateEST.toFormat('yyyy-MM-dd');
    return dateUTC.toFormat("yyyy-MM-dd");
  };

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

  const getInventory = (course: string) => {
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
          pickupDeadline: disc.pickupDeadline
            ? convertToEST(disc.pickupDeadline)
            : null,
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
            return isMatch && new Date(disc.pickupDeadline!) < new Date();
          }

          // Check for Unclaimed
          if (isUnclaimedFilter) {
            const isNotNew = disc.status !== DiscStateString.New;
            const isNotOverdue = new Date(disc.pickupDeadline!) >= new Date();
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
  };

  useEffect(() => {
    getInventory(course);
  }, [
    course,
    searchQuery,
    sortDirection,
    sortOption,
    isNewFilter,
    isOverdueFilter,
    isUnclaimedFilter,
  ]);

  const markAsClaimed = (discId: string) => {
    setIsLoading(true); // Set loading state to true

    axios
      .put(`${API_BASE_URL}/mark-claimed/${discId}`)
      .then((response) => {
        //console.log('Disc marked as claimed:', response.data);
        setIsLoading(false); // Set loading state to false
        setSuccessMessage("Disc claimed successfully"); // Set success message
        setClaimedDisc(parseInt(discId)); // Set claimedDisc to the ID of the disc being marked as claimed
      })
      .catch((error) => {
        console.error("Error marking disc as claimed:", error);
        setIsLoading(false); // Set loading state to false in case of an error
        setSuccessMessage("Error marking disc as claimed"); // Set error message
      });
  };

  const [editedDiscID, setEditedDiscID] = useState<number>(-1);
  const [editedDisc, setEditedDisc] = useState<Disc | null>(null);

  const startEditing = (disc: Disc) => {
    setEditedDisc(disc);
    setEditedDiscID(disc.id!);
  };

  const stopEditing = () => {
    saveEditedDisc(editedDisc!);
  };

  const saveEditedDisc = (editedDiscIn: Disc) => {
    if (editedDiscIn) {
      axios
        .put(`${API_BASE_URL}/edit-disc/${editedDiscIn.id}`, editedDiscIn)
        .then((response) => {
          //console.log('Disc updated:', response.data);
          // Refresh the inventory or handle success as needed
        })
        .catch((error) => {
          console.error("Error updating disc:", error);
          // Handle error or display an error message
        });
    }
    setEditedDisc(null);
    setEditedDiscID(-1);
  };

  const listForSale = (discId: string, course: string) => {
    setIsLoading(true);
    console.log("Marking as for sale");

    // Make an API call to mark the disc as for sale
    axios
      .put(`${API_BASE_URL}/change-status/${discId}`, null, {
        params: {
          course: course,
        },
      })
      .then((response) => {
        setIsLoading(false);
        setSuccessMessage("Disc is now for sale");
        setClaimedDisc(parseInt(discId));
      })
      .catch((error) => {
        console.error("Error marking disc as for sale", error);
        setIsLoading(false);
        setSuccessMessage("Error marking disc as for sale");
      });
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    // Assuming phoneNumber is in the format "1234567890"
    return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  };

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

  const [showDeletePopup, setShowDeletePopup] = useState(false);

  const handleDeleteClick = () => {
    console.log("Delete clicked");
    setShowDeletePopup(true);
  };

  const handleClose = () => {
    setShowDeletePopup(false);
  };

  const handleConfirmDelete = (disc: Disc) => {
    setIsLoading(true);
    console.log("Deleting disc:", disc);
    axios
      .delete(`${API_BASE_URL}/delete-disc/${disc.id}`)
      .then((response) => {
        console.log("Disc deleted:", response.data);
        setDeleteSuccessMessage("Disc deleted successfully");
        setIsLoading(false);
        handleClose(); // Close the popup after successful deletion
      })
      .catch((error) => {
        console.error("Error deleting disc:", error);
        console.log("Error deleting disc:", error.response.data.message);
        setDeleteFailureMessage("Error deleting Disc");
        setIsLoading(false);
        handleClose(); // Close the popup after an error
      });
  };

  return (
    <PullToRefresh className="ptr-override" onRefresh={handleRefresh}>
      <div className="page-container">
        <div className="col-center">
          <Paper
            component="form"
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              marginTop: "5px",
              width: isMobile ? "320px" : "700px",
            }}
          >
            <IconButton
              sx={{ p: "10px" }}
              aria-label="menu"
              onClick={handleClickPopover}
            >
              <FilterListOutlinedIcon />
            </IconButton>
            <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: "12px" }}
              placeholder="Search by id, name, disc brand, number & more"
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
          <Popover
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
                label="Overdue"
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
          <Legend />
          <div className="inventory-count">
            Total Discs: {filteredInventory.length}
          </div>
        </div>
        <div className="container">
          <div className="table-container">
            <table className="inventory-table" style={{ tableLayout: "fixed" }}>
              <colgroup>
                <col style={{ width: "35px" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "37%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th className="table-header" />
                  {renderColumnHeader("name", "Name")}
                  {renderColumnHeader("disc", "Disc")}
                  {renderColumnHeader("pickupDeadline", "Pickup Deadline")}
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
                        {disc.name.length > 0 ? disc.name : "No Name"}
                      </td>
                      <td className="table-cell">{disc.disc}</td>
                      <td className="table-cell">
                        {disc.pickupDeadline}
                        {new Date(disc.pickupDeadline!) < new Date() && (
                          <FontAwesomeIcon
                            icon={faCircle}
                            style={{ color: "red", marginLeft: "10px" }}
                          />
                        )}
                        {disc.status === DiscStateString.New && (
                          <FontAwesomeIcon
                            icon={faCircle}
                            style={{ color: "orange", marginLeft: "10px" }}
                          />
                        )}
                        {disc.status !== DiscStateString.New &&
                          new Date(disc.pickupDeadline!) >= new Date() && (
                            <FontAwesomeIcon
                              icon={faCircle}
                              style={{ color: "yellow", marginLeft: "10px" }}
                            />
                          )}
                      </td>
                      <td className="table-cell"></td>
                    </tr>
                    {expandedRows.includes(disc.id!) && (
                      <tr>
                        <td colSpan={8}>
                          <div>
                            {successMessage && disc.id === claimedDisc && (
                              <div className="success-message">
                                {successMessage}
                              </div>
                            )}
                            {deleteSuccessMessage && (
                              <div className="success-message">
                                {deleteSuccessMessage}
                              </div>
                            )}
                            {deleteFailureMessage && (
                              <div className="error-message">
                                {deleteFailureMessage}
                              </div>
                            )}
                            <div className="row">
                              {editedDiscID === disc.id ? (
                                <SaveOutlinedIcon
                                  sx={{
                                    cursor: "pointer",
                                    marginRight: "10px",
                                  }}
                                  onClick={stopEditing}
                                ></SaveOutlinedIcon>
                              ) : (
                                <EditOutlinedIcon
                                  sx={{ cursor: "pointer" }}
                                  onClick={() => startEditing(disc)}
                                ></EditOutlinedIcon>
                              )}
                              <DeleteIcon
                                onClick={() => handleDeleteClick()}
                                sx={{
                                  marginLeft: "20px",
                                  marginTop: "5px",
                                  cursor: "pointer",
                                }}
                              />
                            </div>
                            <div className="row">
                              <p className="detailed-text">
                                <strong>ID:</strong> {disc.id}
                              </p>
                            </div>
                            <div className="row">
                              <p className="detailed-text">
                                <strong>Course: </strong>
                                {disc.course}
                              </p>
                            </div>
                            <div className="row">
                              {editedDiscID === disc.id ? (
                                <TextField
                                  id="outlined-uncontrolled"
                                  sx={{
                                    marginTop: "10px",
                                    marginBottom: "10px",
                                    marginLeft: "auto",
                                    marginRight: "auto",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                  label="Name"
                                  defaultValue={disc.name}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    disc.name = e.target.value;
                                    setEditedDisc({
                                      ...disc,
                                      name: e.target.value,
                                    });
                                  }}
                                />
                              ) : (
                                <p className="detailed-text">
                                  <strong>Name: </strong>
                                  {disc.name.length > 0 ? disc.name : "No Name"}
                                </p>
                              )}
                            </div>
                            <div className="row">
                              {editedDiscID === disc.id ? (
                                <TextField
                                  id="outlined-uncontrolled"
                                  sx={{
                                    marginTop: "10px",
                                    marginBottom: "10px",
                                    marginLeft: "auto",
                                    marginRight: "auto",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                  label="Phone Number"
                                  defaultValue={formatPhoneNumber(
                                    disc.phoneNumber
                                  )}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    disc.phoneNumber = e.target.value;
                                    setEditedDisc({
                                      ...disc,
                                      phoneNumber: e.target.value,
                                    });
                                  }}
                                />
                              ) : (
                                <p className="detailed-text">
                                  <strong>Phone Number: </strong>
                                  {formatPhoneNumber(disc.phoneNumber)}
                                </p>
                              )}
                            </div>
                            <div className="row">
                              {editedDiscID === disc.id ? (
                                <TextField
                                  id="outlined-uncontrolled"
                                  sx={{
                                    marginTop: "10px",
                                    marginBottom: "10px",
                                    marginLeft: "auto",
                                    marginRight: "auto",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                  label="Disc Brand"
                                  defaultValue={disc.brand}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    disc.brand = e.target.value;
                                    setEditedDisc({
                                      ...disc,
                                      brand: e.target.value,
                                    });
                                  }}
                                />
                              ) : (
                                <p className="detailed-text">
                                  <strong>Brand: </strong>
                                  {disc.brand}
                                </p>
                              )}
                            </div>
                            <div className="row">
                              {editedDiscID === disc.id ? (
                                <TextField
                                  id="outlined-uncontrolled"
                                  sx={{
                                    marginTop: "10px",
                                    marginBottom: "10px",
                                    marginLeft: "auto",
                                    marginRight: "auto",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                  label="Disc Name"
                                  defaultValue={disc.disc}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    disc.disc = e.target.value;
                                    setEditedDisc({
                                      ...disc,
                                      disc: e.target.value,
                                    });
                                  }}
                                />
                              ) : (
                                <p className="detailed-text">
                                  <strong>Disc: </strong>
                                  {disc.disc}
                                </p>
                              )}
                            </div>
                            <div className="row">
                              {editedDiscID === disc.id ? (
                                <TextField
                                  id="outlined-uncontrolled"
                                  sx={{
                                    marginTop: "10px",
                                    marginBottom: "10px",
                                    marginLeft: "auto",
                                    marginRight: "auto",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                  label="Color"
                                  defaultValue={disc.color}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    disc.color = e.target.value;
                                    setEditedDisc({
                                      ...disc,
                                      color: e.target.value,
                                    });
                                  }}
                                />
                              ) : (
                                <p className="detailed-text">
                                  <strong>Color: </strong>
                                  {disc.color}
                                </p>
                              )}
                            </div>
                            <div className="row">
                              {editedDiscID === disc.id ? (
                                <TextField
                                  id="outlined-uncontrolled"
                                  sx={{
                                    marginTop: "10px",
                                    marginBottom: "10px",
                                    marginLeft: "auto",
                                    marginRight: "auto",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                  label="Bin"
                                  defaultValue={disc.bin}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    disc.bin = e.target.value;
                                    setEditedDisc({
                                      ...disc,
                                      bin: e.target.value,
                                    });
                                  }}
                                />
                              ) : (
                                <p className="detailed-text">
                                  <strong>Bin: </strong>
                                  {disc.bin}
                                </p>
                              )}
                            </div>
                            <div className="row">
                              {editedDiscID === disc.id ? (
                                <TextField
                                  id="outlined-uncontrolled"
                                  sx={{
                                    marginTop: "10px",
                                    marginBottom: "10px",
                                    marginLeft: "auto",
                                    marginRight: "auto",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                  label="Date Found"
                                  defaultValue={disc.dateFound}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    disc.dateFound = e.target.value;
                                    setEditedDisc({
                                      ...disc,
                                      dateFound: e.target.value,
                                    });
                                  }}
                                />
                              ) : (
                                <p className="detailed-text">
                                  <strong>Date Found: </strong>
                                  {disc.dateFound}
                                </p>
                              )}
                            </div>
                            <div className="row">
                              {editedDiscID === disc.id ? (
                                <TextField
                                  id="outlined-uncontrolled"
                                  sx={{
                                    marginTop: "10px",
                                    marginBottom: "10px",
                                    marginLeft: "auto",
                                    marginRight: "auto",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                  label="Date Texted"
                                  defaultValue={disc.dateTexted}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    disc.dateTexted = e.target.value;
                                    setEditedDisc({
                                      ...disc,
                                      dateTexted: e.target.value,
                                    });
                                  }}
                                />
                              ) : (
                                <p className="detailed-text">
                                  <strong>Date Texted: </strong>
                                  {disc.dateTexted}
                                </p>
                              )}
                            </div>
                            <div className="row">
                              {editedDiscID === disc.id ? (
                                <TextField
                                  id="outlined-uncontrolled"
                                  sx={{
                                    marginTop: "10px",
                                    marginBottom: "10px",
                                    marginLeft: "auto",
                                    marginRight: "auto",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                  label="Date Claimed"
                                  defaultValue={disc.dateClaimed}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    disc.dateClaimed = e.target.value;
                                    setEditedDisc({
                                      ...disc,
                                      dateClaimed: e.target.value,
                                    });
                                  }}
                                />
                              ) : (
                                <p className="detailed-text">
                                  <strong>Date Claimed: </strong>
                                  {disc.dateClaimed}
                                </p>
                              )}
                            </div>
                            <div className="row">
                              {/* {editedDiscID === disc.id ? (
                              <TextField
                                id="outlined-uncontrolled"
                                sx={{ marginTop: "10px", marginBottom: "10px", marginLeft: "auto", marginRight: "auto", justifyContent: "center", alignItems: "center"}}
                                label="Status"
                                defaultValue={disc.status}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  disc.status = e.target.value;
                                  setEditedDisc({ ...disc, status: e.target.value });
                                  }}
                              />
                            ) : ( */}
                              <p className="detailed-text">
                                <strong>Status: </strong>
                                {disc.status}
                              </p>
                              {/* )} */}
                            </div>
                            <div className="row">
                              {/* {editedDiscID === disc.id ? (
                              <TextField
                                id="outlined-uncontrolled"
                                sx={{ marginTop: "10px", marginBottom: "10px", marginLeft: "auto", marginRight: "auto", justifyContent: "center", alignItems: "center"}}
                                label="Pickup Deadline"
                                defaultValue={disc.pickupDeadline}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  disc.pickupDeadline = e.target.value;
                                  setEditedDisc({ ...disc, pickupDeadline: e.target.value });
                                  }}
                              />
                            ) : ( */}
                              <p className="detailed-text">
                                <strong>Pickup Deadline: </strong>
                                {disc.pickupDeadline}
                              </p>
                              {/* )} */}
                            </div>
                            <div className="row">
                              {editedDiscID === disc.id ? (
                                <TextField
                                  id="outlined-uncontrolled"
                                  sx={{
                                    marginTop: "10px",
                                    marginBottom: "10px",
                                    marginLeft: "auto",
                                    marginRight: "auto",
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                  label="Comments"
                                  defaultValue={disc.comments}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    disc.comments = e.target.value;
                                    setEditedDisc({
                                      ...disc,
                                      comments: e.target.value,
                                    });
                                  }}
                                />
                              ) : (
                                <p className="detailed-text">
                                  <strong>Comments: </strong>
                                  {disc.comments}
                                </p>
                              )}
                            </div>
                            {isLoading ? (
                              <div>
                                <CircularProgress />
                              </div>
                            ) : (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexDirection: "row",
                                  width: "100%",
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                {disc.id !== claimedDisc ? (
                                  <div>
                                    {/* Check if the pickup deadline is in the past */}
                                    {new Date(disc.pickupDeadline!) <
                                      new Date() && (
                                      <button
                                        className="inventory-button"
                                        onClick={() =>
                                          listForSale(
                                            disc.id!.toString(),
                                            course
                                          )
                                        }
                                      >
                                        List For Sale
                                      </button>
                                    )}

                                    <button
                                      className="inventory-button"
                                      onClick={() =>
                                        markAsClaimed(disc.id!.toString())
                                      }
                                      style={{ marginLeft: "10px" }}
                                    >
                                      Mark as Claimed
                                    </button>
                                  </div>
                                ) : null}
                              </Box>
                            )}

                            {showDeletePopup && (
                              <DeleteConfirmationPopup
                                disc={disc}
                                open={showDeletePopup}
                                onClose={handleClose}
                                onConfirm={() => handleConfirmDelete(disc)}
                              />
                            )}
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
    </PullToRefresh>
  );
}

export default Inventory;
