import axios from "axios";
import { Disc } from "../App";
import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

interface DeleteConfirmationPopupProps {
  disc: Disc;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteConfirmationPopup: React.FC<DeleteConfirmationPopupProps> = ({
  disc,
  open,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{"Delete Disc"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Are you sure you wish to delete the disc "{disc.disc}"?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" autoFocus>
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationPopup;
