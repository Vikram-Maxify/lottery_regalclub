import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import TradeChart from "./Pages/TradeChart";
import SideNavbar from "./Pages/SideNavbar";
import PasswordRecovery from "./Pages/PasswordRecovery";
import Withdraw from "./Pages/Withdraw";
import Deposite from "./Pages/Deposite";
import TradePair from "./components/TradePair";
import PrivateRoute from "./PrivateRoute";
import Header from "./components/Header";
import BonusPage from "./Pages/BouncePage";
import DepositPayment from "./Pages/DepositPayment";
import MobileFooter from "./components/MobileFooter";
import SupportModal from "./Pages/Support";

import { useDispatch, useSelector } from "react-redux";
import { getUser } from "./Redux/Reducer/authReducer";

function App() {
  const dispatch = useDispatch();

  const {
    userInfo,
    loading,
  } = useSelector((state) => state.auth);

  // ============================================================
  // CHECK MAIN-DOMAIN AUTH
  // ============================================================

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  // ============================================================
  // APP
  // ============================================================

  return (
    <Router>
      <Header />

      <Routes>

        {/* ======================================================
            ALL TRADE ROUTES ARE PROTECTED
            ====================================================== */}
                      <Route
            path="/"
            element={<TradeChart />}
          />


        <Route element={<PrivateRoute />}>

          {/* ROOT */}

          {/* TRADE CHART */}
          <Route
            path="/TradeChart"
            element={<TradeChart />}
          />

          {/* SIDE NAVBAR */}
          <Route
            path="/SideNavbar"
            element={<TradeChart />}
          />

          {/* WITHDRAW */}
          <Route
            path="/Withdraw"
            element={<Withdraw />}
          />

          {/* DEPOSIT */}
          <Route
            path="/Deposite"
            element={<Deposite />}
          />

          {/* TRADE PAIR */}
          <Route
            path="/TradePair"
            element={<TradePair />}
          />

          {/* BONUS */}
          <Route
            path="/bounce-page"
            element={<BonusPage />}
          />

          {/* DEPOSIT PAYMENT */}
          <Route
            path="/deposit-payment"
            element={<DepositPayment />}
          />

          {/* SUPPORT */}
          <Route
            path="/support"
            element={<SupportModal />}
          />

        </Route>

        {/* ======================================================
            PASSWORD RECOVERY
            ====================================================== */}

        <Route
          path="/PasswordRecovery"
          element={<PasswordRecovery />}
        />

      </Routes>

      {/* ========================================================
          MOBILE FOOTER
          ======================================================== */}

      {userInfo && <MobileFooter />}

      {/* ========================================================
          TOAST
          ======================================================== */}

      <ToastContainer
        theme="dark"
        autoClose={1000}
      />
    </Router>
  );
}

export default App;
