import React, { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import Nav from "../components/Nav";
import axios from "axios";

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

  const [isError, setIsError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [distinctProduct, setDistinctProduct] = useState([]);

  const fetchProchead = async () => {
    try {
      const response = await axios.get(
        "http://10.17.100.115:3001/api/smart_planning/filter-process-master-header"
      );
      const dataProduct = response.data;
      setDistinctProduct(dataProduct);
    } catch (error) {
      console.error(`Error fetching distinct data ProductList: ${error}`);
    }
  };
  
  useEffect(() => {
    fetchProchead();
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
            <div style={{border: '1px solid black', width: 1800, height: 750, overflow: 'auto'}}>
              {isLoading ? (
                  <Custom_Progress />
              ) : (
                <table style={{width: 4700, borderCollapse: 'collapse',}}>
                <thead style={{fontSize: 16, position: 'sticky', }}>
                  <tr>
                    <th
                        style={{
                        textAlign: "center",
                        backgroundColor: "#4E31AA",
                        width: "120px",
                        border: 'solid black 1px',
                        color: 'white',

                        }}
                    >
                        Product name
                    </th>
                    {distinctProduct.map((item, index) => (
                      <th
                        style={{
                          backgroundColor: item.proc_disp?.includes("KRHOLD") ? "#FFA500" 
                                         : (item.proc_disp === 'FG Outer') ? "#00FF9C"
                                         : (item.proc_type === 'OR') ? "#DDDDDD"
                                         : (item.seq == 0 ) ? "#5DEBD7"
                                         : (item.sort_no >= 79 && item.sort_no <= 92) ? "#BBE2EC"
                                         : (item.sort_no >= 93 && item.sort_no <= 99) ? "#F6F7C4"
                                         : (item.sort_no >= 100 && item.sort_no <= 109) ? "#F6D6D6"
                                         : "#E8F9FF",  // #EAEFEF gray
                          height: "108px",
                          width: "25px",
                          border: 'solid black 2px',
                          padding: 0,
                          verticalAlign: 'bottom',
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
                           }}
                        >
                          {item.proc_disp}
                        </div>
                      </th>
                  ))}
                  </tr>
                </thead>
                <tbody style={{fontSize: 15, paddingLeft: '5px'}}>
                  <tr>
                    <td style={{paddingLeft: '5px'}}>
                      RGPZ-556ML-0A
                    </td>
                  </tr>
                  <tr>
                    <td style={{paddingLeft: '5px'}}>
                      RGPZ-556ML-0AL1
                    </td>
                  </tr>
                  <tr>
                    <td style={{paddingLeft: '5px'}}>
                      RGPZ-556ML-0AL4
                    </td>
                  </tr>
                </tbody>
              </table>
              )}
            </div>
          </Box>
      </div>
    </>
  );
}