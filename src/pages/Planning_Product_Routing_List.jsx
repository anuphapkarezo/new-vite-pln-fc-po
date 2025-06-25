import React, { useState, useEffect , useRef } from "react";
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro';
import Nav from "../components/Nav";
import Container from "@mui/material/Container";
import "./styles/Planning_Product_Price_Analysis.css";
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import { Autocomplete, TextField } from '@mui/material';
import axios from "axios";
import CircularProgress from '@mui/material/CircularProgress';
import EditIcon from "@mui/icons-material/Edit";
import Swal from 'sweetalert2';
import ReactApexChart from 'react-apexcharts';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import TableChartIcon from '@mui/icons-material/TableChart';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export default function Planning_Product_Routing_List({ onSearch }) {
  localStorage.setItem('page_name', 'Product Master Report');

  const Custom_Progress = () => (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
    <div className="loader"></div>
    <div style={{ marginTop: 16, fontSize: 18, fontWeight: 'bold', color: '#3498db' }}>Loading Data...</div>
    <style jsx>{`
        .loader {
        border: 8px solid #f3f3f3;
        border-top: 8px solid #3498db;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        }
        @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
        }
    `}</style>
    </div>
  );

  const [isError, setIsError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedFactory, setSelectedFactory] = useState([]);

  const [distinctFactory, setDistinctFactory] = useState([]);

  const [distinctPrdRoutList, setdistinctPrdRoutList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit, setLimit] = useState(100); // Records per page

  const fetchFactory = async () => {
    try {
      const response = await axios.get(
        "http://10.17.100.115:3001/api/smart_edi/filter-factory-list-routing-list"
      );
      const dataProduct = response.data;
      setDistinctFactory(dataProduct);
    } catch (error) {
      console.error(`Error fetching distinct data ProductList: ${error}`);
    }
  };
  
  useEffect(() => {
    fetchFactory();
    if (distinctPrdRoutList.length > 0) { // Only search if we have data already
      setCurrentPage(1);
      handleSearch(1, limit);
    }
  }, [limit]);

  const handleFactoryChange = (event, newValue) => {
    setSelectedFactory(newValue);
  };

  const formatNumberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  let cancelLoading = false;
  const handleSearch = async (page = 1, pageLimit = limit) => {
    try {
      // Check if factory is selected
      if (!selectedFactory || selectedFactory.length === 0) {
        Swal.fire({
          title: 'Factory Required',
          text: 'Please select a factory to search',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }

      cancelLoading = false;
      setIsLoading(true);
      
      // Build query parameters
      let queryParams = `page=${page}&limit=${pageLimit}`;
      
      // Add factory filter - single factory
      const factoryId = selectedFactory.factory_desc;
      
      queryParams += `&factories=${encodeURIComponent(factoryId)}`;
      
      const response = await axios.get(`http://10.17.100.115:3001/api/smart_edi/filter-prod-rout-list-new?${queryParams}`);
      const data = response.data;
      
      // If using pagination response structure
      if (data.pagination) {
        setdistinctPrdRoutList(data.data);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
        setTotalRecords(data.pagination.totalRecords);
      } else {
        // If backend returns direct array (fallback)
        setdistinctPrdRoutList(data);
      }
      
    } catch (error) {
      console.error(`Error fetching distinct data SUS Delivery order: ${error}`);
      
      // Handle specific error responses
      if (error.response && error.response.status === 400) {
        Swal.fire({
          title: 'Factory Required',
          text: error.response.data.message || 'Please select a factory to search',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Failed to fetch data. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    cancelLoading = true; // Cancel ongoing chunk loading
    setdistinctPrdRoutList([]);
    setSelectedFactory([]);
    setCurrentPage(1); // Reset to first page
    setTotalPages(1);  // Reset total pages to 1 (this will disable Next button)
    setTotalRecords(0);   // Reset total records to 0
    setLimit(100);        // Reset to default limit
  };

  const handleExportToCSV = async () => {
    try {
      if (!selectedFactory || selectedFactory.length === 0) {
        Swal.fire({
          title: 'Factory Required',
          text: 'Please select at least one factory to export',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }

      setIsLoading(true);
      
      Swal.fire({
        icon: 'info',
        title: 'Exporting Data',
        html: 'Loading progress: <b>0%</b>',
        allowOutsideClick: false,
        showConfirmButton: false,
      });

      const factoryIds = selectedFactory.factory_desc;
      
      // CSV header
      let csvContent = 'No.,ITEM TYPE,PRODUCT,CATEGORY,FACTORY,SEQ,UNIT,PROCESS,LT,WC,R/L,SHT LOT,GATE\n';
      
      const chunkSize = 20000;
      let page = 1;
      let hasMoreData = true;
      let totalRecords = 0;
      let processedRecords = 0;

      while (hasMoreData) {
        try {
          const response = await axios.get(
            `http://10.17.100.115:3001/api/smart_edi/filter-prod-rout-list-new?page=${page}&limit=${chunkSize}&factories=${encodeURIComponent(factoryIds)}`
          );
          
          const data = response.data;
          const records = data.data || data;
          
          if (page === 1 && data.pagination) {
            totalRecords = data.pagination.totalRecords;
          }
          
          if (records && records.length > 0) {
            // Process records directly to CSV string
            for (let i = 0; i < records.length; i++) {
              const item = records[i];
              const rowNum = processedRecords + i + 1;
              
              // Escape CSV values and handle commas/quotes
              const escapeCsv = (value) => {
                if (value === null || value === undefined) return '';
                const str = String(value);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                  return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
              };
              
              const row = [
                rowNum,
                escapeCsv(item.item_type),
                escapeCsv(item.prd_name),
                escapeCsv(item.category),
                escapeCsv(item.factory_desc),
                escapeCsv(item.seq),
                escapeCsv(item.unit_desc),
                escapeCsv(item.proc_disp),
                escapeCsv(item.lt_day),
                escapeCsv(item.wc),
                escapeCsv(item.roll_lot),
                escapeCsv(item.sht_lot),
                escapeCsv(item.gate_proc)
              ].join(',');
              
              csvContent += row + '\n';
            }
            
            processedRecords += records.length;
            
            const progress = totalRecords > 0 ? 
              Math.round((processedRecords / totalRecords) * 100) : 
              Math.round((page * chunkSize / (processedRecords + chunkSize)) * 100);
            
            Swal.update({
              // html: `Loading progress: <b>${Math.min(progress, 100)}%</b><br>Processed: ${processedRecords.toLocaleString()} records`,
              html: `Loading progress: <b>${Math.min(progress, 100)}%</b>`,
              allowOutsideClick: false,
              showConfirmButton: false,
            });
            
            page++;
            
            if (data.pagination) {
              hasMoreData = page <= data.pagination.totalPages;
            } else {
              hasMoreData = records.length === chunkSize;
            }
            
            await new Promise(resolve => setTimeout(resolve, 10));
          } else {
            hasMoreData = false;
          }
        } catch (error) {
          console.error(`Error fetching page ${page}:`, error);
          if (processedRecords === 0) {
            throw error;
          }
          hasMoreData = false;
        }
      }

      if (processedRecords === 0) {
        throw new Error('No data found to export');
      }

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
      const fileName = `ProductRoutingList(${encodeURIComponent(factoryIds)})_${dateStr}${timeStr}.csv`;

      saveAs(blob, fileName);

      Swal.fire({
        title: 'Success!',
        text: `Excel file has been downloaded successfully`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Export error:', error);
      Swal.fire({
        title: 'Export Failed',
        text: 'Failed to export data. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="background-container">
          <Box>
            <Nav/>
            
            <div style={{width: 1050 , display: "flex", flexDirection: "row", marginTop: 40}}>
                {/* <label htmlFor="">From Product :</label> */}
                <Autocomplete
                  disablePortal
                  id="combo-box-demo-product"
                  size="small"
                  options={distinctFactory}
                  getOptionLabel={(option) => option?.factory_desc || ''}
                  value={selectedFactory}
                  onChange={handleFactoryChange}
                  sx={{ width: 230, height: 50 }}
                  renderInput={(params) => (
                    <TextField {...params} label="Factory" />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option && value && option.factory_desc === value.factory_desc
                  }
                />
                <Button 
                    variant="contained" 
                    className="btn_hover"
                    // size="small"
                    style={{width: '120px', height: '40px' , marginLeft: '20px', borderRadius: 10, boxShadow: '3px 3px 5px grey'}}
                    onClick={handleSearch}
                    startIcon={<SearchIcon />}
                    >Search
                </Button>
                <Button 
                    className="btn_hover" 
                    variant="contained" 
                    startIcon={<CancelIcon />} 
                    onClick={handleClear} 
                    style={{backgroundColor: 'orange', color:'black', width: '120px', height: '40px' , marginLeft: '10px', borderRadius: 10, boxShadow: '3px 3px 5px grey'}}>
                    Cancel 
                </Button>
                <Button 
                    className="btn_hover" 
                    variant="contained" 
                    startIcon={<TableChartIcon />} 
                    onClick={handleExportToCSV} 
                    disabled={isLoading}
                    style={{backgroundColor: 'green', color:'white', width: '130px', height: '40px' , marginLeft: '10px', borderRadius: 10, boxShadow: '3px 3px 5px grey'}}>
                    To Excel 
                </Button>
            </div>
            <div style={{border: '1px solid black', width: 1225, height: 650, overflowY: 'auto', overflowX: 'hidden', marginTop: 5}}>
              {isLoading ? (
                  <Custom_Progress />
              ) : (
                  <table style={{width: 1200, borderCollapse: 'collapse',}}>
                    <thead style={{fontSize: 16, fontWeight: 'bold', position: 'sticky', top: 0, zIndex: 1, }}>
                      <tr>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "30px",
                                border: 'solid white 1px',
                                }}
                          >
                            No.
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "60px",
                                border: 'solid white 1px',
                                }}
                          >
                            ITEM TYPE
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "120px",
                                border: 'solid white 1px',
                                }}
                          >
                            PRODUCT
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "30px",
                                border: 'solid white 1px',
                                }}
                          >
                            CATEGORY
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "50px",
                                border: 'solid white 1px',
                                }}
                          >
                            FACTORY
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "45px",
                                border: 'solid white 1px',
                                }}
                          >
                            SEQ
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "60px",
                                border: 'solid white 1px',
                                }}
                          >
                            UNIT
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "40px",
                                border: 'solid white 1px',
                                }}
                          >
                            PROCESS
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "45px",
                                border: 'solid white 1px',
                                }}
                          >
                            LT
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "45px",
                                border: 'solid white 1px',
                                }}
                          >
                            WC
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "45px",
                                border: 'solid white 1px',
                                }}
                          >
                            R/L
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "55px",
                                border: 'solid white 1px',
                                }}
                          >
                            SHT LOT
                        </th>
                        <th
                          style={{
                                textAlign: "center",
                                backgroundColor: "#4D55CC",
                                color: 'white',
                                height: "40px",
                                width: "50px",
                                border: 'solid white 1px',
                                }}
                          >
                            GATE
                        </th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: 14, textAlign: 'center' }}>
                      {distinctPrdRoutList.map((item, index) => (
                        <tr key={index}>
                          <td style={{border: 'solid black 1px', 
                                      textAlign: 'center',
                                    }}
                              >
                              {index + 1}
                          </td>
                          <td style={{border: 'solid black 1px', 
                                      textAlign: 'center',
                                    }}
                              >
                              {item.item_type || ""}
                          </td>
                          <td style={{border: 'solid black 1px', 
                                      textAlign: 'left',
                                      paddingLeft : 10 ,
                                      height: "30px",
                                    }}
                              >
                              {item.prd_name || ""}
                          </td>
                          <td style={{border: 'solid black 1px',
                                      textAlign: 'center',
                                    }}
                              >
                              {item.category || ""}
                          </td>
                          <td style={{border: 'solid black 1px',
                                      textAlign: 'center',
                                    }}
                              >
                              {item.factory_desc || ""}
                          </td>
                          <td style={{border: 'solid black 1px',
                                      textAlign: 'center',
                                    }}
                              >
                              {item.seq || ""}
                          </td>
                          <td style={{border: 'solid black 1px',
                                      textAlign: 'center',
                                    }}
                              >
                              {item.unit_desc || ""}
                          </td>
                          <td style={{border: 'solid black 1px',
                                      textAlign: 'left',
                                      paddingLeft : 10 ,
                                    }}
                              >
                              {item.proc_disp || ""}
                          </td>
                          <td style={{border: 'solid black 1px',
                                      textAlign: 'center',
                                    }}
                              >
                              {item.lt_day || ""}
                          </td>
                          <td style={{border: 'solid black 1px',
                                      textAlign: 'center',
                                    }}
                              >
                              {item.wc || ""}
                          </td>
                          <td style={{border: 'solid black 1px',
                                      textAlign: 'center',
                                    }}
                              >
                              {item.roll_lot || ""}
                          </td>
                          <td style={{border: 'solid black 1px',
                                      textAlign: 'center',
                                    }}
                              >
                              {parseInt(item.sht_lot)}
                          </td>
                          <td style={{border: 'solid black 1px',
                                      textAlign: 'center',
                                      backgroundColor: item.gate_proc === "Y" ? "#FFA55D" : "transparent",
                                    }}
                              >
                              {item.gate_proc || ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                </table>
              )}
            </div>
            {/* Pagination Controls */}
            <div style={{ 
              width: 1225,
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              marginTop: '20px',
              gap: '10px'
            }}>
              <button 
                onClick={() => handleSearch(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentPage <= 1 ? '#ccc' : '#3674B5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
                }}
              >
                {'<'}
              </button>
              
              <span style={{ margin: '0 15px', fontSize: '16px' }}>
                Page {formatNumberWithCommas(currentPage)} of {formatNumberWithCommas(totalPages)}
                {/* Page {formatNumberWithCommas(currentPage)} of {formatNumberWithCommas(totalPages)} ({formatNumberWithCommas(totalRecords)} total records) */}
              </span>
              
              <button 
                onClick={() => handleSearch(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentPage >= totalPages ? '#ccc' : '#3674B5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                {'>'}
              </button>
              
              {/* Page size selector */}
              <select 
                value={limit} 
                // onChange={async (e) => {
                //   const newLimit = parseInt(e.target.value);
                //   setLimit(newLimit);
                //   setCurrentPage(1); // Reset to first page
                //   await new Promise(resolve => setTimeout(resolve, 0));
                //   handleSearch(1); // Load first page with new limit
                // }}
                onChange={(e) => {
                  const newLimit = parseInt(e.target.value);
                  setLimit(newLimit);
                  setCurrentPage(1);
                  // The useEffect will handle the search when limit changes
                }}
                style={{
                  padding: '8px',
                  marginLeft: '15px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
               </select>
            </div>
          </Box>
      </div>
    </>
  );
}