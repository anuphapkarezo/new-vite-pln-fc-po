import React, { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import Nav from "../components/Nav";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import Swal from 'sweetalert2';
import CancelIcon from '@mui/icons-material/Cancel';

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
  const [editValues, setEditValues] = useState({});
  const [distinctStockFg, setDistinctStockFg] = useState([]);

  const fetchStockFg = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://10.17.100.115:3001/api/smart_planning/PMC-filter-stovk-fg-production"
        );
        const dataProduct = response.data;
        setDistinctStockFg(dataProduct);
      } catch (error) {
        console.error(`Error fetching distinct data ProductList: ${error}`);
      } finally {
        setIsLoading(false); 
      }
  };
  useEffect(() => {
    fetchStockFg();
  }, []);

  // ฟังก์ชันสำหรับเก็บข้อมูลทุกแถว ทุกคอลัมน์
  // const handleSaveFg = () => {
  //   // สร้าง array สำหรับเก็บข้อมูล
  //   const tableData = Array.from(new Set(distinctStockFg.map(item => item.product_sub))).map(productSub => {
  //     // filter ข้อมูลของแต่ละ product_sub
  //     const productRows = distinctStockFg.filter(item => item.product_sub === productSub);

  //     // ดึงค่าทุกคอลัมน์ (FA, NPM, UPD, TEST, MASS)
  //     const getValue = (type) => {
  //       const edit = editValues[`${productSub}_${type}`];
  //       if (edit !== undefined && edit !== '') return edit;
  //       return productRows.find(item => item.stock_date === type)?.sum_qty ?? '';
  //     };

  //     // ดึงค่าทุกวันที่ย้อนหลัง 7 วัน
  //     const dateValues = past7Days.map(dateStr => {
  //       const found = productRows.find(item => {
  //         if (!item.stock_date) return false;
  //         if (/^\d{4}-\d{2}-\d{2}$/.test(item.stock_date)) {
  //           const [y, m, d] = item.stock_date.split('-');
  //           const stockDateStr = `${d}/${m}/${y}`;
  //           return stockDateStr === dateStr;
  //         }
  //         if (/^\d{2}\/\d{2}\/\d{4}$/.test(item.stock_date)) {
  //           return item.stock_date === dateStr;
  //         }
  //         return false;
  //       });
  //       return found ? found.sum_qty : '';
  //     });

  //     // รวมข้อมูลแต่ละแถว
  //     const rowData = {
  //       productSub,
  //       dates: dateValues,
  //       FA: getValue('FA'),
  //       NPM: getValue('NPM'),
  //       UPD: getValue('UPD'),
  //       TEST: getValue('TEST'),
  //       MASS: getValue('MASS'),
  //       TOTAL: (() => {
  //         const fa = Number(getValue('FA')) || 0;
  //         const npm = Number(getValue('NPM')) || 0;
  //         const upd = Number(getValue('UPD')) || 0;
  //         const test = Number(getValue('TEST')) || 0;
  //         const mass = Number(getValue('MASS')) || 0;
  //         return fa + npm + upd + test + mass;
  //       })(),
  //       UPDATE_BY: productRows.find(item => item.stock_date === 'UPDATE BY')?.sum_qty ?? '',
  //       LAST_UPDATE: productRows.find(item => item.stock_date === 'LAST UPDATE')?.sum_qty ?? '',
  //     };

  //     // แสดงข้อมูลทีละคอลัมน์ในแต่ละแถว (ย้ายมาไว้ในนี้)
  //     console.log(`Row: ${productSub}`);
  //     // past7Days.forEach((date, idx) => {
  //     //   console.log(`  Date ${date}: ${rowData.dates[idx]}`);
  //     // });
  //     ['FA', 'NPM', 'UPD', 'TEST', 'MASS', 'TOTAL', 'UPDATE_BY', 'LAST_UPDATE'].forEach(col => {
  //       console.log(`  ${col}: ${rowData[col]}`);
  //     });
  //     console.log('-----------------------------');

  //     return rowData;
  //   });

  //   return tableData;
  // };

  // const handleSaveFg = async () => {
  //   const tableData = Array.from(new Set(distinctStockFg.map(item => item.product_sub))).map(productSub => {
  //     const productRows = distinctStockFg.filter(item => item.product_sub === productSub);

  //     const getValue = (type) => {
  //       const edit = editValues[`${productSub}_${type}`];
  //       if (edit !== undefined && edit !== '') return edit;
  //       return productRows.find(item => item.stock_date === type)?.sum_qty ?? '';
  //     };

  //     // ตรวจสอบว่ามีการแก้ไขค่าในแถวนี้หรือไม่
  //     const isEditedRow = ['FA', 'NPM', 'UPD', 'TEST', 'MASS'].some(type => {
  //       const item = productRows.find(row => row.stock_date === type);
  //       return (
  //         editValues[`${productSub}_${type}`] !== undefined &&
  //         editValues[`${productSub}_${type}`] !== (item?.sum_qty ?? '')
  //       );
  //     });

  //     // ...dateValues และ rowData ตามเดิม...
  //     const dateValues = past7Days.map(dateStr => {
  //       const found = productRows.find(item => {
  //         if (!item.stock_date) return false;
  //         if (/^\d{4}-\d{2}-\d{2}$/.test(item.stock_date)) {
  //           const [y, m, d] = item.stock_date.split('-');
  //           const stockDateStr = `${d}/${m}/${y}`;
  //           return stockDateStr === dateStr;
  //         }
  //         if (/^\d{2}\/\d{2}\/\d{4}$/.test(item.stock_date)) {
  //           return item.stock_date === dateStr;
  //         }
  //         return false;
  //       });
  //       return found ? found.sum_qty : '';
  //     });

  //     const rowData = {
  //       productSub,
  //       dates: dateValues,
  //       FA: getValue('FA'),
  //       NPM: getValue('NPM'),
  //       UPD: getValue('UPD'),
  //       TEST: getValue('TEST'),
  //       MASS: getValue('MASS'),
  //       TOTAL: (() => {
  //         const fa = Number(getValue('FA')) || 0;
  //         const npm = Number(getValue('NPM')) || 0;
  //         const upd = Number(getValue('UPD')) || 0;
  //         const test = Number(getValue('TEST')) || 0;
  //         const mass = Number(getValue('MASS')) || 0;
  //         return fa + npm + upd + test + mass;
  //       })(),
  //       UPDATE_BY: productRows.find(item => item.stock_date === 'UPDATE BY')?.sum_qty ?? '',
  //       LAST_UPDATE: productRows.find(item => item.stock_date === 'LAST UPDATE')?.sum_qty ?? '',
  //       isEditedRow, // เพิ่ม property นี้
  //     };

  //     // log ตัวอย่าง
  //     // , 'TOTAL', 'UPDATE_BY', 'LAST_UPDATE'
  //     ['FA', 'NPM', 'UPD', 'TEST', 'MASS'].forEach(col => {
  //       if (isEditedRow !== false) {
  //         const swalWithZIndex = Swal.mixin({
  //           customClass: {
  //               popup: 'my-swal-popup', // Define a custom class for the SweetAlert popup
  //           },
  //         });
  //         swalWithZIndex.fire({
  //           title: "Confirm Save",
  //           text: "Are you sure want to Delete for Data mapping plan MAT?",
  //           icon: "warning",
  //           showCancelButton: true,
  //           confirmButtonText: "Yes, Save",
  //           cancelButtonText: "Cancel",
  //         }).then((result) => {
  //           if (result.isConfirmed) {
  //             const url = (`http://10.17.100.115:3001/api/smart_planning/PMC-filter-count-fg-production?prd_name=${productSub}&stock_type=${col}`);
  //             axios.get(url)
  //             .then(response => {
  //             const data = response.data;
  //             let Count_fg = 0;
  //             Count_fg = data[0].count_fg;
  //             if (Count_fg > 0) {
  //               axios
  //                 .get(
  //                   `http://10.17.100.115:3001/api/smart_planning/PMC-update-fg-production?prd_name=${productSub}&stock_type=${col}&stock_qty=${rowData[col]}&update_by=${UpperUpdate_By}&update_date=${update_date}`
  //                 )
  //                 .then(() => {
  //                 })
  //                 .catch((error) => {
  //                   console.error("There was an error updating the plan!", error);
  //                 });

  //             } else {
  //               axios
  //                 .get(
  //                   `http://10.17.100.115:3001/api/smart_planning/PMC-insert-fg-production?prd_name=${productSub}&stock_type=${col}&stock_qty=${rowData[col]}&update_by=${UpperUpdate_By}&update_date=${update_date}&stock_date=${checkDate}`
  //                 )
  //                 .then(() => {
  //                 })
  //                 .catch((error) => {
  //                   console.error("There was an error inserting the plan!", error);
  //                 });
  //             }
  //           }
  //         });

  //         const url = (`http://10.17.100.115:3001/api/smart_planning/PMC-filter-count-fg-production?prd_name=${productSub}&stock_type=${col}`);
  //         axios.get(url)
  //         .then(response => {
  //           const data = response.data;
  //           let Count_fg = 0;
  //           Count_fg = data[0].count_fg;
  //           if (Count_fg > 0) {
  //             axios
  //               .get(
  //                 `http://10.17.100.115:3001/api/smart_planning/PMC-update-fg-production?prd_name=${productSub}&stock_type=${col}&stock_qty=${rowData[col]}&update_by=${UpperUpdate_By}&update_date=${update_date}`
  //               )
  //               .then(() => {
  //               })
  //               .catch((error) => {
  //                 console.error("There was an error updating the plan!", error);
  //               });

  //           } else {
  //             axios
  //               .get(
  //                 `http://10.17.100.115:3001/api/smart_planning/PMC-insert-fg-production?prd_name=${productSub}&stock_type=${col}&stock_qty=${rowData[col]}&update_by=${UpperUpdate_By}&update_date=${update_date}&stock_date=${checkDate}`
  //               )
  //               .then(() => {
  //               })
  //               .catch((error) => {
  //                 console.error("There was an error inserting the plan!", error);
  //               });
  //           }
  //           // console.log(`Row: ${productSub} | isEditedRow: ${isEditedRow}`);
  //           // console.log(`${col}: ${rowData[col]}`);
  //           // console.log(`Count_fg: ${Count_fg}`);
  //           // console.log('-----------------------------');
  //         })
  //         .catch(error => {
  //           console.error('There was an error!', error);
  //         });

  //       }
  //     });
  //     // 

  //     return rowData;
  //   });
  //   fetchStockFg();
  //   setEditValues({});
  //   return tableData;
  // };

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
      fetchStockFg();
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
    fetchStockFg();
    setEditValues({});
  };

  return (
    <>
      <div className="background-container">
          <Box>
            <Nav/>
            <div>
              <h5
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#006769",
                  width: "500px",
                  paddingLeft: "5px",
                  marginBottom: "20px",
                  // border: '1px solid black',
                  // backgroundColor: '#CAE6B2',
                }}
              >
                {/* Product MultiLayer Control */}
              </h5>
            </div>
            
            <div style={{ width: 1830, height: 700, overflow: 'auto', border: '1px solid black', }}>
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
                  style={{marginTop: '15px', backgroundColor: 'orange', color:'black', width: '120px', height: '40px' , marginLeft: '10px', borderRadius: 10, boxShadow: '3px 3px 5px grey'}}>
                  Cancel 
              </Button>
            
          </Box>
      </div>
    </>
  );
}