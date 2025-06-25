import "./App.css";
import { Route, Routes } from "react-router-dom";
import Planning_Forecast_POPage from "./pages/Planning_Forecast_POPage";
import Planning_Forecast_POPage_New from "./pages/Planning_Forecast_POPage_New";
import Planning_Forecast_AnalysisPage from "./pages/Planning_Forecast_AnalysisPage";
import Planning_Forecast_time_Capacity from "./pages/Planning_Forecast_time_Capacity";
import Planning_Forecast_time_Capacity_Chart from "./pages/Planning_Forecast_time_Capacity_Chart";
import Planning_Manage_Machine_In_Process from "./pages/Planning_Manage_Machine_In_Process";
import Process_STD_Leasdtime_Master from "./pages/Process_STD_Leasdtime_Master";
import Product_Routing_No_STD_LT from "./pages/Product_Routing_No_STD_LT";
import Login from "./pages/Login";
import Nav from "../src/components/Nav";
import { Fragment } from "react";
import ProtectedRoutes from "./components/auths/ProtectedRoutes";
import Planning_Product_Price_Analysis from "./pages/Planning_Product_Price_Analysis";
import Planning_PO_FC_bill_to from "./pages/Planning_PO_FC_bill_to";
import Planning_Product_Master from "./pages/Planning_Product_Master";
import LoginNew from "./pages/LoginNew";
import Planning_Product_MultiLayer_Control from "./pages/zPMC_Planning_Product_MultiLayer_Control";
import PMC_Select_Product_To_Master_Header from "./pages/zPMC_Select_Product_To_Master_Header";
import PMC_Fg_Stock_Production from "./pages/zPMC_Fg_Stock_Production";
import PMC_Plan_per_day from "./pages/zPMC_Plan_per_day";
import Planning_Monthly_Plan_Product from "./pages/Planning_Monthly_Plan_Product";
import Planning_Product_Routing_List from "./pages/Planning_Product_Routing_List";

export default function App() {
  return (
    <Fragment>
      <Routes>
        <Route path="/" element={<LoginNew />} />
        <Route path="/login" element={<LoginNew />} />
        

        {/* Protect */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/home" element={<Nav />} />
          <Route path="/pln_fc_po" element={<Planning_Forecast_POPage />} />
          <Route path="/pln_fc_po_new" element={<Planning_Forecast_POPage_New />} />
          <Route path="/pln_fc_analysis" element={<Planning_Forecast_AnalysisPage />}/>
          <Route path="/pln_fc_time_cap" element={<Planning_Forecast_time_Capacity />}/>
          <Route path="/pln_fc_time_cap_chart" element={<Planning_Forecast_time_Capacity_Chart />}/>
          <Route path="/pln_manage_mc_in_proc" element={<Planning_Manage_Machine_In_Process />}/>
          <Route path="/proc_std_lt_master" element={<Process_STD_Leasdtime_Master />}/>
          <Route path="/prod_rout_no_std_lt" element={<Product_Routing_No_STD_LT />}/>
          <Route path="/pln_prod_price_analysis" element={<Planning_Product_Price_Analysis />}/>
          <Route path="/pln_po_fc_bill_to_master" element={<Planning_PO_FC_bill_to />}/>
          <Route path="/pln_product_master" element={<Planning_Product_Master />}/>
          <Route path="/pln_pmc_product_multilayer_control" element={<Planning_Product_MultiLayer_Control />}/>
          <Route path="/pln_pmc_select_product_to_master_header" element={<PMC_Select_Product_To_Master_Header />}/>
          <Route path="/pln_pmc_fg_stock_production" element={<PMC_Fg_Stock_Production />}/>
          <Route path="/pln_pmc_plan_per_day" element={<PMC_Plan_per_day />}/>
          <Route path="/pln_monthly_plan_product" element={<Planning_Monthly_Plan_Product />}/>
          <Route path="/pln_prod_rout_list" element={<Planning_Product_Routing_List />}/>
        </Route>
        {/* Protect */}
      </Routes>
    </Fragment>
  );
}
