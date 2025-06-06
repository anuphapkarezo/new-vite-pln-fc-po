import React, { useState, useEffect } from "react";
// import * as React from 'react';
import Box from "@mui/material/Box";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import { DataGridPro } from '@mui/x-data-grid-pro';
// import { randomTraderName, randomEmail } from '@mui/x-data-grid-generator';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Switch from '@mui/material/Switch';
import "./styles/Planning_Forecast_AnalysisPage.css";
import CircularProgress from "@mui/material/CircularProgress";
// import { Axios } from "axios";
import axios from "axios";
// import ConnectedTvTwoToneIcon from "@mui/icons-material/ConnectedTvTwoTone";
// import LaptopTwoToneIcon from "@mui/icons-material/LaptopTwoTone";
import GppGoodIcon from "@mui/icons-material/GppGood";
import GppMaybeIcon from "@mui/icons-material/GppMaybe";
import GppBadIcon from "@mui/icons-material/GppBad";
import Nav from "../components/Nav";
// import { Container } from "@mui/material";

const columns = [
  {
    field: "sales",
    headerName: "Sales",
    width: 120,
    headerAlign: "center",
    headerClassName: "bold-header",
  },
  {
    field: "part",
    headerName: "Product Name",
    width: 150,
    headerAlign: "center",
    headerClassName: "bold-header",
  },
  {
    field: "input_factory",
    headerName: "Input Factory",
    width: 100,
    headerAlign: "center",
    align: "center",
    headerClassName: "bold-header",
  },
  {
    field: "ship_factory",
    headerName: "Ship Factory",
    width: 100,
    headerAlign: "center",
    align: "center",
    headerClassName: "bold-header",
  },
  {
    field: "planner",
    headerName: "Planner",
    width: 140,
    headerAlign: "center",
    headerClassName: "bold-header",
  },
  {
    field: "cr",
    headerName: "CR",
    width: 140,
    headerAlign: "center",
    headerClassName: "bold-header",
  },
  {
    field: "fc",
    headerName: "FC (pcs)",
    width: 100,
    headerAlign: "center",
    align: "center",
    headerClassName: "bold-header",
    valueFormatter: (params) => {
      // Assuming 'fc' is a numerical value, format it with commas for display
      const formattedValue = new Intl.NumberFormat("en-US").format(
        params.value
      );
      return formattedValue;
    },
    sortComparator: (a, b, cellParamsA, cellParamsB) => {
      // Assuming 'fc' is a numerical value, use a custom sort comparator
      return cellParamsA.value - cellParamsB.value;
    },
  },
  {
    field: "qty_fc_4wk",
    headerName: "FC (Next 4wk) || (pcs)",
    width: 160,
    headerAlign: "center",
    align: "center",
    headerClassName: "bold-header",
    valueFormatter: (params) => {
      // Attempt to convert the string to a number
      const numericValue = parseFloat(params.value.replace(/[^0-9.-]+/g, ""));

      // Check if the value is a valid number
      if (!isNaN(numericValue)) {
        const formattedValue = new Intl.NumberFormat("en-US").format(
          numericValue
        );
        return formattedValue;
      } else {
        return "Invalid Data"; // or any default value or an empty string
      }
    },
    sortComparator: (a, b, cellParamsA, cellParamsB) => {
      const numA = parseFloat(cellParamsA.value.replace(/[^0-9.-]+/g, ""));
      const numB = parseFloat(cellParamsB.value.replace(/[^0-9.-]+/g, ""));

      // Check if both values are valid numbers
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      } else {
        return 0; // or handle the case when the comparison is not possible
      }
    },
  },
  {
    field: "po_cover_fc",
    headerName: "PO cover FC (week)",
    width: 150,
    headerAlign: "center",
    align: "center",
    headerClassName: "bold-header",
  },
  {
    field: "fc_accuracy",
    headerName: "FC Stablelability",
    width: 150,
    headerAlign: "center",
    align: "right",
    headerClassName: "bold-header",
    renderCell: (params) => (
      <div>
        {params.value}&nbsp;%&nbsp;&nbsp;&nbsp;&nbsp;
        {params.row.fc_accuracy >= 80 ? (
          <GppGoodIcon style={{ color: "green" }} />
        ) : params.row.fc_accuracy >= 60 ? (
          <GppMaybeIcon style={{ color: "#E9B824" }} />
        ) : (
          <GppBadIcon style={{ color: "red" }} />
        )}
      </div>
    ),
    valueFormatter: (params) => {
      // Assuming 'fc' is a numerical value, format it with commas for display
      const formattedValue = new Intl.NumberFormat("en-US").format(
        params.value
      );
      return formattedValue;
    },
    sortComparator: (a, b, cellParamsA, cellParamsB) => {
      // Assuming 'fc' is a numerical value, use a custom sort comparator
      return cellParamsA.value - cellParamsB.value;
    },
  },
  {
    field: "booking_plan",
    headerName: "Booking Plan (pcs)",
    width: 150,
    headerAlign: "center",
    align: "center",
    headerClassName: "bold-header",
    valueFormatter: (params) => {
      // Assuming 'fc' is a numerical value, format it with commas for display
      const formattedValue = new Intl.NumberFormat("en-US").format(
        params.value
      );
      return formattedValue;
    },
    sortComparator: (a, b, cellParamsA, cellParamsB) => {
      // Assuming 'fc' is a numerical value, use a custom sort comparator
      return cellParamsA.value - cellParamsB.value;
    },
  },
  {
    field: "percent_reject",
    headerName: "% Reject",
    width: 175,
    headerAlign: "center",
    align: "center",
    headerClassName: "bold-header",
    valueFormatter: (params) => {
      const numericValue = parseFloat(params.value);

      // Check if the value is a valid number
      if (!isNaN(numericValue)) {
        const formattedValue = new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(numericValue);
        return `${formattedValue} %`;
      } else {
        return "Invalid Data"; // or any default value or an empty string
      }
    },
    sortComparator: (a, b, cellParamsA, cellParamsB) => {
      const numA = parseFloat(cellParamsA.value);
      const numB = parseFloat(cellParamsB.value);

      // Check if both values are valid numbers
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      } else {
        return 0; // Change this to '0.00%' or any default value with percentage sign
      }
    },
  },
  {
    field: "wip",
    headerName: "WIP (pcs)",
    width: 95,
    headerAlign: "center",
    align: "center",
    headerClassName: "bold-header",
    valueFormatter: (params) => {
      // Attempt to convert the string to a number
      const numericValue = parseFloat(params.value.replace(/[^0-9.-]+/g, ""));

      // Check if the value is a valid number
      if (!isNaN(numericValue)) {
        const formattedValue = new Intl.NumberFormat("en-US").format(
          numericValue
        );
        return formattedValue;
      } else {
        return "Invalid Data"; // or any default value or an empty string
      }
    },
    sortComparator: (a, b, cellParamsA, cellParamsB) => {
      const numA = parseFloat(cellParamsA.value.replace(/[^0-9.-]+/g, ""));
      const numB = parseFloat(cellParamsB.value.replace(/[^0-9.-]+/g, ""));

      // Check if both values are valid numbers
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      } else {
        return 0; // or handle the case when the comparison is not possible
      }
    },
  },
  {
    field: "wip_yield",
    headerName: "WIP Yield (pcs)",
    width: 115,
    headerAlign: "center",
    align: "center",
    headerClassName: "bold-header",
    valueFormatter: (params) => {
      // Attempt to convert the string to an integer
      const intValue = parseInt(params.value, 10);

      // Check if the value is a valid integer
      if (!isNaN(intValue)) {
        const formattedValue = new Intl.NumberFormat("en-US").format(intValue);
        return formattedValue;
      } else {
        return "Invalid Data"; // or any default value or an empty string
      }
    },
    sortComparator: (a, b, cellParamsA, cellParamsB) => {
      const intA = parseInt(cellParamsA.value, 10);
      const intB = parseInt(cellParamsB.value, 10);

      // Check if both values are valid integers
      if (!isNaN(intA) && !isNaN(intB)) {
        return intA - intB;
      } else {
        return 0; // or handle the case when the comparison is not possible
      }
    },
  },
  {
    field: "wip_pending",
    headerName: "WIP Pending (1.1,3.1)",
    width: 165,
    headerAlign: "center",
    align: "center",
    headerClassName: "bold-header",
    valueFormatter: (params) => {
      // Attempt to convert the string to a number
      const numericValue = parseFloat(params.value.replace(/[^0-9.-]+/g, ""));

      // Check if the value is a valid number
      if (!isNaN(numericValue)) {
        const formattedValue = new Intl.NumberFormat("en-US").format(
          numericValue
        );
        return formattedValue;
      } else {
        return "Invalid Data"; // or any default value or an empty string
      }
    },
    sortComparator: (a, b, cellParamsA, cellParamsB) => {
      const numA = parseFloat(cellParamsA.value.replace(/[^0-9.-]+/g, ""));
      const numB = parseFloat(cellParamsB.value.replace(/[^0-9.-]+/g, ""));

      // Check if both values are valid numbers
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      } else {
        return 0; // or handle the case when the comparison is not possible
      }
    },
  },
  {
    field: "fg",
    headerName: "FG (pcs)",
    width: 95,
    headerAlign: "center",
    align: "center",
    headerClassName: "bold-header",
    valueFormatter: (params) => {
      // Attempt to convert the string to a number
      const numericValue = parseFloat(params.value.replace(/[^0-9.-]+/g, ""));

      // Check if the value is a valid number
      if (!isNaN(numericValue)) {
        const formattedValue = new Intl.NumberFormat("en-US").format(
          numericValue
        );
        return formattedValue;
      } else {
        return "Invalid Data"; // or any default value or an empty string
      }
    },
    sortComparator: (a, b, cellParamsA, cellParamsB) => {
      const numA = parseFloat(cellParamsA.value.replace(/[^0-9.-]+/g, ""));
      const numB = parseFloat(cellParamsB.value.replace(/[^0-9.-]+/g, ""));

      // Check if both values are valid numbers
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      } else {
        return 0; // or handle the case when the comparison is not possible
      }
    },
  },
  {
    field: "fg_unm",
    headerName: "FG Unmovement (pcs)",
    width: 170,
    headerAlign: "center",
    align: "center",
    headerClassName: "bold-header",
    valueFormatter: (params) => {
      // Attempt to convert the string to a number
      const numericValue = parseFloat(params.value.replace(/[^0-9.-]+/g, ""));

      // Check if the value is a valid number
      if (!isNaN(numericValue)) {
        const formattedValue = new Intl.NumberFormat("en-US").format(
          numericValue
        );
        return formattedValue;
      } else {
        return "Invalid Data"; // or any default value or an empty string
      }
    },
    sortComparator: (a, b, cellParamsA, cellParamsB) => {
      const numA = parseFloat(cellParamsA.value.replace(/[^0-9.-]+/g, ""));
      const numB = parseFloat(cellParamsB.value.replace(/[^0-9.-]+/g, ""));

      // Check if both values are valid numbers
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      } else {
        return 0; // or handle the case when the comparison is not possible
      }
    },
  },
  {
    field: "po_bal",
    headerName: "PO balance(pcs)",
    width: 130,
    headerAlign: "center",
    align: "center",
    headerClassName: "bold-header",
    valueFormatter: (params) => {
      // Attempt to convert the string to a number
      const numericValue = parseFloat(params.value.replace(/[^0-9.-]+/g, ""));

      // Check if the value is a valid number
      if (!isNaN(numericValue)) {
        const formattedValue = new Intl.NumberFormat("en-US").format(
          numericValue
        );
        return formattedValue;
      } else {
        return "Invalid Data"; // or any default value or an empty string
      }
    },
    sortComparator: (a, b, cellParamsA, cellParamsB) => {
      const numA = parseFloat(cellParamsA.value.replace(/[^0-9.-]+/g, ""));
      const numB = parseFloat(cellParamsB.value.replace(/[^0-9.-]+/g, ""));

      // Check if both values are valid numbers
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      } else {
        return 0; // or handle the case when the comparison is not possible
      }
    },
  },
  {
    field: "wip_fg_compare_po",
    headerName: "WIP_Yield+FG VS PO",
    width: 175,
    headerAlign: "center",
    align: "center",
    headerClassName: "bold-header",
    valueFormatter: (params) => {
      const numericValue = parseFloat(params.value);

      // Check if the value is a valid number
      if (!isNaN(numericValue)) {
        const formattedValue = new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(numericValue);
        return `${formattedValue} %`;
      } else {
        return "Invalid Data"; // or any default value or an empty string
      }
    },
    sortComparator: (a, b, cellParamsA, cellParamsB) => {
      const numA = parseFloat(cellParamsA.value);
      const numB = parseFloat(cellParamsB.value);

      // Check if both values are valid numbers
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      } else {
        return 0; // Change this to '0.00%' or any default value with percentage sign
      }
    },
  },
  {
    field: "wip_fg_compare_fc",
    headerName: "WIP_Yield+FG VS FC",
    width: 175,
    headerAlign: "center",
    align: "center",
    headerClassName: "bold-header",
    valueFormatter: (params) => {
      const numericValue = parseFloat(params.value);

      // Check if the value is a valid number
      if (!isNaN(numericValue)) {
        const formattedValue = new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(numericValue);
        return `${formattedValue} %`;
      } else {
        return "Invalid Data"; // or any default value or an empty string
      }
    },
    sortComparator: (a, b, cellParamsA, cellParamsB) => {
      const numA = parseFloat(cellParamsA.value);
      const numB = parseFloat(cellParamsB.value);

      // Check if both values are valid numbers
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      } else {
        return 0; // Change this to '0.00%' or any default value with percentage sign
      }
    },
  },{
    field: "qty_feedback_sale",
    headerName: "PO_Bal - FC (Next 4wk) || (pcs)",
    width: 220,
    headerAlign: "center",
    align: "center",
    headerClassName: "bold-header",
    valueFormatter: (params) => {
      // Attempt to convert the string to a number
      const numericValue = Number(params.value);
  
      // Check if the value is a valid number and an integer
      if (!isNaN(numericValue) && Number.isInteger(numericValue)) {
        const formattedValue = new Intl.NumberFormat("en-US").format(numericValue);
        return formattedValue;
      } else {
        return "Invalid Data"; // or any default value or an empty string
      }
    },
    sortComparator: (a, b, cellParamsA, cellParamsB) => {
      const numA = Number(cellParamsA.value);
      const numB = Number(cellParamsB.value);
  
      // Check if both values are valid numbers
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      } else {
        return 0; // or handle the case when the comparison is not possible
      }
    },
    // renderCell: (params) => (
    //   <div>
    //     {params.value}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    //     {params.row.qty_feedback_sale < 0 ? (
    //       <GppBadIcon style={{ color: "red" }} />
    //     ) : (
    //       <GppGoodIcon style={{ color: "green" }} />
    //     )}
    //   </div>
    // ),
    // valueFormatter: (params) => {
    //   // Attempt to convert the string to a number
    //   const numericValue = parseFloat(params.value.replace(/[^0-9.-]+/g, ""));

    //   // Check if the value is a valid number
    //   if (!isNaN(numericValue)) {
    //     const formattedValue = new Intl.NumberFormat("en-US").format(
    //       numericValue
    //     );
    
    //     return formattedValue;
    //   } else {
    //     return "Invalid Data"; // or any default value or an empty string
    //   }
    // },
    // sortComparator: (a, b, cellParamsA, cellParamsB) => {
    //   const numA = parseFloat(cellParamsA.value.replace(/[^0-9.-]+/g, ""));
    //   const numB = parseFloat(cellParamsB.value.replace(/[^0-9.-]+/g, ""));

    //   // Check if both values are valid numbers
    //   if (!isNaN(numA) && !isNaN(numB)) {
    //     return numA - numB;
    //   } else {
    //     return 0; // or handle the case when the comparison is not possible
    //   }
    // },
  },{
    field: "qty_control_loading",
    headerName: "(FG+FG Un+WIP Yield+WIP pending) - FC (Next 4wk) (pcs)",
    width: 220,
    headerAlign: "center",
    align: "center",
    headerClassName: 'bold-header',
    // renderCell: (params) => (
    //   <div>
    //     {params.value}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    //     {params.row.qty_feedback_sale < 0 ? (
    //       <GppBadIcon style={{ color: "red" }} />
    //     ) : (
    //       <GppGoodIcon style={{ color: "green" }} />
    //     )}
    //   </div>
    // ),
    valueFormatter: (params) => {
      // Attempt to convert the string to a number
      const numericValue = Number(params.value);
  
      // Check if the value is a valid number and an integer
      if (!isNaN(numericValue) && Number.isInteger(numericValue)) {
        const formattedValue = new Intl.NumberFormat("en-US").format(numericValue);
        return formattedValue;
      } else {
        return "Invalid Data"; // or any default value or an empty string
      }
    },
    sortComparator: (a, b, cellParamsA, cellParamsB) => {
      const numA = Number(cellParamsA.value);
      const numB = Number(cellParamsB.value);
  
      // Check if both values are valid numbers
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      } else {
        return 0; // or handle the case when the comparison is not possible
      }
    },
  },
  
];

