import "./App.css";
import { Route, Routes } from "react-router-dom";
import Planning_Forecast_POPage from "./pages/Planning_Forecast_POPage";
import Planning_Forecast_POPage_New from "./pages/Planning_Forecast_POPage_New";
import Planning_Forecast_AnalysisPage from "./pages/Planning_Forecast_AnalysisPage";
import Planning_Forecast_time_Capacity from "./pages/Planning_Forecast_time_Capacity";
import Planning_Manage_Machine_In_Process from "./pages/Planning_Manage_Machine_In_Process";
import Process_STD_Leasdtime_Master from "./pages/Process_STD_Leasdtime_Master";
import Product_Routing_No_STD_LT from "./pages/Product_Routing_No_STD_LT";
import Login from "./pages/Login";
import Nav from "../src/components/Nav";
import { Fragment } from "react";
import ProtectedRoutes from "./components/auths/ProtectedRoutes";

export default function App() {
  return (
    <Fragment>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Protect */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/home" element={<Nav />} />
          <Route path="/pln_fc_po" element={<Planning_Forecast_POPage />} />
          <Route path="/pln_fc_po_new" element={<Planning_Forecast_POPage_New />} />
          <Route path="/pln_fc_analysis" element={<Planning_Forecast_AnalysisPage />}/>
          <Route path="/pln_fc_time_cap" element={<Planning_Forecast_time_Capacity />}/>
          <Route path="/pln_manage_mc_in_proc" element={<Planning_Manage_Machine_In_Process />}/>
          <Route path="/proc_std_lt_master" element={<Process_STD_Leasdtime_Master />}/>
          <Route path="/prod_rout_no_std_lt" element={<Product_Routing_No_STD_LT />}/>
        </Route>
        {/* Protect */}
      </Routes>
    </Fragment>
  );
}
