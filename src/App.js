import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Plus,
  Save,
  Wrench,
  AlertTriangle,
  FileText,
  X,
  History,
  Trash2,
  Loader2,
  Activity,
  QrCode,
  Lightbulb,
  CheckCircle2,
  Upload,
  ChevronRight,
  ChevronDown,
  Factory,
  BookOpen,
  Unlock,
  User,
  Clock,
  Clipboard,
  WifiOff,
  Download,
  Flame,
  Zap,
  Scroll,
  Sword,
  Trophy,
  Target,
  Sparkles,
  BarChart2,
  Tag,
  ListChecks,
  Cpu,
  ArrowDownCircle,
  Gavel,
  Wind,
  Sun,
  Feather,
} from "lucide-react";

// --- 輔助函數 ---
const sanitize = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

// --- 機台分類判定邏輯 (純顏色區分) ---
const getSectInfo = (log) => {
  const machine = (log.machine || "").toUpperCase();

  // 1. Chroma 3380 / 3360 系列 (綠色)
  if (machine.includes("3380") || machine.includes("3360")) {
    const is3360 = machine.includes("3360");
    return {
      name: is3360 ? "3360" : "3380",
      style: is3360 ? "Chroma 3360" : "Chroma 3380",
      color: "bg-emerald-600",
      lightColor: "bg-emerald-50",
      borderColor: "border-emerald-600",
      textColor: "text-emerald-900",
      icon: <Activity size={20} className="text-white opacity-80" />,
    };
  }

  // 2. Chroma 3650 / 3680 系列 (藍色 - 主力)
  if (
    machine.includes("3650") ||
    machine.includes("3680") ||
    machine.includes("L57") ||
    machine.includes("S50") ||
    machine.includes("SC_4") ||
    machine.includes("CMA_1") ||
    machine.startsWith("K")
  ) {
    const is3680 = machine.includes("3680");
    return {
      name: is3680 ? "3680" : "3650",
      style: is3680 ? "Chroma 3680" : "Chroma 3650",
      color: "bg-blue-600",
      lightColor: "bg-blue-50",
      borderColor: "border-blue-600",
      textColor: "text-blue-900",
      icon: <Cpu size={20} className="text-white opacity-80" />,
    };
  }

  // 3. ASL 系列 (橘色)
  if (machine.includes("ASL")) {
    return {
      name: "ASL",
      style: "Linear ASL",
      color: "bg-orange-600",
      lightColor: "bg-orange-50",
      borderColor: "border-orange-600",
      textColor: "text-orange-900",
      icon: <Zap size={20} className="text-white opacity-80" />,
    };
  }

  // 4. Handler 分類機 (粉色)
  if (machine.includes("HANDLER") || machine.startsWith("H")) {
    return {
      name: "HND",
      style: "Handler",
      color: "bg-pink-600",
      lightColor: "bg-pink-50",
      borderColor: "border-pink-600",
      textColor: "text-pink-900",
      icon: <Factory size={20} className="text-white opacity-80" />,
    };
  }

  // 5. Prober 針測機 (青色)
  if (machine.includes("PROBER") || machine.startsWith("P")) {
    return {
      name: "PRB",
      style: "Prober",
      color: "bg-cyan-600",
      lightColor: "bg-cyan-50",
      borderColor: "border-cyan-600",
      textColor: "text-cyan-900",
      icon: <QrCode size={20} className="text-white opacity-80" />,
    };
  }

  // 6. 其他 (灰色)
  return {
    name: "MISC",
    style: "其他設備",
    color: "bg-slate-500",
    lightColor: "bg-slate-100",
    borderColor: "border-slate-500",
    textColor: "text-slate-700",
    icon: <Tag size={20} className="text-white opacity-80" />,
  };
};

const getMartialRank = (count) => {
  if (count > 3000) return { title: "掃地神僧", icon: "🧹" };
  if (count > 2000) return { title: "獨孤求敗", icon: "👑" };
  if (count > 1000) return { title: "武林盟主", icon: "🐲" };
  if (count > 500) return { title: "一派宗師", icon: "🧘‍♂️" };
  if (count > 100) return { title: "江湖俠客", icon: "⚔️" };
  return { title: "初入江湖", icon: "🎒" };
};

