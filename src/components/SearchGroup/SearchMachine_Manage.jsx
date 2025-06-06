import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import React, { useState, useEffect } from "react";
import axios from "axios";
//count usage function
import countUsagedPO from "../catchCount/CountUsagePO.jsx";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

function SearchMachine_Manage({ onSearch }) {
  const [error, setError] = useState(null);

  //Set Dropdown List
  const [SelectedFactory, setSelectedFactory] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedGroupProcess, setSelectedGroupProcess] = useState(null);

  //Set Parameter from API
  const [distinctFactory, setDistinctFactory] = useState([]);
  const [distinctUnit, setDistinctUnit] = useState([]);
  const [distinctGroupProcess, setDistinctGroupProcess] = useState([]);

  const fetchFactory = async () => {
    try {
      const response = await axios.get(
        "http://10.17.100.115:3001/api/smart_planning/filter-factory-list-machine-manage"
      );
      const data = response.data;
      setDistinctFactory(data);
    } catch (error) {
      console.error(`Error fetching distinct data Period List: ${error}`);
    }
  };

  const fetchUnit = async () => {
    // console.log('SelectedFactory >' , SelectedFactory);
    try {
      const response = await axios.get(
        `http://10.17.100.115:3001/api/smart_planning/filter-unit-list-machine-manage?factory=${SelectedFactory.factory}`
      );
      const data = response.data;
      setDistinctUnit(data);
    } catch (error) {
      console.error(`Error fetching distinct data Unit List: ${error}`);
    }
  };

  const fetchGroupProcess = async () => {
    try {
      const response = await axios.get(
        `http://10.17.100.115:3001/api/smart_planning/filter-group-process-list-machine-manage?factory=${SelectedFactory.factory}&unit=${selectedUnit.unit}`
      );
      const data = response.data;
      setDistinctGroupProcess(data);
    } catch (error) {
      console.error(`Error fetching distinct data Group process List: ${error}`);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  //สร้าง Function selection change
  const handleFactoryChange = (event, newValue) => {
    setSelectedFactory(newValue);
    setSelectedUnit(null);
    setSelectedGroupProcess(null);
  };

  const handleUnitChange = (event, newValue) => {
    setSelectedUnit(newValue);
    setSelectedGroupProcess(null);
  };

  const handleGroupProcessChange = (event, newValue) => {
    setSelectedGroupProcess(newValue);
  };

  const handleSearch = () => {
    if (SelectedFactory == null || selectedUnit == null || selectedGroupProcess == null) {
      // console.log('1');
    } else {
      // console.log('2');
      const queryParams = {
        factory: SelectedFactory.factory,
        unit: selectedUnit.unit,
        group_process: selectedGroupProcess.group_process,
      };
      console.log(queryParams);
      onSearch(queryParams); // Invoke the callback function with the selected values
    }
    
  };

  useEffect(() => {
    fetchFactory();
    if (SelectedFactory == null) {
    } else {
      fetchUnit();
    }
    if (selectedUnit == null) {
    } else {
      fetchGroupProcess();
    }
  }, [SelectedFactory , selectedUnit , selectedGroupProcess]);

  return (
    <React.Fragment>
      <div>
        <h5
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#006769",
            width: "500px",
            paddingLeft: "5px",
            marginBottom: "20px",
            // backgroundColor: '#CAE6B2',
          }}
        >
          {/* Machine in Process Management */}
        </h5>
      </div>
      <Box maxWidth="xl" sx={{ width: "100%", height: 50 }}>
        <Grid container spacing={0} style={{ width: 1350 }}>
          <Grid item xs={2} md={2}>
            <div style={{ display: "grid", placeItems: "center" }}>
              <Autocomplete
                disablePortal
                // freeSolo
                id="combo-box-demo-product"
                size="small"
                options={distinctFactory}
                getOptionLabel={(option) => option && option.factory}
                value={SelectedFactory}
                onChange={handleFactoryChange}
                sx={{ width: 215 }}
                renderInput={(params) => (
                  <TextField {...params} label="Factory" />
                )}
                isOptionEqualToValue={(option, value) =>
                  option && value && option.factory === value.factory
                }
              />
            </div>
          </Grid>

          <Grid item xs={2} md={2}>
            <div style={{ display: "grid", placeItems: "center" }}>
              <Autocomplete
                disablePortal
                // freeSolo
                id="combo-box-demo-product"
                size="small"
                options={distinctUnit}
                getOptionLabel={(option) => option && option.unit}
                value={selectedUnit}
                onChange={handleUnitChange}
                sx={{ width: 215 }}
                renderInput={(params) => (
                  <TextField {...params} label="Unit" />
                )}
                isOptionEqualToValue={(option, value) =>
                  option && value && option.unit === value.unit
                }
              />
            </div>
          </Grid>

          <Grid item xs={2} md={2}>
            <div style={{ display: "grid", placeItems: "center" }}>
              <Autocomplete
                disablePortal
                // freeSolo
                id="combo-box-demo-product"
                size="small"
                options={distinctGroupProcess}
                getOptionLabel={(option) => option && option.group_process}
                value={selectedGroupProcess}
                onChange={handleGroupProcessChange}
                sx={{ width: 215 }}
                renderInput={(params) => (
                  <TextField {...params} label="Group process" />
                )}
                isOptionEqualToValue={(option, value) =>
                  option && value && option.group_process === value.group_process
                }
              />
            </div>
          </Grid>

          <Grid item xs={2} md={2}>
            <Button
              variant="contained"
              size="small"
              style={{
                width: "150px",
                height: "40px",
                marginLeft: "30px",
                backgroundColor: '#40A578'
              }}
              onClick={() => {
                handleSearch();
              }}
            >
              Search
            </Button>
          </Grid>

        </Grid>
      </Box>
    </React.Fragment>
  );
}

export default SearchMachine_Manage;