export default function Planning_Forecast_AnalysisPage({ onSearch }) {
  localStorage.setItem('page_name', 'Forecast Analysis');

  const [filterModel, setFilterModel] = React.useState({
    items: [],
    quickFilterExcludeHiddenColumns: true,
    quickFilterValues: [""],
  });

  function formatNumberWithCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const [distinctFcAnalysis, setDistinctFcAnalysis] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFcAnalysis = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `http://10.17.100.115:3001/api/smart_planning/filter-fc-analysis`
      );
      const data = await response.data;
      // Add a unique id property to each row
      const rowsWithId = data.map((row, index) => ({
        ...row,
        id: index, // You can use a better unique identifier here if available
      }));
      setDistinctFcAnalysis(rowsWithId);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("An error occurred while fetching data Wip Details");
    } finally {
      setIsLoading(false); // Set isLoading back to false when fetch is complete
    }
  };

  useEffect(() => {
    fetchFcAnalysis();
  }, []);

  const [columnVisibilityModel, setColumnVisibilityModel] = React.useState({});
  return (
    <>
      <Box>
        <Nav />
        <div
          className="table-container"
          style={{ height: 800, width: "1600px", marginTop: "5px" }}
        >
          {isLoading ? ( // Render the loading indicator if isLoading is true
            <div
              className="loading-indicator"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "50vh",
              }}
            >
              <CircularProgress />{" "}
              {/* Use the appropriate CircularProgress component */}
              <p>Loading data...</p>
              {/* <p>Loading data...{Math.round(loadingPercentage)}%</p> */}
            </div>
          ) : (
            <Box sx={{ width: 1 }}>
              {/* <FormControlLabel
            checked={columnVisibilityModel.id !== false}
            onChange={(event) =>
              setColumnVisibilityModel(() => ({ id: event.target.checked }))
            }
            control={<Switch color="primary" size="small" />}
            label="Show ID column"
          />
          <FormControlLabel
            checked={filterModel.quickFilterExcludeHiddenColumns}
            onChange={(event) =>
              setFilterModel((model) => ({
                ...model,
                quickFilterExcludeHiddenColumns: event.target.checked,
              }))
            }
            control={<Switch color="primary" size="small" />}
            label="Exclude hidden columns"
          /> */}
              <Box sx={{ height: 725 }}>
                <DataGrid
                  columns={columns}
                  rows={distinctFcAnalysis.map((row) => ({
                    ...row,
                    // fc: formatNumberWithCommas(row.fc),
                    // fc_accuracy: formatNumberWithCommas(parseInt(row.fc_accuracy, 10)) ,
                    // fc: `${formatNumberWithCommas(row.fc)}%`,
                    wip: formatNumberWithCommas(row.wip),
                    wip_pending: formatNumberWithCommas(row.wip_pending),
                    fg: formatNumberWithCommas(row.fg),
                    fg_unm: formatNumberWithCommas(row.fg_unm),
                    po_bal: formatNumberWithCommas(row.po_bal),
                  }))}
                  // disableColumnFilter
                  // disableDensitySelector
                  slots={{ toolbar: GridToolbar }}
                  filterModel={filterModel}
                  onFilterModelChange={(newModel) => setFilterModel(newModel)}
                  slotProps={{ toolbar: { showQuickFilter: true } }}
                  columnVisibilityModel={columnVisibilityModel}
                  // checkboxSelection
                  onColumnVisibilityModelChange={(newModel) =>
                    setColumnVisibilityModel(newModel)
                  }
                />
              </Box>
            </Box>
            
          )}
        </div>
        
      </Box>
      
    </>
  );
}
