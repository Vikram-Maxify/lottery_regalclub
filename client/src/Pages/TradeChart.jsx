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
  // Track if initial fetch has happened
  const isInitialFetchDone = useRef(false);

  //30 sec
  const [seconds, setSeconds] = useState(30);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [times, setTime] = useState({
    minute: 0,
    secondtime1: 0,
    secondtime2: 0,
  });
  // console.log(period, "period");

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

  // Shared WebSocket connection. ChartSection and TradeChart now
  // receive the same server clock instead of opening two sockets.
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

  // Call once on mount
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
      isInitialFetchDone.current && // Only after initial fetch
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
      isInitialFetchDone.current && // Only after initial fetch
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

  //popup
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
      case 0: // Pending
        return "bg-yellow-500 bg-opacity-20 text-[#B8860B]";
      case 1: // Completed
        return "bg-green-500 bg-opacity-20 text-green-400";
      default: // Failed
        return "bg-red-500 bg-opacity-20 text-red-400";
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
      }  text-[#222222] bg-white lg:h-[89.5vh] overflow-auto lg:overflow-hidden`}
    >
      <div
        className={`
    transition-all duration-500 ease-in-out
    overflow-hidden
    lg:block hidden
    ${topPopupOpen ? "w-[550px] opacity-100" : "w-0 opacity-0"}
  `}
      >
      </div>

      {/* Chart Section */}
      <div className={`${isMobile ? "w-full" : "w-4/5"} px-2 md:p-4`}>
        <div className=" rounded-xl h-full">
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
        <div className="md:bg-white rounded-[14px] border border-[#E8D49A] shadow-[0_4px_18px_rgba(164,124,25,0.10)] p-2 md:p-4 h-full flex flex-col justify-around">
          {/* Pair Header */}
          <div className="justify-between items-center mb-3 md:mb-4 hidden lg:flex">
            <div className="flex items-center justify-between w-full space-x-2">
              <span className="text-base md:text-lg font-bold text-[#2D2415] leading-tight">
                USD/JPY <span className="block">(OTC)</span>
              </span>

              <span className="bg-gradient-to-b from-[#E8C860] via-[#C99A29] to-[#A97808] text-white font-bold px-3 py-1.5 rounded-md text-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_2px_5px_rgba(169,120,8,0.22)]">
                93%
              </span>
            </div>
          </div>

          {/* Mobile Pair Selector */}
          <span>
            <span
              onClick={() => SetShowButton((prev) => !prev)}
              className="flex items-center gap-1 cursor-pointer lg:hidden bg-[#FBF7EB] border border-[#E8D49A] p-1 rounded-lg w-fit h-[4vh]"
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
                <span className="font-semibold text-xs text-[#2D2415]">
                  USD/JPY (OTC)
                </span>
                <div className="text-[#B8860B] font-bold text-xs">93%</div>
                <span>
                  {" "}
                  <FaCaretDown className="text-[#B8860B] text-xl" />
                </span>
              </div>
            </span>
          </span>

          {/* Time + Investment */}
          <div className="flex md:flex-col gap-1">
            {/* Time Selection */}
            <div className="mb-3 md:mb-2 w-full">
              <label className="block text-xs md:text-sm font-bold mb-1 md:mb-2 text-[#3A2E18]">
                Time
              </label>

              <div className="text-sm font-bold w-full bg-[#FBF5E5] border border-[#E8D49A] rounded-[10px] p-1 md:p-2 text-center h-[4vh] md:h-[6vh] flex items-center justify-center text-[#6A4C12] shadow-[inset_0_1px_3px_rgba(164,124,25,0.06)]">
                0{times.minute}: {times.secondtime1}
                {times.secondtime2}s
              </div>
            </div>

            {/* Investment Selection */}
            <div className="mb-4 md:mb-4 w-full">
              <label className="block text-xs md:text-sm font-bold mb-1 md:mb-2 text-[#3A2E18]">
                Investment
              </label>

              <div className="flex items-center justify-between bg-[#FBF5E5] border border-[#E8D49A] rounded-[10px] p-1 md:p-1 h-[4vh] md:h-[6vh] shadow-[inset_0_1px_3px_rgba(164,124,25,0.06)]">
                <button
                  onClick={() => handleInvestmentChange(-1)}
                  className="bg-[#FFFDF7] border border-[#E8D49A] text-[#8A6514] w-10 h-full rounded-[8px] text-lg font-bold flex items-center justify-center hover:bg-[#F7EED6] transition-colors"
                >
                  -
                </button>

                <div className="flex items-center space-x-1 text-center text-xs md:text-sm">
                  <p className="text-sm font-bold size-fit mt-[2px] text-[#A87809]">
                    <FiDollarSign />
                  </p>

                  <input
                    type="number"
                    value={investment}
                    onChange={(e) => setInvestment(e.target.value)}
                    placeholder="investment"
                    className="text-[#2D2415] font-bold text-sm w-[50px] bg-transparent border-none focus:outline-none text-center"
                  />
                </div>

                <button
                  onClick={() => handleInvestmentChange(1)}
                  className="bg-[#FFFDF7] border border-[#E8D49A] text-[#8A6514] w-10 h-full rounded-[8px] text-lg font-bold flex items-center justify-center hover:bg-[#F7EED6] transition-colors"
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
                className="bg-gradient-to-b from-[#FFF19A] via-[#FFC928] to-[#D99200]
border border-[#FFD75A]
shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_2px_7px_rgba(210,145,0,0.45)] hover:from-[#F0D678] hover:via-[#D3A934] hover:to-[#B9850A] text-black px-5 py-2 md:px-10 md:py-3 rounded-[11px] h-[5vh] md:h-[6vh] flex items-center justify-between font-bold space-x-1 md:space-x-2 transition-all text-xs md:text-sm"
              >
                <span>Up</span>
                <FaArrowUp className="text-xs md:text-sm bg-white/20 size-6 p-1 rounded-full" />
              </button>

              <p className="text-center text-sm hidden md:flex items-center justify-center text-[#2D2415]">
                Your payout:{" "}
                <span className="font-bold flex items-center text-[#2D2415]">
                  {" "}
                  <FiDollarSign className="mt-1 text-[#A87809]" />
                  {(investment + investment * 0.93).toFixed(2)}
                </span>
              </p>

              {/* DOWN */}
              <button
                disabled={isDisabled}
                onClick={handleDown}
                className="bg-white border-2 border-[#D4AF37] hover:bg-[#FFF9EA] text-[#E7443A] px-5 py-2 md:px-10 md:py-3 rounded-[11px] h-[5vh] md:h-[6vh] flex items-center justify-between font-bold space-x-1 md:space-x-2 transition-all text-xs md:text-sm shadow-[0_2px_6px_rgba(164,124,25,0.08)]"
              >
                <span>Down</span>
                <FaArrowDown className="text-xs md:text-sm bg-[#FDE6E2] text-[#E7443A] size-6 p-1 rounded-full" />
              </button>
            </div>

            {/* Conditionally Render the Popup */}
            {popup && (
              <div className="relative">
                {/* Background Overlay */}
                <div className="fixed inset-0 bg-black bg-opacity-40 z-30 transition-opacity duration-500"></div>

                {/* Popup Content */}
                <div
                  className="sm:w-[350px] lg:w-[400px] md:w-[500px] h-[250px] bg-white z-50 fixed rounded-3xl overflow-hidden shadow-xl transition-transform duration-500 transform"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {/* Close Button */}
                  <button
                    className="absolute top-2 right-2 text-white w-[30px] h-[30px] bg-[#D4AF37] flex items-center justify-center rounded"
                    onClick={closePopup}
                  >
                    X
                  </button>

                  {/* Popup Content */}
                  <div className="flex justify-center items-center h-full text-[#333333] text-center px-4">
                    <div className="text-lg">Your bet is successfully won!</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tooltip */}
          <div className="text-xxs md:text-xs text-[#6F6250] text-center p-2 md:p-3 hidden md:flex items-center justify-center gap-2 bg-[#FBF5E5] border border-[#E8D49A] rounded-[10px] leading-relaxed">
            <span className="text-[#B8860B] text-base">◷</span>
            <span>
              Opening deals by time is currently available only for OTC trading.
            </span>
          </div>
        </div>

        {/* Trades/Orders Panel */}
        <div className="bg-[#FFFFFF] rounded flex-grow hidden md:flex flex-col">
          {/* Tabs */}
          <div className="flex border-b gap-2 border-[#E5DFCFFF]">
            <button
              className={`flex-1 py-2 md:py-3 flex items-center justify-center rounded text-xs md:text-sm ${
                activeTab === "trades"
                  ? "rounded-lg bg-gradient-to-b from-[#FFF19A] via-[#FFC928] to-[#D99200] border border-[#FFD75A] shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_2px_7px_rgba(210,145,0,0.45)] text-black"
                  : "hover:bg-[#F3F0E8]"
              } transition-colors`}
              onClick={() => setActiveTab("trades")}
            >
              <span className="mr-1 md:mr-2">Trades</span>
              <span className="bg-[#E8E2D2] text-white px-1 md:px-2 py-0.5 rounded text-xxs md:text-xs">
                {traderhistory?.length}
              </span>
            </button>
            <button
              className={`flex-1 py-2 md:py-3 flex items-center justify-center text-xs md:text-sm rounded ${
                activeTab === "orders"
                  ? "rounded-lg bg-gradient-to-b from-[#FFF19A] via-[#FFC928] to-[#D99200] border border-[#FFD75A] shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_2px_7px_rgba(210,145,0,0.45)] text-black"
                  : "hover:bg-[#F3F0E8]"
              } transition-colors`}
              onClick={() => setActiveTab("orders")}
            >
              <FaList className="mr-1 md:mr-2 text-xs md:text-sm" />
              <span className="bg-[#E8E2D2] text-white px-1 md:px-2 py-0.5 rounded text-xxs md:text-xs">
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
              <div className="h-full flex flex-col justify-start text-[#777777]">
                <div className="overflow-x-hidden w-full text-center">
                  <div className="w-full text-sm text-[#555555] space-y-3 overflow-auto h-[40vh]">
                    {traderhistory?.map((trade) => (
                      <div className="border-b border-[#E5DFCFFF]">
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
                            <span className="text-[#333333] text-sm font-semibold">
                              USD/JPY ( OT ....
                            </span>
                            <span className="text-[#777777] text-sm font-medium uppercase">
                              {trade?.bet}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-[#333333] text-sm font-semibold">
                              {" "}
                              {trade.amount}
                            </span>
                          </div>
                          <div>
                            <span
                              className={`text-sm font-semibold ${
                                trade.status === 0
                                  ? "text-[#B8860B]"
                                  : trade.getAmount > 0
                                    ? "text-green-500"
                                    : "text-red-500"
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
              <div className="h-full flex flex-col justify-start text-[#777777]">
                <div className="overflow-x-hidden w-full text-center">
                  <div className="w-full text-sm text-[#555555] space-y-3 overflow-auto h-[40vh]">
                    {pendingResult?.map((trade) => (
                      <div className="border-b border-[#E5DFCFFF]">
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
                            <span className="text-[#333333] text-base font-semibold">
                              USD/JPY ( OT ....
                            </span>
                            <span className="text-[#777777] font-medium uppercase">
                              {trade?.bet}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-[#333333] text-base font-semibold">
                              {" "}
                              {trade.amount}
                            </span>
                          </div>
                          <div>
                            <span
                              className={`text-base font-semibold ${
                                trade.status === 0
                                  ? "text-[#B8860B]"
                                  : trade.getAmount > 0
                                    ? "text-green-500"
                                    : "text-red-500"
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
            className="w-full py-1 md:py-2 bg-[#F3F0E8] hover:bg-[#E8E2D2] transition-colors flex items-center justify-center"
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
          className="text-white bg-[#FFFFFF] rounded p-1"
        >
          <MdWorkHistory className="text-2xl" />
        </div>
      </div>
      {history && (
        <div className="bg-[#FFFFFF] rounded flex-grow md:flex flex-col w-full absolute bottom-10 z-20">
          {/* Tabs */}
          <div className="flex border-b gap-2 border-[#E5DFCFFF]">
            <button
              className={`flex-1 py-2 md:py-3 flex items-center justify-center rounded text-xs md:text-sm ${
                activeTab === "trades"
                  ? "bg-[#D4AF37] text-white"
                  : "hover:bg-[#F3F0E8]"
              } transition-colors`}
              onClick={() => setActiveTab("trades")}
            >
              <span className="mr-1 md:mr-2">Trades</span>
              <span className="bg-[#E8E2D2] text-white px-1 md:px-2 py-0.5 rounded text-xxs md:text-xs">
                {traderhistory?.length}
              </span>
            </button>
            <button
              className={`flex-1 py-2 md:py-3 flex items-center justify-center text-xs md:text-sm rounded ${
                activeTab === "orders"
                  ? "bg-[#D4AF37] text-white"
                  : "hover:bg-[#F3F0E8]"
              } transition-colors`}
              onClick={() => setActiveTab("orders")}
            >
              <FaList className="mr-1 md:mr-2 text-xs md:text-sm" />
              <span className="bg-[#E8E2D2] text-white px-1 md:px-2 py-0.5 rounded text-xxs md:text-xs">
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
              <div className="h-full flex flex-col justify-start text-[#777777]">
                <div className="overflow-x-hidden w-full text-center">
                  <div className="w-full text-sm text-[#555555] space-y-3 overflow-auto h-[30vh]">
                    {traderhistory?.map((trade) => (
                      <div className="border-b border-[#E5DFCFFF]">
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
                            <span className="text-[#333333] text-sm font-semibold">
                              USD/JPY ( OT ....
                            </span>
                            <span className="text-[#777777] font-medium uppercase">
                              {trade?.bet}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-[#333333] text-sm font-semibold">
                              {" "}
                              {trade.amount}
                            </span>
                          </div>
                          <div>
                            <span
                              className={`text-sm font-semibold ${
                                trade.status === 0
                                  ? "text-[#B8860B]"
                                  : trade.getAmount > 0
                                    ? "text-green-500"
                                    : "text-red-500"
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
              <div className="h-full flex flex-col justify-start text-[#777777]">
                <div className="overflow-x-hidden w-full text-center">
                  <div className="w-full text-sm text-[#555555] space-y-3 overflow-auto h-[40vh]">
                    {pendingResult?.map((trade) => (
                      <div className="border-b border-[#E5DFCFFF]">
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
                            <span className="text-[#333333] text-sm font-semibold">
                              USD/JPY ( OT ....
                            </span>
                            <span className="text-[#777777] font-medium uppercase">
                              {trade?.bet}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-[#333333] text-sm font-semibold">
                              {" "}
                              {trade.amount}
                            </span>
                          </div>
                          <div>
                            <span
                              className={`text-sm font-semibold ${
                                trade.status === 0
                                  ? "text-[#B8860B]"
                                  : trade.getAmount > 0
                                    ? "text-green-500"
                                    : "text-red-500"
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
            className="w-full py-1 md:py-2 bg-[#F3F0E8] hover:bg-[#E8E2D2] transition-colors flex items-center justify-center"
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
        <div className="fixed inset-0 z-[999] bg-black/30 flex items-start md:items-center justify-center">
          <div
            className="
        relative
        w-full
        h-full
        md:w-[750px]
        md:h-[600px]
        md:rounded-2xl
        bg-white
        shadow-[0_15px_50px_rgba(126,92,20,0.18)]
        overflow-hidden
        flex flex-col
      "
          >
            {/* ================= HEADER ================= */}
            <div
              className="
          flex items-center justify-between
          px-4 md:px-5
          py-3.5 md:py-4
          border-b border-[#E8DFC9]
          bg-gradient-to-r from-white via-[#FFFDF8] to-[#FBF5E8]
          shrink-0
        "
            >
              <div className="flex items-center gap-2">
                <div
                  className="
              w-1
              h-6
              rounded-full
              bg-gradient-to-b
              from-[#E9C961]
              via-[#C99A29]
              to-[#A97808]
            "
                />

                <h3 className="font-bold text-base md:text-lg text-[#2F281D]">
                  Select trade pair
                </h3>
              </div>

              <button
                onClick={() => SetShowButton(false)}
                className="
            w-9 h-9
            flex items-center justify-center
            rounded-lg
            bg-[#F8F3E7]
            border border-[#E4D6B5]
            text-[#8A6514]
            hover:bg-[#D4AF37]
            hover:text-white
            transition-all
          "
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* ================= FILTER ================= */}
            <div
              className="
          px-4 md:px-5
          py-2.5
          border-b border-[#ECE4D4]
          bg-white
          shrink-0
        "
            >
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`
              relative
              px-2 py-2
              text-[11px] md:text-xs
              font-bold
              tracking-wide
              transition-all
              ${
                activeFilter === filter
                  ? "text-[#A87808]"
                  : "text-[#8A816F] hover:text-[#B8860B]"
              }
            `}
                >
                  {filter}

                  {activeFilter === filter && (
                    <span
                      className="
                  absolute
                  left-1
                  right-1
                  bottom-0
                  h-[2px]
                  rounded-full
                  bg-gradient-to-r
                  from-[#E9C961]
                  via-[#C99A29]
                  to-[#A97808]
                "
                    />
                  )}
                </button>
              ))}
            </div>

            {/* ================= SEARCH ================= */}
            <div
              className="
          px-4 md:px-5
          py-3
          border-b border-[#ECE4D4]
          bg-[#FFFDF9]
          shrink-0
        "
            >
              <div className="relative w-full">
                <div
                  className="
              absolute
              inset-y-0
              left-0
              pl-3
              flex
              items-center
              pointer-events-none
            "
                >
                  <FaSearch className="text-[#B8860B]" />
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search trade pair..."
                  className="
              block
              w-full
              pl-10
              pr-4
              py-2.5
              rounded-xl
              border border-[#E4D7B9]
              bg-white
              text-[#332B20]
              placeholder-[#A69D8C]
              text-sm
              focus:outline-none
              focus:border-[#C99A29]
              focus:ring-2
              focus:ring-[#D4AF37]/20
              transition-all
            "
                />
              </div>
            </div>

            {/* ================= MOBILE LIST ================= */}
            <div className="md:hidden flex-1 overflow-y-auto bg-[#FCFAF6] p-3 space-y-2">
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
                  className="
              w-full
              bg-white
              rounded-xl
              border border-[#E9DFC8]
              px-3
              py-3
              shadow-[0_2px_8px_rgba(126,92,20,0.06)]
              active:scale-[0.99]
              transition-all
            "
                >
                  <div className="flex items-center justify-between">
                    {/* LEFT */}
                    <div className="flex items-center min-w-0">
                      <button
                        className="
                    relative
                    w-10
                    h-7
                    mr-3
                    shrink-0
                  "
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
                          className="
                      absolute
                      left-0
                      top-0
                      w-7
                      h-7
                      rounded-full
                      object-cover
                      border-2
                      border-white
                      shadow-sm
                      z-10
                    "
                        />

                        <img
                          src={asset.flag2}
                          alt=""
                          className="
                      absolute
                      left-[14px]
                      top-0
                      w-7
                      h-7
                      rounded-full
                      object-cover
                      border-2
                      border-white
                      shadow-sm
                    "
                        />
                      </button>

                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-[#2F281D] truncate">
                          {asset.pair}
                        </span>

                        <span className="text-[10px] text-[#958B79] uppercase mt-0.5">
                          {asset.type}
                        </span>
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`
                    flex items-center
                    text-xs
                    font-bold
                    ${asset.change >= 0 ? "text-[#149B58]" : "text-[#E0574D]"}
                  `}
                      >
                        {asset.change >= 0 ? (
                          <FaArrowUp className="mr-1 text-[10px]" />
                        ) : (
                          <FaArrowDown className="mr-1 text-[10px]" />
                        )}
                        {Math.abs(asset.change)}%
                      </span>

                      <span
                        className="
                    px-2
                    py-1
                    rounded-md
                    bg-gradient-to-b
                    from-[#E9C961]
                    via-[#C99A29]
                    to-[#A97808]
                    text-white
                    text-xs
                    font-bold
                    shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]
                  "
                      >
                        {asset.payout1}%
                      </span>
                    </div>
                  </div>

                  {/* Bottom Info */}
                  <div
                    className="
                mt-2.5
                pt-2
                border-t border-[#F0E8D8]
                flex items-center justify-between
              "
                  >
                    <span className="text-[10px] text-[#9B917F]">
                      Profit 30 sec
                    </span>

                    <span className="text-[10px] font-semibold text-[#A87808]">
                      1+ min: {asset.payout2}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ================= DESKTOP TABLE ================= */}
            <div className="hidden md:block flex-1 overflow-y-auto">
              <table className="min-w-full divide-y divide-[#ECE4D4]">
                <thead className="bg-[#FCFAF5] sticky top-0 z-10">
                  <tr>
                    <th
                      className="
                  px-6 py-3.5
                  text-left
                  text-[11px]
                  font-bold
                  text-[#958B79]
                  uppercase
                  tracking-[0.08em]
                "
                    >
                      Name
                    </th>

                    <th
                      className="
                  px-6 py-3.5
                  text-left
                  text-[11px]
                  font-bold
                  text-[#958B79]
                  uppercase
                  tracking-[0.08em]
                "
                    >
                      24h change
                    </th>

                    <th
                      className="
                  px-6 py-3.5
                  text-left
                  text-[11px]
                  font-bold
                  text-[#958B79]
                  uppercase
                  tracking-[0.08em]
                "
                    >
                      Profit 30 sec
                    </th>

                    <th
                      className="
                  px-6 py-3.5
                  text-left
                  text-[11px]
                  font-bold
                  text-[#958B79]
                  uppercase
                  tracking-[0.08em]
                "
                    >
                      1+ min
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-[#F0E8D8]">
                  {filteredAssets.map((asset, index) => (
                    <tr
                      key={asset.id}
                      className="
                  hover:bg-[#FFFCF5]
                  cursor-pointer
                  transition-colors
                "
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
                            className="
                        mr-3
                        text-[#9A907D]
                        hover:text-[#B8860B]
                        transition-colors
                      "
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
                                className="
                            h-5 w-5
                            rounded-full
                            object-cover
                            border border-white
                          "
                              />

                              <img
                                src={asset.flag2}
                                alt=""
                                className="
                            h-5 w-5
                            rounded-full
                            object-cover
                            absolute left-2.5
                            border border-white
                          "
                              />
                            </div>
                          </button>

                          <span className="text-[#2F281D] font-semibold text-sm">
                            {asset.pair}

                            <span className="text-[#958B79] ml-1 font-normal">
                              ({asset.type})
                            </span>
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`
                      flex items-center
                      font-semibold
                      ${asset.change >= 0 ? "text-[#149B58]" : "text-[#E0574D]"}
                    `}
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
                        <span
                          className="
                      inline-flex
                      px-2.5
                      py-1
                      rounded-full
                      bg-[#FBF3DD]
                      border border-[#E7D28F]
                      text-[#A87808]
                      text-xs
                      font-bold
                    "
                        >
                          {asset.payout1}%
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className="
                      inline-flex
                      px-2.5
                      py-1
                      rounded-full
                      bg-[#FBF3DD]
                      border border-[#E7D28F]
                      text-[#A87808]
                      text-xs
                      font-bold
                    "
                        >
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
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white border border-[#D4AF37]/40 p-6 rounded text-center shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-2">Coming Soon!</h2>
            <p className="text-[#555555]">
              This chart is not available at the moment. For technical reasons,
              we cannot show the chart of this pair, please choose another
              trading pair.
            </p>
            <button
              onClick={() => setComming(false)}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded "
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
