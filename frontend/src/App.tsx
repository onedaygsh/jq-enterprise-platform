import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Strategy from "./pages/Strategy";
import Business from "./pages/Business";
import Product from "./pages/Product";
import Finance from "./pages/Finance";
import Talent from "./pages/Talent";
import SupplyChain from "./pages/SupplyChain";
import GroupBlueprint from "./pages/GroupBlueprint";
import Platform from "./pages/Platform";
import System from "./pages/System";
import MasterData from "./pages/MasterData";
import MasterDataCrud from "./pages/MasterDataCrud";
import Manufacturing from "./pages/Manufacturing";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/group-blueprint" element={<GroupBlueprint />} />
        <Route path="/master-data" element={<MasterData />} />
        <Route path="/master-data-crud" element={<MasterDataCrud />} />
        <Route path="/manufacturing" element={<Manufacturing />} />
        <Route path="/strategy" element={<Strategy />} />
        <Route path="/business" element={<Business />} />
        <Route path="/product" element={<Product />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/talent" element={<Talent />} />
        <Route path="/supply-chain" element={<SupplyChain />} />
        <Route path="/platform" element={<Platform />} />
        <Route path="/system" element={<System />} />
      </Route>
    </Routes>
  );
}
