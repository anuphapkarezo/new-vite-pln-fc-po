import { useState } from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import { Link } from "react-router-dom";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
// import InboxIcon from "@mui/icons-material/Inbox";
// import MailIcon from "@mui/icons-material/Mail";
// import HomeIcon from "@mui/icons-material/Home";
// import AutoAwesomeMotionTwoToneIcon from "@mui/icons-material/AutoAwesomeMotionTwoTone";
// import FileDownloadIcon from "@mui/icons-material/FileDownload";
// import ManageSearchTwoToneIcon from "@mui/icons-material/ManageSearchTwoTone";
// import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
// import ViewCompactSharpIcon from "@mui/icons-material/ViewCompactSharp";
import WaterfallChartRoundedIcon from "@mui/icons-material/WaterfallChartRounded";
import StackedLineChartOutlinedIcon from "@mui/icons-material/StackedLineChartOutlined";
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import ManageHistoryIcon from '@mui/icons-material/ManageHistory';
// count usage function
import countUsageAnalysis from "./catchCount/CountUsageAnalysis.jsx";
import MicrowaveIcon from '@mui/icons-material/Microwave';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import FolderCopyTwoToneIcon from '@mui/icons-material/FolderCopyTwoTone';
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize"; // หรือไอคอนตามที่คุณต้องการ
import DashboardIcon from '@mui/icons-material/Dashboard';
import FilterTiltShiftIcon from '@mui/icons-material/FilterTiltShift';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import CopyAllIcon from '@mui/icons-material/CopyAll';
import AppRegistrationTwoToneIcon from '@mui/icons-material/AppRegistrationTwoTone';
import InventoryIcon from '@mui/icons-material/Inventory';
import DateRangeIcon from '@mui/icons-material/DateRange';
import SubjectIcon from '@mui/icons-material/Subject';

