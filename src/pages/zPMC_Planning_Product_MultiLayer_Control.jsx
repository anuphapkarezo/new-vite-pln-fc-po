import React, { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import Nav from "../components/Nav";
import axios from "axios";
import Button from "@mui/material/Button";
import RefreshIcon from '@mui/icons-material/Refresh';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Swal from 'sweetalert2';

export default function Planning_Product_MultiLayer_Control({ onSearch }) {
  localStorage.setItem('page_name', 'Product MultiLayer Control');

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
  const update_date = date +'/'+ month_x +'/'+ year

  const [isError, setIsError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [distinctProcess, setDistinctProcess] = useState([]);
  const [distinctReport, setDistinctReport] = useState([]);
  const [distinctMonthlyPlan, setDistinctMonthlyPlan] = useState([]);
  const [planDayInput, setPlanDayInput] = useState({});
  const [planDayOriginal, setPlanDayOriginal] = useState({});

  const fetchProchead = async () => {
    try {
      const response = await axios.get(
        "http://10.17.100.115:3001/api/smart_planning/PMC-filter-process-master-header"
      );
      const dataProduct = response.data;
      setDistinctProcess(dataProduct);
    } catch (error) {
      console.error(`Error fetching distinct data ProductList: ${error}`);
    }
  };
  const fetchReport = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://10.17.100.115:3001/api/smart_planning/PMC-filter-product-multi-layer-report"
        );
        const dataProduct = response.data;
        setDistinctReport(dataProduct);
      } catch (error) {
        console.error(`Error fetching distinct data ProductList: ${error}`);
      } finally {
        setIsLoading(false); 
      }
  };
  const handlePlanDayChange = (prd_name, value) => {
    setPlanDayInput(prev => ({
      ...prev,
      [prd_name]: value
    }));
  };
  // const fetchMonthlyPlan = async () => {
  //   try {
  //     const response = await axios.get(
  //       "http://10.17.100.115:3001/api/smart_planning/PMC-filter-monthly-plan-curr"
  //     );
  //     const dataProduct = response.data;
  //     setDistinctMonthlyPlan(dataProduct);
  //   } catch (error) {
  //     console.error(`Error fetching distinct data ProductList: ${error}`);
  //   }
  // };
  // --- เพิ่มฟังก์ชันแปลงข้อมูลก่อน return ---
  // const groupByProduct = (data, processList) => {
  //   // สร้าง object สำหรับเก็บข้อมูลแต่ละ product
  //   const result = {};
  //   data.forEach(item => {
  //     if (!result[item.prd_name]) {
  //       result[item.prd_name] = {
  //         sort_no: item.sort_no,
  //         prd_type: item.prd_type, // เพิ่ม prd_type
  //         process: {}
  //       };
  //     }
  //     result[item.prd_name].process[item.proc_disp] = item.sum_lot;
  //   });
  //   // แปลงเป็น array สำหรับ render
  //   return Object.keys(result).map(prd_name => ({
  //     prd_name,
  //     sort_no: result[prd_name].sort_no,
  //     prd_type: result[prd_name].prd_type,
  //     process: processList.map(proc => ({
  //       proc_disp: proc.proc_disp,
  //       sum_lot: result[prd_name].process[proc.proc_disp] || ""
  //     }))
  //   }));
  // };

  const groupByProduct = (data, processList) => {
    // เก็บ process เป็น array ของ object
    const result = {};
    data.forEach(item => {
      if (!result[item.prd_name]) {
        result[item.prd_name] = {
          sort_no: item.sort_no,
          prd_type: item.prd_type,
          process: []
        };
      }
      result[item.prd_name].process.push({
        proc_disp: item.proc_disp,
        sum_lot: item.sum_lot,
        prd_type: item.prd_type
      });
    });
    // สร้าง process array โดย match proc_disp และ prd_type
    return Object.keys(result).map(prd_name => ({
      prd_name,
      sort_no: result[prd_name].sort_no,
      prd_type: result[prd_name].prd_type,
      process: processList.map(proc => {
        // หา process ที่ proc_disp ตรงกัน
        const found = result[prd_name].process.find(
          p => p.proc_disp === proc.proc_disp && p.prd_type === result[prd_name].prd_type
        );
        return {
          proc_disp: proc.proc_disp,
          sum_lot: found ? found.sum_lot : ""
        };
      })
    }));
    
  };
  const tableData = groupByProduct(distinctReport, distinctProcess);
    // ฟังก์ชันจัดกลุ่มและเรียง Product ตามที่ต้องการ
    const sortTableData = (data) => {
    // 1. จัดกลุ่มด้วย prefix (เช่น RGPZ-556ML-0A, RGPZ-556ML-0AL1, ... อยู่กลุ่มเดียวกัน)
    // สมมติ prefix คือ ตัวอักษรจนถึงตัวที่เป็นเลขชุดแรก + ตัวอักษร (เช่น RGPZ-556ML-)
    // หรือใช้ sort_no ก็ได้ถ้าแน่ใจว่าเป็นกลุ่มเดียวกัน
    // ตัวอย่างนี้จะใช้ prefix จากชื่อ product (ตัดเลข/ตัวอักษรต่อท้าย)
    const groupMap = {};

    data.forEach(item => {
      // สมมติใช้ prefix เป็นชื่อ product ตัด L1, L3, L4, ... ออก (หรือใช้ logic ที่เหมาะสมกับข้อมูลจริง)
      // เช่น RGPZ-556ML-0A, RGPZ-556ML-7A, RGPZ-556ML-0AL1, RGPZ-556ML-0AL4 => prefix = RGPZ-556ML
      // ให้ตัดเลขชุดสุดท้ายและตัวอักษรต่อท้ายออก
      const match = item.prd_name.match(/^(.*?-\d+[A-Z]?)/);
      const prefix = match ? match[1] : item.prd_name;
      if (!groupMap[prefix]) groupMap[prefix] = [];
      groupMap[prefix].push(item);
    });

    // 2. เรียงในแต่ละกลุ่ม: MAIN ก่อน, SUB ต่อท้าย
    const sortedGroups = Object.values(groupMap).map(group => {
      // MAIN ก่อน (prd_type === 'MAIN'), SUB ต่อท้าย
      const main = group.filter(x => x.prd_type === 'MAIN');
      const sub = group.filter(x => x.prd_type !== 'MAIN');
      // MAIN เรียงตาม prd_name, SUB เรียงตาม prd_name
      main.sort((a, b) => a.prd_name.localeCompare(b.prd_name, 'en', { numeric: true }));
      sub.sort((a, b) => a.prd_name.localeCompare(b.prd_name, 'en', { numeric: true }));
      return [...main, ...sub];
    });

    // 3. เรียงกลุ่มตาม prefix (หรือ sort_no ของ MAIN)
    sortedGroups.sort((a, b) => {
      // ใช้ sort_no ของ MAIN ตัวแรกในแต่ละกลุ่ม
      const aSort = a[0]?.sort_no ?? 0;
      const bSort = b[0]?.sort_no ?? 0;
      return aSort - bSort;
    });

    // 4. รวมกลุ่มทั้งหมดเป็น array เดียว
    return sortedGroups.flat();
  };
  
  useEffect(() => {
    fetchProchead();
    fetchReport();
    // fetchMonthlyPlan();_
  }, []);

  useEffect(() => {
    if (distinctReport.length > 0) {
      const original = {};
      distinctReport.forEach(item => {
        if (item.proc_disp === "Plan/day") {
          original[item.prd_name] = item.sum_lot;
        }
      });
      setPlanDayOriginal(original);
    }
  }, [distinctReport]);

  // const exportToExcel1 = async () => {
  //   const workbook = new ExcelJS.Workbook();
  //   const worksheet = workbook.addWorksheet("Product MultiLayer", {
  //     views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }] // freeze column แรก
  //   });
  //   // const worksheet = workbook.addWorksheet("Product MultiLayer");

  //   // สร้าง header
  //   const headerRow = [
  //     { header: "Product name", key: "prd_name", width: 20 }
  //   ];
  //   distinctProcess.forEach((proc) => {
  //     headerRow.push({ header: proc.proc_disp, key: proc.proc_disp, width: 10 });
  //   });
  //   worksheet.columns = headerRow;

  //   // กำหนดความกว้างคอลัมน์ที่ 2 ถึงสุดท้าย = 5
  //   for (let i = 2; i <= worksheet.columns.length; i++) {
  //     worksheet.getColumn(i).width = 3;
  //   }

  //   // สร้าง style header
  //   worksheet.getRow(1).eachCell((cell, colNumber) => {
  //     cell.fill = {
  //       type: "pattern",
  //       pattern: "solid",
  //       fgColor: { argb: colNumber === 1 ? "4E31AA" : (
  //         distinctProcess[colNumber - 2]?.proc_disp?.includes("KRHOLD") ? "FFA500" :
  //         (["FG OUTER", "Total WIP", "Target WIP", "Plan/day"].includes(distinctProcess[colNumber - 2]?.proc_disp)) ? "00FF9C" :
  //         (distinctProcess[colNumber - 2]?.proc_type === "SUB") ? "DDDDDD" :
  //         (distinctProcess[colNumber - 2]?.seq == 0) ? "5DEBD7" :
  //         (distinctProcess[colNumber - 2]?.sort_no == 3) ? "BBE2EC" :
  //         "E8F9FF"
  //       ) }
  //     };
  //     cell.font = { color: { argb: colNumber === 1 ? "FFFFFF" : "0000FF" }, bold: false };
  //     cell.alignment = { vertical: "bottom", horizontal: "center", textRotation: colNumber === 1 ? 0 : 90 };
  //     cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
  //   });

  //   // สร้างข้อมูล row
  //   sortTableData(tableData).forEach((row) => {
  //     const dataRow = { prd_name: row.prd_name };
  //     row.process.forEach((proc, idx) => {
  //       // ถ้าไม่มีข้อมูลหรือเป็น 0 ให้ใส่ "-"
  //       let value = proc.sum_lot;
  //       if (value === "" || value === null || value === undefined || value === "0" || value === 0) {
  //         value = "-";
  //       }
  //       dataRow[distinctProcess[idx]?.proc_disp] = value;
  //     });
  //     worksheet.addRow(dataRow);
  //   });

  //   // style cell เหมือนใน table
  //   // ...existing code...
  //   worksheet.eachRow((row, rowNumber) => {
  //     if (rowNumber === 1) return; // header
  //     row.getCell(1).fill = {
  //       type: "pattern",
  //       pattern: "solid",
  //       fgColor: { argb: "F5F5F5" }
  //     };
  //     row.getCell(1).font = { color: { argb: "0000FF" } };
  //     row.getCell(1).alignment = { horizontal: "left" };
  //     row.eachCell((cell, colNumber) => {
  //       cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
  //       if (colNumber > 1) {
  //         const procType = distinctProcess[colNumber - 2]?.proc_type;
  //         const procDisp = distinctProcess[colNumber - 2]?.proc_disp;
  //         // ดึงค่า prd_type ของ row นี้
  //         const prdType = row.getCell(1).value && tableData.find(d => d.prd_name === row.getCell(1).value)?.prd_type;
  //         let cellBg = undefined;
  //         if (procDisp === "FG OUTER" && prdType === "MAIN") {
  //           cellBg = "DDDDDD"; // สีเทา
  //         } else if (procType === "SUB") {
  //           cellBg = "DDDDDD";
  //         } else if (["FG OUTER", "Total WIP"].includes(procDisp)) {
  //           cellBg = "00FF9C";
  //         }
  //         if (cellBg) {
  //           cell.fill = {
  //             type: "pattern",
  //             pattern: "solid",
  //             fgColor: { argb: cellBg }
  //           };
  //         }
  //         // ฟอนต์น้ำเงินถ้า value > 0
  //         if (cell.value && cell.value !== "-" && !isNaN(Number(cell.value)) && Number(cell.value) > 0) {
  //           cell.font = { color: { argb: "0000FF" } };
  //         }
  //       }
  //     });
  //   });
  //   // ...existing code...

  //   // สร้างไฟล์
  //   const buf = await workbook.xlsx.writeBuffer();
  //   saveAs(new Blob([buf]), "Product_MultiLayer_WIPControl.xlsx");
  // };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Product MultiLayer", {
      views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }]
    });

    // สร้าง header
    const headerRow = [
      { header: "Product name", key: "prd_name", width: 20 }
    ];
    distinctProcess.forEach((proc) => {
      headerRow.push({ header: proc.proc_disp, key: proc.proc_disp, width: 10 });
    });
    worksheet.columns = headerRow;

    // กำหนดความกว้างคอลัมน์ที่ 2 ถึงสุดท้าย = 3
    for (let i = 2; i <= worksheet.columns.length; i++) {
      worksheet.getColumn(i).width = 3;
    }

    // สร้าง style header
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: colNumber === 1 ? "4E31AA" : (
          distinctProcess[colNumber - 2]?.proc_disp?.includes("KRHOLD") ? "FFA500" :
          (["FG OUTER", "Total WIP", "Target WIP", "Plan/day"].includes(distinctProcess[colNumber - 2]?.proc_disp)) ? "00FF9C" :
          (distinctProcess[colNumber - 2]?.proc_type === "SUB") ? "DDDDDD" :
          (distinctProcess[colNumber - 2]?.seq == 0) ? "5DEBD7" :
          (distinctProcess[colNumber - 2]?.sort_no == 3) ? "BBE2EC" :
          "E8F9FF"
        ) }
      };
      cell.font = { color: { argb: colNumber === 1 ? "FFFFFF" : "0000FF" }, bold: false };
      cell.alignment = { vertical: "center", horizontal: "center", textRotation: colNumber === 1 ? 0 : 90 };
      cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
    });

    // --- สร้างข้อมูล row ---
    const sortedData = sortTableData(tableData);
    let prevSortNo = null;
    sortedData.forEach((row) => {
      // แทรก row ว่างถ้า sort_no เปลี่ยน
      if (prevSortNo !== null && row.sort_no !== prevSortNo) {
        const emptyRow = worksheet.addRow({});
        for (let i = 1; i <= worksheet.columnCount; i++) {
          const cell = emptyRow.getCell(i);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "DDDDDD" }
          };
          cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
        }
      }
      prevSortNo = row.sort_no;

      const dataRow = { prd_name: row.prd_name };
      row.process.forEach((proc, idx) => {
        const procDisp = distinctProcess[idx]?.proc_disp;
        let value = proc.sum_lot;

        // --- Plan/day ---
        if (procDisp === "Plan/day") {
          // ใช้ค่าที่ user กรอก ถ้ามี, ถ้าไม่มีใช้ค่าจาก API
          let planDayValue = planDayInput[row.prd_name];
          if (
            planDayValue === undefined ||
            planDayValue === "" ||
            planDayValue === "-" ||
            planDayValue === null
          ) {
            const planDayObj = distinctReport.find(
              p => p.prd_name === row.prd_name && p.proc_disp === "Plan/day"
            );
            planDayValue = planDayObj ? planDayObj.sum_lot : "";
          }
          value = (planDayValue === 0 || planDayValue === "0" || planDayValue === "" || planDayValue === null || planDayValue === undefined || planDayValue === "-")
            ? "-"
            : planDayValue;
        }

        // --- Target WIP ---
        else if (procDisp === "Target WIP") {
          // ดึงค่า Plan/day ที่ใช้แสดงใน input
          let planDayValue = planDayInput[row.prd_name];
          if (
            planDayValue === undefined ||
            planDayValue === "" ||
            planDayValue === "-" ||
            planDayValue === null
          ) {
            const planDayObj = distinctReport.find(
              p => p.prd_name === row.prd_name && p.proc_disp === "Plan/day"
            );
            planDayValue = planDayObj ? planDayObj.sum_lot : "";
          }
          const planDayNum = (planDayValue === 0 || planDayValue === "0" || planDayValue === "" || planDayValue === null || planDayValue === undefined || planDayValue === "-")
            ? 0
            : Number(planDayValue);

          if (row.prd_type === "MAIN") {
            value = planDayNum > 0 ? planDayNum * 3 : "-";
          } else if (row.prd_type === "SUB") {
            // หา MAIN ทุกตัวในกลุ่มเดียวกัน (sort_no เดียวกัน)
            const mainRows = tableData.filter(
              r => r.prd_type === "MAIN" && r.sort_no === row.sort_no
            );
            // รวม Plan/day ของ MAIN ทุกตัว
            const totalPlanDay = mainRows.reduce((sum, mainRow) => {
              let mainPlanDay = planDayInput[mainRow.prd_name];
              if (
                mainPlanDay === undefined ||
                mainPlanDay === "" ||
                mainPlanDay === "-" ||
                mainPlanDay === null
              ) {
                const mainPlanDayObj = distinctReport.find(
                  p => p.prd_name === mainRow.prd_name && p.proc_disp === "Plan/day"
                );
                mainPlanDay = mainPlanDayObj ? mainPlanDayObj.sum_lot : "";
              }
              const mainPlanDayNum = (mainPlanDay === 0 || mainPlanDay === "0" || mainPlanDay === "" || mainPlanDay === null || mainPlanDay === undefined || mainPlanDay === "-")
                ? 0
                : Number(mainPlanDay);
              return sum + mainPlanDayNum;
            }, 0);
            const mainTarget = totalPlanDay > 0 ? totalPlanDay * 3 : 0;
            const subTotalWip = getTotalWIPSum(row, distinctProcess) || 0;
            if (mainTarget > 0) {
              value = subTotalWip - mainTarget;
            } else {
              value = "-";
            }
          } else {
            value = "-";
          }
        }

        // --- Total WIP ---
        else if (procDisp === "Total WIP") {
          const sum = getTotalWIPSum(row, distinctProcess);
          value = (sum === null || sum === 0) ? "-" : sum;
        }

        // --- เงื่อนไขทั่วไป ---
        else if (value === "" || value === null || value === undefined || value === "0" || value === 0) {
          value = "-";
        }

        dataRow[procDisp] = value;
      });
      worksheet.addRow(dataRow);
    });

    // style cell เหมือนใน table
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // header
      if (!row.getCell(1).value) return; // row ว่าง
      row.getCell(1).font = { color: { argb: "0000FF" } };
      row.getCell(1).alignment = { horizontal: "left" };
      row.eachCell((cell, colNumber) => {
        cell.border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
        if (colNumber > 1) {
          cell.alignment = { horizontal: "center" };
          const procType = distinctProcess[colNumber - 2]?.proc_type;
          const procDisp = distinctProcess[colNumber - 2]?.proc_disp;
          const prdType = row.getCell(1).value && tableData.find(d => d.prd_name === row.getCell(1).value)?.prd_type;
          let cellBg = undefined;
          if (procDisp === "FG OUTER" && prdType === "MAIN") {
            cellBg = "DDDDDD";
          } else if (procType === "SUB") {
            cellBg = "DDDDDD";
          } else if (["FG OUTER", "Total WIP"].includes(procDisp)) {
            cellBg = "00FF9C";
          }
          if (cellBg) {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: cellBg }
            };
          }
          // ฟอนต์น้ำเงินถ้า value > 0
          if (cell.value && cell.value !== "-" && !isNaN(Number(cell.value)) && Number(cell.value) > 0) {
            cell.font = { color: { argb: "0000FF" } };
          }
          // ฟอนต์แดงถ้า Target WIP < 0
          if (
            procDisp === "Target WIP" &&
            cell.value &&
            cell.value !== "-" &&
            !isNaN(Number(cell.value)) &&
            Number(cell.value) < 0
          ) {
            cell.font = { color: { argb: "FF0000" } };
          }
        }
      });
    });

  // สร้างไฟล์
  const buf = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buf]), "Product_MultiLayer_WIPControl.xlsx");
};

  // ฟังก์ชันหาค่า sum_lot ของแต่ละ product ตามเงื่อนไข
  const getTotalWIPSum = (row, distinctProcess) => {
    // หา index ของ Total WIP ในหัวตาราง
    const totalWipIdx = distinctProcess.findIndex(p => p.proc_disp === "Total WIP");
    if (totalWipIdx === -1) return null;

    // เงื่อนไข SUB + sort_no=2
    if (row.prd_type === "SUB") {
      // process ที่ตรงกับหัวตารางและ sort_no=2
      return row.process.reduce((sum, proc, idx) => {
        const procHead = distinctProcess[idx];
        if (procHead && procHead.sort_no === 2 && procHead.proc_disp === proc.proc_disp) {
          const val = Number(proc.sum_lot);
          return sum + (isNaN(val) ? 0 : val);
        }
        return sum;
      }, 0);
    }
    // เงื่อนไข MAIN + sort_no=3
    if (row.prd_type === "MAIN") {
      return row.process.reduce((sum, proc, idx) => {
        const procHead = distinctProcess[idx];
        if (procHead && procHead.sort_no === 3 && procHead.proc_disp === proc.proc_disp) {
          const val = Number(proc.sum_lot);
          return sum + (isNaN(val) ? 0 : val);
        }
        return sum;
      }, 0);
    }
    return null;
  };

  const handleSave = async (prd_name) => {
    // const row = tableData.find(r => r.prd_name === prd_name);
    // const saveData = {
    //   prd_name: row.prd_name,
    //   sort_no: row.sort_no,
    //   prd_type: row.prd_type,
    //   plan_day: planDayValue,
    // };
    const oldValue = planDayOriginal[prd_name];
    const newValue = planDayInput[prd_name];
    
    if (
      newValue === "-" ||
      newValue === "" ||
      newValue === null ||
      newValue === undefined ||
      newValue === 0 ||
      newValue === "0"
    ) {
      return;
    }

    const resultPln = await Swal.fire({
      title: 'Confirm save?',
      html: `
        <div style="text-align:center">
          <div style="margin-bottom:8px;">Are you sure you want to save this plan?</div>
          <b>Product :</b> ${prd_name} / <b>Plan :</b> ${newValue ?? "-"}<br/>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: "Yes, Save",
      cancelButtonText: "Cancel",
    });
    if (resultPln.isConfirmed) {
      // ดำเนินการ save ที่นี่
      // console.log('prd_name :', prd_name);
      // console.log('oldValue :', oldValue);
      // console.log('newValue :', newValue);
      const urlCheck = `http://10.17.100.115:3001/api/smart_planning/PMC-filter-count-plan-per-day-by-product?prd_name=${prd_name}`;
      try {
        const response = await axios.get(urlCheck);
        const Count_ppd = response.data[0]?.count_ppd || 0;
        // console.log('Count_ppd :', Count_ppd);
        if (Count_ppd > 0) {
          // update
          await axios.get(
            `http://10.17.100.115:3001/api/smart_planning/PMC-update-plan-per-day?prd_name=${prd_name}&plan_qty=${newValue}`
          );
        } else {
          // insert
          await axios.get(
            `http://10.17.100.115:3001/api/smart_planning/PMC-insert-plan-per-day?prd_name=${prd_name}&plan_qty=${newValue}&update_by=${UpperUpdate_By}&update_date=${update_date}`
          );
        }
      } catch (error) {
        console.error("There was an error updating/inserting the plan!", error);
      }
      setPlanDayInput(prev => {
        const newInput = { ...prev };
        delete newInput[prd_name];
        return newInput;
      });
      fetchReport();
      // setEditValues({});
      Swal.fire({
        icon: "success",
        title: "Save Success",
        text: "Plan per day saved successfully",
        timer: 1500, // ปิดเองใน 1.5 วินาที
        confirmButtonText: "OK",
        showConfirmButton: false
      });
    }
  };
  
  return (
    <>
      <div className="background-container">
          <Box>
            <Nav/>
            <div>
              <Button 
                  className="btn_hover" 
                  variant="contained" 
                  startIcon={<RefreshIcon />} 
                  onClick={fetchReport} 
                  style={{marginTop: '30px', marginBottom: 10, backgroundColor: 'skyblue', color:'blue', width: '130px', height: '40px' , borderRadius: 10, boxShadow: '3px 3px 5px grey'}}>
                  refresh 
              </Button>
              <Button 
                  className="btn_hover" 
                  variant="contained" 
                  startIcon={<BackupTableIcon />} 
                  onClick={exportToExcel} 
                  style={{marginTop: '30px', marginBottom: 10, marginLeft: 15, backgroundColor: 'green', color:'white', width: '130px', height: '40px' , borderRadius: 10, boxShadow: '3px 3px 5px grey'}}>
                  to Excel 
              </Button>
            </div>
            <div style={{border: '1px solid black', width: 1800, height: 750, overflow: 'auto'}}>
              {isLoading ? (
                  <Custom_Progress />
              ) : (
                <table style={{width: 3500, borderCollapse: 'collapse',}}>
                <thead style={{fontSize: 16, position: 'sticky',top: 0, zIndex: 1, }}>
                  <tr>
                    <th
                        style={{
                        textAlign: "center",
                        backgroundColor: "#4E31AA",
                        width: "120px",
                        border: 'solid black 1px',
                        color: 'white',
                        position: "sticky",
                        top: 0,
                        left: 0,
                        zIndex: 4,
                        }}
                    >
                        Product name
                    </th>
                    {distinctProcess.map((item, index) => (
                      <th
                        style={{
                          backgroundColor: item.proc_disp?.includes("KRHOLD") ? "#FFA500" 
                                         : (item.proc_disp === 'FG OUTER' || 
                                            item.proc_disp === 'Total WIP' ||
                                            item.proc_disp === 'Target WIP'||
                                            item.proc_disp === 'Plan/day') ? "#00FF9C"
                                         : (item.proc_type === 'SUB') ? "#DDDDDD"
                                         : (item.seq == 0 ) ? "#5DEBD7"
                                         : (item.sort_no == 3 ) ? "#BBE2EC"
                                         : "#E8F9FF",  // #EAEFEF gray
                          height: "108px",
                          width: "25px",
                          border: 'solid black 2px',
                          padding: 0,
                          verticalAlign: 'bottom',
                          position: "sticky",
                          top: 0,
                          zIndex: 2,
                        }}
                      >
                        <div
                          style={{
                            transform: 'rotate(-90deg)',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'left',
                            height: '50px',
                            width: '25px',
                            color: 'blue',
                            fontWeight: 'normal',     
                            marginLeft: '5px',
                            position: "sticky",
                            top: 0,
                            zIndex: 2,
                           }}
                        >
                          {item.proc_disp}
                        </div>
                      </th>
                  ))}
                  </tr>
                </thead>
                <tbody style={{fontSize: 14 , textAlign: 'center'}}>
                  {sortTableData(tableData).map((row, rowIdx, arr) => {
                    const currentSortNo = row.sort_no;
                    const prevSortNo = rowIdx > 0 ? arr[rowIdx - 1].sort_no : currentSortNo;
                    const shouldInsertSpace = rowIdx > 0 && currentSortNo !== prevSortNo;

                    return (
                      <React.Fragment key={rowIdx}>
                        {shouldInsertSpace && (
                          <tr>
                            <td colSpan={1 + distinctProcess.length} style={{ height: 10, background: "#F5F5F5", border: "none" }}></td>
                          </tr>
                        )}
                        <tr>
                          <td style={{ 
                                border: 'solid black 1px', 
                                background: '#F5F5F5', 
                                fontWeight: 'normal', 
                                textAlign: 'left', 
                                paddingLeft: '10px', 
                                color: 'blue',
                                position: 'sticky', 
                                left: 0, 
                                // zIndex: 3, 
                                // backgroundColor: '#F5F5F5'  // เพื่อให้ข้อมูลไม่ overlap
                              }}>
                            {row.prd_name}
                          </td>
                          {row.process.map((proc, colIdx) => {
                            let isPositive = proc.sum_lot !== "" && proc.sum_lot !== null && Number(proc.sum_lot) > 0;
                            const procType = distinctProcess[colIdx]?.proc_type;
                            const procDisp = distinctProcess[colIdx]?.proc_disp;
                            const cellBg = procType === "SUB" ? "#F5F5F5" : 
                                procDisp === "FG OUTER" && row.prd_type === "SUB" || procDisp === "Total WIP" ? "#00FF9C" : 
                                procDisp === "FG OUTER" && row.prd_type === "MAIN" ? "#F5F5F5" : undefined;

                            let displayValue = (proc.sum_lot === "0" || proc.sum_lot === 0 || proc.sum_lot === "" || proc.sum_lot == null || proc.sum_lot === undefined) ? "-" : proc.sum_lot;

                            // สำหรับ Total WIP
                            let totalWipValue = null;
                            if (procDisp === "Total WIP") {
                              const sum = getTotalWIPSum(row, distinctProcess);
                              displayValue = (sum === null || sum === 0) ? "-" : sum;
                              isPositive = sum > 0;
                              totalWipValue = sum;
                            }

                            // สำหรับ Plan/day
                            if (procDisp === "Plan/day") {
                              // หา sum_lot จาก distinctReport ที่ตรงกับ product และ proc_disp
                              const planDayObj = distinctReport.find(
                                p => p.prd_name === row.prd_name && p.proc_disp === "Plan/day"
                              );
                              let defaultValue = planDayInput[row.prd_name] ?? (planDayObj ? planDayObj.sum_lot : "");

                              // ถ้าเป็น 0, "0", "", null, undefined ให้แสดง "-"
                              if (
                                defaultValue === 0 ||
                                defaultValue === "0" ||
                                defaultValue === "" ||
                                defaultValue === null ||
                                defaultValue === undefined
                              ) {
                                defaultValue = "";
                              }

                              const originalValue = planDayObj ? String(planDayObj.sum_lot ?? "") : "";
                              const isChanged =
                                              planDayInput[row.prd_name] !== undefined &&
                                              (
                                                (String(planDayInput[row.prd_name]) !== String(originalValue)) &&
                                                !(planDayInput[row.prd_name] === "" && (originalValue === "" || originalValue === "0" || originalValue === 0))
                                              );

                              if (row.prd_type === "MAIN") {
                                displayValue = (
                                  <input
                                    type="text"
                                    style={{ width: '80%', textAlign: "center", background: isChanged ? "#FFA500" : '#FFF1DB' }}
                                    value={defaultValue}
                                    onChange={e => handlePlanDayChange(row.prd_name, e.target.value)}
                                    onKeyDown={e => {
                                                      if (e.key === "Enter") {
                                                        e.preventDefault(); // สำคัญมาก!
                                                        handleSave(row.prd_name);
                                                      }
                                                    }}
                                  />
                                );
                              } else {
                                displayValue = "-";
                              }
                            }

                            // สำหรับ Target WIP
                            if (procDisp === "Target WIP") {
                              // ดึงค่า Plan/day ที่ใช้แสดงใน input
                              let planDayValue = planDayInput[row.prd_name];
                              if (
                                planDayValue === undefined ||
                                planDayValue === "" ||
                                planDayValue === "-" ||
                                planDayValue === null
                              ) {
                                // ถ้า user ยังไม่กรอก ให้ใช้ sum_lot จาก API
                                const planDayObj = distinctReport.find(
                                  p => p.prd_name === row.prd_name && p.proc_disp === "Plan/day"
                                );
                                planDayValue = planDayObj ? planDayObj.sum_lot : "";
                              }
                              // ถ้าเป็น 0, "0", "", null, undefined หรือ "-" ให้ถือว่าไม่มีค่า
                              const planDayNum = (planDayValue === 0 || planDayValue === "0" || planDayValue === "" || planDayValue === null || planDayValue === undefined || planDayValue === "-")
                                ? 0
                                : Number(planDayValue);

                              if (row.prd_type === "MAIN") {
                                displayValue = planDayNum > 0 ? planDayNum * 3 : "-";
                                isPositive = planDayNum * 3 > 0;
                              } else if (row.prd_type === "SUB") {
                                // หา MAIN ทุกตัวในกลุ่มเดียวกัน (sort_no เดียวกัน)
                                const mainRows = tableData.filter(
                                  r => r.prd_type === "MAIN" && r.sort_no === row.sort_no
                                );
                                // รวม Plan/day ของ MAIN ทุกตัว (ใช้ logic เดียวกับข้างบน)
                                const totalPlanDay = mainRows.reduce((sum, mainRow) => {
                                  let mainPlanDay = planDayInput[mainRow.prd_name];
                                  if (
                                    mainPlanDay === undefined ||
                                    mainPlanDay === "" ||
                                    mainPlanDay === "-" ||
                                    mainPlanDay === null
                                  ) {
                                    const mainPlanDayObj = distinctReport.find(
                                      p => p.prd_name === mainRow.prd_name && p.proc_disp === "Plan/day"
                                    );
                                    mainPlanDay = mainPlanDayObj ? mainPlanDayObj.sum_lot : "";
                                  }
                                  const mainPlanDayNum = (mainPlanDay === 0 || mainPlanDay === "0" || mainPlanDay === "" || mainPlanDay === null || mainPlanDay === undefined || mainPlanDay === "-")
                                    ? 0
                                    : Number(mainPlanDay);
                                  return sum + mainPlanDayNum;
                                }, 0);
                                const mainTarget = totalPlanDay > 0 ? totalPlanDay * 3 : 0;
                                const subTotalWip = getTotalWIPSum(row, distinctProcess) || 0;
                                if (mainTarget > 0) {
                                  displayValue = subTotalWip - mainTarget;
                                  isPositive = displayValue > 0;
                                } else {
                                  displayValue = "-";
                                  isPositive = false;
                                }
                              } else {
                                displayValue = "-";
                                isPositive = false;
                              }
                            }

                            return (
                              <td
                                key={colIdx}
                                style={{
                                  border: 'solid black 1px',
                                  color:
                                        procDisp === "Target WIP" && !isNaN(Number(displayValue)) && Number(displayValue) < 0
                                          ? 'red'
                                          : isPositive
                                            ? 'blue'
                                            : undefined,
                                  background: cellBg,
                                }}
                              >
                                {displayValue}
                              </td>
                            );
                          })}
                        </tr>
                      </React.Fragment>
                      // <React.Fragment key={rowIdx}>
                      //   {shouldInsertSpace && (
                      //     <tr>
                      //       <td colSpan={1 + distinctProcess.length} style={{ height: 10, background: "#F5F5F5", border: "none" }}></td>
                      //     </tr>
                      //   )}
                      //   <tr>
                      //     <td 
                      //       style={{ 
                      //         border: 'solid black 1px', 
                      //         background: '#F5F5F5', 
                      //         fontWeight: 'normal', 
                      //         textAlign: 'left', 
                      //         paddingLeft: '10px', 
                      //         color: 'blue',
                      //         position: 'sticky', 
                      //         left: 0, 
                      //         // zIndex: 3, 
                      //         // backgroundColor: '#F5F5F5'  // เพื่อให้ข้อมูลไม่ overlap
                      //       }}
                      //     >
                      //       {row.prd_name}
                      //     </td>
                      //     {row.process.map((proc, colIdx) => {
                      //       let isPositive = proc.sum_lot !== "" && proc.sum_lot !== null && Number(proc.sum_lot) > 0;
                      //       const procType = distinctProcess[colIdx]?.proc_type;
                      //       const procDisp = distinctProcess[colIdx]?.proc_disp;
                      //       const cellBg = procType === "SUB" ? "#F5F5F5" : 
                      //           procDisp === "FG OUTER" && row.prd_type === "SUB" || procDisp === "Total WIP" ? "#00FF9C" : 
                      //           procDisp === "FG OUTER" && row.prd_type === "MAIN" ? "#F5F5F5" : undefined;

                      //       let displayValue = (proc.sum_lot === "0" || proc.sum_lot === 0 || proc.sum_lot === "" || proc.sum_lot == null || proc.sum_lot === undefined) ? "-" : proc.sum_lot;
                      //       // if (procDisp === "Total WIP") {
                      //       //   const sum = getTotalWIPSum(row, distinctProcess);
                      //       //   displayValue = (sum === null || sum === 0) ? "-" : sum;
                      //       //   isPositive = sum > 0;
                      //       // }

                      //       // // สำหรับ Plan/day
                      //       // let plan = null;
                      //       // if (procDisp === "Plan/day" || procDisp === "Target WIP") {
                      //       //   plan = distinctMonthlyPlan.find(
                      //       //     p => p.product === row.prd_name
                      //       //   );
                      //       // }
                      //       // if (procDisp === "Plan/day") {
                      //       //   displayValue = plan && plan.plan_lot_qty !== undefined && plan.plan_lot_qty !== null && plan.plan_lot_qty !== 0
                      //       //     ? plan.plan_lot_qty
                      //       //     : "-";
                      //       //   isPositive = plan && Number(plan.plan_lot_qty) > 0;
                      //       // }

                      //       // // สำหรับ Target WIP
                      //       // if (procDisp === "Target WIP") {
                      //       //   if (plan && Number(plan.plan_lot_qty) > 0) {
                      //       //     displayValue = plan.plan_lot_qty * 3;
                      //       //     isPositive = true;
                      //       //   } else {
                      //       //     displayValue = (proc.sum_lot === "0" || proc.sum_lot === 0 || proc.sum_lot === "" || proc.sum_lot == null || proc.sum_lot === undefined) ? "-" : proc.sum_lot;
                      //       //     isPositive = proc.sum_lot !== "" && proc.sum_lot !== null && Number(proc.sum_lot) > 0;
                      //       //   }
                      //       // }

                      //       // สำหรับ Total WIP
                      //       let totalWipValue = null;
                      //       if (procDisp === "Total WIP") {
                      //         const sum = getTotalWIPSum(row, distinctProcess);
                      //         displayValue = (sum === null || sum === 0) ? "-" : sum;
                      //         isPositive = sum > 0;
                      //         totalWipValue = sum;
                      //       }

                      //       // สำหรับ Plan/day
                      //       let plan = null;
                      //       if (procDisp === "Plan/day" || procDisp === "Target WIP") {
                      //         plan = distinctMonthlyPlan.find(
                      //           p => p.product === row.prd_name
                      //         );
                      //       }
                      //       if (procDisp === "Plan/day") {
                      //         displayValue = plan && plan.plan_lot_qty !== undefined && plan.plan_lot_qty !== null && plan.plan_lot_qty !== 0
                      //           ? plan.plan_lot_qty
                      //           : "-";
                      //         isPositive = plan && Number(plan.plan_lot_qty) > 0;
                      //       }

                      //       // สำหรับ Target WIP
                      //       if (procDisp === "Target WIP") {
                      //         if (row.prd_type === "SUB") {
                      //           // หา MAIN ในกลุ่มเดียวกัน (prefix เดียวกัน)
                      //           // const mainRow = tableData.find(
                      //           //   r => r.prd_type === "MAIN" &&
                      //           //       r.prd_name.replace(/L\d+$/, "") === row.prd_name.replace(/L\d+$/, "")
                      //           // );
                      //           const mainRow = tableData.find(
                      //             r => r.prd_type === "MAIN" && r.sort_no === row.sort_no
                      //           );
                      //           let mainPlan = null;
                      //           if (mainRow) {
                      //             mainPlan = distinctMonthlyPlan.find(
                      //               p => p.product === mainRow.prd_name
                      //             );
                      //           }
                      //           const mainPlanQty = mainPlan && mainPlan.plan_lot_qty ? Number(mainPlan.plan_lot_qty) : 0;
                      //           const mainTarget = mainPlanQty > 0 ? mainPlanQty * 3 : 0;

                      //           // หา Total WIP ของ SUB แถวนี้
                      //           const subTotalWip = getTotalWIPSum(row, distinctProcess) || 0;

                      //           if (mainTarget > 0) {
                      //             displayValue = subTotalWip - mainTarget ;
                      //             isPositive = displayValue > 0;
                      //           } else {
                      //             displayValue = (proc.sum_lot === "0" || proc.sum_lot === 0 || proc.sum_lot === "" || proc.sum_lot == null || proc.sum_lot === undefined) ? "-" : proc.sum_lot;
                      //             isPositive = proc.sum_lot !== "" && proc.sum_lot !== null && Number(proc.sum_lot) > 0;
                      //           }
                      //         } else {
                      //           // MAIN ใช้ logic เดิม
                      //           if (plan && Number(plan.plan_lot_qty) > 0) {
                      //             displayValue = plan.plan_lot_qty * 3;
                      //             isPositive = true;
                      //           } else {
                      //             displayValue = (proc.sum_lot === "0" || proc.sum_lot === 0 || proc.sum_lot === "" || proc.sum_lot == null || proc.sum_lot === undefined) ? "-" : proc.sum_lot;
                      //             isPositive = proc.sum_lot !== "" && proc.sum_lot !== null && Number(proc.sum_lot) > 0;
                      //           }
                      //         }
                      //       }
                                
                      //       return (
                      //         <td
                      //           key={colIdx}
                      //           style={{
                      //             border: 'solid black 1px',
                      //             // color: isPositive ? 'blue' : undefined,
                      //             color:
                      //                   procDisp === "Target WIP" && !isNaN(Number(displayValue)) && Number(displayValue) < 0
                      //                     ? 'red'
                      //                     : isPositive
                      //                       ? 'blue'
                      //                       : undefined,
                      //             background: cellBg,
                      //           }}
                      //         >
                      //           {/* {(proc.sum_lot === "0" || proc.sum_lot === 0 || proc.sum_lot === "" || proc.sum_lot == null) ? "-" : proc.sum_lot} */}
                      //           {/* {(proc.sum_lot === "0" || proc.sum_lot === 0 || proc.sum_lot === "" || proc.sum_lot == null || proc.sum_lot === undefined) ? "-" : proc.sum_lot} */}
                      //           {displayValue}
                      //         </td>
                      //       );
                      //     })}
                      //   </tr>
                      // </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
              )}
            </div>
          </Box>
      </div>
    </>
  );
}