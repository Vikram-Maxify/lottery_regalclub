import { useEffect, useRef, useState } from "react";
import {
  FaArrowDown,
  FaArrowUp,
  FaCaretUp,
  FaList,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { FaCaretDown } from "react-icons/fa6";
import { FiDollarSign } from "react-icons/fi";
import { MdWorkHistory } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import flag3 from "../assets/universalImage/Bangladesh-512.webp";
import flag4 from "../assets/universalImage/brazil.webp";
import flag5 from "../assets/universalImage/can.webp";
import flag2 from "../assets/universalImage/circle-flag-of-japan-free-png.webp";
import flag1 from "../assets/universalImage/circle-flag-of-usa-free-png.webp";
import flag6 from "../assets/universalImage/col.webp";
import flag7 from "../assets/universalImage/turky.webp";
import ChartSection from "../components/ChartSection";
import { getUser } from "../Redux/Reducer/authReducer";
import {
  betHistory,
  getPeriod,
  pendingHistory,
  placebet,
} from "../Redux/Reducer/betReducer";
import { subscribeSocket } from "../Redux/socket";

const tokken = localStorage.getItem("token");

console.log("tokken in trade chart:", tokken);

const TradeChart = () => {
  const { period, bet, traderhistory, pendingResult } = useSelector(
    (state) => state.bet,
  );
  const [investment, setInvestment] = useState(70);
  const [activeTab, setActiveTab] = useState("trades");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [history, setHistory] = useState(false);
  const [showButton, SetShowButton] = useState(false);
  const [comming, setComming] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const isInitialFetchDone = useRef(false);

  // 30 sec
  const [seconds, setSeconds] = useState(30);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [times, setTime] = useState({
    minute: 0,
    secondtime1: 0,
    secondtime2: 0,
  });

  // TopX Purple gradient
  const purpleGradient =
    "bg-gradient-to-br from-[#B45CFF] via-[#7418F5] to-[#3A00C9] border border-[#C77AFF] shadow-[0_0_8px_#B45CFF,0_0_18px_rgba(139,43,255,0.75),inset_0_2px_4px_rgba(255,255,255,0.45),inset_0_-5px_8px_rgba(30,0,100,0.45)]";

  useEffect(() => {
    if (
      times.minute === 0 &&
      times.secondtime1 === 0 &&
      times.secondtime2 <= 5
    ) {
      setIsDisabled(true);
    } else {
      setIsDisabled(false);
    }
  }, [times.minute, times.secondtime1, times.secondtime2]);

  useEffect(() => {
    const unsubscribe = subscribeSocket((data) => {
      if (data.event === "timeUpdate_30") {
        setTime({
          minute: data.minute,
          secondtime1: data.secondtime1,
          secondtime2: data.secondtime2,
        });
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isInitialFetchDone.current) {
      dispatch(getPeriod({ page: 1, limit: 10 }));
      isInitialFetchDone.current = true;
    }
  }, [dispatch]);

  useEffect(() => {
    dispatch(betHistory());
  }, [dispatch]);
  useEffect(() => {
    dispatch(pendingHistory());
  }, [dispatch]);

  useEffect(() => {
    if (
      isInitialFetchDone.current &&
      times.minute === 0 &&
      times.secondtime1 === 0 &&
      times.secondtime2 === 4
    ) {
      dispatch(getPeriod({ page: 1, limit: 10 }));
      dispatch(betHistory());
    }
  }, [times, dispatch]);

  useEffect(() => {
    if (
      isInitialFetchDone.current &&
      times.minute === 0 &&
      times.secondtime1 === 3 &&
      times.secondtime2 === 0
    ) {
      dispatch(betHistory());
    }
  }, [times, dispatch]);

  useEffect(() => {
    if (seconds === 0) return;
    const intervalId = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [seconds]);

  useEffect(() => {
    if (seconds === 0) {
      const timeoutId = setTimeout(() => {
        setSeconds(30);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [seconds]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleInvestmentChange = (amount) => {
    setInvestment((prev) => Math.max(0, prev + amount));
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const [popup, setPopup] = useState(false);

  const handleUp = () => {
    dispatch(
      placebet({
        tradeType: "Crypto",
        amount: investment,
        period: period,
        bet: "up",
      }),
    ).then((res) => {
      if (res.payload.data.success) {
        toast.success(res.payload.data.message);
        dispatch(getUser());
        dispatch(betHistory());
      } else {
        toast.error("Insufficient balance");
      }
    });
  };

  const handleDown = () => {
    dispatch(
      placebet({
        tradeType: "Crypto",
        amount: investment,
        period: period,
        bet: "down",
      }),
    ).then((res) => {
      if (res.payload.data.success) {
        toast.success(res.payload.data.message);
        dispatch(getUser());
        dispatch(betHistory());
      } else {
        toast.error(res.payload.message);
      }
    });
  };

  const closePopup = () => {
    setPopup(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPopup(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 0:
        return "bg-[#F1C40F]/20 text-[#F1C40F]";
      case 1:
        return "bg-[#00E676]/20 text-[#00E676]";
      default:
        return "bg-red-500/20 text-red-400";
    }
  };
  const [topPopupOpen, setTopPopupOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("CURRENCIES");

  const filters = ["CURRENCIES"];

  const assets = [
    {
      id: 1,
      pair: "USD/JPY",
      type: "OTC",
      change: 0.81,
      payout1: 93,
      payout2: 93,
      link: "/SideNavbar",
      flag1: flag1,
      flag2: flag2,
    },
    {
      id: 2,
      pair: "USD/BRL",
      type: "OTC",
      change: -1.22,
      payout1: 86,
      payout2: 86,
      flag1: flag1,
      flag2: flag4,
    },
    {
      id: 3,
      pair: "USD/BDT",
      type: "OTC",
      change: 0.45,
      payout1: 24,
      payout2: 93,
      flag1: flag1,
      flag2: flag3,
    },
    {
      id: 4,
      pair: "USD/TRY",
      type: "OTC",
      change: -0.32,
      payout1: 93,
      payout2: 93,
      flag1: flag1,
      flag2: flag7,
    },
    {
      id: 5,
      pair: "USD/COP",
      type: "OTC",
      change: -0.32,
      payout1: 93,
      payout2: 93,
      flag1: flag1,
      flag2: flag6,
    },
    {
      id: 6,
      pair: "NZD/CAD",
      type: "OTC",
      change: -0.32,
      payout1: 93,
      payout2: 93,
      flag1: flag1,
      flag2: flag5,
    },
  ];

  const filteredAssets = assets.filter(
    (asset) =>
      asset.pair.toLowerCase().includes(searchQuery.toLowerCase()) &&
      activeFilter === "CURRENCIES",
  );

  return (
    <div
      className={`flex ${
        isMobile ? "flex-col " : "h-screen"
      } text-white bg-[#0B0410] lg:h-[89.5vh] overflow-auto lg:overflow-hidden`}
    >
      <div
        className={`
    transition-all duration-500 ease-in-out
    overflow-hidden
    lg:block hidden
    ${topPopupOpen ? "w-[550px] opacity-100" : "w-0 opacity-0"}
  `}
      ></div>

      {/* Chart Section */}
      <div className={`${isMobile ? "w-full" : "w-4/5"} px-2 md:p-4`}>
        <div className="rounded-xl h-full">
          <ChartSection investment={investment} />
        </div>
      </div>

      {/* Control Panel */}
      <div
        className={`${
          isMobile ? "w-full h-[25vh] justify-center mt-5 " : "w-1/5"
        } flex flex-col space-y-2 md:space-y-4 p-2 md:p-2`}
      >
        {/* Trading Panel */}
        <div className="md:bg-[#1C0F2B] rounded-[14px] border border-[#2a1b3d] shadow-[0_4px_18px_rgba(0,0,0,0.4)] p-2 md:p-4 h-full flex flex-col justify-around">
          {/* Pair Header */}
          <div className="justify-between items-center mb-3 md:mb-4 hidden lg:flex">
            <div className="flex items-center justify-between w-full space-x-2">
              <span className="text-base md:text-lg font-bold text-white leading-tight">
                USD/JPY <span className="block">(OTC)</span>
              </span>

              <span
                className={`${purpleGradient} text-white font-bold px-3 py-1.5 rounded-md text-sm`}
              >
                93%
              </span>
            </div>
          </div>

          {/* Mobile Pair Selector */}
          <span>
            <span
              onClick={() => SetShowButton((prev) => !prev)}
              className="flex items-center gap-1 cursor-pointer lg:hidden bg-[#12061C] border border-[#2a1b3d] p-1 rounded-lg w-fit h-[4vh]"
            >
              <div className="flex items-center relative w-8">
                <img
                  src={flag1}
                  alt=""
                  className="h-4 w-4 overflow-hidden rounded-full object-cover"
                />
                <img
                  src={flag2}
                  alt=""
                  className="h-4 w-4 overflow-hidden rounded-full object-cover absolute left-2.5"
                />
              </div>

              <div className="flex gap-2">
                <span className="font-semibold text-xs text-white">
                  USD/JPY (OTC)
                </span>
                <div className="text-[#C77AFF] font-bold text-xs">93%</div>
                <span>
                  <FaCaretDown className="text-[#C77AFF] text-xl" />
                </span>
              </div>
            </span>
          </span>

          {/* Time + Investment */}
          <div className="flex md:flex-col gap-1">
            {/* Time Selection */}
            <div className="mb-3 md:mb-2 w-full">
              <label className="block text-xs md:text-sm font-bold mb-1 md:mb-2 text-gray-300">
                Time
              </label>

              <div className="text-sm font-bold w-full bg-[#12061C] border border-[#2a1b3d] rounded-[10px] p-1 md:p-2 text-center h-[4vh] md:h-[6vh] flex items-center justify-center text-[#C77AFF]">
                0{times.minute}: {times.secondtime1}
                {times.secondtime2}s
              </div>
            </div>

            {/* Investment Selection */}
            <div className="mb-4 md:mb-4 w-full">
              <label className="block text-xs md:text-sm font-bold mb-1 md:mb-2 text-gray-300">
                Investment
              </label>

              <div className="flex items-center justify-between bg-[#12061C] border border-[#2a1b3d] rounded-[10px] p-1 md:p-1 h-[4vh] md:h-[6vh]">
                <button
                  onClick={() => handleInvestmentChange(-1)}
                  className="bg-[#1C0F2B] border border-[#2a1b3d] text-[#C77AFF] w-10 h-full rounded-[8px] text-lg font-bold flex items-center justify-center hover:bg-[#2a1b3d] transition-colors"
                >
                  -
                </button>

                <div className="flex items-center space-x-1 text-center text-xs md:text-sm">
                  <p className="text-sm font-bold size-fit mt-[2px] text-[#C77AFF]">
                    <FiDollarSign />
                  </p>

                  <input
                    type="number"
                    value={investment}
                    onChange={(e) => setInvestment(e.target.value)}
                    placeholder="investment"
                    className="text-white font-bold text-sm w-[50px] bg-transparent border-none focus:outline-none text-center"
                  />
                </div>

                <button
                  onClick={() => handleInvestmentChange(1)}
                  className="bg-[#1C0F2B] border border-[#2a1b3d] text-[#C77AFF] w-10 h-full rounded-[8px] text-lg font-bold flex items-center justify-center hover:bg-[#2a1b3d] transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div>
            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-3 mb-3 md:mb-4">
              {/* UP */}
              <button
                disabled={isDisabled}
                onClick={handleUp}
                className={`${purpleGradient} text-white px-5 py-2 md:px-10 md:py-3 rounded-[11px] h-[5vh] md:h-[6vh] flex items-center justify-between font-bold space-x-1 md:space-x-2 transition-all text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span>Up</span>
                <FaArrowUp className="text-xs md:text-sm bg-white/20 size-6 p-1 rounded-full" />
              </button>

              <p className="text-center text-sm hidden md:flex items-center justify-center text-gray-300">
                Your payout:{" "}
                <span className="font-bold flex items-center text-white">
                  <FiDollarSign className="mt-1 text-[#C77AFF]" />
                  {(investment + investment * 0.93).toFixed(2)}
                </span>
              </p>

              {/* DOWN */}
              <button
                disabled={isDisabled}
                onClick={handleDown}
                className="bg-[#1C0F2B] border-2 border-[#9B59B6]/50 hover:bg-[#2a1b3d] text-[#E74C3C] px-5 py-2 md:px-10 md:py-3 rounded-[11px] h-[5vh] md:h-[6vh] flex items-center justify-between font-bold space-x-1 md:space-x-2 transition-all text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Down</span>
                <FaArrowDown className="text-xs md:text-sm bg-red-500/20 text-[#E74C3C] size-6 p-1 rounded-full" />
              </button>
            </div>

            {/* Popup */}
            {popup && (
              <div className="relative">
                <div className="fixed inset-0 bg-black bg-opacity-40 z-30 transition-opacity duration-500"></div>

                <div
                  className="sm:w-[350px] lg:w-[400px] md:w-[500px] h-[250px] bg-[#1C0F2B] z-50 fixed rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-[#2a1b3d] transition-transform duration-500 transform"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <button
                    className={`absolute top-2 right-2 text-white w-[30px] h-[30px] ${purpleGradient} flex items-center justify-center rounded`}
                    onClick={closePopup}
                  >
                    X
                  </button>

                  <div className="flex justify-center items-center h-full text-white text-center px-4">
                    <div className="text-lg">Your bet is successfully won!</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tooltip */}
          <div className="text-xxs md:text-xs text-gray-400 text-center p-2 md:p-3 hidden md:flex items-center justify-center gap-2 bg-[#12061C] border border-[#2a1b3d] rounded-[10px] leading-relaxed">
            <span className="text-[#C77AFF] text-base">◷</span>
            <span>
              Opening deals by time is currently available only for OTC trading.
            </span>
          </div>
        </div>

        {/* Trades/Orders Panel */}
        <div className="bg-[#1C0F2B] border border-[#2a1b3d] rounded flex-grow hidden md:flex flex-col">
          {/* Tabs */}
          <div className="flex border-b gap-2 border-[#2a1b3d]">
            <button
              className={`flex-1 py-2 md:py-3 flex items-center justify-center rounded text-xs md:text-sm ${
                activeTab === "trades"
                  ? `${purpleGradient} text-white`
                  : "text-gray-400 hover:bg-[#2a1b3d]"
              } transition-colors`}
              onClick={() => setActiveTab("trades")}
            >
              <span className="mr-1 md:mr-2">Trades</span>
              <span className="bg-[#9B59B6]/30 text-white px-1 md:px-2 py-0.5 rounded text-xxs md:text-xs">
                {traderhistory?.length}
              </span>
            </button>
            <button
              className={`flex-1 py-2 md:py-3 flex items-center justify-center text-xs md:text-sm rounded ${
                activeTab === "orders"
                  ? `${purpleGradient} text-white`
                  : "text-gray-400 hover:bg-[#2a1b3d]"
              } transition-colors`}
              onClick={() => setActiveTab("orders")}
            >
              <FaList className="mr-1 md:mr-2 text-xs md:text-sm" />
              <span className="bg-[#9B59B6]/30 text-white px-1 md:px-2 py-0.5 rounded text-xxs md:text-xs">
                {pendingResult?.length || "0"}
              </span>
            </button>
          </div>

          {/* Content */}
          <div
            className={`flex-grow p-2 md:p-2 ${
              isExpanded ? "block" : "hidden"
            }`}
          >
            {activeTab === "trades" ? (
              <div className="h-full flex flex-col justify-start text-gray-400">
                <div className="overflow-x-hidden w-full text-center">
                  <div className="w-full text-sm text-gray-300 space-y-3 overflow-auto h-[40vh]">
                    {traderhistory?.map((trade) => (
                      <div className="border-b border-[#2a1b3d]">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center relative w-8">
                            <img
                              src={flag1}
                              alt=""
                              className="h-4 w-4 overflow-hidden rounded-full object-cover"
                            />
                            <img
                              src={flag2}
                              alt=""
                              className="h-4 w-4 overflow-hidden rounded-full object-cover absolute left-2.5"
                            />
                          </div>
                          <div className="flex justify-between item-center w-full">
                            <span className="text-white text-sm font-semibold">
                              USD/JPY ( OT ....
                            </span>
                            <span className="text-gray-400 text-sm font-medium uppercase">
                              {trade?.bet}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-white text-sm font-semibold">
                              {" "}
                              {trade.amount}
                            </span>
                          </div>
                          <div>
                            <span
                              className={`text-sm font-semibold ${
                                trade.status === 0
                                  ? "text-[#F1C40F]"
                                  : trade.getAmount > 0
                                    ? "text-[#00E676]"
                                    : "text-red-400"
                              }`}
                            >
                              {trade.status === 0
                                ? "Pending"
                                : "$" + trade.getAmount}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-start text-gray-400">
                <div className="overflow-x-hidden w-full text-center">
                  <div className="w-full text-sm text-gray-300 space-y-3 overflow-auto h-[40vh]">
                    {pendingResult?.map((trade) => (
                      <div className="border-b border-[#2a1b3d]">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center relative w-8">
                            <img
                              src={flag1}
                              alt=""
                              className="h-5 w-5 overflow-hidden rounded-full object-cover"
                            />
                            <img
                              src={flag2}
                              alt=""
                              className="h-5 w-5 overflow-hidden rounded-full object-cover absolute left-2.5"
                            />
                          </div>
                          <div className="flex justify-between item-center w-full">
                            <span className="text-white text-base font-semibold">
                              USD/JPY ( OT ....
                            </span>
                            <span className="text-gray-400 font-medium uppercase">
                              {trade?.bet}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-white text-base font-semibold">
                              {" "}
                              {trade.amount}
                            </span>
                          </div>
                          <div>
                            <span
                              className={`text-base font-semibold ${
                                trade.status === 0
                                  ? "text-[#F1C40F]"
                                  : trade.getAmount > 0
                                    ? "text-[#00E676]"
                                    : "text-red-400"
                              }`}
                            >
                              {trade.status === 0
                                ? "Pending"
                                : "$" + trade.getAmount}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Toggle Button */}
          <button
            className="w-full py-1 md:py-2 bg-[#12061C] hover:bg-[#2a1b3d] transition-colors flex items-center justify-center text-[#C77AFF]"
            onClick={toggleExpand}
          >
            <FaCaretUp
              className={`transition-transform text-xs md:text-sm ${
                isExpanded ? "rotate-0" : "rotate-180"
              }`}
            />
          </button>
        </div>
      </div>
      <div className="absolute top-20 left-2 block md:hidden">
        <div
          onClick={() => setHistory(!history)}
          className="text-white bg-[#1C0F2B] border border-[#2a1b3d] rounded p-1"
        >
          <MdWorkHistory className="text-2xl text-[#C77AFF]" />
        </div>
      </div>
      {history && (
        <div className="bg-[#1C0F2B] border border-[#2a1b3d] rounded flex-grow md:flex flex-col w-full absolute bottom-10 z-20">
          {/* Tabs */}
          <div className="flex border-b gap-2 border-[#2a1b3d]">
            <button
              className={`flex-1 py-2 md:py-3 flex items-center justify-center rounded text-xs md:text-sm ${
                activeTab === "trades"
                  ? `${purpleGradient} text-white`
                  : "text-gray-400 hover:bg-[#2a1b3d]"
              } transition-colors`}
              onClick={() => setActiveTab("trades")}
            >
              <span className="mr-1 md:mr-2">Trades</span>
              <span className="bg-[#9B59B6]/30 text-white px-1 md:px-2 py-0.5 rounded text-xxs md:text-xs">
                {traderhistory?.length}
              </span>
            </button>
            <button
              className={`flex-1 py-2 md:py-3 flex items-center justify-center text-xs md:text-sm rounded ${
                activeTab === "orders"
                  ? `${purpleGradient} text-white`
                  : "text-gray-400 hover:bg-[#2a1b3d]"
              } transition-colors`}
              onClick={() => setActiveTab("orders")}
            >
              <FaList className="mr-1 md:mr-2 text-xs md:text-sm" />
              <span className="bg-[#9B59B6]/30 text-white px-1 md:px-2 py-0.5 rounded text-xxs md:text-xs">
                {pendingResult?.length || "0"}
              </span>
            </button>
          </div>

          {/* Content */}
          <div
            className={`flex-grow p-2 md:p-2 ${
              isExpanded ? "block" : "hidden"
            }`}
          >
            {activeTab === "trades" ? (
              <div className="h-full flex flex-col justify-start text-gray-400">
                <div className="overflow-x-hidden w-full text-center">
                  <div className="w-full text-sm text-gray-300 space-y-3 overflow-auto h-[30vh]">
                    {traderhistory?.map((trade) => (
                      <div className="border-b border-[#2a1b3d]">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center relative w-8">
                            <img
                              src={flag1}
                              alt=""
                              className="h-5 w-5 overflow-hidden rounded-full object-cover"
                            />
                            <img
                              src={flag2}
                              alt=""
                              className="h-5 w-5 overflow-hidden rounded-full object-cover absolute left-2.5"
                            />
                          </div>
                          <div className="flex justify-between item-center w-full">
                            <span className="text-white text-sm font-semibold">
                              USD/JPY ( OT ....
                            </span>
                            <span className="text-gray-400 font-medium uppercase">
                              {trade?.bet}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-white text-sm font-semibold">
                              {" "}
                              {trade.amount}
                            </span>
                          </div>
                          <div>
                            <span
                              className={`text-sm font-semibold ${
                                trade.status === 0
                                  ? "text-[#F1C40F]"
                                  : trade.getAmount > 0
                                    ? "text-[#00E676]"
                                    : "text-red-400"
                              }`}
                            >
                              {trade.status === 0
                                ? "Pending"
                                : "$" + trade.getAmount}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col justify-start text-gray-400">
                <div className="overflow-x-hidden w-full text-center">
                  <div className="w-full text-sm text-gray-300 space-y-3 overflow-auto h-[40vh]">
                    {pendingResult?.map((trade) => (
                      <div className="border-b border-[#2a1b3d]">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center relative w-8">
                            <img
                              src={flag1}
                              alt=""
                              className="h-5 w-5 overflow-hidden rounded-full object-cover"
                            />
                            <img
                              src={flag2}
                              alt=""
                              className="h-5 w-5 overflow-hidden rounded-full object-cover absolute left-2.5"
                            />
                          </div>
                          <div className="flex justify-between item-center w-full">
                            <span className="text-white text-sm font-semibold">
                              USD/JPY ( OT ....
                            </span>
                            <span className="text-gray-400 font-medium uppercase">
                              {trade?.bet}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-white text-sm font-semibold">
                              {" "}
                              {trade.amount}
                            </span>
                          </div>
                          <div>
                            <span
                              className={`text-sm font-semibold ${
                                trade.status === 0
                                  ? "text-[#F1C40F]"
                                  : trade.getAmount > 0
                                    ? "text-[#00E676]"
                                    : "text-red-400"
                              }`}
                            >
                              {trade.status === 0
                                ? "Pending"
                                : "$" + trade.getAmount}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Toggle Button */}
          <button
            className="w-full py-1 md:py-2 bg-[#12061C] hover:bg-[#2a1b3d] transition-colors flex items-center justify-center text-[#C77AFF]"
            onClick={toggleExpand}
          >
            <FaCaretUp
              className={`transition-transform text-xs md:text-sm ${
                isExpanded ? "rotate-0" : "rotate-180"
              }`}
            />
          </button>
        </div>
      )}

      {showButton && (
        <div className="fixed inset-0 z-[999] bg-black/70 flex items-start md:items-center justify-center">
          <div className="relative w-full h-full md:w-[750px] md:h-[600px] md:rounded-2xl bg-[#1C0F2B] border border-[#2a1b3d] shadow-[0_15px_50px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 md:px-5 py-3.5 md:py-4 border-b border-[#2a1b3d] bg-[#12061C] shrink-0">
              <div className="flex items-center gap-2">
                <div className={`w-1 h-6 rounded-full ${purpleGradient}`} />
                <h3 className="font-bold text-base md:text-lg text-white">
                  Select trade pair
                </h3>
              </div>

              <button
                onClick={() => SetShowButton(false)}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#1C0F2B] border border-[#2a1b3d] text-[#C77AFF] hover:bg-[#2a1b3d] hover:border-[#9B59B6]/50 transition-all"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* FILTER */}
            <div className="px-4 md:px-5 py-2.5 border-b border-[#2a1b3d] bg-[#12061C] shrink-0">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`relative px-2 py-2 text-[11px] md:text-xs font-bold tracking-wide transition-all ${
                    activeFilter === filter
                      ? "text-[#C77AFF]"
                      : "text-gray-500 hover:text-[#9B59B6]"
                  }`}
                >
                  {filter}
                  {activeFilter === filter && (
                    <span
                      className={`absolute left-1 right-1 bottom-0 h-[2px] rounded-full ${purpleGradient}`}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* SEARCH */}
            <div className="px-4 md:px-5 py-3 border-b border-[#2a1b3d] bg-[#12061C] shrink-0">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-[#9B59B6]" />
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search trade pair..."
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#2a1b3d] bg-[#1C0F2B] text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#B45CFF]/60 focus:ring-2 focus:ring-[#B45CFF]/20 transition-all"
                />
              </div>
            </div>

            {/* MOBILE LIST */}
            <div className="md:hidden flex-1 overflow-y-auto bg-[#12061C] p-3 space-y-2">
              {filteredAssets.map((asset, index) => (
                <div
                  key={asset.id}
                  onClick={() => {
                    if (index === 0) {
                      navigate("/SideNavbar");
                      SetShowButton(false);
                    } else {
                      setComming(true);
                      SetShowButton(false);
                    }
                  }}
                  className="w-full bg-[#1C0F2B] rounded-xl border border-[#2a1b3d] px-3 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.3)] active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                      <button
                        className="relative w-10 h-7 mr-3 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFavorites((prev) =>
                            prev.includes(asset.id)
                              ? prev.filter((id) => id !== asset.id)
                              : [...prev, asset.id],
                          );
                        }}
                      >
                        <img
                          src={asset.flag1}
                          alt=""
                          className="absolute left-0 top-0 w-7 h-7 rounded-full object-cover border-2 border-[#1C0F2B] shadow-sm z-10"
                        />
                        <img
                          src={asset.flag2}
                          alt=""
                          className="absolute left-[14px] top-0 w-7 h-7 rounded-full object-cover border-2 border-[#1C0F2B] shadow-sm"
                        />
                      </button>

                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-white truncate">
                          {asset.pair}
                        </span>
                        <span className="text-[10px] text-gray-500 uppercase mt-0.5">
                          {asset.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`flex items-center text-xs font-bold ${asset.change >= 0 ? "text-[#00E676]" : "text-[#E74C3C]"}`}
                      >
                        {asset.change >= 0 ? (
                          <FaArrowUp className="mr-1 text-[10px]" />
                        ) : (
                          <FaArrowDown className="mr-1 text-[10px]" />
                        )}
                        {Math.abs(asset.change)}%
                      </span>

                      <span
                        className={`px-2 py-1 rounded-md ${purpleGradient} text-white text-xs font-bold`}
                      >
                        {asset.payout1}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#2a1b3d] flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">
                      Profit 30 sec
                    </span>
                    <span className="text-[10px] font-semibold text-[#C77AFF]">
                      1+ min: {asset.payout2}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block flex-1 overflow-y-auto">
              <table className="min-w-full divide-y divide-[#2a1b3d]">
                <thead className="bg-[#12061C] sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.08em]">
                      Name
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.08em]">
                      24h change
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.08em]">
                      Profit 30 sec
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.08em]">
                      1+ min
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-[#1C0F2B] divide-y divide-[#2a1b3d]">
                  {filteredAssets.map((asset, index) => (
                    <tr
                      key={asset.id}
                      className="hover:bg-[#2a1b3d]/50 cursor-pointer transition-colors"
                      onClick={() => {
                        if (index === 0) {
                          navigate("/SideNavbar");
                          SetShowButton(false);
                        } else {
                          setComming(true);
                          SetShowButton(false);
                        }
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            className="mr-3 text-gray-500 hover:text-[#C77AFF] transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFavorites((prev) =>
                                prev.includes(asset.id)
                                  ? prev.filter((id) => id !== asset.id)
                                  : [...prev, asset.id],
                              );
                            }}
                          >
                            <div className="flex items-center relative w-8">
                              <img
                                src={asset.flag1}
                                alt=""
                                className="h-5 w-5 rounded-full object-cover border border-[#1C0F2B]"
                              />
                              <img
                                src={asset.flag2}
                                alt=""
                                className="h-5 w-5 rounded-full object-cover absolute left-2.5 border border-[#1C0F2B]"
                              />
                            </div>
                          </button>

                          <span className="text-white font-semibold text-sm">
                            {asset.pair}
                            <span className="text-gray-500 ml-1 font-normal">
                              ({asset.type})
                            </span>
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`flex items-center font-semibold ${asset.change >= 0 ? "text-[#00E676]" : "text-[#E74C3C]"}`}
                        >
                          {asset.change >= 0 ? (
                            <FaArrowUp className="mr-1 text-xs" />
                          ) : (
                            <FaArrowDown className="mr-1 text-xs" />
                          )}
                          {Math.abs(asset.change)}%
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-full bg-[#9B59B6]/15 border border-[#9B59B6]/30 text-[#C77AFF] text-xs font-bold">
                          {asset.payout1}%
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-full bg-[#9B59B6]/15 border border-[#9B59B6]/30 text-[#C77AFF] text-xs font-bold">
                          {asset.payout2}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {comming && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#1C0F2B] border border-[#9B59B6]/40 p-6 rounded text-center shadow-[0_8px_32px_rgba(0,0,0,0.6)] max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-2 text-white">
              Coming Soon!
            </h2>
            <p className="text-gray-400">
              This chart is not available at the moment. For technical reasons,
              we cannot show the chart of this pair, please choose another
              trading pair.
            </p>
            <button
              onClick={() => setComming(false)}
              className={`mt-4 px-4 py-2 ${purpleGradient} text-white rounded`}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeChart;