const MenuList = ({ open, setOpen  }) => {
  //bind value user from localstorage
  const userString = localStorage.getItem("userToken");
  const userObject = JSON.parse(userString);
  const userName = userObject?.user_name;
  const userSurname = userObject?.user_surname;
  const userRole = userObject?.role_no ;
  // console.log('userRole' , userRole);

  const userGuest = localStorage.getItem("guestToken");
  const userGuestObject = JSON.parse(userGuest);
  const userGuestRole = userGuestObject?.user_role;
  // console.log('userGuestRole' , userGuestRole);
  const [openFC, setOpenFC] = useState(false);
  const handleOpenFCClick = () => {
    setOpenFC(!openFC);
    if (openFC === false) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  const [openCap, setOpenCap] = useState(false);
  const handleOpenCapClick = () => {
    setOpenCap(!openCap);
    if (openCap === false) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  };  

  const [openLT, setOpenLT] = useState(false);
  const handleOpenLTClick = () => {
    setOpenLT(!openLT);
    if (openLT === false) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }; 

  const [openPrice, setOpenPrice] = useState(false);
  const handleOpenPriceClick = () => {
    setOpenPrice(!openPrice);
    if (openPrice === false) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }; 

  const [openMaster, setOpenMaster] = useState(false);
  const handleOpenMasterClick = () => {
    setOpenMaster(!openMaster);
    if (openMaster === false) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }; 

  const [openOuter, setOpenOuter] = useState(false);
  const [chkOuter, setchkOuter] = useState(0);
  const handleOpenOuterClick = () => {
    setOpenOuter(!openOuter);
    if (openOuter === false) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }; 
  
  return (
    <List>
      {/* <ListItem disablePadding sx={{ display: 'block',color: 'black' }} component={Link} to="/">
            <ListItemButton
                sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    
                }}
                >
                <ListItemIcon
                    sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                        color: 'inherit', // Set initial color
                                "&:hover": {
                                color: 'primary.main', // Change color on hover
                                }
                    }}
                    >
                    <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Home" sx={{ opacity: open ? 1 : 0 }} />
            </ListItemButton>
      </ListItem> */}
      {/* <ListItem
        disablePadding
        sx={{ display: "block", color: "black" }}
        component={Link}
        to="/pln_fc_po"
      >
        <ListItemButton
          sx={{
            minHeight: 48,
            justifyContent: open ? "initial" : "center",
            px: 2.5,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 3 : "auto",
              justifyContent: "center",
              color: "inherit", // Set initial color
              "&:hover": {
                color: "primary.main", // Change color on hover
              },
            }}
          >
            <WaterfallChartRoundedIcon />
          </ListItemIcon>
          <ListItemText
            primary="Forecast Vs PO"
            sx={{ opacity: open ? 1 : 0 }}
          />
        </ListItemButton>
      </ListItem> */}

      {/* ------------------------------FC Dashboard------------------------------ */}
      <ListItemButton onClick={handleOpenFCClick} sx={{ gap: 3 }}>
        <ListItemIcon sx={{ minWidth: 'auto' }}>
          <DashboardCustomizeIcon />
        </ListItemIcon>
        <ListItemText primary="FC Dashboard" />
        {openFC ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={openFC} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {/* FC Vs PO */}
          <ListItem
            disablePadding
            component={Link}
            to="/pln_fc_po_new"
            sx={{ pl: 2 }}
          >
            <ListItemButton>
              <ListItemIcon sx={{ minWidth: 10, mr: 1 }}>
                <WaterfallChartRoundedIcon />
              </ListItemIcon>
              <ListItemText primary="FC Vs PO" />
            </ListItemButton>
          </ListItem>

          {/* FC Analysis */}
          <ListItem
            onClick={countUsageAnalysis}
            disablePadding
            component={Link}
            to="/pln_fc_analysis"
            sx={{ pl: 2 }}
          >
            <ListItemButton>
              <ListItemIcon sx={{ minWidth: 10, mr: 1 }}>
                <StackedLineChartOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="FC Analysis" />
            </ListItemButton>
          </ListItem>
        </List>
      </Collapse>
      {/* FC Vs PO */}
      {/* <ListItem
        disablePadding
        sx={{ display: "block", color: "black" }}
        component={Link}
        to="/pln_fc_po_new"
      >
        <ListItemButton
          sx={{
            minHeight: 48,
            justifyContent: open ? "initial" : "center",
            px: 2.5,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 3 : "auto",
              justifyContent: "center",
              color: "inherit", // Set initial color
              "&:hover": {
                color: "primary.main", // Change color on hover
              },
            }}
          >
            <WaterfallChartRoundedIcon />
          </ListItemIcon>
          <ListItemText
            primary="FC Vs PO"
            sx={{ opacity: open ? 1 : 0 }}
          />
        </ListItemButton>
      </ListItem> */}

      {/* FC Analysis */}
      {/* <ListItem
        // set onclick to send count data to the server
        onClick={countUsageAnalysis}
        disablePadding
        sx={{ display: "block", color: "black" }}
        component={Link}
        to="/pln_fc_analysis"
      >
        <ListItemButton
          sx={{
            minHeight: 48,
            justifyContent: open ? "initial" : "center",
            px: 2.5,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 3 : "auto",
              justifyContent: "center",
              color: "inherit", // Set initial color
              "&:hover": {
                color: "primary.main", // Change color on hover
              },
            }}
          >
            <StackedLineChartOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            primary="FC Analysis"
            sx={{ opacity: open ? 1 : 0 }}
          />
        </ListItemButton>
      </ListItem> */}
      {/* ------------------------------------------------------------- */}

      {/* ------------------------------CAP Dashboard------------------------------ */}
      <ListItemButton onClick={handleOpenCapClick} sx={{ gap: 3 }}>
        <ListItemIcon sx={{ minWidth: 'auto' }}>
          <DashboardIcon />
        </ListItemIcon>
        <ListItemText primary="CAP Dashboard" />
        {openCap ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={openCap} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem
            onClick={countUsageAnalysis}
            disablePadding
            component={Link}
            to="/pln_fc_time_cap"
            sx={{ pl: 2 }}
          >
            <ListItemButton>
              <ListItemIcon  sx={{ minWidth: 10, mr: 1 }}>
                <MicrowaveIcon />
              </ListItemIcon>
              <ListItemText primary="FC Time Capacity" />
            </ListItemButton>
          </ListItem>

          <ListItem
            onClick={countUsageAnalysis}
            disablePadding
            component={Link}
            to="/pln_fc_time_cap_chart"
            sx={{ pl: 2 }}
          >
            <ListItemButton>
              <ListItemIcon  sx={{ minWidth: 10, mr: 1 }}>
                <SsidChartIcon />
              </ListItemIcon>
              <ListItemText primary="FC & Cap. [Graph]" />
            </ListItemButton>
          </ListItem>

          {userGuestRole !== 'Guest' && userRole === 1 && (
            <ListItem
              onClick={countUsageAnalysis}
              disablePadding
              component={Link}
              to="/pln_manage_mc_in_proc"
              sx={{ pl: 2 }}
            >
              <ListItemButton>
                <ListItemIcon  sx={{ minWidth: 10, mr: 1 }}>
                  <PrecisionManufacturingIcon />
                </ListItemIcon>
                <ListItemText primary="Manage Machine" />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Collapse>
      {/* FC Time Capacity */}
      {/* <ListItem
        onClick={countUsageAnalysis}
        disablePadding
        sx={{ display: "block", color: "black" }}
        component={Link}
        to="/pln_fc_time_cap"
      >
        <ListItemButton
          sx={{
            minHeight: 48,
            justifyContent: open ? "initial" : "center",
            px: 2.5,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 3 : "auto",
              justifyContent: "center",
              color: "inherit", // Set initial color
              "&:hover": {
                color: "primary.main", // Change color on hover
              },
            }}
          >
            <MicrowaveIcon />
          </ListItemIcon>
          <ListItemText
            primary="FC Time Capacity"
            sx={{ opacity: open ? 1 : 0 }}
          />
        </ListItemButton>
      </ListItem> */}

      {/* FC & Cap. [Graph] */}
      {/* <ListItem
        // set onclick to send count data to the server
        onClick={countUsageAnalysis}
        disablePadding
        sx={{ display: "block", color: "black" }}
        component={Link}
        to="/pln_fc_time_cap_chart"
      >
        <ListItemButton
          sx={{
            minHeight: 48,
            justifyContent: open ? "initial" : "center",
            px: 2.5,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 3 : "auto",
              justifyContent: "center",
              color: "inherit", // Set initial color
              "&:hover": {
                color: "primary.main", // Change color on hover
              },
            }}
          >
            <SsidChartIcon />
          </ListItemIcon>
          <ListItemText
            primary="FC & Cap. [Graph]"
            sx={{ opacity: open ? 1 : 0 }}
          />
        </ListItemButton>
      </ListItem> */}

      {/* Manage Machine */}
      {/* && userRole === 1  (
        <ListItem
          // set onclick to send count data to the server
          onClick={countUsageAnalysis}
          disablePadding
          sx={{ display: "block", color: "black" }}
          component={Link}
          to="/pln_manage_mc_in_proc"
        >
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : "auto",
                justifyContent: "center",
                color: "inherit", // Set initial color
                "&:hover": {
                  color: "primary.main", // Change color on hover
                },
              }}
            >
              <PrecisionManufacturingIcon />
            </ListItemIcon>
            <ListItemText
              primary="Manage Machine"
              sx={{ opacity: open ? 1 : 0 }}
            />
          </ListItemButton>
        </ListItem>
      )} */}
      {/* ------------------------------------------------------------- */}

      {/* ------------------------------LT Dashboard------------------------------ */}
      <ListItemButton onClick={handleOpenLTClick} sx={{ gap: 3 }}>
        <ListItemIcon sx={{ minWidth: 'auto' }}>
          <FilterTiltShiftIcon />
        </ListItemIcon>
        <ListItemText primary="LT Dashboard" />
        {openLT ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={openLT} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem
            onClick={countUsageAnalysis}
            disablePadding
            component={Link}
            to="/proc_std_lt_master"
            sx={{ pl: 2 }}
          >
            <ListItemButton>
              <ListItemIcon  sx={{ minWidth: 10, mr: 1 }}>
                <WatchLaterIcon />
              </ListItemIcon>
              <ListItemText primary="Master Leadtime" />
            </ListItemButton>
          </ListItem>

          <ListItem
            onClick={countUsageAnalysis}
            disablePadding
            component={Link}
            to="/prod_rout_no_std_lt"
            sx={{ pl: 2 }}
          >
            <ListItemButton>
              <ListItemIcon  sx={{ minWidth: 10, mr: 1 }}>
                <ManageHistoryIcon />
              </ListItemIcon>
              <ListItemText primary="Proessc No Leadtime" />
            </ListItemButton>
          </ListItem>
        </List>
      </Collapse>
      {/* <ListItem
        disablePadding
        sx={{ display: "block", color: "black" }}
        component={Link}
        to="/proc_std_lt_master"
      >
        <ListItemButton
          sx={{
            minHeight: 48,
            justifyContent: open ? "initial" : "center",
            px: 2.5,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 3 : "auto",
              justifyContent: "center",
              color: "inherit", // Set initial color
              "&:hover": {
                color: "primary.main", // Change color on hover
              },
            }}
          >
            <WatchLaterIcon />
          </ListItemIcon>
          <ListItemText
            primary="Master Leadtime"
            sx={{ opacity: open ? 1 : 0 }}
          />
        </ListItemButton>
      </ListItem> */}

      {/* <ListItem
        disablePadding
        sx={{ display: "block", color: "black" }}
        component={Link}
        to="/prod_rout_no_std_lt"
      >
        <ListItemButton
          sx={{
            minHeight: 48,
            justifyContent: open ? "initial" : "center",
            px: 2.5,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 3 : "auto",
              justifyContent: "center",
              color: "inherit", // Set initial color
              "&:hover": {
                color: "primary.main", // Change color on hover
              },
            }}
          >
            <ManageHistoryIcon />
          </ListItemIcon>
          <ListItemText
            primary="Proessc no Leadtime"
            sx={{ opacity: open ? 1 : 0 }}
          />
        </ListItemButton>
      </ListItem> */}
      {/* ------------------------------------------------------------- */}

      {/* ------------------------------Price Dashboard------------------------------ */}
      <ListItemButton onClick={handleOpenPriceClick} sx={{ gap: 3 }}>
        <ListItemIcon sx={{ minWidth: 'auto' }}>
          <RequestQuoteIcon />
        </ListItemIcon>
        <ListItemText primary="Price Dashboard" />
        {openPrice ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={openPrice} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem
            onClick={countUsageAnalysis}
            disablePadding
            component={Link}
            to="/pln_prod_price_analysis"
            sx={{ pl: 2 }}
          >
            <ListItemButton>
              <ListItemIcon  sx={{ minWidth: 10, mr: 1 }}>
                <PriceChangeOutlinedIcon />
              </ListItemIcon>
              <ListItemText primary="Product Price" />
            </ListItemButton>
          </ListItem>

          {userGuestRole !== 'Guest' && userRole === 1 && (
            <ListItem
              onClick={countUsageAnalysis}
              disablePadding
              component={Link}
              to="/pln_po_fc_bill_to_master"
              sx={{ pl: 2 }}
            >
              <ListItemButton>
                <ListItemIcon  sx={{ minWidth: 10, mr: 1 }}>
                  <CorporateFareIcon />
                </ListItemIcon>
                <ListItemText primary="Bill-to Master" />
              </ListItemButton>
            </ListItem>
          )}    
        </List>
      </Collapse>

      {/*  */}
      {/* <ListItem
        disablePadding
        sx={{ display: "block", color: "black" }}
        component={Link}
        to="/pln_prod_price_analysis"
      >
        <ListItemButton
          sx={{
            minHeight: 48,
            justifyContent: open ? "initial" : "center",
            px: 2.5,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 3 : "auto",
              justifyContent: "center",
              color: "inherit", // Set initial color
              "&:hover": {
                color: "primary.main", // Change color on hover
              },
            }}
          >
            <PriceChangeOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            primary="Product Price"
            sx={{ opacity: open ? 1 : 0 }}
          />
        </ListItemButton>
      </ListItem> */}

      {/* {userGuestRole !== 'Guest' && (
        <ListItem
          disablePadding
          sx={{ display: "block", color: "black" }}
          component={Link}
          to="/pln_po_fc_bill_to_master"
        >
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : "auto",
                justifyContent: "center",
                color: "inherit", // Set initial color
                "&:hover": {
                  color: "primary.main", // Change color on hover
                },
              }}
            >
              <CorporateFareIcon />
            </ListItemIcon>
            <ListItemText
              primary="PO-FC bill-to"
              sx={{ opacity: open ? 1 : 0 }}
            />
          </ListItemButton>
        </ListItem>
      )} */}
      {/* ------------------------------------------------------------- */}

      {/* ------------------------------Data Dashboard------------------------------ */}
      <ListItemButton onClick={handleOpenMasterClick} sx={{ gap: 3 }}>
        <ListItemIcon sx={{ minWidth: 'auto' }}>
          <ImportContactsIcon />
        </ListItemIcon>
        <ListItemText primary="Data Dashboard" />
        {openMaster ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={openMaster} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem
            onClick={countUsageAnalysis}
            disablePadding
            component={Link}
            to="/pln_product_master"
            sx={{ pl: 2 }}
          >
            <ListItemButton>
              <ListItemIcon  sx={{ minWidth: 10, mr: 1 }}>
                <FolderCopyTwoToneIcon />
              </ListItemIcon>
              <ListItemText primary="Product Master" />
            </ListItemButton>
          </ListItem>
        </List>

        <List component="div" disablePadding>
          <ListItem
            onClick={countUsageAnalysis}
            disablePadding
            component={Link}
            to="/pln_prod_rout_list"
            sx={{ pl: 2 }}
          >
            <ListItemButton>
              <ListItemIcon  sx={{ minWidth: 10, mr: 1 }}>
                <SubjectIcon />
              </ListItemIcon>
              <ListItemText primary="Routing List" />
            </ListItemButton>
          </ListItem>
        </List>
        
      </Collapse>

      {/* ------------------------------Outer Dashboard------------------------------ */}
      <ListItemButton onClick={handleOpenOuterClick} sx={{ gap: 3 }}>
        <ListItemIcon sx={{ minWidth: 'auto' }}>
          <CopyAllIcon />
        </ListItemIcon>
        <ListItemText primary="Outer Dashboard" />
        {openOuter ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={openOuter} timeout="auto" unmountOnExit>
      
        {(userRole === 1 || userRole === 2) && (
          <List component="div" disablePadding>
            <ListItem
              onClick={countUsageAnalysis}
              disablePadding
              component={Link}
              to="/pln_pmc_select_product_to_master_header"
              sx={{ pl: 2 }}
            >
              <ListItemButton>
                <ListItemIcon  sx={{ minWidth: 10, mr: 1 }}>
                  <AppRegistrationTwoToneIcon />
                </ListItemIcon>
                <ListItemText primary="Select Master" />
              </ListItemButton>
            </ListItem>
          </List>
        )}
        
        <List component="div" disablePadding>
          <ListItem
            onClick={countUsageAnalysis}
            disablePadding
            component={Link}
            to="/pln_pmc_fg_stock_production"
            sx={{ pl: 2 }}
          >
            <ListItemButton>
              <ListItemIcon  sx={{ minWidth: 10, mr: 1 }}>
                <InventoryIcon />
              </ListItemIcon>
              <ListItemText primary="Stock Outer" />
            </ListItemButton>
          </ListItem>
        </List>

        <List component="div" disablePadding>
          <ListItem
            onClick={countUsageAnalysis}
            disablePadding
            component={Link}
            to="/pln_monthly_plan_product"
            sx={{ pl: 2 }}
          >
            <ListItemButton>
              <ListItemIcon  sx={{ minWidth: 10, mr: 1 }}>
                <DateRangeIcon />
              </ListItemIcon>
              <ListItemText primary="Monthly Plan" />
            </ListItemButton>
          </ListItem>
        </List>

        <List component="div" disablePadding>
          <ListItem
            onClick={countUsageAnalysis}
            disablePadding
            component={Link}
            to="/pln_pmc_product_multilayer_control"
            sx={{ pl: 2 }}
          >
            <ListItemButton>
              <ListItemIcon  sx={{ minWidth: 10, mr: 1 }}>
                <DynamicFeedIcon />
              </ListItemIcon>
              <ListItemText primary="PRD Multi Control" />
            </ListItemButton>
          </ListItem>
        </List>
      </Collapse>

      {/* <ListItem
        disablePadding
        sx={{ display: "block", color: "black" }}
        component={Link}
        to="/pln_product_master"
      >
        <ListItemButton
          sx={{
            minHeight: 48,
            justifyContent: open ? "initial" : "center",
            px: 2.5,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 3 : "auto",
              justifyContent: "center",
              color: "inherit", // Set initial color
              "&:hover": {
                color: "primary.main", // Change color on hover
              },
            }}
          >
            <FolderCopyTwoToneIcon />
          </ListItemIcon>
          <ListItemText
            primary="Product Master"
            sx={{ opacity: open ? 1 : 0 }}
          />
        </ListItemButton>
      </ListItem> */}
      {/* ------------------------------------------------------------- */}
    </List>
  );
};

export default MenuList;
