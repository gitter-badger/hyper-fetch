/* eslint-disable no-console */
/* eslint-disable react/require-default-props */
import * as React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Box, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { UseFetchReturnType, UseSubmitReturnType } from "@better-typed/react-hyper-fetch";
import { CommandInstance } from "@better-typed/hyper-fetch";
import { useSnackbar } from "notistack";

import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import ErrorIcon from "@mui/icons-material/Error";
import DataArrayIcon from "@mui/icons-material/DataArray";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

type Props = {
  name: string;
  result: UseFetchReturnType<CommandInstance> | UseSubmitReturnType<CommandInstance>;
  children?: React.ReactNode;
};

export function Request({ name, children, result }: Props) {
  const { data, error, loading, submitting, timestamp } = result;

  const { enqueueSnackbar } = useSnackbar();

  const [fetched, setFetched] = React.useState(false);

  const isLoading = submitting || loading;

  const loadingComponent = isLoading ? (
    <Box sx={{ display: "flex", gap: "10px" }}>
      True <CircularProgress size="4" />
    </Box>
  ) : (
    <Box sx={{ display: "flex", gap: "10px" }}>False</Box>
  );

  const dataComponent = data ? (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
        <Typography>Show Data</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <code>
          <pre style={{ margin: 0 }}>{JSON.stringify(data, null, 2)}</pre>
        </code>
      </AccordionDetails>
    </Accordion>
  ) : (
    "---"
  );

  const errorComponent = error ? (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
        <Typography>Show Error</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <code>
          <pre style={{ margin: 0 }}>
            {JSON.stringify(error instanceof Error ? { message: error.message } : error, null, 2)}
          </pre>
        </code>
      </AccordionDetails>
    </Accordion>
  ) : (
    "---"
  );

  const onSuccess = result?.onSuccess || result?.onSubmitSuccess;
  const onError = result?.onError || result?.onSubmitError;
  const onAbort = result?.onAbort || result?.onSubmitAbort;
  const onFinished = result?.onFinished || result?.onSubmitFinished;
  const onRequestStart = result?.onRequestStart || result?.onSubmitRequestStart;
  const onResponseStart = result?.onResponseStart || result?.onSubmitResponseStart;
  const onDownloadProgress = result?.onDownloadProgress || result?.onSubmitDownloadProgress;
  const onUploadProgress = result?.onUploadProgress || result?.onSubmitUploadProgress;

  onRequestStart(() => {
    setFetched(true);
    enqueueSnackbar("Request started", { variant: "default" });
  });

  onResponseStart(() => {
    enqueueSnackbar("Response started", { variant: "info" });
  });

  onSuccess(() => {
    enqueueSnackbar("Success", { variant: "success" });
  });

  onError(() => {
    enqueueSnackbar("Error", { variant: "error" });
  });

  onAbort(() => {
    enqueueSnackbar("Abort Error", { variant: "error" });
  });

  onFinished(() => {
    enqueueSnackbar("Finished", { variant: "warning" });
  });

  onDownloadProgress((progress) => {
    console.log("DOWNLOAD PROGRESS", progress);
  });

  onUploadProgress((progress) => {
    console.log("UPLOAD PROGRESS", progress);
  });

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" textTransform="uppercase" fontWeight="800">
        {name}
      </Typography>
      {children && <Box sx={{ mt: 2, mb: 2 }}>{children}</Box>}
      <List>
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <HourglassBottomIcon />
            </ListItemIcon>
            <ListItemText primary="Initially Fetched" sx={{ minWidth: "150px", maxWidth: "150px" }} />
            <Divider orientation="vertical" flexItem sx={{ margin: "0 20px 0 10px" }} />
            <ListItemText secondary={String(fetched)} />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <AutorenewIcon />
            </ListItemIcon>
            <ListItemText primary="Loading" sx={{ minWidth: "150px", maxWidth: "150px" }} />
            <Divider orientation="vertical" flexItem sx={{ margin: "0 20px 0 10px" }} />
            <ListItemText primary={loadingComponent} />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <ErrorIcon />
            </ListItemIcon>
            <ListItemText primary="Error" sx={{ minWidth: "150px", maxWidth: "150px" }} />
            <Divider orientation="vertical" flexItem sx={{ margin: "0 20px 0 10px" }} />
            <ListItemText primary={errorComponent} />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <DataArrayIcon />
            </ListItemIcon>
            <ListItemText primary="Data" sx={{ minWidth: "150px", maxWidth: "150px" }} />
            <Divider orientation="vertical" flexItem sx={{ margin: "0 20px 0 10px" }} />
            <ListItemText primary={dataComponent} />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton>
            <ListItemIcon>
              <AccessTimeIcon />
            </ListItemIcon>
            <ListItemText primary="Timestamp" sx={{ minWidth: "150px", maxWidth: "150px" }} />
            <Divider orientation="vertical" flexItem sx={{ margin: "0 20px 0 10px" }} />
            <ListItemText
              secondary={timestamp ? `${timestamp?.toDateString()} ${timestamp?.toLocaleTimeString()}` : "---"}
            />
          </ListItemButton>
        </ListItem>
        <Divider />
      </List>
    </Box>
  );
}
