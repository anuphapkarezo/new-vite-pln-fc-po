import React, { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import Nav from "../components/Nav";
import axios from "axios";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Button from "@mui/material/Button";
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import Swal from 'sweetalert2';

export default function zPMC_Select_Product_To_Master_Header({ onSearch }) {
  localStorage.setItem('page_name', 'Select Product to Master');

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

  const [isError, setIsError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [distinctProductMain, setDistinctProductMain] = useState([]);
  const [distinctProductSub, setDistinctProductSub] = useState([]);
  const [distinctMasterMainProduct, setDistinctMasterMainProduct] = useState([]);
  const [distinctMasterSubProduct, setDistinctMasterSubProduct] = useState([]);

  const [selectedProductMain, setSelectedProductMain] = useState(null);
  const [selectedProductSub, setSelectedProductSub] = useState(null);

  const fetchProductMain = async () => {
    try {
      const response = await axios.get(
        "http://10.17.100.115:3001/api/smart_planning/PMC-filter-product-list-main"
      );
      const dataProduct = response.data;
      setDistinctProductMain(dataProduct);
    } catch (error) {
      console.error(`Error fetching distinct data ProductList: ${error}`);
    }
  };
  const fetchProductSub = async () => {
    try {
      const response = await axios.get(
        "http://10.17.100.115:3001/api/smart_planning/PMC-filter-product-list-sub"
      );
      const dataProduct = response.data;
      setDistinctProductSub(dataProduct);
    } catch (error) {
      console.error(`Error fetching distinct data ProductList: ${error}`);
    }
  };

  const fetchMasterMainProduct = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "http://10.17.100.115:3001/api/smart_planning/PMC-filter-master-main-product-select"
      );
      const dataProduct = response.data;
      setDistinctMasterMainProduct(dataProduct);
    } catch (error) {
      console.error(`Error fetching distinct data ProductList: ${error}`);
    } finally {
      setIsLoading(false); 
    }
  };
  const fetchMasterSubProduct = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "http://10.17.100.115:3001/api/smart_planning/PMC-filter-master-sub-product-select"
      );
      const dataProduct = response.data;
      setDistinctMasterSubProduct(dataProduct);
    } catch (error) {
      console.error(`Error fetching distinct data ProductList: ${error}`);
    } finally {
      setIsLoading(false); 
    }
  };
  
  useEffect(() => {
    fetchProductMain();
    fetchProductSub();
    fetchMasterMainProduct();
    fetchMasterSubProduct();
  }, []);

  const handleProductMainChange = (event, newValue) => {
    setSelectedProductMain(newValue);
  };
  const handleProductSubChange = (event, newValue) => {
    setSelectedProductSub(newValue);
  };

  const handleSave = async () => {
    const mainPrd = selectedProductMain?.product?.trim() || '';
    const subPrd = selectedProductSub?.product?.trim() || '';
    // console.log('mainPrd>' , mainPrd);
    // console.log('subPrd>' , subPrd);
    if (mainPrd === '' && subPrd === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Warning !',
        text: 'Please select Product Main OR Product Sub.',
        confirmButtonColor: '#4E71FF',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      // text: `Do you want to save the selected ?\n${mainPrd ? `Product Main: ${mainPrd}` : ''}${subPrd ? `\nSub: ${subPrd}` : ''}`,
      html: `Do you want to save the selected ?<br/>${mainPrd ? `Product Main: ${mainPrd}<br/>` : ''}${subPrd ? `Sub: ${subPrd}` : ''}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Save',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#4E71FF',
    });

    if (!result.isConfirmed) return;

    try {
      if (mainPrd !== ''){
        console.log('mainPrd>' , mainPrd);
        // Update status main product
        axios.get(
          `http://10.17.100.115:3001/api/smart_planning/PMC-update-master-main-product`
        )
        .then(() => {
        })
        .catch((error) => {
          console.error("There was an error updating the plan!", error);
        });

        // Insert new master main product 
        axios.get(
          `http://10.17.100.115:3001/api/smart_planning/PMC-insert-master-main-product?prd_name=${mainPrd}&update_date=${update_date}&update_by=${UpperUpdate_By}`
        )
        .then(() => {
          setSelectedProductMain(null);
          fetchMasterMainProduct();
        })
        .catch((error) => {
          console.error("There was an error updating the plan!", error);
        });
      }

      if (subPrd !== ''){
        console.log('subPrd>' , subPrd);
        // Update status sub product
        axios.get(
          `http://10.17.100.115:3001/api/smart_planning/PMC-update-master-sub-product`
        )
        .then(() => {
        })
        .catch((error) => {
          console.error("There was an error updating the plan!", error);
        });

        // Insert new master sub product 
        axios.get(
          `http://10.17.100.115:3001/api/smart_planning/PMC-insert-master-sub-product?prd_name=${subPrd}&update_date=${update_date}&update_by=${UpperUpdate_By}`
        )
        .then(() => {
          fetchMasterSubProduct();
          setSelectedProductSub(null);
        })
        .catch((error) => {
          console.error("There was an error updating the plan!", error);
        });
      }
      Swal.fire({
        icon: "success",
        title: "Save Success",
        text: "Saved successfully",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error("There was an error updating the plan!", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "There was an error saving the product(s).",
      });
    }
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
            <div style={{display: 'inline-flex', width: 680, height: 75, border: '1px solid black', borderRadius: 10, backgroundColor: '#E8F9FF', boxShadow: '0px 4px 16px rgba(31, 38, 135, 0.12)', marginBottom: '10px'}}>
              <Autocomplete
                disablePortal
                id="combo-box-demo-series"
                size="small"
                options={distinctProductMain}
                getOptionLabel={(option) => option && option.product}
                value={selectedProductMain}
                onChange={handleProductMainChange}
                sx={{ height: 40, width: 240, marginLeft: 2, marginTop: 2, backgroundColor: 'white' }}
                renderInput={(params) => (
                  <TextField {...params} label="Product Main" />
                )}
                isOptionEqualToValue={(option, value) =>
                  option && value && option.product === value.product
                }
              />

              <Autocomplete
                disablePortal
                id="combo-box-demo-series"
                size="small"
                options={distinctProductSub}
                getOptionLabel={(option) => option && option.product}
                value={selectedProductSub}
                onChange={handleProductSubChange}
                sx={{  height: 40, width: 240, marginLeft: 2, marginTop: 2, backgroundColor: 'white'}}
                renderInput={(params) => (
                  <TextField {...params} label="Product Sub" />
                )}
                isOptionEqualToValue={(option, value) =>
                  option && value && option.product === value.product
                }
              />

              <Button
                variant="contained"
                endIcon={<SaveAltIcon />}
                fontSize="large"
                style={{
                  width: "120px",
                  height: 40,
                  marginTop: '15px',
                  marginLeft: "15px",
                }}
                onClick={() => {
                  handleSave();
                  // countUsagedPO();
                }}
              >
                Submit
              </Button>
            </div>
            <div style={{display: 'inline-flex',}}>

              <div style={{ width: 820, height: 700, overflow: 'auto'}}>
                {isLoading ? (
                    <Custom_Progress />
                ) : (
                  <table style={{width: 770, borderCollapse: 'collapse', boxShadow: '0px 4px 16px rgba(31, 38, 135, 0.12)',}}>
                  <thead style={{fontSize: 16, position: 'sticky', }}>
                    <tr>
                      <th
                          style={{
                          textAlign: "center",
                          backgroundColor: "#4E31AA",
                          width: "120px",
                          border: 'solid white 1px',
                          color: 'white',
                          height: "40px",   
                          }}
                      >
                          Product name
                      </th>
                      <th
                          style={{
                          textAlign: "center",
                          backgroundColor: "#4E31AA",
                          width: "100px",
                          border: 'solid white 1px',
                          color: 'white',

                          }}
                      >
                          Product Type
                      </th>
                      <th
                          style={{
                          textAlign: "center",
                          backgroundColor: "#4E31AA",
                          width: "80px",
                          border: 'solid white 1px',
                          color: 'white',

                          }}
                      >
                          Status
                      </th>
                      <th
                          style={{
                          textAlign: "center",
                          backgroundColor: "#4E31AA",
                          width: "100px",
                          border: 'solid white 1px',
                          color: 'white',

                          }}
                      >
                          Update by
                      </th>
                      <th
                          style={{
                          textAlign: "center",
                          backgroundColor: "#4E31AA",
                          width: "120px",
                          border: 'solid white 1px',
                          color: 'white',

                          }}
                      >
                        Update date
                      </th>
                    </tr>
                  </thead>
                  <tbody style={{fontSize: 15, paddingLeft: '5px'}}>
                    {distinctMasterMainProduct.map((item, index) => (
                      <tr key={index}>
                          <td style={{border: 'solid black 1px', 
                                      textAlign: 'left',
                                      height: "30px",
                                      paddingLeft: 10,
                                    }}
                              >
                              {item.prd_name || ""}
                          </td>
                          <td style={{border: 'solid black 1px', 
                                      textAlign: 'left',
                                      height: "30px",
                                      paddingLeft: 10,
                                    }}
                              >
                              {item.prd_type || ""}
                          </td>
                          <td style={{border: 'solid black 1px', 
                                      textAlign: 'center',
                                      height: "30px",
                                      paddingLeft: 10,
                                      backgroundColor: item.status === 'ACTIVE' ? "#00FF9C" : "#FFA500", // Highlight if price_remark exists
                                    }}
                              >
                              {item.status || ""}
                          </td>
                          <td style={{border: 'solid black 1px', 
                                      textAlign: 'center',
                                      height: "30px",
                                      paddingLeft: 10,
                                    }}
                              >
                              {item.update_by || ""}
                          </td>
                          <td style={{border: 'solid black 1px', 
                                      textAlign: 'center',
                                      height: "30px",
                                      paddingLeft: 10,
                                    }}
                              >
                              {item.update_date || ""}
                          </td>
                      </tr> 
                    ))}
                  </tbody>
                </table>
                )}
              </div>

              <div style={{ width: 820, height: 700, overflow: 'auto'}}>
                {isLoading ? (
                    <Custom_Progress />
                ) : (
                  <table style={{width: 770, borderCollapse: 'collapse', boxShadow: '0px 4px 16px rgba(31, 38, 135, 0.12)',}}>
                  <thead style={{fontSize: 16, position: 'sticky', }}>
                    <tr>
                      <th
                          style={{
                          textAlign: "center",
                          backgroundColor: "#4E31AA",
                          width: "120px",
                          border: 'solid white 1px',
                          color: 'white',
                          height: "40px",   
                          }}
                      >
                          Product name
                      </th>
                      <th
                          style={{
                          textAlign: "center",
                          backgroundColor: "#4E31AA",
                          width: "100px",
                          border: 'solid white 1px',
                          color: 'white',

                          }}
                      >
                          Product Type
                      </th>
                      <th
                          style={{
                          textAlign: "center",
                          backgroundColor: "#4E31AA",
                          width: "80px",
                          border: 'solid white 1px',
                          color: 'white',

                          }}
                      >
                          Status
                      </th>
                      <th
                          style={{
                          textAlign: "center",
                          backgroundColor: "#4E31AA",
                          width: "100px",
                          border: 'solid white 1px',
                          color: 'white',

                          }}
                      >
                          Update by
                      </th>
                      <th
                          style={{
                          textAlign: "center",
                          backgroundColor: "#4E31AA",
                          width: "120px",
                          border: 'solid white 1px',
                          color: 'white',

                          }}
                      >
                        Update date
                      </th>
                    </tr>
                  </thead>
                  <tbody style={{fontSize: 15, paddingLeft: '5px'}}>
                    {distinctMasterSubProduct.map((item, index) => (
                      <tr key={index}>
                          <td style={{border: 'solid black 1px', 
                                      textAlign: 'left',
                                      height: "30px",
                                      paddingLeft: 10,
                                    }}
                              >
                              {item.prd_name || ""}
                          </td>
                          <td style={{border: 'solid black 1px', 
                                      textAlign: 'left',
                                      height: "30px",
                                      paddingLeft: 10,
                                    }}
                              >
                              {item.prd_type || ""}
                          </td>
                          <td style={{border: 'solid black 1px', 
                                      textAlign: 'center',
                                      height: "30px",
                                      paddingLeft: 10,
                                      backgroundColor: item.status === 'ACTIVE' ? "#00FF9C" : "#FFA500", // Highlight if price_remark exists
                                    }}
                              >
                              {item.status || ""}
                          </td>
                          <td style={{border: 'solid black 1px', 
                                      textAlign: 'center',
                                      height: "30px",
                                      paddingLeft: 10,
                                    }}
                              >
                              {item.update_by || ""}
                          </td>
                          <td style={{border: 'solid black 1px', 
                                      textAlign: 'center',
                                      height: "30px",
                                      paddingLeft: 10,
                                    }}
                              >
                              {item.update_date || ""}
                          </td>
                      </tr> 
                    ))}
                  </tbody>
                </table>
                )}
              </div>
            </div>
            
          </Box>
      </div>
    </>
  );
}