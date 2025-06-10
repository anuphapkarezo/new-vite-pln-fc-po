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

export default function PMC_Plan_per_day({ onSearch }) {
  localStorage.setItem('page_name', 'Plan product per day');

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

  const [isLoading, setIsLoading] = useState(false);
  const [distinctProductList, setDistinctProductList] = useState([]);

  const fetchProductList = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          "http://10.17.100.115:3001/api/smart_planning/PMC-filter-product-list-plan-per-day"
        );
        const dataProduct = response.data;
        setDistinctProductList(dataProduct);
      } catch (error) {
        console.error(`Error fetching distinct data ProductList: ${error}`);
      } finally {
        setIsLoading(false); 
      }
  };
  useEffect(() => {
    fetchProductList();
  }, []);

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
            
            <div style={{ width: 295, height: 700, overflow: 'auto', border: '1px solid black', }}>
              {isLoading ? (
                  <Custom_Progress />
              ) : (
                <table style={{width: 270, borderCollapse: 'collapse', boxShadow: '0px 4px 16px rgba(31, 38, 135, 0.12)',}}>
                <thead style={{fontSize: 16, position: 'sticky', }}>
                  <tr>
                    <th
                        style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        textAlign: "center",
                        backgroundColor: "#4E31AA",
                        width: "150px",
                        border: 'solid white 1px',
                        color: 'white',
                        height: "40px",   
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
                        backgroundColor: "#00FF9C",
                        width: "60px",
                        border: 'solid black 1px',
                        color: 'black',
                        height: "40px",   
                        fontWeight: 'normal',
                        }}
                    >
                        Plan/Day
                    </th>
                  </tr>
                </thead>
                <tbody style={{fontSize: 14 , textAlign: 'center'}}>
                  {distinctProductList.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ border: 'solid black 1px', 
                                   textAlign: "left", 
                                   padding: '10px' 
                                   }}>
                        {item.prd_name}
                      </td>
                      <td style={{ border: 'solid black 1px', }}>
                        <input
                          type="number"
                          style={{ width: '90%', 
                                   height: '30px', 
                                   textAlign: "center", 
                                }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}
            </div>
          </Box>
      </div>
    </>
  );
}