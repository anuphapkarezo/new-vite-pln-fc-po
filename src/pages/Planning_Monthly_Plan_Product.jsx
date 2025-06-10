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

export default function Planning_Monthly_Plan_Product({ onSearch }) {
  localStorage.setItem('page_name', 'Monthly Plan');

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
  for (let i = 0; i < 7; i++) {
    const d = new Date(now_x);
    d.setDate(now_x.getDate() + i);
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

  const [selectedFromProduct, setSelectedFromProduct] = useState(null);
  const [selectedToProduct, setSelectedToProduct] = useState(null);

  const [distinctProduct, setDistinctProduct] = useState([]);
  const [distinctMonthlyPlan, setDistinctMonthlyPlan] = useState([]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(
        "http://10.17.100.115:3001/api/smart_planning/PMC-filter-product-list-monthly-plan"
      );
      const dataProduct = response.data;
      setDistinctProduct(dataProduct);
    } catch (error) {
      console.error(`Error fetching distinct data ProductList: ${error}`);
    }
  };
  
  useEffect(() => {
    fetchProduct();
  }, [selectedFromProduct, selectedToProduct,]);

  const handleFromProductChange = (event, newValue) => {
    setSelectedFromProduct(newValue);
    setSelectedToProduct(newValue);
  };
  const handleToProductChange = (event, newValue) => {
    setSelectedToProduct(newValue);
  };

  const handleSearch = async () => {
    const fromPrd = selectedFromProduct?.prd_name?.trim() || '';
    const toPrd = selectedToProduct?.prd_name?.trim() || '';
    if (fromPrd === '' && toPrd === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Warning !',
        text: 'Please select FromProduct & ToProduct.',
        confirmButtonColor: '#4E71FF',
      });
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.get(`http://10.17.100.115:3001/api/smart_planning/PMC-filter-monthly-plan-product?fromPrd=${fromPrd}&toPrd=${toPrd}`);
      const data  = response.data;
      // เพิ่มฟังก์ชันนี้ไว้ก่อน setDistinctMonthlyPlan
      const transformMonthlyPlan = (data) => {
        const map = {};
        data.forEach(item => {
          const key = `${item.prd_name}|${item.process}|${item.prd_item}|${item.prd_category}`;
          if (!map[key]) {
            map[key] = {
              prd_name: item.prd_name,
              process: item.process,
              prd_item: item.prd_item,
              prd_category: item.prd_category,
              plan: []
            };
          }
          map[key].plan.push({
            eff_date: item.eff_date,
            plan_lot_qty: item.plan_lot_qty,
            actual_lot_qty: item.actual_lot_qty
          });
        });
        return Object.values(map);
      };
      setDistinctMonthlyPlan(transformMonthlyPlan(data));
    } catch (error) {
      console.error(`Error fetching distinct data SUS Delivery order: ${error}`);
    } finally {
      setIsLoading(false); 
    }
  };

  const handleClear = () => {
    setDistinctMonthlyPlan([]);
    setSelectedFromProduct(null);
    setSelectedToProduct(null);
  };

  // ฟังก์ชันรวมข้อมูลที่ซ้ำกัน
  const mergeMonthlyPlan = (data) => {
    const map = {};
    data.forEach(row => {
      const key = `${row.prd_name}|${row.process}|${row.prd_item}|${row.prd_category}`;
      if (!map[key]) {
        map[key] = { ...row, plan: [...(row.plan || [])] };
      } else {
        // รวม plan array
        map[key].plan = [...map[key].plan, ...(row.plan || [])];
      }
    });
    // ลบ plan ที่ eff_date ซ้ำกัน ให้เหลืออันล่าสุด
    Object.values(map).forEach(row => {
      if (row.plan) {
        const planMap = {};
        row.plan.forEach(p => {
          planMap[p.eff_date] = p; // ถ้ามี eff_date ซ้ำ จะเก็บอันล่าสุด
        });
        row.plan = Object.values(planMap);
      }
    });
    return Object.values(map);
  };

  const handleExportToExcel = async () => {
    if (!distinctMonthlyPlan || distinctMonthlyPlan.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning !',
        text: 'No data available to export.',
        confirmButtonColor: '#4E71FF',
      });
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('MonthlyPlan');

    // สร้าง header 2 บรรทัด
    const firstRow = [
      'Product', 'Process', 'Project', 'Category',
      ...past7Days.flatMap(date => [date, ''])
    ];
    const secondRow = [
      '', '', '', '',
      ...past7Days.flatMap(() => ['PLAN', 'ACTUAL'])
    ];

    worksheet.addRow(firstRow);
    worksheet.addRow(secondRow);

    // Merge cell สำหรับหัวตารางหลัก
    worksheet.mergeCells(1, 1, 2, 1); // Product
    worksheet.mergeCells(1, 2, 2, 2); // Process
    worksheet.mergeCells(1, 3, 2, 3); // Project
    worksheet.mergeCells(1, 4, 2, 4); // Category

    // Merge cell สำหรับวันที่
    for (let i = 0; i < past7Days.length; i++) {
      const startCol = 5 + i * 2;
      worksheet.mergeCells(1, startCol, 1, startCol + 1);
    }

    // กำหนดความกว้างคอลัมน์
    worksheet.getColumn(1).width = 15; // Product
    worksheet.getColumn(2).width = 10; // Process
    worksheet.getColumn(3).width = 10; // Project
    worksheet.getColumn(4).width = 10; // Category
    for (let i = 5; i < 5 + past7Days.length * 2; i++) {
      worksheet.getColumn(i).width = 8; // วันที่
    }

    // สไตล์ header
    [1, 2].forEach(rowNum => {
      const row = worksheet.getRow(rowNum);
      row.height = 30;
      row.eachCell((cell, colNumber) => {
        // เฉพาะคอลัมน์ 1-4 (Product, Process, Project, Category)
        if (colNumber >= 1 && colNumber <= 4) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '4E31AA' } // พื้นหลังม่วงเข้ม
          };
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFFFFF' } }; // ฟอนต์ขาว
        } else {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: rowNum === 1 ? 'AED2FF' : 'E0EDFF' }
          };
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: '000000' } };
        }
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });
    });

    // สร้างข้อมูล row
    mergeMonthlyPlan(distinctMonthlyPlan).forEach(row => {
      const base = [
        row.prd_name,
        row.process,
        row.prd_item,
        row.prd_category
      ];
      const dayData = past7Days.flatMap(date => {
        const planData = Array.isArray(row.plan)
          ? row.plan.find(
              (item) =>
                (item.eff_date || '').trim() === date.trim()
            )
          : null;
        return [
          planData && Number(planData.plan_lot_qty) !== 0
            ? planData.plan_lot_qty
            : "-",
          planData && Number(planData.actual_lot_qty) !== 0
            ? planData.actual_lot_qty
            : "-"
        ];
      });
      const excelRow = worksheet.addRow([...base, ...dayData]);

      // จัดข้อความ Product, Process ชิดซ้าย
      excelRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
      excelRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };

      // สไตล์ border และฟอนต์
      excelRow.eachCell((cell, colNumber) => {
        cell.font = { name: 'Calibri', size: 10 };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = cell.alignment || { horizontal: 'center', vertical: 'middle' };

        // เปลี่ยนสีฟอนต์เป็นน้ำเงินถ้าค่ามากกว่า 0 ในคอลัมน์ PLAN/ACTUAL
        if (colNumber >= 5) {
          const value = cell.value;
          if (value !== '-' && !isNaN(Number(value)) && Number(value) > 0) {
            cell.font = { ...cell.font, color: { argb: '0000FF' } }; // น้ำเงิน
          }
        }
      });
    });

    // Save the Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const date = now.getDate().toString().padStart(2, '0');
    const formattedDateTime = year + month + date;
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `MonthlyPlan_${formattedDateTime}.xlsx`);
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
                  // freeSolo
                  id="combo-box-demo-product"
                  size="small"
                  options={distinctProduct}
                  getOptionLabel={(option) => option && option.prd_name}
                  value={selectedFromProduct}
                  onChange={handleFromProductChange}
                  sx={{ width: 230, height: 50 }}
                  renderInput={(params) => (
                    <TextField {...params} label="From Product" />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option && value && option.prd_name === value.prd_name
                  }
              />
              <Autocomplete
                  disablePortal
                  // freeSolo
                  id="combo-box-demo-product"
                  size="small"
                  options={distinctProduct}
                  getOptionLabel={(option) => option && option.prd_name}
                  value={selectedToProduct}
                  onChange={handleToProductChange}
                  sx={{ width: 230, height: 50, marginLeft: 2, }}
                  renderInput={(params) => (
                    <TextField {...params} label="To Product" />
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option && value && option.prd_name === value.prd_name
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
                  onClick={handleExportToExcel} 
                  style={{backgroundColor: 'green', color:'white', width: '130px', height: '40px' , marginLeft: '10px', borderRadius: 10, boxShadow: '3px 3px 5px grey'}}>
                  To Excel 
              </Button>
            </div>
            
            <div style={{ width: 1830, height: 700, overflow: 'auto', border: '1px solid black', }}>
              {isLoading ? (
                  <Custom_Progress />
              ) : (
                <table style={{width: 1800, borderCollapse: 'collapse', boxShadow: '0px 4px 16px rgba(31, 38, 135, 0.12)',}}>
                  <thead style={{fontSize: 16, position: 'sticky', }}>
                    <tr>
                      <th rowSpan={2}
                          style={{
                            position: "sticky",
                            top: 0,
                            zIndex: 2,
                            textAlign: "center",
                            backgroundColor: "#4E31AA",
                            width: "120px",
                            border: 'solid white 1px',
                            color: 'white',
                            height: "40px",   
                          }}
                      >
                        Product
                      </th>
                      <th rowSpan={2}
                          style={{
                            position: "sticky",
                            top: 0,
                            zIndex: 2,
                            textAlign: "center",
                            backgroundColor: "#4E31AA",
                            width: "100px",
                            border: 'solid white 1px',
                            color: 'white',
                            height: "40px",   
                          }}
                      >
                        Process
                      </th>
                      <th rowSpan={2}
                          style={{
                            position: "sticky",
                            top: 0,
                            zIndex: 2,
                            textAlign: "center",
                            backgroundColor: "#4E31AA",
                            width: "60px",
                            border: 'solid white 1px',
                            color: 'white',
                            height: "40px",   
                          }}
                      >
                        Project
                      </th>
                      <th rowSpan={2}
                          style={{
                            position: "sticky",
                            top: 0,
                            zIndex: 2,
                            textAlign: "center",
                            backgroundColor: "#4E31AA",
                            width: "60px",
                            border: 'solid white 1px',
                            color: 'white',
                            height: "40px",   
                          }}
                      >
                        Category
                      </th>
                      {past7Days.map((date, idx) => (
                        <th
                          key={date}
                          colSpan={2}
                          style={{
                            position: "sticky",
                            top: 0,
                            zIndex: 2,
                            textAlign: "center",
                            backgroundColor: "#AED2FF",
                            width: "140px",
                            border: 'solid black 1px',
                            color: 'black',
                            height: "40px",   
                            fontWeight: 'normal',
                          }}
                        >
                          {date}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      {past7Days.map((date, idx) => (
                        <React.Fragment key={date + "_sub"}>
                          <th
                            style={{
                              position: "sticky",
                              top: 40,
                              zIndex: 2,
                              textAlign: "center",
                              backgroundColor: "#E0EDFF",
                              width: "70px",
                              border: 'solid black 1px',
                              color: 'black',
                              height: "30px",
                              fontWeight: 'normal',
                            }}
                          >
                            PLAN
                          </th>
                          <th
                            style={{
                              position: "sticky",
                              top: 40,
                              zIndex: 2,
                              textAlign: "center",
                              backgroundColor: "#E0EDFF",
                              width: "70px",
                              border: 'solid black 1px',
                              color: 'black',
                              height: "30px",
                              fontWeight: 'normal',
                            }}
                          >
                            ACTUAL
                          </th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody style={{fontSize: 14 , textAlign: 'center'}}>
                    {distinctMonthlyPlan.length === 0 ? (
                      <tr>
                        {/* <td colSpan={4 + past7Days.length * 2}></td> */}
                      </tr>
                    ) : (
                      mergeMonthlyPlan(distinctMonthlyPlan).map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          <td style={{border: 'solid black 1px', 
                                        textAlign: 'left',
                                        paddingLeft: '10px',
                                      }}>
                            {row.prd_name}
                          </td>
                          <td style={{border: 'solid black 1px', 
                                        textAlign: 'left',
                                        paddingLeft: '10px',
                                      }}>
                            {row.process}
                          </td>
                          <td style={{border: 'solid black 1px', 
                                        textAlign: 'center',
                                      }}>
                            {row.prd_item}
                          </td>
                          <td style={{border: 'solid black 1px', 
                                        textAlign: 'center',
                                      }}>
                            {row.prd_category}
                          </td>
                          {past7Days.map((date, idx) => {
                            const planData = Array.isArray(row.plan)
                              ? row.plan.find(
                                  (item) =>
                                    (item.eff_date || '').trim() === date.trim()
                                )
                              : null;
                            return (
                              <React.Fragment key={date}>
                                <td style={{border: 'solid black 1px', 
                                            textAlign: 'center',
                                            color: planData && Number(planData.plan_lot_qty) !== 0 ? 'blue' : 'black',
                                          }}>
                                  {planData && Number(planData.plan_lot_qty) !== 0
                                    ? planData.plan_lot_qty
                                    : '-'}
                                </td>
                                <td style={{border: 'solid black 1px', 
                                            textAlign: 'center',
                                            color: planData && Number(planData.actual_lot_qty) !== 0 ? 'blue' : 'black',
                                          }}>
                                  {planData && Number(planData.actual_lot_qty) !== 0
                                    ? planData.actual_lot_qty
                                    : '-'}
                                </td>
                              </React.Fragment>
                            );
                          })}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </Box>
      </div>
    </>
  );
}