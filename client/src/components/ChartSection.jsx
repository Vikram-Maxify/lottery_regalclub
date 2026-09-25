import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactApexChart from "react-apexcharts";
import {
  FaArrowDown,
  FaArrowUp,
  FaCaretDown,
  FaPlus,
  FaRegStar,
  FaSearch,
  FaStar,
  FaTimes,
  FaWindowClose,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import flag3 from "../assets/universalImage/Bangladesh-512.webp";
import flag4 from "../assets/universalImage/brazil.webp";
import flag5 from "../assets/universalImage/can.webp";
import flag2 from "../assets/universalImage/circle-flag-of-japan-free-png.webp";
import flag1 from "../assets/universalImage/circle-flag-of-usa-free-png.webp";
import flag6 from "../assets/universalImage/col.webp";
import flag7 from "../assets/universalImage/turky.webp";
import { getBetGrapgResult } from "../Redux/Reducer/betReducer";
import { subscribeSocket } from "../Redux/socket";

function ChartSection({ investment }) {
  const dispatch = useDispatch();
  const { betResult, allTrade } = useSelector((state) => state.bet);
  const [series, setSeries] = useState([{ data: [] }]);
  const [comming, setComming] = useState(false);
  const [latestPrice, setLatestPrice] = useState("1.44634");
  const [currentCandle, setCurrentCandle] = useState(null);
  const isInitialFetchDone = useRef(false);
  const [xAxisRange, setXAxisRange] = useState({
    min: undefined,
    max: undefined,
  });
  const [touchState, setTouchState] = useState({
    startDistance: null,
    startRange: null,
  });

  const [zoomOutStep, setZoomOutStep] = useState(2); // values: 0, 1, 2

  const [times, setTime] = useState({
    minute: 0,
    secondtime1: 0,
    secondtime2: 0,
  });
  const navigate = useNavigate();

  const [isCandleMoving, setIsCandleMoving] = useState(false);
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startRange: { min: null, max: null },
    chartX: 0,
    chartWidth: 0,
  });
  const [isManualPan, setIsManualPan] = useState(false);
  const [ann, setAnn] = useState(70);
  const newestCandleTimeRef = useRef(null);
  const initialRangeSet = useRef(false);
  const DEFAULT_VISIBLE_CANDLES = 30;
  const CANDLE_INTERVAL = 10000;
  const candleStartTimeRef = useRef(null);
  const initialAnimationDone = useRef(false);

  // Ref for the chart wrapper div — needed for native (non-passive) wheel listener
  const chartWrapperRef = useRef(null);

  useEffect(() => {
    if (investment > 0) {
      setAnn(investment);
    }
  });
  // Shared WebSocket connection for synchronized trading time.
  // This component does not create its own socket.
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

  // Initial data fetch
  useEffect(() => {
    if (!isInitialFetchDone.current) {
      dispatch(getBetGrapgResult());
      isInitialFetchDone.current = true;
    }
  }, [dispatch]);
  useEffect(() => {
    dispatch(getBetGrapgResult());
  }, [dispatch]);

  // Periodic data refresh
  useEffect(() => {
    if (
      isInitialFetchDone.current &&
      times.minute === 0 &&
      times.secondtime1 === 0 &&
      times.secondtime2 === 4
    ) {
      dispatch(getBetGrapgResult());
    }
  }, [times, dispatch]);

  // Transform trade data for chart
  const transformedData = useMemo(() => {
    if (!allTrade) return [];
    return allTrade
      .map((trade) => ({
        y: [
          parseFloat(trade.open),
          parseFloat(trade.high),
          parseFloat(trade.low),
          parseFloat(trade.close),
        ],
        x: new Date(trade.x),
      }))
      .sort((a, b) => a.x - b.x); // Ensure chronological order
  }, [allTrade]);

  const prevPriceRef = useRef("1.44634");
  const MIN_ZOOM_RANGE = 100 * 1000;
  const MAX_ZOOM_RANGE = 200 * 1000;
  const DEFAULT_WINDOW_SIZE = 30;
  const MAX_CANDLE_HISTORY = 350;
  const RIGHT_PADDING = 130000;
  const SHIFT_AMOUNT = 5 * 10000;

  const generatePriceMovement = (basePrice) => {
    const direction = betResult > 4 ? 1 : -1;
    const change = direction * (0.00005 + Math.random() * 0.0002);
    return Number((basePrice + change).toFixed(5));
  };

  const latestClose = transformedData[transformedData.length - 1]?.y[3];
  const offset = 0.0002;

  const [yAxisRange, setYAxisRange] = useState({
    min: latestClose - offset,
    max: latestClose + offset,
  });

  // Keep refs of the latest data/range so the native wheel listener
  // (registered once) never reads stale closures.
  const transformedDataRef = useRef(transformedData);
  useEffect(() => {
    transformedDataRef.current = transformedData;
  }, [transformedData]);

  const xAxisRangeRef = useRef(xAxisRange);
  useEffect(() => {
    xAxisRangeRef.current = xAxisRange;
  }, [xAxisRange]);

  // Chart options configuration
  const options = useMemo(
    () => ({
      chart: {
        type: "candlestick",
        height: 1000,
        background: "#FFFFFF",
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350,
          },
        },
        toolbar: {
          show: false,
          tools: {
            download: false,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
          autoSelected: "zoom", // Default to zoom mode
        },
        zoom: {
          enabled: true,
          type: "xy",
          autoScaleYaxis: true,
          limits: {
            y: {
              min: 0.001, // Minimum y-axis range
              max: undefined,
            },
          },
          zoomedArea: {
            fill: {
              color: "#D8C28A",
              opacity: 0.4,
            },
            stroke: {
              color: "#B8891A",
              opacity: 0.8,
              width: 1,
            },
          },
        },
        pan: { enabled: true, mode: "xy" },
        events: {
          zoomed: (chartContext, { xaxis, yaxis }) => {
            const newMin = xaxis.min;
            const newMax = xaxis.max;
            const zoomRange = newMax - newMin;
            const center = (newMin + newMax) / 2;
            const visibleData = transformedData.filter(
              (d) => d.x >= xaxis.min && d.x <= xaxis.max,
            );

            let minPrice = Infinity;
            let maxPrice = -Infinity;

            visibleData.forEach((d) => {
              minPrice = Math.min(minPrice, d.y[1]);
              maxPrice = Math.max(maxPrice, d.y[2]);
            });

            const stepRatio = [1.0, 1.0, 1.0];
            const currentRatio = stepRatio[zoomOutStep];
            const maxAllowedRange = MAX_ZOOM_RANGE / currentRatio;

            let newStep = zoomOutStep;
            if (
              zoomRange > maxAllowedRange &&
              zoomOutStep < stepRatio.length - 1
            ) {
              newStep = 2;
            } else if (zoomRange < maxAllowedRange && zoomOutStep > 0) {
              newStep = 2;
            }

            if (newStep !== zoomOutStep) {
              const newRatio = stepRatio[newStep];

              setXAxisRange({
                min: center - MAX_ZOOM_RANGE / newRatio / 2,
                max: center + MAX_ZOOM_RANGE / newRatio / 2,
              });

              setZoomOutStep(newStep);

              const dynamicOffset = getDynamicOffset();
              const latestClose =
                transformedData[transformedData.length - 1]?.y[3] ||
                latestPrice;

              setYAxisRange({
                min: latestClose - dynamicOffset,
                max: latestClose + dynamicOffset,
              });
            } else {
              setXAxisRange({ min: newMin, max: newMax });
            }
          },

          events: {
            beforeZoom: (chartContext, { xaxis, yaxis }) => {
              const minRange = 30 * 60 * 1000;
              if (xaxis.max - xaxis.min < minRange) {
                return {
                  xaxis: {
                    min: xaxis.min,
                    max: xaxis.min + minRange,
                  },
                };
              }
              return { xaxis, yaxis };
            },
          },

          mouseDown: (event, chartContext, config) => {
            setIsManualPan(true);
            const xAxis = chartContext.w.globals.minX;
            const xAxisMax = chartContext.w.globals.maxX;
            const chartWidth = chartContext.w.globals.gridWidth;

            dragState.current = {
              isDragging: true,
              startX: event.clientX,
              startRange: { min: xAxis.min, max: xAxis.max },
              chartX: xAxis,
              chartWidth: chartWidth,
            };
          },
          mouseMove: (event, chartContext, config) => {
            if (!dragState.current.isDragging) return;

            const deltaX = event.clientX - dragState.current.startX;
            const timePerPixel =
              (dragState.current.startRange.max -
                dragState.current.startRange.min) /
              dragState.current.chartWidth;

            const transformedDataTimes = transformedData.map((d) =>
              d.x.getTime(),
            );
            const oldestCandle = Math.min(...transformedDataTimes);
            const newestCandle =
              Math.max(...transformedDataTimes) + RIGHT_PADDING;

            setXAxisRange((prev) => {
              let newMin =
                dragState.current.startRange.min - deltaX * timePerPixel;
              let newMax =
                dragState.current.startRange.max - deltaX * timePerPixel;

              if (newMax > newestCandle) {
                newMin -= newMax - newestCandle;
                newMax = newestCandle;
              }

              if (newMin < oldestCandle) {
                newMax += oldestCandle - newMin;
                newMin = oldestCandle;
              }

              return {
                min: Math.max(oldestCandle, newMin),
                max: Math.min(newestCandle, newMax),
              };
            });
          },
          mouseUp: () => {
            dragState.current.isDragging = false;
          },
        },
      },

      annotations: {
        yaxis: [
          {
            y: latestClose,
            borderColor: "#C89B3C",
            strokeDashArray: 4,
            label: {
              text: `(${latestClose})`,
              style: {
                color: "#FFFFFF",
                background: "#C89B3C",
                borderColor: "#B8891A",
              },
            },
          },
        ],
        xaxis: [
          {
            x: latestPrice,
            borderColor: "#D2AE55",
            label: {
              style: {
                color: "#fff",
              },
              text: "X-axis annotation - 22 Nov",
            },
          },
        ],
      },
      title: { text: "", align: "left", style: { color: "#6B5420" } },
      xaxis: {
        type: "datetime",
        min: xAxisRange.min,
        max: xAxisRange.max,
        labels: {
          style: { colors: "#A17A22" },
          datetimeFormatter: { hour: "HH:mm", minute: "HH:mm:ss" },
        },
        axisBorder: { color: "#E1D6BC" },
        axisTicks: { color: "#E1D6BC" },
        tickPlacement: "on",
        range: undefined,
        tickAmount: "dataPoints",
        group: {
          style: {
            colors: [],
          },
          groups: [],
        },
      },
      series: [
        {
          data: transformedData,
        },
      ],
      yaxis: {
        min: yAxisRange.min,
        max: yAxisRange.max,
        tooltip: { enabled: true },
        labels: {
          style: { colors: "#A17A22" },
          formatter: (val) => val.toFixed(5),
        },
        forceNiceScale: true,
        yxisBorder: { color: "#E1D6BC" },
        tickAmount: 8,
        stepSize: 4,
        opposite: true,
      },
      transition: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150,
        },
      },
      grid: {
        borderColor: "#E9E1CF",
        strokeDashArray: 0,
        xaxis: {
          lines: {
            show: true,
          },
        },
      },
      plotOptions: {
        candlestick: {
          colors: { upward: "#10a055", downward: "#e85b4e" },
          wick: { useFillColor: true },
          barWidth: "100%",
        },
      },
      tooltip: {
        theme: "dark",
        x: { format: "HH:mm:ss" },
        y: { formatter: (val) => val.toFixed(5) },
      },
    }),
    [xAxisRange, transformedData],
  );

  // Calculate dynamic offset based on zoom level
  const getDynamicOffset = () => {
    const baseMinOffset = 0.0005;

    if (transformedData.length === 0) return baseMinOffset;

    const visibleData = transformedData.filter(
      (d) => d.x.getTime() >= xAxisRange.min && d.x.getTime() <= xAxisRange.max,
    );

    if (visibleData.length === 0) return baseMinOffset;

    let minPrice = Infinity;
    let maxPrice = -Infinity;

    visibleData.forEach((d) => {
      minPrice = Math.min(minPrice, d.y[2]);
      maxPrice = Math.max(maxPrice, d.y[1]);
    });

    const priceRange = maxPrice - minPrice;

    return Math.max(baseMinOffset, priceRange * 0.5);
  };

  useEffect(() => {
    if (transformedData.length > 0) {
      const dynamicOffset = getDynamicOffset();
      const latestClose =
        transformedData[transformedData.length - 1]?.y[3] || latestPrice;

      setYAxisRange({
        min: latestClose - dynamicOffset,
        max: latestClose + dynamicOffset,
      });
    }
  }, [transformedData, zoomOutStep, latestPrice]);

  useEffect(() => {
    if (transformedData.length === 0 || !xAxisRange.min || !xAxisRange.max)
      return;

    const visibleData = transformedData.filter(
      (d) => d.x.getTime() >= xAxisRange.min && d.x.getTime() <= xAxisRange.max,
    );

    if (visibleData.length === 0) return;

    let minY = Infinity;
    let maxY = -Infinity;

    visibleData.forEach((d) => {
      minY = Math.min(minY, d.y[2]);
      maxY = Math.max(maxY, d.y[1]);
    });

    const currentRange = maxY - minY;
    const minRequiredRange = 0.001;

    let padding = 0;
    if (currentRange < minRequiredRange) {
      padding = (minRequiredRange - currentRange) / 2;
    } else {
      padding = currentRange * 0.05;
    }

    minY -= padding;
    maxY += padding;

    minY = Math.max(0, minY);

    setYAxisRange({
      min: Number(minY.toFixed(5)),
      max: Number(maxY.toFixed(5)),
    });
  }, [xAxisRange, transformedData]);

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (transformedData?.length > 0) {
      if (!initialAnimationDone.current) {
        initialAnimationDone.current = true;

        const lastCandleTime =
          transformedData[transformedData.length - 1].x.getTime();
        const visibleRange = DEFAULT_VISIBLE_CANDLES * CANDLE_INTERVAL;
        setXAxisRange({
          min: lastCandleTime - visibleRange,
          max: lastCandleTime + RIGHT_PADDING,
        });
      } else {
        const shouldAnimate = isInitialFetchDone.current;

        if (
          shouldAnimate &&
          !isAnimating &&
          times.minute === 0 &&
          times.secondtime1 === 0 &&
          times.secondtime2 <= 3
        ) {
          animateCandle(transformedData[0], 0);
          initialAnimationDone.current = true;
          animateCandle(
            transformedData[transformedData.length - 1],
            transformedData.length - 1,
          );
        } else if (!isAnimating) {
          setSeries([{ data: transformedData }]);
        }

        if (transformedData?.length > 0) {
          const newestCandle = transformedData[transformedData.length - 1];
          const newCandleTime = newestCandle.x.getTime() + RIGHT_PADDING;

          const maxZoomRange = 1744393458000 - 1744393888000;

          if (xAxisRange.min - xAxisRange.max > maxZoomRange) {
            setXAxisRange({
              min: xAxisRange.min + maxZoomRange,
              max: xAxisRange.max,
            });
          }
          if (!isManualPan && newCandleTime !== newestCandleTimeRef.current) {
            const visibleRange = xAxisRange.max - xAxisRange.min;

            setXAxisRange({
              min: newCandleTime - visibleRange,
              max: newCandleTime,
            });
          }

          newestCandleTimeRef.current = newCandleTime;
        }
      }
    }
  }, [transformedData, times]);

  const animateCandle = (candle, candleIndex) => {
    setIsAnimating(true);

    const initialData = transformedData.map((c, idx) =>
      idx === candleIndex
        ? { ...c, y: [c.y[0], c.y[0], c.y[0], c.y[0]] }
        : { ...c },
    );

    setSeries([{ data: initialData }]);

    const startTime = Date.now();
    const duration = 3000;
    const targetClose = candle.y[3];

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const currentClose = candle.y[0] + (targetClose - candle.y[0]) * progress;

      setSeries((prev) => {
        const newData = prev[0].data.map((c, idx) => {
          if (idx !== candleIndex) return c;
          return {
            ...c,
            y: [
              c.y[0],
              Math.max(c.y[0], currentClose),
              Math.min(c.y[0], currentClose),
              currentClose,
            ],
          };
        });

        return [{ data: newData }];
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (!isCandleMoving) return;

    const priceInterval = setInterval(() => {
      const currentPrice = Number.parseFloat(latestPrice);
      const newPrice = generatePriceMovement(currentPrice);
      setLatestPrice(newPrice.toFixed(5));

      setSeries((prev) => {
        if (!prev[0].data.length) return prev;
        const existingData = [...prev[0].data];
        const lastCandle = existingData[existingData.length - 1];
        const updatedCandle = {
          ...lastCandle,
          y: [
            lastCandle.y[0],
            Math.max(lastCandle.y[1], newPrice),
            Math.min(lastCandle.y[2], newPrice),
            newPrice,
          ],
        };
        return [{ data: [...existingData.slice(0, -1), updatedCandle] }];
      });
    }, 1000);

    return () => clearInterval(priceInterval);
  }, [isCandleMoving, latestPrice]);

  const handleMoveLeft = () => {
    setIsManualPan(true);
    if (transformedData.length === 0) return;

    const oldestCandleTime = transformedData[0].x.getTime();
    const currentRange = xAxisRange.max - xAxisRange.min;

    setXAxisRange((prev) => {
      const newMin = Math.max(oldestCandleTime, prev.min - SHIFT_AMOUNT);
      return {
        min: newMin,
        max: newMin + currentRange,
      };
    });
  };

  const handleMoveRight = () => {
    setIsManualPan(true);
    if (transformedData.length === 0) return;

    const newestCandleTime =
      transformedData[transformedData.length - 1].x.getTime() + RIGHT_PADDING;
    const currentRange = xAxisRange.max - xAxisRange.min;

    setXAxisRange((prev) => {
      const newMax = Math.min(newestCandleTime, prev.max + SHIFT_AMOUNT);
      return {
        min: newMax - currentRange,
        max: newMax,
      };
    });
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      setTouchState({
        startDistance: distance,
        startRange: { ...xAxisRange },
      });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && touchState.startDistance) {
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );

      const scale = currentDistance / touchState.startDistance;
      const range = touchState.startRange.max - touchState.startRange.min;
      const newRange = range / scale;

      const centerX =
        (touchState.startRange.min + touchState.startRange.max) / 2;

      setXAxisRange({
        min: centerX - newRange / 2,
        max: centerX + newRange / 2,
      });
    }
  };

  useEffect(() => {
    const preventDefault = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", preventDefault, { passive: false });

    return () => {
      document.removeEventListener("touchmove", preventDefault);
    };
  }, []);

  // ---- NEW: mouse wheel support (zoom + horizontal pan) ----
  // Plain vertical scroll  -> zoom in/out (centered on current view)
  // Shift+scroll / trackpad horizontal swipe -> pan left/right
  // Registered as a native listener with { passive: false } because React's
  // synthetic onWheel is passive by default and preventDefault() there is a no-op.
  useEffect(() => {
    const wrapper = chartWrapperRef.current;
    if (!wrapper) return;

    const handleWheel = (e) => {
      e.preventDefault();

      const data = transformedDataRef.current;
      if (!data || data.length === 0) return;

      const currentRange = xAxisRangeRef.current;
      if (currentRange.min == null || currentRange.max == null) return;

      const oldestCandleTime = data[0].x.getTime();
      const newestCandleTime =
        data[data.length - 1].x.getTime() + RIGHT_PADDING;

      const isHorizontalIntent =
        e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY);

      setIsManualPan(true);

      if (isHorizontalIntent) {
        // ---- PAN LEFT / RIGHT ----
        const rawDelta = e.shiftKey && e.deltaX === 0 ? e.deltaY : e.deltaX;
        const span = currentRange.max - currentRange.min;
        const panAmount = (rawDelta / 100) * (span * 0.08);

        setXAxisRange((prev) => {
          let newMin = prev.min + panAmount;
          let newMax = prev.max + panAmount;

          if (newMax > newestCandleTime) {
            newMin -= newMax - newestCandleTime;
            newMax = newestCandleTime;
          }
          if (newMin < oldestCandleTime) {
            newMax += oldestCandleTime - newMin;
            newMin = oldestCandleTime;
          }

          return { min: newMin, max: newMax };
        });
      } else {
        // ---- ZOOM IN / OUT ----
        // deltaY > 0 => scrolled down => zoom out; deltaY < 0 => zoom in
        const zoomFactor = e.deltaY > 0 ? 1.12 : 0.88;
        const span = currentRange.max - currentRange.min;
        let newSpan = span * zoomFactor;

        newSpan = Math.min(Math.max(newSpan, MIN_ZOOM_RANGE), MAX_ZOOM_RANGE);

        const center = (currentRange.min + currentRange.max) / 2;
        let newMin = center - newSpan / 2;
        let newMax = center + newSpan / 2;

        if (newMax > newestCandleTime) {
          newMax = newestCandleTime;
          newMin = newMax - newSpan;
        }
        if (newMin < oldestCandleTime) {
          newMin = oldestCandleTime;
          newMax = newMin + newSpan;
        }

        setXAxisRange({ min: newMin, max: newMax });
      }
    };

    wrapper.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      wrapper.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // Dropdown content state
  const [showButton, SetShowButton] = useState(false);
  const [activeFilter, setActiveFilter] = useState("CURRENCIES");
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [navbarOpen, SetNavbarOpen] = useState([]);
  const [index, setIndex] = useState(0);

  const setData = (data) => {
    SetNavbarOpen((prev) => [...prev, data]);
    setIndex(index + 1);
  };

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

  const FlagIcon = ({ code }) => (
    <img
      src={`https://flagcdn.com/16x12/${code}.png`}
      alt={code}
      className="w-4 h-3 mr-1"
      onError={(e) => {
        e.target.style.display = "none";
      }}
    />
  );

  return (
    <div className="app">
      <div className="chart-container relative">
        {/* Top bar */}
        <div className="items-center gap-2 p-4 z-[10] absolute -top-6 left-0 hidden lg:flex">
          <div>
            <button
              onClick={() => SetShowButton((prev) => !prev)}
              className="bg-[#C89B3C] hover:bg-[#B88922] rounded-md text-white p-3"
            >
              <FaPlus className="size-4" />
            </button>
            {showButton && (
              <div className="absolute top-[80px] z-50">
                <div className="bg-white border border-[#D6B65A]/50 rounded-xl shadow-[0_12px_40px_rgba(116,85,15,0.18)] w-[750px] h-[600px] overflow-hidden">
                  {/* Header */}
                  <div className="flex justify-between items-center px-5 py-4 border-b border-[#E9DFC4] bg-gradient-to-r from-white via-[#FFFDF8] to-[#FBF5E8]">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#E9C961] via-[#C99A29] to-[#A97808]" />

                      <h3 className="font-semibold text-lg text-[#2F281D]">
                        Select trade pair
                      </h3>
                    </div>

                    <button
                      onClick={() => SetShowButton(false)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg
                     bg-[#F8F2E4]
                     border border-[#E6D6A8]
                     text-[#8A6514]
                     hover:bg-[#D4AF37]
                     hover:text-white
                     hover:border-[#C99A29]
                     transition-all duration-200"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  </div>

                  {/* Filters */}
                  <div className="flex items-center px-5 py-3 border-b border-[#E9DFC4] bg-white">
                    {filters.map((filter) => (
                      <button
                        key={filter}
                        className={`relative px-3 py-2 text-xs font-bold tracking-wide transition-all duration-200 ${
                          activeFilter === filter
                            ? "text-[#9A6F08]"
                            : "text-[#777064] hover:text-[#B8860B]"
                        }`}
                        onClick={() => setActiveFilter(filter)}
                      >
                        {filter}

                        {activeFilter === filter && (
                          <span className="absolute left-3 right-3 bottom-0 h-[2px] rounded-full bg-gradient-to-r from-[#E9C961] via-[#C99A29] to-[#A97808]" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Search and Favorites */}
                  <div className="flex justify-between items-center gap-4 px-5 py-4 border-b border-[#E9DFC4] bg-[#FFFDF9]">
                    {/* Favorites */}
                    <div
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg
                     bg-[#FBF5E7]
                     border border-[#E6D6A8]
                     text-[#8A6514] text-sm font-semibold"
                    >
                      {favorites.length > 0 ? (
                        <>
                          <FaStar className="text-[#C99A29]" />
                          <span>{favorites.length}</span>
                        </>
                      ) : (
                        <>
                          <FaRegStar className="text-[#9A907D]" />
                          <span className="text-[#776F61]">0</span>
                        </>
                      )}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 max-w-[650px]">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="text-[#B8860B]" />
                      </div>

                      <input
                        type="text"
                        className="block w-full pl-10 pr-4 py-2.5
                       border border-[#E4D6B4]
                       rounded-lg
                       leading-5
                       bg-white
                       text-[#332B20]
                       placeholder-[#AAA08D]
                       focus:outline-none
                       focus:border-[#C99A29]
                       focus:ring-2
                       focus:ring-[#D4AF37]/20
                       shadow-[inset_0_1px_3px_rgba(124,91,19,0.05)]
                       sm:text-sm
                       transition-all"
                        placeholder="Search trade pair..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-y-auto h-[calc(400px-0px)] scrollbar-thin scrollbar-thumb-[#D4AF37] scrollbar-track-[#F8F4EA]">
                    <table className="min-w-full divide-y divide-[#ECE3D0]">
                      {/* Table Header */}
                      <thead className="bg-[#FCFAF5] sticky top-0 z-10">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3.5 text-left text-[11px] font-bold
                           text-[#9A8D77] uppercase tracking-[0.08em]"
                          >
                            Name
                          </th>

                          <th
                            scope="col"
                            className="px-6 py-3.5 text-left text-[11px] font-bold
                           text-[#9A8D77] uppercase tracking-[0.08em]
                           hidden md:table-cell"
                          >
                            24h change
                          </th>

                          <th
                            scope="col"
                            className="px-6 py-3.5 text-left text-[11px] font-bold
                           text-[#9A8D77] uppercase tracking-[0.08em]"
                          >
                            Profit 30 sec
                          </th>

                          <th
                            scope="col"
                            className="px-6 py-3.5 text-left text-[11px] font-bold
                           text-[#9A8D77] uppercase tracking-[0.08em]"
                          >
                            1+ min
                          </th>
                        </tr>
                      </thead>

                      {/* Table Body */}
                      <tbody className="bg-white divide-y divide-[#F0E8D8]">
                        {filteredAssets.map((asset, index) => (
                          <tr
                            key={asset.id}
                            className="group hover:bg-gradient-to-r hover:from-[#FFFDF8] hover:to-[#FBF5E8] cursor-pointer transition-all duration-150"
                            onClick={() => {
                              if (index === 0) {
                                navigate("/SideNavbar");
                                SetShowButton(false);
                              } else {
                                setComming(true);
                              }
                            }}
                          >
                            {/* Pair */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <button
                                  className="mr-3 text-[#A79C89] hover:text-[#C99A29] transition-colors"
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
                                      className="h-5 w-5 overflow-hidden rounded-full object-cover"
                                    />

                                    <img
                                      src={asset.flag2}
                                      alt=""
                                      className="h-5 w-5 overflow-hidden rounded-full object-cover absolute left-2.5"
                                    />
                                  </div>
                                </button>

                                <div className="flex items-center">
                                  <span className="text-[#2F281D] font-semibold text-sm">
                                    {asset.pair}

                                    <span className="text-[#988E7D] ml-1 font-normal">
                                      ({asset.type})
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* 24h Change */}
                            <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                              <div
                                className={`flex items-center font-semibold ${
                                  asset.change >= 0
                                    ? "text-[#149B58]"
                                    : "text-[#E0574D]"
                                }`}
                              >
                                {asset.change >= 0 ? (
                                  <FaArrowUp className="mr-1 text-xs" />
                                ) : (
                                  <FaArrowDown className="mr-1 text-xs" />
                                )}

                                <span>{Math.abs(asset.change)}%</span>
                              </div>
                            </td>

                            {/* Profit 30 sec */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className="inline-flex items-center px-2.5 py-1
                               rounded-full
                               bg-[#FBF3DD]
                               border border-[#E7D28F]
                               text-[#A87808]
                               text-xs
                               font-bold"
                              >
                                {asset.payout1}%
                              </span>
                            </td>

                            {/* 1+ min */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className="inline-flex items-center px-2.5 py-1
                               rounded-full
                               bg-[#FBF3DD]
                               border border-[#E7D28F]
                               text-[#A87808]
                               text-xs
                               font-bold"
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
          </div>

          <div className="bg-[#FBFAF7] rounded py-1 px-2 flex items-center justify-between">
            <div
              onClick={() => SetShowButton((prev) => !prev)}
              className="
    flex items-center justify-between
    w-full
    h-[64px]
    px-3
    cursor-pointer
    rounded-xl
    bg-gradient-to-r from-white via-[#FFFDF9] to-[#FBF6E9]
    border border-[#DCC27A]
    shadow-[0_3px_12px_rgba(145,108,24,0.12)]
    hover:shadow-[0_4px_16px_rgba(145,108,24,0.18)]
    hover:border-[#C9A33A]
    transition-all duration-200
  "
            >
              {/* LEFT SIDE */}
              <div className="flex items-center min-w-0">
                {/* Flags */}
                <div className="relative flex items-center w-[42px] h-[30px] mr-3">
                  <img
                    src={flag1}
                    alt=""
                    className="
          absolute left-0
          w-7 h-7
          rounded-full
          object-cover
          border-2 border-white
          shadow-[0_2px_5px_rgba(0,0,0,0.12)]
          z-10
        "
                  />

                  <img
                    src={flag2}
                    alt=""
                    className="
          absolute left-[15px]
          w-7 h-7
          rounded-full
          object-cover
          border-2 border-white
          shadow-[0_2px_5px_rgba(0,0,0,0.12)]
        "
                  />
                </div>

                {/* Pair Name */}
                <div className="flex flex-col justify-center leading-none">
                  <span className="text-[18px] font-bold text-[#2D281F] tracking-tight">
                    USD/JPY
                  </span>

                  <span className="mt-1 text-[13px] font-medium text-[#8F887A]">
                    OTC
                  </span>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex items-center gap-3">
                {/* 93% */}
                <div
                  className=" -mt-3 m-2
        min-w-[47px]
        h-[29px]
        px-3
        flex items-center justify-center
        rounded-[10px]
        bg-gradient-to-b
        from-[#E8CB68]
        via-[#C99A29]
        to-[#A97708]
        text-white
        text-[13px]
        font-bold
        shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_3px_7px_rgba(169,120,8,0.22)]
      "
                >
                  93%
                </div>

                {/* Dropdown */}
                <div
                  className="
        w-8 h-8
        flex items-center justify-center
        rounded-full
        bg-[#FBF5E6]
        border border-[#E5D19A]
      "
                >
                  <FaCaretDown className="text-[#A97808] text-[18px]" />
                </div>
              </div>
            </div>

            <div>
              {navbarOpen.length > 0 && (
                <div className="relative">
                  <div className="absolute -top-7">
                    <div className="flex gap-2 items-start ml-5">
                      {navbarOpen.slice(0, index).map((item, idx) => (
                        <div
                          key={idx}
                          className="relative bg-[#FBFAF7] rounded-md"
                        >
                          <div className="flex">
                            <div className="text-[#333333] px-7 flex flex-col p-1 items-start">
                              <div>{item.pair}</div>
                              <div>{item.payout1}%</div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIndex(index - 1);
                              SetNavbarOpen((prev) =>
                                prev.filter((_, i) => i !== idx),
                              );
                            }}
                            className="p-1 rounded-full absolute top-0 right-0"
                          >
                            <FaWindowClose className="h-3 w-3 text-[#333333]" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="time-display text-xs text-gray-300 absolute top-4 right-4">
          {new Date().toLocaleTimeString()} UTC
        </div>

        {/* Navigation controls */}
        <div className="flex justify-center items-center gap-4 mb-2 absolute top-10 right-4 z-10 opacity-100">
          <button
            onClick={handleMoveLeft}
            className="bg-gradient-to-b from-[#E9C961] via-[#C99A29] to-[#A97808] hover:from-[#F0D678] hover:via-[#D3A934] hover:to-[#B9850A] text-white rounded-full p-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_3px_8px_rgba(169,120,8,0.25)] transition-all"
            title="View older candles"
          >
            <ChevronLeft className="md:h-5 md:w-5 w-4 h-4" />
          </button>

          <button
            onClick={handleMoveRight}
            className="bg-gradient-to-b from-[#E9C961] via-[#C99A29] to-[#A97808] hover:from-[#F0D678] hover:via-[#D3A934] hover:to-[#B9850A] text-white rounded-full p-1 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_3px_8px_rgba(169,120,8,0.25)] transition-all"
            title="View newer candles"
          >
            <ChevronRight className="md:h-5 md:w-5 w-4 h-4" />
          </button>
        </div>

        {/* Main chart */}
        <div
          ref={chartWrapperRef}
          className="chart-wrapper md:pt-1 h-[50vh] lg:h-[88vh]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <ReactApexChart
            options={options}
            series={series}
            type="candlestick"
            height="100%"
            width="100%"
          />
        </div>
      </div>
      {comming && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#FBFAF7] p-6 rounded-md text-center shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-2">Coming Soon!</h2>
            <p className="text-gray-300">
              This chart is not available at the moment. For technical reasons,
              we cannot show the chart of this pair, please choose another
              trading pair.
            </p>
            <button
              onClick={() => setComming(false)}
              className="mt-4 px-4 py-2 bg-green-500 text-[#333333] rounded "
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChartSection;