export default function RepairHelperApp() {
  const [isReady, setIsReady] = useState(false);
  const [isXlsxReady, setIsXlsxReady] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(50);

  useEffect(() => {
    const twScript = document.querySelector(
      'script[src="https://cdn.tailwindcss.com"]'
    );
    if (!twScript) {
      const script = document.createElement("script");
      script.src = "https://cdn.tailwindcss.com";
      script.async = true;
      document.head.appendChild(script);
    }
    const xlsxSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    let xlsxScript = document.querySelector(`script[src="${xlsxSrc}"]`);
    const checkReady = () => {
      if (window.XLSX) {
        setIsXlsxReady(true);
        setTimeout(() => setIsReady(true), 5000);
        return true;
      }
      return false;
    };
    if (!xlsxScript) {
      xlsxScript = document.createElement("script");
      xlsxScript.src = xlsxSrc;
      xlsxScript.async = true;
      xlsxScript.onload = () => checkReady();
      document.head.appendChild(xlsxScript);
    } else {
      if (!checkReady())
        xlsxScript.addEventListener("load", () => checkReady());
    }

    // --- 啟動畫面維持 5 秒 ---
    setTimeout(() => setIsReady(true), 5000);

    const styleId = "wuxia-animations";
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) existingStyle.remove();
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .animate-text-shimmer { background: linear-gradient(to right, #fef08a 20%, #facc15 40%, #fef08a 60%, #fef08a 80%); background-size: 200% auto; color: transparent; background-clip: text; -webkit-background-clip: text; animation: shimmer 3s linear infinite; }
        @keyframes grow-bar { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .animate-bar { transform-origin: left; animation: grow-bar 1s ease-out forwards; }
    `;
    document.head.appendChild(style);
  }, []);

  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("repair_last_tab") || "home"
  );
  useEffect(() => {
    localStorage.setItem("repair_last_tab", activeTab);
    setDisplayLimit(50);
  }, [activeTab]);

  const [modalView, setModalView] = useState(null);
  const [searchTerm, setSearchTerm] = useState(
    () => localStorage.getItem("repair_last_search") || ""
  );
  useEffect(() => {
    localStorage.setItem("repair_last_search", searchTerm);
    setDisplayLimit(50);
  }, [searchTerm]);

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  const [logs, setLogs] = useState(() => {
    try {
      const savedLogs = localStorage.getItem("repair_logs_local");
      return savedLogs ? JSON.parse(savedLogs) : [];
    } catch (e) {
      return [];
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("repair_logs_local", JSON.stringify(logs));
    } catch (e) {
      alert("儲存空間不足");
    }
  }, [logs]);

  const fileInputRef = useRef(null);
  const [importPreview, setImportPreview] = useState([]);
  const [traceProductSearch, setTraceProductSearch] = useState("");
  const [selectedTraceProduct, setSelectedTraceProduct] = useState(null);
  const [importText, setImportText] = useState("");

  const [formData, setFormData] = useState(() => {
    try {
      const savedForm = localStorage.getItem("repair_form_draft");
      return savedForm
        ? JSON.parse(savedForm)
        : {
            machine: "",
            productID: "",
            errorCode: "",
            issue: "",
            solution: "",
            shift: "",
            engineer: "",
          };
    } catch (e) {
      return {
        machine: "",
        productID: "",
        errorCode: "",
        issue: "",
        solution: "",
        shift: "",
        engineer: "",
      };
    }
  });
  useEffect(() => {
    localStorage.setItem("repair_form_draft", JSON.stringify(formData));
  }, [formData]);

  const rank = getMartialRank(logs.length);
  const uniqueMachines = useMemo(
    () =>
      Array.from(new Set(logs.map((l) => l.machine)))
        .filter(Boolean)
        .sort(),
    [logs]
  );
  const uniqueErrorCodes = useMemo(
    () =>
      Array.from(new Set(logs.map((l) => l.errorCode)))
        .filter((c) => c && c !== "NA")
        .sort(),
    [logs]
  );
  const uniqueProductsList = useMemo(
    () =>
      Array.from(new Set(logs.map((l) => l.productID)))
        .filter(Boolean)
        .sort(),
    [logs]
  );

  const getSuggestions = (type, inputVal) => {
    let source = [];
    if (type === "machine") source = uniqueMachines;
    if (type === "productID") source = uniqueProductsList;
    if (type === "errorCode") source = uniqueErrorCodes;
    if (!inputVal) return source.slice(0, 10);
    return source
      .filter((item) => item.toLowerCase().includes(inputVal.toLowerCase()))
      .slice(0, 10);
  };

  const searchSuggestions = useMemo(() => {
    const candidates = new Set();
    if ((!searchTerm || searchTerm.length < 1) && isSearchFocused)
      return uniqueMachines.slice(0, 8);
    if (!searchTerm && !isSearchFocused) return [];
    logs.forEach((log) => {
      if (log.errorCode && log.errorCode !== "NA")
        candidates.add(log.errorCode);
      if (log.machine) candidates.add(log.machine);
      if (log.productID) candidates.add(log.productID);
    });
    return Array.from(candidates)
      .filter((item) => item.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 6);
  }, [logs, searchTerm, isSearchFocused, uniqueMachines]);

  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs;
    const lowerTerm = searchTerm.toLowerCase();
    return logs.filter(
      (log) =>
        (log.machine && log.machine.toLowerCase().includes(lowerTerm)) ||
        (log.errorCode && log.errorCode.toLowerCase().includes(lowerTerm)) ||
        (log.issue && log.issue.toLowerCase().includes(lowerTerm)) ||
        (log.solution && log.solution.toLowerCase().includes(lowerTerm)) ||
        (log.productID && log.productID.toLowerCase().includes(lowerTerm)) ||
        (log.engineer && log.engineer.toLowerCase().includes(lowerTerm))
    );
  }, [logs, searchTerm]);

  const displayLogs = useMemo(
    () => filteredLogs.slice(0, displayLimit),
    [filteredLogs, displayLimit]
  );

  const diagnosisStats = useMemo(() => {
    if (!searchTerm || filteredLogs.length === 0) return null;
    const solutionCounts = {};
    const totalCount = filteredLogs.length;
    filteredLogs.forEach((log) => {
      const sol = log.solution;
      if (sol) solutionCounts[sol] = (solutionCounts[sol] || 0) + 1;
    });
    return Object.entries(solutionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([sol, count]) => ({
        sol,
        count,
        percentage: Math.round((count / totalCount) * 100),
      }));
  }, [filteredLogs, searchTerm]);

  const uniqueProducts = useMemo(
    () =>
      Array.from(new Set(logs.map((l) => l.productID).filter(Boolean))).sort(),
    [logs]
  );
  const matchedProducts = useMemo(
    () =>
      traceProductSearch
        ? uniqueProducts.filter((p) =>
            String(p).toLowerCase().includes(traceProductSearch.toLowerCase())
          )
        : [],
    [traceProductSearch, uniqueProducts]
  );

  const productStats = useMemo(() => {
    if (!selectedTraceProduct) return [];
    const productLogs = logs.filter(
      (l) => l.productID === selectedTraceProduct
    );
    const statsMap = {};
    productLogs.forEach((log) => {
      const m = log.machine || "Unknown";
      if (!statsMap[m])
        statsMap[m] = { machine: m, count: 0, logs: [], issueCounts: {} };
      statsMap[m].count++;
      statsMap[m].logs.push(log);
      const issueKey =
        log.errorCode && log.errorCode !== "NA"
          ? log.errorCode
          : log.issue || "未記錄";
      statsMap[m].issueCounts[issueKey] =
        (statsMap[m].issueCounts[issueKey] || 0) + 1;
    });
    return Object.values(statsMap)
      .map((item) => {
        const topIssueEntry = Object.entries(item.issueCounts).sort(
          (a, b) => b[1] - a[1]
        )[0];
        return {
          ...item,
          topIssue: topIssueEntry ? topIssueEntry[0] : "多種故障",
          topIssueCount: topIssueEntry ? topIssueEntry[1] : 0,
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [selectedTraceProduct, logs]);

  const maxTraceCount = productStats.length > 0 ? productStats[0].count : 0;

  const chartData = useMemo(() => {
    if (logs.length === 0)
      return {
        machineData: [],
        failItemData: [],
        componentData: [],
        maxMachineCount: 0,
        maxFailItemCount: 0,
        maxComponentCount: 0,
      };
    const machineMap = {};
    logs.forEach((l) => {
      if (l.machine) machineMap[l.machine] = (machineMap[l.machine] || 0) + 1;
    });
    const machineData = Object.entries(machineMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    const maxMachineCount = machineData.length > 0 ? machineData[0].count : 0;

    const failItemMap = {};
    logs.forEach((l) => {
      if (!l.issue) return;
      let item = l.issue.split(/[:/(]/)[0].trim();
      if (item.length > 2 && !item.toLowerCase().includes("bin"))
        failItemMap[item] = (failItemMap[item] || 0) + 1;
    });
    const failItemData = Object.entries(failItemMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([item, count]) => ({ item, count }));
    const maxFailItemCount =
      failItemData.length > 0 ? failItemData[0].count : 0;

    const componentMap = {
      Relay: 0,
      Site: 0,
      Board: 0,
      Probe: 0,
      Cable: 0,
      Swap: 0,
      Clean: 0,
    };
    logs.forEach((l) => {
      if (l.solution) {
        const sol = l.solution.toLowerCase();
        if (sol.includes("relay")) componentMap["Relay"]++;
        if (sol.includes("site") || sol.includes("dut")) componentMap["Site"]++;
        if (sol.includes("board") || sol.includes("板"))
          componentMap["Board"]++;
        if (sol.includes("probe") || sol.includes("針") || sol.includes("card"))
          componentMap["Probe"]++;
        if (sol.includes("cable") || sol.includes("線"))
          componentMap["Cable"]++;
        if (sol.includes("swap") || sol.includes("交換"))
          componentMap["Swap"]++;
        if (sol.includes("clean") || sol.includes("清"))
          componentMap["Clean"]++;
      }
    });
    const componentData = Object.entries(componentMap)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
    const maxComponentCount =
      componentData.length > 0 ? componentData[0].count : 0;
    return {
      machineData,
      failItemData,
      componentData,
      maxMachineCount,
      maxFailItemCount,
      maxComponentCount,
    };
  }, [logs]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 強制檢查 XLSX 套件
    if (!window.XLSX) {
      alert("系統正在載入解析核心，請稍等 2 秒後再試一次！");
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      script.async = true;
      document.head.appendChild(script);
      return;
    }

    const reader = new FileReader();

    if (file.name.endsWith(".csv")) {
      // 關鍵：CSV 檔用 Big5 讀取，解決亂碼問題
      reader.onload = (evt) => {
        parseImportData(evt.target.result);
      };
      reader.readAsText(file, "Big5");
    } else {
      // Excel 檔用 ArrayBuffer + XLSX 讀取
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const workbook = window.XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          // 直接轉成陣列處理
          const jsonData = window.XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
          });
          parseImportArray(jsonData);
        } catch (err) {
          console.error("Excel Error:", err);
          alert("Excel 解析失敗");
        }
      };
      reader.readAsArrayBuffer(file);
    }
    e.target.value = "";
  };

  // --- 解析 Excel 轉出來的陣列 ---
  const parseImportArray = (rows) => {
    const parsed = rows
      .map((parts, index) => {
        if (!parts || parts.length < 3) return null;
        // 轉字串陣列
        const row = parts.map((c) => String(c || "").trim());
        return processRow(row, index);
      })
      .filter((item) => item !== null);

    if (parsed.length === 0) alert("找不到有效資料");
    else setImportPreview(parsed);
  };

  // --- 解析 CSV 文字 ---
  const parseImportData = (text) => {
    // 簡易 CSV Parser (處理引號內的逗號)
    const pattern = /("((?:[^"]|"")*)"|[^,\n\r]*)(,|\r\n|\n|\r|$)/g;
    const rows = [];
    let row = [];
    let match = null;
    while ((match = pattern.exec(text))) {
      let cell = match[2] ? match[2].replace(/""/g, '"') : match[1];
      row.push(cell ? cell.trim() : "");
      if (match[3] && (match[3].includes("\n") || match[3].includes("\r"))) {
        if (row.length > 1) rows.push(row);
        row = [];
      }
    }
    if (row.length > 1) rows.push(row);

    const parsed = rows
      .map((r, i) => processRow(r, i))
      .filter((item) => item !== null);
    if (parsed.length === 0) alert("找不到有效資料");
    else setImportPreview(parsed);
  };

  // --- 核心資料處理函數 ---
  const processRow = (parts, index) => {
    // 排除標題列
    const rowText = parts.join(" ").toLowerCase();
    if (
      index === 0 &&
      (rowText.includes("date") ||
        rowText.includes("日期") ||
        rowText.includes("fail item"))
    )
      return null;

    let dateStr = new Date().toISOString().split("T")[0];
    let shift = "",
      machine = "",
      productID = "",
      engineer = "",
      issue = "",
      errorCode = "NA",
      solution = "",
      tag = "";

    // 1. 日會記錄格式 (8欄: 年,月,日,機台,產品,Bin,fail item,真因)
    const possibleYear = parseInt(parts[0]);
    if (parts.length >= 7 && !isNaN(possibleYear) && possibleYear > 2000) {
      const monthStr = parts[1];
      const day = parts[2];
      try {
        const d = new Date(`${monthStr} ${day}, ${possibleYear}`);
        if (!isNaN(d.getTime())) dateStr = d.toISOString().split("T")[0];
      } catch (e) {}

      machine = sanitize(parts[3]);
      productID = sanitize(parts[4]);
      const bin = sanitize(parts[5]);
      errorCode = bin ? `Bin ${bin}` : "NA";
      // 為了避免重複，把 fail item 和 真因 合併存入 issue，solution 留白
      issue = `${sanitize(parts[6])}\n------------------\n${sanitize(
        parts[7]
      )}`;
      solution = "";
      engineer = "日會結案";
      tag = "日會";
    }
    // 2. 維修紀錄格式 (6欄: 日期, 班別, 機台, 產品, 人員, 事件)
    else if (parts.length >= 6) {
      const rawDate = sanitize(parts[0]);
      if (rawDate) {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) dateStr = d.toISOString().split("T")[0];
      }
      shift = sanitize(parts[1]);
      machine = sanitize(parts[2]);
      productID = sanitize(parts[3]);
      engineer = sanitize(parts[4]);

      // 事件欄位直接存入 issue，solution 留白
      const eventText = sanitize(parts[5]);
      issue = eventText;
      solution = "";

      // 嘗試抓 Bin Code
      const binMatch = eventText.match(/bin\s*(\d+)/i);
      if (binMatch) errorCode = `Bin ${binMatch[1]}`;
    }
    // 3. 簡易格式 (5欄)
    else if (parts.length >= 5) {
      machine = sanitize(parts[0]);
      productID = sanitize(parts[1]);
      errorCode = sanitize(parts[2]);
      issue = sanitize(parts[3]);
      solution = sanitize(parts[4]);

      // 如果有 solution，自動合併到 issue
      if (solution) {
        issue = `${issue}\n------------------\n${solution}`;
        solution = "";
      }
    } else return null;

    if (
      !machine ||
      machine.toUpperCase().includes("機台") ||
      machine.length < 2
    )
      return null;

    return {
      id: `${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
      importDate: dateStr,
      shift,
      machine,
      productID,
      engineer,
      errorCode,
      issue,
      solution,
      tag,
      createdAt: { seconds: Date.now() / 1000 },
    };
  };

  const executeBatchImport = () => {
    if (importPreview.length === 0) return;
    const currentSignatures = new Set(
      logs.map((l) =>
        `${l.machine}-${l.importDate}-${l.productID}-${l.issue}`
          .toLowerCase()
          .replace(/\s+/g, "")
      )
    );
    const newLogs = [];
    let duplicateCount = 0;
    importPreview.forEach((item) => {
      const sig =
        `${item.machine}-${item.importDate}-${item.productID}-${item.issue}`
          .toLowerCase()
          .replace(/\s+/g, "");
      if (!currentSignatures.has(sig)) {
        newLogs.push(item);
        currentSignatures.add(sig);
      } else {
        duplicateCount++;
      }
    });
    if (newLogs.length === 0) {
      alert("無新資料 (資料已存在)");
      setImportPreview([]);
      setModalView(null);
      return;
    }
    if (confirm(`準備匯入 ${newLogs.length} 筆資料？`)) {
      setLogs((prev) => [...newLogs, ...prev]);
      setImportPreview([]);
      setImportText("");
      setModalView(null);
    }
  };

  const handleRemoveDuplicates = () => {
    if (logs.length === 0) return;
    const uniqueMap = new Map();
    logs.forEach((log) =>
      uniqueMap.set(
        `${log.machine}-${log.importDate}-${log.productID}-${log.issue}`
          .toLowerCase()
          .replace(/\s+/g, ""),
        log
      )
    );
    if (logs.length === uniqueMap.size) {
      alert("無重複資料");
      return;
    }
    if (confirm(`清除 ${logs.length - uniqueMap.size} 筆重複？`))
      setLogs(
        Array.from(uniqueMap.values()).sort(
          (a, b) => b.createdAt.seconds - a.createdAt.seconds
        )
      );
  };

  const handleClearAll = () => {
    if (confirm("清空資料？")) {
      setLogs([]);
      setModalView(null);
    }
  };
  const handleSave = () => {
    if (!formData.machine || !formData.issue) {
      alert("請填寫機台與維修內容");
      return;
    }
    setLogs((prev) => [
      {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: { seconds: Date.now() / 1000 },
        importDate: new Date().toISOString().split("T")[0],
      },
      ...prev,
    ]);
    setFormData({
      machine: "",
      productID: "",
      errorCode: "",
      issue: "",
      solution: "",
      shift: "",
      engineer: "",
    });
    setModalView(null);
  };
  const handleDelete = (logId) => {
    if (confirm("刪除此紀錄？")) {
      setLogs((prev) => prev.filter((l) => l.id !== logId));
      if (selectedLog?.id === logId) {
        setModalView(null);
        setSelectedLog(null);
      }
    }
  };
  const handleExport = () => {
    if (!window.XLSX || logs.length === 0) return;
    const ws = window.XLSX.utils.json_to_sheet(
      logs.map((l) => ({
        日期: l.importDate,
        班別: l.shift,
        機台: l.machine,
        產品: l.productID,
        代碼: l.errorCode,
        問題: l.issue,
        對策: l.solution,
        人員: l.engineer,
      }))
    );
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "RepairLogs");
    window.XLSX.writeFile(wb, "Setup_Backup.xlsx");
  };
  const handleCopyReport = () => {
    navigator.clipboard
      .writeText(
        `【維修回報】\n機台：${selectedLog.machine}\n故障：${selectedLog.issue}\n對策：${selectedLog.solution}`
      )
      .then(() => alert("已複製"));
  };

  // --- 啟動畫面 (加入圖片 + 10秒) ---
  if (!isReady) {
    return (
      <div className="fixed inset-0 bg-blue-600 flex flex-col items-center justify-center z-[9999] text-white font-sans transition-opacity duration-1000">
        <img
          src="https://i.postimg.cc/fL8nyFJr/creative-1765374647222.jpg"
          alt="Startup"
          className="w-56 h-56 object-cover rounded-full border-4 border-yellow-400 shadow-2xl mb-8 animate-pulse"
        />
        <div className="text-4xl font-black tracking-widest mb-4 text-yellow-300 drop-shadow-md">
          SETUP 九陽真經
        </div>
        <div className="text-blue-100 text-lg font-bold tracking-wider animate-bounce">
          正在運功打通任督二脈...
        </div>
      </div>
    );
  }

  const renderDetailPage = () => {
    const sect = getSectInfo(selectedLog);
    const shiftBadge = getShiftBadge(selectedLog.shift);
    return (
      <div className="absolute inset-0 z-50 flex flex-col bg-slate-900/50 backdrop-blur-sm">
        <div
          className={`flex-1 m-4 mb-24 ${sect.lightColor} rounded-r-2xl rounded-l-lg shadow-2xl overflow-hidden flex relative`}
        >
          <div
            className={`w-6 ${sect.color} flex flex-col items-center py-6 gap-8 shadow-2xl z-20 flex-shrink-0`}
          >
            <div
              className={`w-2 h-2 rounded-full ${sect.lightColor} shadow-inner`}
            ></div>
            <div
              className={`w-2 h-2 rounded-full ${sect.lightColor} shadow-inner`}
            ></div>
            <div
              className={`w-2 h-2 rounded-full ${sect.lightColor} shadow-inner`}
            ></div>
            <div className="flex-1 border-r border-white/10 w-full"></div>
            <button
              onClick={() => setModalView(null)}
              className="w-8 h-8 bg-black/20 text-white rounded-full flex items-center justify-center hover:bg-black/40"
            >
              <X size={20} />
            </button>
          </div>
          <div
            className="flex-1 overflow-y-auto relative"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <div className="absolute top-4 right-4 flex gap-2 z-20">
              <button
                onClick={handleCopyReport}
                className="p-2 bg-black/5 text-slate-700 rounded-full hover:bg-black/10"
              >
                <Clipboard size={20} />
              </button>
              <button
                onClick={() => handleDelete(selectedLog.id)}
                className="p-2 bg-black/5 text-red-700 rounded-full hover:bg-red-100"
              >
                <Trash2 size={20} />
              </button>
            </div>
            <div className="p-8 min-h-full">
              <div
                className={`border-l-2 border-dashed ${sect.borderColor} pl-6 h-full min-h-[80vh] opacity-80`}
              >
                <div
                  className={`relative border-b-2 ${sect.borderColor} pb-6 mb-8`}
                >
                  <div
                    className={`text-sm font-bold tracking-widest mb-1 ${sect.textColor}`}
                  >
                    【{sect.style}】
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight font-serif">
                    {selectedLog.machine}
                  </h1>
                  {selectedLog.errorCode && (
                    <div className="border-[3px] border-red-600 text-red-600 px-4 py-1 text-xl font-black rounded-lg transform rotate-[-12deg] opacity-80 mix-blend-multiply absolute right-12 top-2 border-double bg-white/50">
                      {selectedLog.errorCode}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 mt-4">
                    <div className="px-3 py-1 bg-black/5 rounded text-slate-700 font-bold text-sm flex items-center gap-2">
                      <Clock size={14} /> {selectedLog.importDate || "未知"}
                    </div>
                    {selectedLog.engineer && (
                      <div
                        className={`px-3 py-1 rounded font-bold text-sm flex items-center gap-2 ${
                          selectedLog.tag === "日會"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        <User size={14} /> {selectedLog.engineer}
                      </div>
                    )}
                    {selectedLog.shift && (
                      <div
                        className={`px-3 py-1 rounded font-bold text-sm flex items-center gap-2 ${shiftBadge.color}`}
                      >
                        <Tag size={14} /> {shiftBadge.text}
                      </div>
                    )}
                    {selectedLog.productID && (
                      <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded font-mono font-bold text-sm flex items-center gap-2">
                        <QrCode size={14} /> {selectedLog.productID}
                      </div>
                    )}
                  </div>
                </div>
                {/* 顯示合併後的內容，只會有這一個區塊 */}
                <div className="mb-8">
                  <h3 className="text-xl font-black text-slate-800 mb-3 flex items-center gap-2">
                    <span
                      className={`w-1.5 h-6 ${sect.color} rounded-full`}
                    ></span>
                    【 修 煉 日 誌 】
                  </h3>
                  <div
                    className="text-lg text-slate-700 leading-relaxed font-medium bg-white/60 p-4 rounded-xl border border-slate-200 shadow-sm"
                    style={{ whiteSpace: "pre-wrap" }}
                  >
                    {selectedLog.issue}
                    {/* 如果有額外的 Solution 且不重複，接在後面顯示，並加分隔線 */}
                    {selectedLog.solution &&
                      selectedLog.solution !== selectedLog.issue &&
                      selectedLog.solution.trim() !== "" && (
                        <>
                          <div className="my-4 border-t border-slate-300 border-dashed"></div>
                          <div>{selectedLog.solution}</div>
                        </>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getShiftBadge = (shiftRaw) => {
    const s = (shiftRaw || "").toUpperCase();
    if (s.includes("A") || s === "DAY")
      return { text: "日 A", color: "bg-orange-100 text-orange-700" };
    if (s.includes("B") || s === "NIGHT")
      return { text: "夜 B", color: "bg-indigo-100 text-indigo-700" };
    if (s.includes("C"))
      return { text: "日 C", color: "bg-amber-100 text-amber-700" };
    if (s.includes("D"))
      return { text: "夜 D", color: "bg-slate-200 text-slate-700" };
    return { text: s, color: "bg-gray-100 text-gray-500" };
  };

  const renderCardList = (dataList) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {dataList.map((log) => {
        const sect = getSectInfo(log);
        return (
          <div
            key={log.id}
            onClick={() => {
              setSelectedLog(log);
              setModalView("detail");
            }}
            className={`relative pl-12 pr-6 py-6 ${sect.lightColor} rounded-r-2xl rounded-l-md shadow-md border-r border-b border-slate-200 cursor-pointer active:scale-[0.98] transition-transform overflow-hidden group`}
          >
            <div
              className={`absolute left-0 top-0 bottom-0 w-6 ${sect.color} flex flex-col items-center justify-around py-4 z-10 shadow-inner`}
            >
              <div
                className={`w-1 h-1 rounded-full ${sect.lightColor} opacity-50`}
              ></div>
              <div
                className={`w-1 h-1 rounded-full ${sect.lightColor} opacity-50`}
              ></div>
              <div className="absolute left-full top-0 bottom-0 w-1 bg-black/10"></div>
            </div>
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="font-black text-2xl text-slate-800 tracking-tight block group-hover:text-blue-700 transition-colors">
                  {log.machine}
                </span>
                <div className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
                  <span>{log.importDate}</span>
                  {log.tag === "日會" ? (
                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200 flex items-center gap-1 ml-2">
                      🏆 日會精華
                    </span>
                  ) : (
                    log.engineer && (
                      <>
                        <span className="text-slate-300">|</span>
                        <span className="font-bold text-slate-500">
                          {log.engineer}
                        </span>
                      </>
                    )
                  )}
                </div>
              </div>
              {log.productID && (
                <div className="absolute top-2 right-2 opacity-10 text-4xl font-black text-slate-900 pointer-events-none -rotate-12 truncate max-w-[150px]">
                  {log.productID}
                </div>
              )}
            </div>
            <div className="mb-4 relative">
              <p className="text-slate-600 text-lg font-medium line-clamp-2 leading-relaxed border-l-2 border-slate-200 pl-3">
                {log.issue}
              </p>
            </div>
            <div className="flex justify-between items-end border-t border-slate-200/50 pt-3 border-dashed">
              <div
                className={`text-sm font-bold flex items-center gap-1 ${sect.textColor}`}
              >
                {sect.icon}
              </div>
              {log.errorCode && (
                <div className="border-2 border-red-500 text-red-600 px-2 py-0.5 text-xs font-black rounded-sm transform -rotate-2 mix-blend-multiply opacity-80 shadow-sm bg-red-50">
                  {log.errorCode}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderHomeTab = () => (
    <div className="flex flex-col h-full bg-slate-100">
      <div className="bg-blue-600 px-6 pt-10 pb-4 shadow-lg sticky top-0 z-10 rounded-b-[2rem] relative overflow-hidden">
        <div className="flex justify-between items-center mb-4 max-w-5xl mx-auto w-full relative z-10">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-bold text-blue-200 bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1`}
              >
                {rank.icon} {rank.title}
              </span>
            </div>
            <h1 className="text-white font-black text-xl flex items-center gap-3 bg-gradient-to-r from-yellow-200 via-white to-yellow-200 text-transparent bg-clip-text animate-text-shimmer">
              <Flame
                className="text-yellow-400 w-6 h-6 animate-pulse"
                fill="currentColor"
              />{" "}
              SETUP 九陽真經
            </h1>
            <div className="mt-2 text-center text-blue-200 text-xs opacity-80">
              (已收錄 {logs.length} 卷 絕世武功)
            </div>
          </div>
          <div className="flex flex-col items-end gap-3 mt-1">
            <div className="flex gap-2">
              <button
                onClick={() => setModalView("import")}
                className="text-blue-600 bg-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1 active:scale-95 transition-transform"
              >
                <Unlock size={14} /> 資料
              </button>
            </div>
            <button
              onClick={() => setModalView("add")}
              className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-amber-500 text-white rounded-full shadow-lg shadow-yellow-400/50 flex items-center justify-center z-20 hover:scale-110 active:scale-95 transition-all"
            >
              <Plus size={24} strokeWidth={3} />
            </button>
          </div>
        </div>
        <div className="relative max-w-5xl mx-auto w-full z-20">
          <Search className="absolute left-5 top-5 text-slate-400" size={28} />
          <input
            type="text"
            className="w-full pl-14 pr-12 py-5 rounded-3xl shadow-lg outline-none text-xl font-medium text-slate-700 placeholder:text-slate-400"
            placeholder="輸入機台或代碼..."
            value={searchTerm}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-5 top-5 text-slate-400 p-1 bg-slate-100 rounded-full hover:bg-slate-200"
            >
              <X size={20} />
            </button>
          )}
          {isSearchFocused && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in slide-in-from-top-2 z-50">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchTerm(suggestion);
                    setIsSearchFocused(false);
                  }}
                  className="w-full text-left px-6 py-4 hover:bg-blue-50 text-lg font-bold text-slate-600 border-b border-slate-50 last:border-0 flex items-center gap-3 transition-colors"
                >
                  <Search size={18} className="text-slate-300" /> {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div
        className="flex-1 overflow-y-auto p-5 pb-40"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="max-w-6xl mx-auto space-y-5">
          {displayLogs.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <p className="text-2xl font-bold">無招勝有招</p>
            </div>
          ) : (
            renderCardList(displayLogs)
          )}
          {filteredLogs.length > displayLogs.length && (
            <button
              onClick={() => setDisplayLimit((prev) => prev + 20)}
              className="w-full py-4 mt-6 bg-white border border-slate-200 text-slate-500 font-bold rounded-xl shadow-sm hover:bg-slate-50 flex items-center justify-center gap-2"
            >
              <ArrowDownCircle size={20} /> 載入更多 ({displayLogs.length} /{" "}
              {filteredLogs.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderDiagnoseTab = () => (
    <div className="flex flex-col h-full bg-slate-100">
      <div className="bg-white px-6 pt-12 pb-8 shadow-sm border-b rounded-b-[2.5rem]">
        <div className="max-w-5xl mx-auto w-full">
          <h2 className="font-black text-3xl text-slate-800 flex items-center gap-3 mb-2">
            <Lightbulb
              className="text-yellow-400 w-10 h-10"
              fill="currentColor"
            />{" "}
            心法
          </h2>
          <p className="text-slate-500 font-medium ml-1 text-lg">
            輸入關鍵字，查詢日會結案與維修精華
          </p>
          <div className="relative mt-8 z-20">
            <Search
              className="absolute left-5 top-5 text-slate-400"
              size={28}
            />
            <input
              type="text"
              className="w-full pl-14 pr-12 py-5 bg-slate-100 border-2 border-transparent focus:bg-white focus:border-yellow-400 rounded-3xl outline-none text-xl font-bold transition-all"
              placeholder="輸入機台/代碼/工程師..."
              value={searchTerm}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div
        className="p-6 flex-1 overflow-y-auto pb-40"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="max-w-5xl mx-auto w-full">
          {searchTerm && diagnosisStats && diagnosisStats.length > 0 ? (
            <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-base font-bold text-slate-400 mb-4 uppercase tracking-wider ml-2 flex items-center justify-between">
                <span>AI 推薦藥方 (Top 3)</span>
                <span className="text-xs bg-slate-200 text-slate-500 px-2 py-1 rounded">
                  樣本數 {filteredLogs.length}
                </span>
              </h3>
              <div className="space-y-3">
                {diagnosisStats.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden"
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-blue-50 transition-all duration-1000 ease-out"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                    <div className="relative z-10 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0 ${
                            index === 0
                              ? "bg-yellow-400 text-white shadow-md scale-110"
                              : index === 1
                              ? "bg-slate-300 text-white"
                              : "bg-orange-200 text-white"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-xl text-slate-800 leading-tight">
                            {item.sol}
                          </h4>
                          <p className="text-sm text-slate-400 mt-1 font-medium">
                            信心水準:{" "}
                            <span className="text-blue-600 font-bold">
                              {item.percentage}%
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right pl-4">
                        <div className="text-2xl font-black text-slate-700">
                          {item.count}
                        </div>
                        <div className="text-xs text-slate-400 font-bold">
                          次
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <h3 className="text-base font-bold text-slate-400 mb-4 uppercase tracking-wider ml-2">
                  相關秘笈 ({displayLogs.length})
                </h3>
                {renderCardList(displayLogs)}
              </div>
            </div>
          ) : (
            <div className="text-center py-24 opacity-40">
              <div className="bg-slate-200 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Zap size={48} />
              </div>
              <p className="text-2xl font-bold text-slate-500">
                請輸入關鍵字，開始運功
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTraceTab = () => {
    return (
      <div className="flex flex-col h-full bg-slate-100">
        <div className="bg-white px-6 pt-12 pb-8 shadow-sm border-b rounded-b-[2.5rem]">
          <div className="max-w-5xl mx-auto w-full">
            <h2 className="font-black text-3xl text-slate-800 flex items-center gap-3">
              <Activity className="text-blue-500 w-10 h-10" /> 凌波微步
            </h2>
            <p className="text-slate-500 font-medium ml-1 mt-2 text-lg">
              交叉分析：追溯產品在各機台的足跡
            </p>
            {/* 新增：故障排行圖 - 橫向版 */}
            {selectedTraceProduct && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mx-4">
                  <h3 className="text-xs font-black text-slate-500 flex items-center gap-1 mb-3 uppercase tracking-wider">
                    <BarChart2 size={14} className="text-blue-500" /> 機況排行榜
                  </h3>
                  <div className="space-y-2">
                    {productStats.slice(0, 5).map((stat, index) => (
                      <div
                        key={stat.machine}
                        className="flex items-center gap-2"
                      >
                        {/* Rank */}
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0 ${
                            index === 0
                              ? "bg-red-500"
                              : index === 1
                              ? "bg-orange-400"
                              : "bg-slate-300"
                          }`}
                        >
                          {index + 1}
                        </div>

                        {/* Machine Name & Bar */}
                        <div className="flex-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-0.5">
                            <span>{stat.machine}</span>
                            <span>{stat.count}</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                index === 0
                                  ? "bg-red-500"
                                  : index === 1
                                  ? "bg-orange-400"
                                  : "bg-blue-400"
                              }`}
                              style={{
                                width: `${
                                  maxTraceCount > 0
                                    ? (stat.count / maxTraceCount) * 100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div
          className="p-4 flex-1 overflow-y-auto pb-48"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="max-w-5xl mx-auto w-full space-y-6">
            <div
              className={`bg-white p-5 rounded-[2xl] shadow-sm transition-all duration-500 ${
                selectedTraceProduct ? "border-b-4 border-blue-500" : ""
              }`}
            >
              <label className="text-base font-bold text-slate-500 mb-3 block uppercase tracking-wider">
                Step 1: 輸入產品型號
              </label>
              <div className="relative">
                <QrCode
                  className="absolute left-5 top-5 text-slate-400"
                  size={24}
                />
                <input
                  type="text"
                  className="w-full pl-14 pr-5 py-3 bg-slate-50 border-2 border-slate-200 focus:border-blue-500 rounded-2xl outline-none text-1g font-bold font-mono text-blue-700 placeholder:text-slate-300 transition-colors"
                  placeholder="例如: HAG039N03"
                  value={traceProductSearch}
                  onChange={(e) => {
                    setTraceProductSearch(e.target.value);
                    setSelectedTraceProduct(null);
                  }}
                />
              </div>
              {!selectedTraceProduct && traceProductSearch && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                  {matchedProducts.slice(0, 6).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        setTraceProductSearch(p);
                        setSelectedTraceProduct(p);
                      }}
                      className="text-left p-4 bg-slate-50 hover:bg-blue-50 rounded-xl border border-slate-200 hover:border-blue-200 transition-colors font-mono font-bold text-slate-600"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedTraceProduct && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-lg font-black text-slate-700 flex items-center gap-2">
                    <Factory size={24} className="text-red-500" /> 機台列表 (
                    {productStats.length})
                  </h3>
                  <span className="text-sm bg-slate-200 text-slate-600 px-3 py-1 rounded-full font-bold">
                    共{" "}
                    {
                      logs.filter((l) => l.productID === selectedTraceProduct)
                        .length
                    }{" "}
                    次紀錄
                  </span>
                </div>
                <div className="space-y-4">
                  {productStats.map((stat, index) => (
                    <div
                      key={stat.machine}
                      className="bg-white border border-slate-200 rounded-[2rem] p-0 shadow-sm overflow-hidden"
                    >
                      <div className="p-6 relative">
                        <div
                          className={`absolute left-0 top-0 bottom-0 opacity-10 transition-all duration-1000 ${
                            index === 0 ? "bg-red-500" : "bg-slate-500"
                          }`}
                          style={{
                            width: `${
                              maxTraceCount > 0
                                ? (stat.count / maxTraceCount) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                        <div className="relative z-10 flex justify-between items-start">
                          <div className="flex gap-4 items-center">
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-inner ${
                                index === 0
                                  ? "bg-red-500 text-white"
                                  : index === 1
                                  ? "bg-orange-400 text-white"
                                  : index === 2
                                  ? "bg-yellow-400 text-white"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <div className="text-2xl font-black text-slate-800 leading-none mb-1">
                                {stat.machine}
                              </div>
                              <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                <AlertTriangle
                                  size={14}
                                  className={
                                    index === 0
                                      ? "text-red-500"
                                      : "text-slate-400"
                                  }
                                />{" "}
                                主因:{" "}
                                <span className="text-slate-700 bg-slate-100 px-2 rounded">
                                  {stat.topIssue}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`block text-xl font-black ${
                                index === 0 ? "text-red-600" : "text-slate-700"
                              }`}
                            >
                              {stat.count}
                            </span>
                            <span className="text-xs text-slate-400 font-bold">
                              次內傷
                            </span>
                          </div>
                        </div>
                      </div>
                      <details className="group border-t border-slate-100 bg-slate-50/50">
                        <summary className="p-3 text-center text-slate-400 text-sm font-bold cursor-pointer hover:bg-slate-100 hover:text-blue-500 transition-colors list-none flex items-center justify-center gap-2">
                          查看詳細紀錄{" "}
                          <ChevronDown
                            size={16}
                            className="group-open:rotate-180 transition-transform"
                          />
                        </summary>
                        <div className="px-6 pb-6 pt-2 space-y-3">
                          {stat.logs.map((log) => (
                            <div
                              key={log.id}
                              className="relative pl-4 py-2 cursor-pointer hover:bg-white rounded-lg transition-colors border-l-2 border-slate-200 hover:border-blue-500"
                              onClick={() => {
                                setSelectedLog(log);
                                setModalView("detail");
                              }}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <div className="text-xs font-mono text-slate-400">
                                  {log.importDate}
                                </div>
                                {log.errorCode && log.errorCode !== "NA" && (
                                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">
                                    {log.errorCode}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm font-bold text-slate-700 line-clamp-1">
                                {log.solution || log.issue}
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // --- 新增紀錄頁面 (單一輸入框版：【 修 煉 日 誌 】 + 修正班別) ---
  const renderAddPage = () => (
    <div className="absolute inset-0 z-50 bg-slate-50 flex flex-col animate-in slide-in-from-bottom-10 duration-300">
      <div className="bg-white px-6 py-4 shadow-sm border-b flex justify-between items-center sticky top-0 z-20">
        <button
          onClick={() => setModalView(null)}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full"
        >
          <X size={24} />
        </button>
        <h2 className="text-lg font-black text-slate-800">撰寫修煉日誌</h2>
        <button
          onClick={handleSave}
          className="text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 flex items-center gap-1"
        >
          <Save size={16} /> 存檔
        </button>
      </div>
      <div
        className="flex-1 overflow-y-auto p-6 space-y-6"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
              機台代號 (Machine)
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full p-4 bg-white border border-slate-200 rounded-xl text-lg font-black text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300 uppercase"
                placeholder="例如: K21"
                value={formData.machine}
                onChange={(e) =>
                  setFormData({ ...formData, machine: e.target.value })
                }
                onFocus={() => setActiveField("machine")}
                onBlur={() => setTimeout(() => setActiveField(null), 200)}
              />
              {activeField === "machine" &&
                getSuggestions("machine", formData.machine).length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 shadow-xl rounded-xl z-30 overflow-hidden max-h-40 overflow-y-auto">
                    {getSuggestions("machine", formData.machine).map((s) => (
                      <button
                        key={s}
                        onMouseDown={() =>
                          setFormData({ ...formData, machine: s })
                        }
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 text-slate-600 font-bold border-b border-slate-50 last:border-0"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                產品 (Product)
              </label>
              <input
                type="text"
                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 uppercase"
                placeholder="產品型號"
                value={formData.productID}
                onChange={(e) =>
                  setFormData({ ...formData, productID: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                故障代碼 (Error Code)
              </label>
              <input
                type="text"
                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500"
                placeholder="Bin / Err"
                value={formData.errorCode}
                onChange={(e) =>
                  setFormData({ ...formData, errorCode: e.target.value })
                }
              />
            </div>
          </div>

          {/* 合併後的單一輸入框：【 修 練 日 誌 】 */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
              【 修 煉 日 誌 】 (Content)
            </label>
            <textarea
              className="w-full p-4 bg-white border border-slate-200 rounded-xl text-base font-medium text-slate-700 outline-none focus:border-blue-500 min-h-[200px]"
              placeholder="請描述故障現象與處置對策..."
              value={formData.issue}
              onChange={(e) =>
                setFormData({ ...formData, issue: e.target.value })
              }
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                班別 (Shift)
              </label>
              <select
                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
                value={formData.shift}
                onChange={(e) =>
                  setFormData({ ...formData, shift: e.target.value })
                }
              >
                <option value="">選擇班別</option>
                <option value="日A">日 A</option>
                <option value="夜B">夜 B</option>
                <option value="日C">日 C</option>
                <option value="夜D">夜 D</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                工程師 (Engineer)
              </label>
              <input
                type="text"
                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
                placeholder="姓名"
                value={formData.engineer}
                onChange={(e) =>
                  setFormData({ ...formData, engineer: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // --- 資料匯入/管理頁面 (掃地僧 + 謄錄經書版) ---
  const renderImportPage = () => (
    <div className="absolute inset-0 z-50 bg-slate-100 flex flex-col animate-in slide-in-from-bottom-10">
      <div className="bg-white px-6 py-4 shadow-sm border-b flex justify-between items-center">
        <button
          onClick={() => setModalView(null)}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full"
        >
          <X size={24} />
        </button>
        <h2 className="text-lg font-black text-slate-800">藏經閣管理</h2>
        <div className="w-8"></div>
      </div>
      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
            資料匯入 (Excel/CSV)
          </h3>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
          >
            <Upload size={32} className="mb-2" />
            <span className="font-bold">點擊上傳檔案</span>
            <span className="text-xs mt-1">支援 .xlsx, .csv</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="mt-4">
            <textarea
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              rows="3"
              placeholder="或直接貼上 CSV 文字..."
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value);
                parseImportData(e.target.value);
              }}
            ></textarea>
          </div>

          {importPreview.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-blue-600">
                  預覽: {importPreview.length} 筆資料
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg bg-slate-50 p-2 space-y-1">
                {importPreview.slice(0, 10).map((row, i) => (
                  <div
                    key={i}
                    className="text-xs text-slate-600 truncate border-b border-slate-100 pb-1"
                  >
                    {row.machine} | {row.issue}
                  </div>
                ))}
                {importPreview.length > 10 && (
                  <div className="text-xs text-center text-slate-400 pt-1">
                    ...還有 {importPreview.length - 10} 筆
                  </div>
                )}
              </div>
              <button
                onClick={executeBatchImport}
                className="w-full mt-4 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
              >
                確認匯入資料庫
              </button>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">
            藏經閣維護
          </h3>

          <button
            onClick={handleRemoveDuplicates}
            className="w-full py-4 bg-orange-50 border border-orange-200 text-orange-800 font-bold rounded-xl hover:bg-orange-100 hover:shadow-md flex items-center justify-center gap-3 transition-all active:scale-95 group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              🧹
            </span>
            <span>請掃地僧清理門戶 (清除重複)</span>
          </button>

          <button
            onClick={handleExport}
            className="w-full py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2"
          >
            <Download size={18} /> 謄錄經書 (下載 Excel)
          </button>
          <button
            onClick={handleClearAll}
            className="w-full py-3 bg-red-50 border border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-100 flex items-center justify-center gap-2"
          >
            <Trash2 size={18} /> 焚毀所有經書 (清空)
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-[100dvh] font-sans text-slate-900 bg-slate-200 flex justify-center items-center overflow-hidden">
      <div className="w-full max-w-md h-full bg-white relative shadow-2xl overflow-hidden flex flex-col md:border-x border-slate-300">
        {activeTab === "home" && renderHomeTab()}
        {activeTab === "diagnose" && renderDiagnoseTab()}
        {activeTab === "trace" && renderTraceTab()}

        {modalView === "add" && renderAddPage()}
        {modalView === "detail" && renderDetailPage()}
        {modalView === "import" && renderImportPage()}

        <div className="absolute bottom-12 left-6 right-6 bg-white border border-slate-200 rounded-[2rem] flex justify-around items-center h-20 shadow-2xl z-30 pb-1">
          <button
            onClick={() => {
              setActiveTab("home");
              setSearchTerm("");
            }}
            className={`flex flex-col items-center gap-1.5 w-1/3 ${
              activeTab === "home"
                ? "text-blue-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Scroll size={28} strokeWidth={2.5} />
            <span className="text-xs font-bold">藏經閣</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("trace");
              setSearchTerm("");
            }}
            className={`flex flex-col items-center gap-1.5 w-1/3 ${
              activeTab === "trace"
                ? "text-green-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Sword size={28} strokeWidth={2.5} />
            <span className="text-xs font-bold">凌波微步</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("diagnose");
              setSearchTerm("");
            }}
            className={`flex flex-col items-center gap-1.5 w-1/3 ${
              activeTab === "diagnose"
                ? "text-yellow-500"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Lightbulb size={28} strokeWidth={2.5} />
            <span className="text-xs font-bold">心法</span>
          </button>
        </div>
      </div>
    </div>
  );
}
