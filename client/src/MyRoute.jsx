import { createBrowserRouter, RouterProvider, useNavigate } from "react-router-dom";
import AppLayout from "./Applayout/AppLayout";
import Home from "./Pages/Home";
import TradeChart from "./Pages/TradeChart";
import Deposite from "./Pages/Deposite";
import Withdraw from "./Pages/Withdraw";
import PasswordRecovery from "./Pages/PasswordRecovery";
import SideNavbar from "./Pages/SideNavbar";
import TradePair from "./components/TradePair";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

const MyRout = () => {
  const { userInfo} = useSelector((state) => state.auth);
  const navigate = useNavigate();
  console.log(userInfo)
  if (!userInfo) {
    navigate("/");
  }
  const router = createBrowserRouter([
    { path: "/TradePair", element: <TradePair /> },
    {
      path: "/",
      element: <AppLayout />,
      children: [
        { path: "/", element: <Home /> },
        { path: "/TradeChart", element: <TradeChart /> },
        { path: "/Deposite", element: <Deposite /> },
        { path: "/Withdraw", element: <Withdraw /> },
        { path: "/PasswordRecovery", element: <PasswordRecovery /> },
        { path: "/SideNavbar", element: <SideNavbar /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default MyRout;
