import React, { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import Nav from "../components/Nav";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import Swal from 'sweetalert2';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import ExcelJS from 'exceljs';
import { saveAs } from "file-saver";
import TableChartIcon from '@mui/icons-material/TableChart';
import AddIcon from '@mui/icons-material/Add';
import Modal from "@mui/material/Modal";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import AddToPhotosIcon from '@mui/icons-material/AddToPhotos';

export default function PMC_Fg_Stock_Production({ onSearch }) {
  localStorage.setItem('page_name', 'FG Stock from Production');

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
  const userString = localStorage.getItem("userToken");
  const userObject = JSON.parse(userString);
  const userName = userObject?.user_name;
  const userSurname = userObject?.user_surname;
  const ShortSurname = userSurname?.charAt(0);
  const update_by = userName +'.'+ ShortSurname; 
  userObject.update_by = update_by;
  const UpperUpdate_By = userObject?.update_by?.toUpperCase();

  const now_x = new Date();
  const year = now_x.getFullYear();
  const month_x = (now_x.getMonth() + 1).toString().padStart(2, '0');
  const date = now_x.getDate().toString().padStart(2, '0');
  const hours = now_x.getHours().toString().padStart(2, '0');
  const minutes = now_x.getMinutes().toString().padStart(2, '0');
  const update_date = date +'/'+ month_x +'/'+ year +' '+ hours +':'+ minutes;
  const checkDate = date +'/'+ month_x +'/'+ year

  const past7Days = [];
  for (let i = 7; i >= 1; i--) {
    const d = new Date(now_x);
    d.setDate(now_x.getDate() - i);
    past7Days.push(
      d.getDate().toString().padStart(2, '0') +
      '/' +
      (d.getMonth() + 1).toString().padStart(2, '0') +
      '/' +
      d.getFullYear()
    );
  }

  const [isError, setIsError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen_Add, setisModalOpen_Add] = useState(false);
  const [editValues, setEditValues] = useState({});
  const [distinctStockFg, setDistinctStockFg] = useState([]);
  const [distinctProcess, setdistinctProcess] = useState(["ALL PROCESS", "STM", "RSTM", "RSTM2", "RSTM#", "RSTM2#", "RMLLV"]);
  const [distinctProcess_Add, setdistinctProcess_Add] = useState(["STM", "RSTM", "RSTM2", "RSTM#", "RSTM2#", "RMLLV"]);
  const [distinctProduct, setDistinctProduct] = useState([]);
  const [distinctProductSubManual, setDistinctProductSubManual] = useState([]);

  const [selectedProcess, setSelectedProcess] = useState(null);
  const [selectedProcess_add, setSelectedProcess_add] = useState(null);
  const [selectedProduct_add, setSelectedProduct_add] = useState(null);

  const handleProcessChange = (event, newValue) => {
    setSelectedProcess(newValue);
  }
  const handleProcessAddChange = (event, newValue) => {
    setSelectedProcess_add(newValue);
  }
  const handleProductAddChange = (event, newValue) => {
    setSelectedProduct_add(newValue);
  }
  const openModal_Add = () => {
    setisModalOpen_Add(true);
  };
  const closeModal_Add = () => {
    setisModalOpen_Add(false);
  };

  const fetchProduct = async () => {
    try {
      const response = await axios.get(
        "http://10.17.100.115:3001/api/smart_planning/PMC-filter-product-sub-list"
      );
      const dataProduct = response.data;
      setDistinctProduct(dataProduct);
    } catch (error) {
      console.error(`Error fetching distinct data ProductList: ${error}`);
    }
  };
  const fetchProductSUbManual = async () => {
    try {
      const response = await axios.get(
        "http://10.17.100.115:3001/api/smart_planning/PMC-filter-product-sub-maunal"
      );
      const data = response.data;
      setDistinctProductSubManual(data);
    } catch (error) {
      console.error(`Error fetching distinct data ProductList: ${error}`);
    }
  };
  useEffect(() => {
    fetchProduct();
    fetchProductSUbManual();
  }, []);

  const handleSearch = async () => {
    if (!selectedProcess) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning !',
        text: 'Please select Process.',
        confirmButtonColor: '#4E71FF',
      });
      return;
    }
    try {
      setIsLoading(true);
      // console.log(`Fetching data for process: ${selectedProcess}`);
      const response = await axios.get(
        `http://10.17.100.115:3001/api/smart_planning/PMC-filter-stock-fg-production?proc_disp=${selectedProcess}`
      );
      const dataProduct = response.data;
      setDistinctStockFg(dataProduct);
    } catch (error) {
      console.error(`Error fetching distinct data SUS Delivery order: ${error}`);
    } finally {
      setIsLoading(false); 
    }
  };

  const handleAddSub = async () => {
    if (!selectedProduct_add) {
      closeModal_Add();
      setSelectedProcess_add(null);
      Swal.fire({
        icon: 'warning',
        title: 'Warning !',
        text: 'Please select Product.',
        confirmButtonColor: '#4E71FF',
      });
      return;
    }
    // if (!selectedProcess_add) {
    //   closeModal_Add();
    //   setSelectedProduct_add(null);
    //   Swal.fire({
    //     icon: 'warning',
    //     title: 'Warning !',
    //     text: 'Please select Process.',
    //     confirmButtonColor: '#4E71FF',
    //   });
    //   return;
    // }
    closeModal_Add();

    const swalWithZIndex = Swal.mixin({
      customClass: {
          popup: 'my-swal-popup', // Define a custom class for the SweetAlert popup
      },
    });
    swalWithZIndex.fire({
      title: "Confirm Save",
      text: "Are you sure want add this data?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Save",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        
        const url = (`http://10.17.100.115:3001/api/smart_planning/PMC-filter-count-product-sub?prd_name=${selectedProduct_add.product_sub}`);
        axios.get(url)
        .then(response => {
          const data = response.data;

          let Count_Sub = 0;
          if (data && data.length > 0 && data[0]) {
            Count_Sub = data[0].count_sub;
          }
          
          if (Count_Sub > 0) {
            Swal.fire({
                      icon: "warning",
                      title: "Duplicate Data",
                      text: "This Product sub duplicates, Please check again.",
                      confirmButtonText: "OK",
                    });
                setSelectedProduct_add(null);
                setSelectedProcess_add(null);
            return
          } else {
            axios.get(`http://10.17.100.115:3001/api/smart_planning/PMC-insert-product-sub?prd_name=${selectedProduct_add.product_sub}&proc_disp=${selectedProcess_add}&update_by=${UpperUpdate_By}&update_date=${update_date}`)
            .then(() => {
                Swal.fire({
                    icon: "success",
                    title: "Save Success",
                    text: "Product sub saved successfully.",
                    confirmButtonText: "OK",
                });
                setSelectedProduct_add(null);
                setSelectedProcess_add(null);
                fetchProductSUbManual();
                handleSearch();
            })
            .catch((error) => {
                console.error("Error saving data:", error);
                Swal.fire({
                    icon: "error",
                    title: "Save Error",
                    text: "An error occurred while saving data",
                    confirmButtonText: "OK",
                });
            });
          }
        })
      } else {
        openModal_Add();
      }
    });
  };

  const handleClearList = () => {
    setDistinctStockFg([])
    setSelectedProcess(null);
    setEditValues({});
  };

  const handleSaveFg = async () => {
    // เตรียมข้อมูลที่มีการแก้ไข
    const editedRows = Array.from(new Set(distinctStockFg.map(item => item.product_sub))).map(productSub => {
      const productRows = distinctStockFg.filter(item => item.product_sub === productSub);
      const getValue = (type) => {
        const edit = editValues[`${productSub}_${type}`];
        if (edit !== undefined && edit !== '') return edit;
        return productRows.find(item => item.stock_date === type)?.sum_qty ?? '';
      };
      const isEditedRow = ['FA', 'NPM', 'UPD', 'TEST', 'MASS'].some(type => {
        const item = productRows.find(row => row.stock_date === type);
        return (
          editValues[`${productSub}_${type}`] !== undefined &&
          editValues[`${productSub}_${type}`] !== (item?.sum_qty ?? '')
        );
      });
      return {
        productSub,
        productRows,
        getValue,
        isEditedRow,
        rowData: {
          FA: getValue('FA'),
          NPM: getValue('NPM'),
          UPD: getValue('UPD'),
          TEST: getValue('TEST'),
          MASS: getValue('MASS'),
        }
      };
    }).filter(row => row.isEditedRow);

    if (editedRows.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No changes",
        text: "ไม่มีข้อมูลที่ถูกแก้ไข",
      });
      return;
    }

    // แสดง Swal แค่ครั้งเดียว
    const swalWithZIndex = Swal.mixin({
      customClass: {
        popup: 'my-swal-popup',
      },
    });
    const result = await swalWithZIndex.fire({
      title: "Confirm Save",
      text: "Are you sure want to Save all changed data?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Save",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      // วนลูปบันทึกเฉพาะ cell ที่มีการแก้ไข
      for (const row of editedRows) {
        const { productSub, rowData } = row;
        for (const col of ['FA', 'NPM', 'UPD', 'TEST', 'MASS']) {
          // เช็คว่า cell นี้มีการแก้ไขจริงหรือไม่
          const item = row.productRows.find(r => r.stock_date === col);
          if (
            editValues[`${productSub}_${col}`] !== undefined &&
            editValues[`${productSub}_${col}`] !== (item?.sum_qty ?? '')
          ) {
            const urlWip = `http://10.17.100.115:3001/api/smart_planning/PMC-filter-wip-prd-main-sub?prd_sub=${productSub}`;
            const response = await axios.get(urlWip);
            const data = response.data;
            for (const item of data) {
              // console.log('product' , item.product);
              // console.log('product_sub' , item.product_sub);
              const url = `http://10.17.100.115:3001/api/smart_planning/PMC-count-prd-main-sub-history?product_main=${item.product}&product_sub=${item.product_sub}&date_stock=${checkDate}`;
              try {
                const response = await axios.get(url);
                const Count_W = response.data[0]?.count_w || 0;
                if (Count_W == 0) {
                  await axios.get(
                    `http://10.17.100.115:3001/api/smart_planning/PMC-insert-prd-main-sub-history?product_main=${item.product}&product_sub=${item.product_sub}&date_stock=${checkDate}`
                  );
                }
              } catch (error) {
                console.error("There was an error updating/inserting the plan!", error);
              }
            }

            // ตรวจสอบว่ามีข้อมูลเดิมหรือไม่
            const urlCheck = `http://10.17.100.115:3001/api/smart_planning/PMC-filter-count-fg-production?prd_name=${productSub}&stock_type=${col}`;
            try {
              const response = await axios.get(urlCheck);
              const Count_fg = response.data[0]?.count_fg || 0;
              if (Count_fg > 0) {
                // update
                await axios.get(
                  `http://10.17.100.115:3001/api/smart_planning/PMC-update-fg-production?prd_name=${productSub}&stock_type=${col}&stock_qty=${rowData[col]}&update_by=${UpperUpdate_By}&update_date=${update_date}`
                );
              } else {
                // insert
                await axios.get(
                  `http://10.17.100.115:3001/api/smart_planning/PMC-insert-fg-production?prd_name=${productSub}&stock_type=${col}&stock_qty=${rowData[col]}&update_by=${UpperUpdate_By}&update_date=${update_date}&stock_date=${checkDate}`
                );
              }
            } catch (error) {
              console.error("There was an error updating/inserting the plan!", error);
            }
          }
        }
      }
      // refresh ข้อมูล
      handleSearch();
      setEditValues({});
      Swal.fire({
        icon: "success",
        title: "Save Success",
        text: "Stock FG Outer saved successfully",
        timer: 1500, // ปิดเองใน 1.5 วินาที
        confirmButtonText: "OK",
        showConfirmButton: false
      });
    }
  };

  const handleClear = () => {
    if (selectedProcess !== null){
      handleSearch();
    }
    setEditValues({});
  };

  const exportToExcel = async () => {
    if (!distinctStockFg || distinctStockFg.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning !',
        text: 'No data available to export.',
        confirmButtonColor: '#4E71FF',
      });
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('FG Stock');

    // Header
    const headers = [
      "Product name",
      ...past7Days,
      "FA", "NPM", "UPD", "TEST", "MASS", "TOTAL", "UPDATE BY", "LAST UPDATE"
    ];
    worksheet.addRow(headers);

    // Style header
    const headerRow = worksheet.getRow(1);
    headerRow.height = 30;
    headerRow.eachCell((cell, colNumber) => {
      // Product name
      if (colNumber === 1) {
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFF' } }; // ฟอนต์ขาว
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'AED2FF' }
        };
      }
      // วันที่ย้อนหลัง 7 วัน
      else if (colNumber > 1 && colNumber <= 1 + past7Days.length) {
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '000000' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'AED2FF' }
        };
      }
      // FA, NPM, UPD, TEST, MASS, TOTAL, UPDATE BY, LAST UPDATE
      else {
        cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: '000000' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '00FF9C' }
        };
      }
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Data rows
    Array.from(new Set(distinctStockFg.map(item => item.product_sub))).forEach(productSub => {
      const productRows = distinctStockFg.filter(item => item.product_sub === productSub);

      // 7 days
      const dateCols = past7Days.map(dateStr => {
        const found = productRows.find(item => {
          if (!item.stock_date) return "";
          if (/^\d{4}-\d{2}-\d{2}$/.test(item.stock_date)) {
            const [y, m, d] = item.stock_date.split('-');
            const stockDateStr = `${d}/${m}/${y}`;
            return stockDateStr === dateStr;
          }
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(item.stock_date)) {
            return item.stock_date === dateStr;
          }
          return false;
        });
        return found ? found.sum_qty : "-";
      });

      // FA, NPM, UPD, TEST, MASS
      const types = ["FA", "NPM", "UPD", "TEST", "MASS"];
      const typeCols = types.map(type => {
        const item = productRows.find(row => row.stock_date === type);
        return editValues[`${productSub}_${type}`] !== undefined
          ? editValues[`${productSub}_${type}`]
          : (item?.sum_qty ?? "");
      });

      // TOTAL
      const getValue = (type) => {
        const edit = editValues[`${productSub}_${type}`];
        if (edit !== undefined && edit !== "") return Number(edit);
        return Number(productRows.find(item => item.stock_date === type)?.sum_qty) || 0;
      };
      const total = types.reduce((sum, type) => sum + getValue(type), 0);

      // UPDATE BY, LAST UPDATE
      const updateBy = productRows.find(item => item.stock_date === "UPDATE BY")?.sum_qty || "-";
      const lastUpdate = productRows.find(item => item.stock_date === "LAST UPDATE")?.sum_qty || "-";

      worksheet.addRow([
        productSub,
        ...dateCols,
        ...typeCols,
        total > 0 ? total : "-",
        updateBy,
        lastUpdate
      ]);
    });

    // Style data rows
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        cell.font = { name: 'Calibri', size: 10 };
        cell.alignment = { horizontal: rowNumber === 1 ? 'center' : (colNumber === 1 ? 'left' : 'center'), vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        // Highlight FA,NPM,UPD,TEST,MASS,TOTAL if value > 0
        if (rowNumber > 1 && colNumber >= past7Days.length + 2 && colNumber <= past7Days.length + 7) {
          const value = cell.value;
          if (value !== '-' && !isNaN(Number(value)) && Number(value) > 0) {
            cell.font = { ...cell.font, color: { argb: '0000FF' } }; // blue
          }
        }
      });
    });

    // Set column width
    worksheet.getColumn(1).width = 20;
    for (let i = 2; i <= headers.length - 2; i++) {
      worksheet.getColumn(i).width = 10;
    }
    worksheet.getColumn(headers.length - 1).width = 20; // UPDATE BY
    worksheet.getColumn(headers.length).width = 20; // LAST UPDATE

    // Export
    const buffer = await workbook.xlsx.writeBuffer();
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const date = now.getDate().toString().padStart(2, '0');
    const formattedDateTime = year + month + date;
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `FG_Stock_Production_${selectedProcess}_${formattedDateTime}.xlsx`);
  };

  const handleDelete = async (row) => {
    closeModal_Add();
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete "${row.prd_sub}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        await axios.get(
          `http://10.17.100.115:3001/api/smart_planning/PMC-delete-product-sub?prd_sub=${row.prd_sub}&update_by=${row.update_by}&update_date=${row.update_date}`
        );
        fetchProductSUbManual();
        handleSearch();
        Swal.fire('Deleted!', 'The item has been deleted.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'Failed to delete item.', 'error');
      }
    } else {
      openModal_Add();
    }
  };

  return (
    <>
      <div className="background-container">
          <Box>
            <Nav/>
            <div style={{width: 1800 , display: "flex", flexDirection: "row", marginTop: 40,}}>
              {/* <label htmlFor="">From Product :</label> */}
              <Autocomplete
                  disablePortal
                  id="combo-box-demo-product"
                  size="small"
                  options={distinctProcess}
                  getOptionLabel={(option) => option}
                  value={selectedProcess}
                  onChange={handleProcessChange}
                  sx={{ width: 230, height: 50 }}
                  renderInput={(params) => (
                    <TextField {...params} label="Process" />
                  )}
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
                  onClick={handleClearList} 
                  style={{backgroundColor: 'orange', color:'black', width: '120px', height: '40px' , marginLeft: '10px', borderRadius: 10, boxShadow: '3px 3px 5px grey'}}>
                  Cancel 
              </Button>
              <Button 
                  className="btn_hover" 
                  variant="contained" 
                  startIcon={<TableChartIcon />} 
                  onClick={exportToExcel} 
                  style={{backgroundColor: 'green', color:'white', width: '130px', height: '40px' , marginLeft: '10px', borderRadius: 10, boxShadow: '3px 3px 5px grey'}}>
                  To Excel 
              </Button>
              <div style={{ flex: 1 }} />
              <Button 
                  className="btn_hover" 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  onClick={openModal_Add} 
                  style={{backgroundColor: '#3D365C', color:'white', width: '140px', height: '40px' , marginLeft: '10px', borderRadius: 10, boxShadow: '3px 3px 5px grey',}}>
                  Add more
              </Button>
            </div>
            
            <div style={{ width: 1830, height: 670, overflow: 'auto', border: '1px solid black', }}>
              {isLoading ? (
                  <Custom_Progress />
              ) : (
                <table style={{width: 1800, borderCollapse: 'collapse', boxShadow: '0px 4px 16px rgba(31, 38, 135, 0.12)',}}>
                <thead style={{fontSize: 16, position: 'sticky', }}>
                  <tr>
                    <th
                        style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        textAlign: "center",
                        backgroundColor: "#4E31AA",
                        width: "130px",
                        border: 'solid white 1px',
                        color: 'white',
                        height: "40px",   
                        }}
                    >
                        Product name
                    </th>
                    {past7Days.map((date, idx) => (
                      <th
                        key={date}
                        style={{
                          position: "sticky",
                          top: 0,
                          zIndex: 2,
                          textAlign: "center",
                          backgroundColor: "#AED2FF",
                          width: "70px",
                          border: 'solid black 1px',
                          color: 'black',
                          height: "40px",   
                          fontWeight: 'normal',
                        }}
                      >
                        {date}
                      </th>
                    ))}
                    <th
                        style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        textAlign: "center",
                        backgroundColor: "#00FF9C",
                        width: "60px",
                        border: 'solid black 1px',
                        color: 'black',
                        height: "40px",   
                        fontWeight: 'normal',
                        }}
                    >
                        FA
                    </th>
                    <th
                        style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        textAlign: "center",
                        backgroundColor: "#00FF9C",
                        width: "60px",
                        border: 'solid black 1px',
                        color: 'black',
                        height: "40px",   
                        fontWeight: 'normal',
                        }}
                    >
                        NPM
                    </th>
                    <th
                        style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        textAlign: "center",
                        backgroundColor: "#00FF9C",
                        width: "60px",
                        border: 'solid black 1px',
                        color: 'black',
                        height: "40px",   
                        fontWeight: 'normal',
                        }}
                    >
                        UPD
                    </th>
                    <th
                        style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        textAlign: "center",
                        backgroundColor: "#00FF9C",
                        width: "60px",
                        border: 'solid black 1px',
                        color: 'black',
                        height: "40px",   
                        fontWeight: 'normal',
                        }}
                    >
                        TEST
                    </th>
                    <th
                        style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        textAlign: "center",
                        backgroundColor: "#00FF9C",
                        width: "60px",
                        border: 'solid black 1px',
                        color: 'black',
                        height: "40px",   
                        fontWeight: 'normal',
                        }}
                    >
                        MASS
                    </th>
                    <th
                        style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        textAlign: "center",
                        backgroundColor: "#00FF9C",
                        width: "60px",
                        border: 'solid black 1px',
                        color: 'black',
                        height: "40px",   
                        fontWeight: 'normal',
                        }}
                    >
                        TOTAL
                    </th>
                    <th
                        style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        textAlign: "center",
                        backgroundColor: "#00FF9C",
                        width: "100px",
                        border: 'solid black 1px',
                        color: 'black',
                        height: "40px",   
                        fontWeight: 'normal',
                        }}
                    >
                        UPDATE BY
                    </th>
                    <th
                        style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        textAlign: "center",
                        backgroundColor: "#00FF9C",
                        width: "120px",
                        border: 'solid black 1px',
                        color: 'black',
                        height: "40px",   
                        fontWeight: 'normal',
                        }}
                    >
                        LAST UPDATE
                    </th>
                    
                  </tr>
                </thead>
                <tbody style={{fontSize: 14 , textAlign: 'center'}}>
                  {/* แสดงข้อมูลแต่ละ product_sub ในแต่ละแถว */}
                  {Array.from(new Set(distinctStockFg.map(item => item.product_sub))).map((productSub, idx) => {
                    // filter ข้อมูลของแต่ละ product_sub
                    const productRows = distinctStockFg.filter(item => item.product_sub === productSub);
                    return (
                      <tr key={productSub}>
                        {/* คอลัมน์แรก: Product name (ใช้ product_sub) */}
                        <td
                          style={{
                            border: 'solid black 1px',
                            textAlign: 'left',
                            height: "30px",
                            paddingLeft: 10,
                          }}
                        >
                          {productSub}
                        </td>
                        {/* คอลัมน์วันที่ย้อนหลัง 7 วัน */}
                        {past7Days.map(dateStr => {
                          // หา stock_qty ที่ตรงกับวันที่นี้
                          const found = productRows.find(item => {
                          if (!item.stock_date) return false;
                          // ตรวจสอบว่า stock_date เป็น YYYY-MM-DD จริงหรือไม่
                          if (/^\d{4}-\d{2}-\d{2}$/.test(item.stock_date)) {
                            const [y, m, d] = item.stock_date.split('-');
                            const stockDateStr = `${d}/${m}/${y}`;
                            return stockDateStr === dateStr;
                          }
                          // ถ้าเป็น DD/MM/YYYY อยู่แล้ว
                          if (/^\d{2}\/\d{2}\/\d{4}$/.test(item.stock_date)) {
                            return item.stock_date === dateStr;
                          }
                          return false;
                        });
                          return (
                            <td
                              key={dateStr}
                              style={{
                                border: 'solid black 1px',
                                textAlign: 'center',
                                height: "30px",
                              }}
                            >
                              {found ? found.sum_qty : '-'}
                            </td>
                          );
                        })}
                        {/* เพิ่มคอลัมน์อื่นๆ ตามต้องการ */}
                        {['FA', 'NPM', 'UPD', 'TEST', 'MASS'].map((type) => {
                          // หาแถวข้อมูลเดิม
                          const item = productRows.find(row => row.stock_date === type);
                          // ใช้ useState สำหรับเก็บค่าที่แก้ไข (ควรย้ายไปไว้ข้างบน component)
                          // const [editValues, setEditValues] = useState({});
                          // ตรวจสอบว่ามีการแก้ไขหรือไม่
                          const isEdited = editValues[`${productSub}_${type}`] !== undefined && editValues[`${productSub}_${type}`] !== (item?.sum_qty ?? '');

                          return (
                            <td key={type} style={{ border: 'solid black 1px', width: "60px", }}>
                              <input
                                type="text"
                                value={editValues[`${productSub}_${type}`] !== undefined ? editValues[`${productSub}_${type}`] : (item?.sum_qty ?? '')}
                                style={{
                                  width: '90%',
                                  height: '30px',
                                  textAlign: 'center',
                                  background: isEdited ? '#FFA500' : '#FFF1DB',
                                  // border: 'none',
                                  // outline: 'none',
                                }}
                                onChange={e => {
                                  setEditValues(prev => ({
                                    ...prev,
                                    [`${productSub}_${type}`]: e.target.value
                                  }));
                                }}
                              />
                            </td>
                          );
                        })}
                        {/* <td style={{border: 'solid black 1px'}}>
                          {
                            (() => {
                              const fa = Number(productRows.find(item => item.stock_date === 'FA')?.sum_qty) || 0;
                              const npm = Number(productRows.find(item => item.stock_date === 'NPM')?.sum_qty) || 0;
                              const upd = Number(productRows.find(item => item.stock_date === 'UPD')?.sum_qty) || 0;
                              const test = Number(productRows.find(item => item.stock_date === 'TEST')?.sum_qty) || 0;
                              const mass = Number(productRows.find(item => item.stock_date === 'MASS')?.sum_qty) || 0;
                              const total = fa + npm + upd + test + mass;
                              return total > 0 ? total : '-';
                            })()
                          }
                        </td> */}
                        {/* <td style={{border: 'solid black 1px',}}>
                          {
                            (() => {
                              // ใช้ค่าจาก editValues ถ้ามีการแก้ไข, ถ้าไม่มีก็ใช้ค่าจากฐานข้อมูล
                              const getValue = (type) => {
                                const edit = editValues[`${productSub}_${type}`];
                                if (edit !== undefined && edit !== '') return Number(edit);
                                return Number(productRows.find(item => item.stock_date === type)?.sum_qty) || 0;
                              };
                              const fa = getValue('FA');
                              const npm = getValue('NPM');
                              const upd = getValue('UPD');
                              const test = getValue('TEST');
                              const mass = getValue('MASS');
                              const total = fa + npm + upd + test + mass;
                              return total > 0 ? total : '-';
                            })()
                          }
                        </td> */}
                        <td
                          style={{
                            border: 'solid black 1px',
                            backgroundColor: (
                              ['FA', 'NPM', 'UPD', 'TEST', 'MASS'].some(type => {
                                const item = productRows.find(row => row.stock_date === type);
                                return (
                                  editValues[`${productSub}_${type}`] !== undefined &&
                                  editValues[`${productSub}_${type}`] !== (item?.sum_qty ?? '')
                                );
                              })
                            ) ? '#FFA500' : undefined
                          }}
                        >
                          {
                            (() => {
                              // ใช้ค่าจาก editValues ถ้ามีการแก้ไข, ถ้าไม่มีก็ใช้ค่าจากฐานข้อมูล
                              const getValue = (type) => {
                                const edit = editValues[`${productSub}_${type}`];
                                if (edit !== undefined && edit !== '') return Number(edit);
                                return Number(productRows.find(item => item.stock_date === type)?.sum_qty) || 0;
                              };
                              const fa = getValue('FA');
                              const npm = getValue('NPM');
                              const upd = getValue('UPD');
                              const test = getValue('TEST');
                              const mass = getValue('MASS');
                              const total = fa + npm + upd + test + mass;
                              return total > 0 ? total : '-';
                            })()
                          }
                        </td>
                        <td style={{border: 'solid black 1px'}}>
                          {
                            (productRows.find(item => item.stock_date === 'UPDATE BY')?.sum_qty) || '-'
                          }
                        </td>
                        <td style={{border: 'solid black 1px'}}>
                          {
                            (productRows.find(item => item.stock_date === 'LAST UPDATE')?.sum_qty) || '-'
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              )}
            </div>
            <Button
                className="btn_hover" 
                  variant="contained"
                  endIcon={<SaveAltIcon />}
                  fontSize="large"
                  style={{
                    width: "120px",
                    height: 40,
                    marginTop: '15px',
                    borderRadius: 10, 
                    boxShadow: '3px 3px 5px grey',
                    backgroundColor: 'green',
                    color: 'white',
                  }}
                  onClick={() => {
                    handleSaveFg();
                  }}
              >
                  Submit
              </Button> 
              <Button 
                className="btn_hover" 
                variant="contained" 
                startIcon={<CancelIcon />} 
                onClick={handleClear} 
                style={{marginTop: '15px', 
                        backgroundColor: 'orange', 
                        color:'black', 
                        width: '120px', 
                        height: '40px' , 
                        marginLeft: '10px', 
                        borderRadius: 10, 
                        boxShadow: '3px 3px 5px grey'}}
              >
                Cancel 
              </Button>
          </Box>
          <Modal
            open={isModalOpen_Add}
            onClose={closeModal_Add}
            aria-labelledby="key-weight-modal-title"
            aria-describedby="key-weight-modal-description"
          >
            <Box sx={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 525 , height: 570 , bgcolor: '#CAF4FF', boxShadow: 24, p: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' , height: 20 , marginBottom: 20}}>
                  <div style={{width: '100%' ,fontWeight: 'bold' , fontSize: 20 , textAlign: 'center' }}>
                      <label htmlFor="" >ADD MORE PRODUCT SUB</label>
                  </div>
                  <div>
                      <IconButton onClick={closeModal_Add} style={{position: 'absolute', top: '10px', right: '10px',}}>
                          <CloseIcon style={{fontSize: '25px', color: 'white', backgroundColor: '#E55604'}} /> 
                      </IconButton>
                  </div>
              </div>
              <div style={{ height: 180 , backgroundColor: '#E4FBFF' ,  }}>
                  <div style={{paddingTop: 20, paddingLeft: 20, display: 'flex', flexDirection: 'row', gap: 4, mb: 3, justifyContent: 'left'}}>
                    <Autocomplete
                      disablePortal
                      // freeSolo
                      id="combo-box-demo-product"
                      size="medium"
                      options={distinctProduct}
                      getOptionLabel={(option) => option && option.product_sub}
                      value={selectedProduct_add}
                      onChange={handleProductAddChange}
                     sx={{ width: '95%', height: 56, backgroundColor: 'white', mb: 1 }}
                      renderInput={(params) => (
                        <TextField {...params} label="Product Sub" sx={{ height: 56 }}/>
                      )}
                      isOptionEqualToValue={(option, value) =>
                        option && value && option.product_sub === value.product_sub
                      }
                    />
                  </div>
                  
                  <div style={{paddingTop: 20, paddingLeft: 20, display: 'flex', flexDirection: 'row', gap: 4, mb: 3, }}>
                    <TextField
                      disabled
                      id="outlined-disabled"
                      label="Update By"
                      value={UpperUpdate_By}
                      // onChange={handleUSystemNameChange}
                      style={{backgroundColor: '#EEF5FF' , width: 235, height: 56, mb: 1, mr: 2.5 }}
                    />

                    <TextField
                      disabled
                      id="outlined-disabled"
                      label="Update Date"
                      value={update_date}
                      // onChange={handleUSystemNameChange}
                      style={{backgroundColor: '#EEF5FF' , width: 235, height: 56, marginLeft: 10 }}
                    />
                  </div>
              </div>
              


              <div style={{backgroundColor:'#F5F5F5', height: 290, marginTop: 15, overflow: 'auto', boxShadow: '0px 4px 16px rgba(31, 38, 135, 0.12)', }}>
                <table style={{borderCollapse: 'collapse', }}>
                  <thead style={{fontSize: 14, position: 'sticky', }}>
                    <tr>
                      <th
                        style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        textAlign: "center",
                        backgroundColor: "#4E31AA",
                        width: "160px",
                        border: 'solid white 1px',
                        color: 'white',
                        height: "30px",   
                        }}
                      >
                        Product name
                      </th>
                      <th
                        style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        textAlign: "center",
                        backgroundColor: "#4E31AA",
                        width: "135px",
                        border: 'solid white 1px',
                        color: 'white',
                        height: "30px",   
                        }}
                      >
                        Update By
                      </th>
                      <th
                        style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        textAlign: "center",
                        backgroundColor: "#4E31AA",
                        width: "145px",
                        border: 'solid white 1px',
                        color: 'white',
                        height: "30px",   
                        }}
                      >
                        Update Date
                      </th>
                      <th
                        style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        textAlign: "center",
                        backgroundColor: "#4E31AA",
                        width: "85px",
                        border: 'solid white 1px',
                        color: 'white',
                        height: "30px",   
                        }}
                      >
                        Delete
                      </th>
                    </tr>
                  </thead>
                  <tbody style={{fontSize: 14}}>
                    {distinctProductSubManual && distinctProductSubManual.length > 0 ? (
                      distinctProductSubManual.map((row, idx) => (
                        <tr key={row.prd_sub + idx}>
                          <td style={{border: '1px solid black', paddingLeft: 7}}>{row.prd_sub}</td>
                          <td style={{border: '1px solid black', textAlign: 'center'}}>{row.update_by}</td>
                          <td style={{border: '1px solid black', textAlign: 'center'}}>{row.update_date}</td>
                          <td style={{border: '1px solid black', textAlign: 'center'}}>
                            <CancelIcon
                              className="btn_hover"
                              onClick={() => handleDelete(row)} // ใส่ฟังก์ชันที่ต้องการ
                              style={{ cursor: 'pointer', color: 'red'}}
                              tabIndex={0}
                              role="button"
                              aria-label="Cancel"
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{textAlign: 'center', color: '#888'}}>No data</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div style={{display: 'flex', justifyContent: 'flex-end' , marginTop: 15 , height: 45 }}>
                <Button variant="contained" startIcon={<CancelIcon />} onClick={closeModal_Add} className="btn_hover" style={{backgroundColor: 'lightgray' , color: 'black' , width: 120 , height: 40 , marginRight: 10 , boxShadow: '3px 3px 5px grey'}}>
                    Cancel 
                </Button>
                <Button variant="contained" endIcon={<AddToPhotosIcon />} onClick={handleAddSub} className="btn_hover" style={{backgroundColor: 'lightgreen' , color: 'black' , width: 120 , height: 40 , boxShadow: '3px 3px 5px grey'}}>
                    SAVE
                </Button>
              </div>
            </Box>
          </Modal>
      </div>
    </>
  );
}