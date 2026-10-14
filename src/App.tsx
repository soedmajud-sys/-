import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, ShieldCheck, Coins, Users, LifeBuoy, Send, CheckCircle, 
  Clock, AlertTriangle, Search, Filter, ArrowLeft, ArrowRight, Sparkles, 
  UploadCloud, Check, X, TrendingUp, Layers, Eye, 
  Settings, Activity, FileCheck, Calendar, Hash, User, Mail, Phone, 
  Building, MessageSquare, Database, Lock, RefreshCcw, Edit, 
  ThumbsUp, CheckCircle2, AlertCircle, EyeOff, FileSpreadsheet, ChevronDown, 
  ExternalLink, BarChart2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { SERVICE_CATEGORIES, ServiceRequest, RequestStatus, UrgencyLevel } from "./types";
import { SAMPLE_REQUESTS } from "./sampleData";

export default function App() {
  // --- Persistent Requests State ---
  const [requests, setRequests] = useState<ServiceRequest[]>(() => {
    const saved = localStorage.getItem("national_office_requests");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading requests:", e);
      }
    }
    return SAMPLE_REQUESTS;
  });

  useEffect(() => {
    localStorage.setItem("national_office_requests", JSON.stringify(requests));
  }, [requests]);

  // --- Theme/UI Navigation State ---
  const [activeTab, setActiveTab] = useState<"citizen" | "officer">("citizen");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  // --- Search & Filters State (Officer Panel) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // --- Citizen Portal Form Fields ---
  const [applicantName, setApplicantName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("admin");
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  
  // --- Attachment Simulation State ---
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // --- AI Style Improver Endpoints State ---
  const [isImproving, setIsImproving] = useState(false);
  const [aiImprovedText, setAiImprovedText] = useState("");
  const [originalCompareText, setOriginalCompareText] = useState("");
  const [showStyleCompare, setShowStyleCompare] = useState(false);
  const [styleError, setStyleError] = useState("");

  // --- Intelligent Submission & Analysis Stepper State ---
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [lastSubmittedRequest, setLastSubmittedRequest] = useState<ServiceRequest | null>(null);
  const [intakeSuccess, setIntakeSuccess] = useState(false);
  const [intakeError, setIntakeError] = useState("");

  // Stepper descriptions for high-quality immersive loading
  const analysisStepsArabic = [
    "جارٍ فك تشفير الطلب وتسجيله بقواعد بيانات المكتب الوطني الأمّنة...",
    "تحليل المضامين والتحقق الدلالي بواسطة محرك Google Gemini 3.5 الاستباقي...",
    "تقييم مستوى الحرجية، والجدول الزمني للاستعجال وتقدير الأولويات الإدارية...",
    "توليد التوصيات، تفصيل الوثائق الناقصة وإيجاز رد البداية الرسمي التلقائي..."
  ];

  // --- Case Officers Admin Actions State ---
  const [officerStatus, setOfficerStatus] = useState<RequestStatus>("new");
  const [officerComments, setOfficerComments] = useState("");
  const [officerResponse, setOfficerResponse] = useState("");
  const [isSavingOfficerUpdates, setIsSavingOfficerUpdates] = useState(false);

  // Synchronize official review panel when a request is selected
  useEffect(() => {
    if (selectedRequest) {
      setOfficerStatus(selectedRequest.status);
      setOfficerComments(selectedRequest.officialComments || "");
      setOfficerResponse(selectedRequest.aiAnalysis?.suggestedResponse || "");
    }
  }, [selectedRequest]);

  // --- Live Clock Counter ---
  const [currentTime, setCurrentTime] = useState("");
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      // Formats to elegant Arabic style locale
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        calendar: 'gregorian'
      };
      setCurrentTime(now.toLocaleDateString('ar-SA', options));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Drag & Drop Handlers ---
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setAttachedFile({ name: file.name, size: `${sizeMB} MB` });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setAttachedFile({ name: file.name, size: `${sizeMB} MB` });
    }
  };

  // --- Trigger AI Style Improvement ---
  const handleImproveStyleText = async () => {
    if (!requestDescription.trim()) {
      setStyleError("الرجاء كتابة نص شرح الطلب أولاً ليقوم الذكاء الاصطناعي بإعادة صياغته.");
      return;
    }
    setStyleError("");
    setIsImproving(true);
    setOriginalCompareText(requestDescription);

    try {
      const response = await fetch("/api/requests/improve-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: requestTitle,
          description: requestDescription,
          category: selectedCategory
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed API response");
      }

      setAiImprovedText(data.enhancedText);
      setShowStyleCompare(true);
    } catch (err: any) {
      console.error(err);
      setStyleError(err.message || "عذراً، فشل الاتصال بخادم الذكاء الاصطناعي لتحسين الصياغة.");
    } finally {
      setIsImproving(false);
    }
  };

  // --- Form Submission & Real-time AI Intake Pipeline ---
  const handleCitizenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!applicantName || !nationalId || !email || !phone || !requestTitle || !requestDescription) {
      setIntakeError("يرجى ملء جميع الحقول المطلوبة لضمان معالجة طلبكم لدى المكتب الوطني.");
      return;
    }

    if (nationalId.length < 10) {
      setIntakeError("الرقم الوطني / السجل المدني غير صالح. يجب أن يتكون من 10 خانات على الأقل.");
      return;
    }

    setIntakeError("");
    setIsAnalyzing(true);
    setAnalysisStep(0);
    setIntakeSuccess(false);

    // Dynamic fake progress steps intervals for high engaging UX
    const stepperInterval = setInterval(() => {
      setAnalysisStep(prev => {
        if (prev < 3) return prev + 1;
        return prev;
      });
    }, 1800);

    try {
      // API call to Express with server-side SDK to analyze the request
      const response = await fetch("/api/requests/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicantName,
          category: selectedCategory,
          title: requestTitle,
          description: requestDescription,
          fileName: attachedFile ? attachedFile.name : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "خطأ غير معروف في خادم التحليل.");
      }

      // Generate unique tracking number and prepare record
      const randomID = Math.floor(10000 + Math.random() * 90000);
      const year = new Date().getFullYear();
      const trackingNumber = `NT-${year}-${randomID}`;
      const newRequestId = `req-${Date.now()}`;

      const finalRequest: ServiceRequest = {
        id: newRequestId,
        trackingNumber,
        applicantName,
        nationalId,
        email,
        phone,
        category: selectedCategory,
        title: requestTitle,
        description: requestDescription,
        status: "new",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fileName: attachedFile ? attachedFile.name : undefined,
        fileSize: attachedFile ? attachedFile.size : undefined,
        aiAnalysis: data.analysis
      };

      // Add to local state (at front of list)
      setRequests(prev => [finalRequest, ...prev]);
      setLastSubmittedRequest(finalRequest);

      // Force completing the steps nicely
      setTimeout(() => {
        clearInterval(stepperInterval);
        setAnalysisStep(3);
        setIsAnalyzing(false);
        setIntakeSuccess(true);
        
        // Reset form inputs
        setApplicantName("");
        setNationalId("");
        setEmail("");
        setPhone("");
        setRequestTitle("");
        setRequestDescription("");
        setAttachedFile(null);
      }, 3500);

    } catch (err: any) {
      clearInterval(stepperInterval);
      setIsAnalyzing(false);
      console.error(err);
      setIntakeError(err.message || "عذراً، فشل إرسال الطلب وإجراء تحليل الذكاء الاصطناعي بسبب خلل في الشبكة الخادم.");
    }
  };

  // --- Official / Administrative Panel Action Handlers ---
  const handleSaveOfficerUpdate = () => {
    if (!selectedRequest) return;

    setIsSavingOfficerUpdates(true);

    // Simulate saving delay
    setTimeout(() => {
      setRequests(prev => prev.map(req => {
        if (req.id === selectedRequest.id) {
          const updated: ServiceRequest = {
            ...req,
            status: officerStatus,
            officialComments: officerComments,
            updatedAt: new Date().toISOString(),
          };
          if (updated.aiAnalysis) {
            updated.aiAnalysis.suggestedResponse = officerResponse;
          }
          // Update selectedRequest view also
          setSelectedRequest(updated);
          return updated;
        }
        return req;
      }));
      setIsSavingOfficerUpdates(false);
    }, 800);
  };

  // Clean application resetting to factory sample database
  const handleRestoreSampleDatabase = () => {
    if (confirm("هل أنت متأكد من رغبتك في إعادة تنظيم لوحة البيانات وإرجاع قائمة الطلبات الافتراضية الأربعة الأصيلة؟")) {
      setRequests(SAMPLE_REQUESTS);
      setSelectedRequest(null);
      localStorage.setItem("national_office_requests", JSON.stringify(SAMPLE_REQUESTS));
    }
  };

  // --- Calculate Analytics Metrics ---
  const totalCount = requests.length;
  const newCount = requests.filter(r => r.status === "new").length;
  const processingCount = requests.filter(r => r.status === "processing").length;
  const acceptedCount = requests.filter(r => r.status === "accepted" || r.status === "completed").length;
  const highPriorityCount = requests.filter(r => r.aiAnalysis?.urgency === "high").length;

  // Recharts structured metrics configuration
  const categoryChartMetadata = SERVICE_CATEGORIES.map(cat => {
    return {
      name: cat.titleArabic,
      key: cat.id,
      "عدد الطلبات": requests.filter(r => r.category === cat.id).length
    };
  });

  const statusPieData = [
    { name: "طلب جديد (بانتظار الفرز)", value: requests.filter(r => r.status === "new").length, color: "#3B82F6" },
    { name: "تحت الدراسة التشغيلية", value: requests.filter(r => r.status === "processing").length, color: "#F59E0B" },
    { name: "تم قبوله واعتماده", value: requests.filter(r => r.status === "accepted").length, color: "#10B981" },
    { name: "طلب مرفوض مع مبررات", value: requests.filter(r => r.status === "rejected").length, color: "#EF4444" },
    { name: "مكتمل ومعاد صياغته", value: requests.filter(r => r.status === "completed").length, color: "#6366F1" }
  ].filter(item => item.value > 0); // No empty charts

  const urgencyPieData = [
    { name: "حرج / استعجال قصوى (عاجل)", value: requests.filter(r => r.aiAnalysis?.urgency === "high").length, color: "#EF4444" },
    { name: "رصين / أولوية عامة (متوسط)", value: requests.filter(r => r.aiAnalysis?.urgency === "medium").length, color: "#F59E0B" },
    { name: "طلب مريح / عادي (منخفض)", value: requests.filter(r => r.aiAnalysis?.urgency === "low").length, color: "#10B981" }
  ].filter(item => item.value > 0);

  // --- Search & Grid filter logic for management table ---
  const filteredRequests = requests.filter(req => {
    const searchMatch = 
      req.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.nationalId.includes(searchTerm) ||
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.description.toLowerCase().includes(searchTerm.toLowerCase());

    const categoryMatch = categoryFilter === "all" || req.category === categoryFilter;
    const statusMatch = statusFilter === "all" || req.status === statusFilter;

    return searchMatch && categoryMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white antialiased">
      
      {/* ====================================
          TOP FLUID EXECUTIVE STATE ACTIONS BAR
          ==================================== */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* National Emblem & Title Style */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg shadow-inner">
                <Building className="h-6 w-6 text-slate-900 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    رسمي
                  </span>
                  <span className="text-xs text-slate-400">بوابة الدخول الموحد للوزارات</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-white tracking-tight">
                  المكتب الوطني <span className="text-amber-400">منصة استقبال طلبات الخدمات الإلكترونية</span>
                </h1>
              </div>
            </div>

            {/* Smart Information and Date Counter */}
            <div className="flex flex-col items-start md:items-end text-xs text-slate-300 bg-slate-800/40 px-4 py-2 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-2 text-amber-300 font-semibold mb-1">
                <Clock className="h-3.5 w-3.5" />
                <span>التوقيت الرسمي للمملكة العربية السعودية (UTC)</span>
              </div>
              <span className="font-mono">{currentTime || "التحميل..."}</span>
            </div>

          </div>
        </div>

        {/* Global Navigation Tabs & IA Active Signage */}
        <div className="bg-slate-950 border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 py-1">
              
              {/* Tabs Switcher with clean gold style and click animations */}
              <div className="flex space-x-reverse space-x-1 py-1">
                <button
                  id="tab-citizen-portal"
                  onClick={() => { setActiveTab("citizen"); setSelectedRequest(null); }}
                  className={`px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                    activeTab === "citizen"
                      ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <Send className="h-4 w-4" />
                  بوابة المواطنين وتقديم الطلبات
                </button>

                <button
                  id="tab-officer-portal"
                  onClick={() => setActiveTab("officer")}
                  className={`px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 flex items-center gap-2 relative ${
                    activeTab === "officer"
                      ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                      : "text-slate-300 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  أمانة فرز ومتابعة الطلبات (مسؤولي المكتب)
                  {newCount > 0 && (
                    <span className="absolute -top-1.5 -left-1.5 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow animate-bounce">
                      {newCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Server-Side Intelligent Agent Indicator */}
              <div className="flex items-center justify-center gap-2 px-3 py-1 bg-slate-850/80 border border-slate-800 rounded-lg text-xs text-blue-300 self-center">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </div>
                <span>الفرز الفوري والتصنيف مفعّل عبر نموذج </span>
                <strong className="text-white font-mono bg-blue-600/20 px-1.5 py-0.5 rounded border border-blue-500/30">
                  Gemini 3.5 Flash
                </strong>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* ====================================
          CORE BROAD DATA GRID OVERVIEW METRICS
          ==================================== */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-inner relative overflow-hidden">
        
        {/* Subtle geometric background overlay to mimic high design quality */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-amber-400 filter blur-3xl"></div>
          <div className="absolute bottom-0 right-10 w-80 h-80 rounded-full bg-blue-500 filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            {/* Stat Card 1 */}
            <div className="bg-slate-950/40 backdrop-blur-sm border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-semibold">إجمالي الطلبات المستلمة</span>
                <span className="p-1 px-2 text-[10px] bg-slate-800 text-slate-300 rounded font-mono">تراكمي</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-heading text-white">{totalCount}</span>
                <span className="text-xs text-slate-400">طلب</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                <span>معدل معالجة فوري 100%</span>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-slate-950/40 backdrop-blur-sm border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-semibold">بانتظار الفرز والاعتماد</span>
                <span className="p-1 px-1.5 text-[10px] bg-blue-500/10 text-blue-400 rounded-full font-bold">نشط</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-heading text-blue-400">{newCount}</span>
                <span className="text-xs text-blue-300">طلبات جديدة</span>
              </div>
              <div className="mt-3 text-[11px] text-slate-400">
                <span>تتطلب اهتمام المسؤولين</span>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-slate-950/40 backdrop-blur-sm border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-semibold">قيد الدراسة الميدانية</span>
                <span className="p-1 px-1.5 text-[10px] bg-amber-500/10 text-amber-400 rounded-full font-bold">معالجة</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-heading text-amber-400">{processingCount}</span>
                <span className="text-xs text-amber-350">تحت الإجراء</span>
              </div>
              <div className="mt-3 text-[11px] text-slate-400">
                <span>جاري إعداد لجان التفتيش</span>
              </div>
            </div>

            {/* Stat Card 4 */}
            <div className="bg-slate-950/40 backdrop-blur-sm border border-slate-800 p-5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-semibold">طلبات منتهية ومكتملة</span>
                <span className="p-1 px-1.5 text-[10px] bg-emerald-500/10 text-emerald-400 rounded-full font-bold">بنجاح</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-heading text-emerald-400">{acceptedCount}</span>
                <span className="text-xs text-emerald-250">طلب معتمد</span>
              </div>
              <div className="mt-3 text-[11px] text-slate-400">
                <span>تم إرسال القرارات الرسمية</span>
              </div>
            </div>

            {/* Stat Card 5 */}
            <div className="bg-slate-950/40 backdrop-blur-sm border border-slate-800 p-5 rounded-xl col-span-2 md:col-span-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-semibold">حالات حرجية عاجلة</span>
                <span className="p-1 px-1.5 text-[10px] bg-red-500/10 text-red-400 rounded-full font-bold">خطيرة</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-heading text-red-500">{highPriorityCount}</span>
                <span className="text-xs text-red-300">أولوية قصوى</span>
              </div>
              <div className="mt-3 text-[11px] text-slate-400">
                <span>مصنفة تلقائياً كاستعجال فوري</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =======================================================
          CITIZEN DISPATCH INTERFACE (PORTAL Tab (بوابة تقديم الطلبات))
          ======================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {activeTab === "citizen" && (
          <div className="space-y-12">
            
            {/* Immersive Success Receipt block */}
            {intakeSuccess && lastSubmittedRequest && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 border-2 border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-lg max-w-4xl mx-auto"
              >
                <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right border-b border-emerald-200 pb-6 mb-6">
                  <div className="p-4 bg-emerald-600 rounded-full text-white shadow-md animate-pulse">
                    <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-heading">تم إرسال طلبكم وتسجيله بنجاح!</h2>
                    <p className="text-sm text-slate-650 mt-1">
                      نشكركم على استخدام البوابة الوطنية للخدمات الإلكترونية. لقد باشرت خوارزميات الذكاء الاصطناعي فرز الطلب وتوصيفه.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Official Receipt */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-slate-900 text-amber-400 font-mono text-[10px] px-3 py-1 font-bold rounded-bl uppercase">
                      إيصال معتمد
                    </div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">بيانات الإيصال والمتابعة</h3>
                    
                    <div className="space-y-3 font-medium">
                      <div className="flex justify-between items-center text-sm py-1 border-b border-slate-100">
                        <span className="text-slate-500">رقم المتابعة الأمني:</span>
                        <span className="font-mono text-blue-600 font-extrabold text-base bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                          {lastSubmittedRequest.trackingNumber}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm py-1 border-b border-slate-100">
                        <span className="text-slate-500">اسم مقدم الطلب:</span>
                        <span className="text-slate-800">{lastSubmittedRequest.applicantName}</span>
                      </div>
                      <div className="flex justify-between text-sm py-1 border-b border-slate-100">
                        <span className="text-slate-500">الهوية الوطنية:</span>
                        <span className="text-slate-800 font-mono">{lastSubmittedRequest.nationalId}</span>
                      </div>
                      <div className="flex justify-between text-sm py-1 border-b border-slate-100">
                        <span className="text-slate-500">الموضوع:</span>
                        <span className="text-slate-800 truncate max-w-[200px]">{lastSubmittedRequest.title}</span>
                      </div>
                      <div className="flex justify-between text-sm py-1 border-b border-slate-100">
                        <span className="text-slate-500">التصنيف الإلكتروني:</span>
                        <span className="text-slate-800">
                          {SERVICE_CATEGORIES.find(c => c.id === lastSubmittedRequest.category)?.titleArabic}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs py-1 text-slate-400">
                        <span>تاريخ وتوقيت التقديم:</span>
                        <span className="font-mono">
                          {new Date(lastSubmittedRequest.createdAt).toLocaleDateString('ar-SA')} 
                          {" الساعة "} 
                          {new Date(lastSubmittedRequest.createdAt).toLocaleTimeString('ar-SA')}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-start gap-2.5">
                      <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 leading-relaxed">
                        يرجى حفظ الكود الأمني <strong className="font-mono">{lastSubmittedRequest.trackingNumber}</strong> لمتابعة حالة الطلب وقرارات المعالجة لدى المكتب الوطني لاحقاً.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: AI Live Evaluation Details */}
                  {lastSubmittedRequest.aiAnalysis && (
                    <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4.5 w-4.5 text-amber-400" />
                          <h4 className="text-sm font-bold text-amber-400">مخرجات فرز المحرك الذكي</h4>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">
                          طاقة المطابقة: {(lastSubmittedRequest.aiAnalysis.confidenceScore * 100).toFixed(0)}%
                        </span>
                      </div>

                      {/* AI Priority Evaluation */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">تصنيف الاستعجال التلقائي:</span>
                          <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                            lastSubmittedRequest.aiAnalysis.urgency === "high" 
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : lastSubmittedRequest.aiAnalysis.urgency === "medium"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          }`}>
                            {lastSubmittedRequest.aiAnalysis.urgency === "high" ? "عاجل جداً" : lastSubmittedRequest.aiAnalysis.urgency === "medium" ? "متوسط الاستعجال" : "عادي / مريح"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-955 p-2.5 rounded border border-slate-800/80">
                          <strong>السبب الإداري:</strong> {lastSubmittedRequest.aiAnalysis.urgencyReason}
                        </p>
                      </div>

                      {/* AI Missing items */}
                      {lastSubmittedRequest.aiAnalysis.missingDetails && lastSubmittedRequest.aiAnalysis.missingDetails.length > 0 && (
                        <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
                          <span className="text-xs text-amber-300 font-bold block">مستندات وتفاصيل مطلوبة للتحضير:</span>
                          <ul className="space-y-1">
                            {lastSubmittedRequest.aiAnalysis.missingDetails.map((detail, index) => (
                              <li key={index} className="text-xs text-slate-300 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* AI automatic drafted greeting */}
                      <div className="space-y-1 border-t border-slate-800/80 pt-3 text-[11px]">
                        <span className="text-slate-400 block font-semibold">باقة الاستجابة الذكية من المساعد الالي للمكتب:</span>
                        <div className="bg-slate-950 p-3 rounded text-slate-350 italic leading-relaxed whitespace-pre-line border border-slate-850">
                          {lastSubmittedRequest.aiAnalysis.suggestedResponse}
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 pt-5">
                  <button
                    onClick={() => {
                      setIntakeSuccess(false);
                      setLastSubmittedRequest(null);
                    }}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition"
                  >
                    تقديم طلب خدمات إضافي جديد
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("officer");
                      // Pre-select the newly added request in matching management board inside admin to highlight full vertical integrations
                      if (lastSubmittedRequest) {
                        setSelectedRequest(lastSubmittedRequest);
                      }
                      setIntakeSuccess(false);
                    }}
                    className="px-6 py-2.5 bg-amber-500 text-slate-950 rounded-lg text-sm font-bold hover:bg-amber-400 transition"
                  >
                    الانتقال للوحة الإدارة لمراجعة طلبكم الفورية
                  </button>
                </div>
              </motion.div>
            )}

            {/* Immersive AI analyzing loader */}
            {isAnalyzing && (
              <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl max-w-lg w-full p-6 sm:p-8 text-white relative overflow-hidden"
                >
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 animate-pulse"></div>
                  
                  <div className="text-center space-y-6">
                    {/* Animated spinner */}
                    <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-amber-400 border-t-transparent animate-spin"></div>
                      <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-amber-400 animate-pulse" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-amber-300 font-heading">معالجة فورية وتصنيف بالذكاء الاصطناعي</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        يجري الآن تقديم طلب العميل إلى سحابة الفرز الإداري التابعة للمكتب الوطني لدراسة المتطلبات فائق السرعة عبر محركات المزامنة التكنولوجية.
                      </p>
                    </div>

                    {/* Stepper with progress ticks */}
                    <div className="space-y-3.5 text-right mt-6">
                      {analysisStepsArabic.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 transition-all">
                          <div className="mt-0.5">
                            {analysisStep > idx ? (
                              <div className="p-0.5 bg-emerald-500 rounded-full text-slate-950">
                                <Check className="h-3 w-3 stroke-[3]" />
                              </div>
                            ) : analysisStep === idx ? (
                              <div className="relative flex h-4 w-4 shrink-0 mt-0.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                              </div>
                            ) : (
                              <div className="h-4 w-4 bg-slate-800 rounded-full border border-slate-700"></div>
                            )}
                          </div>
                          <p className={`text-xs ${analysisStep === idx ? "text-amber-300 font-bold" : analysisStep > idx ? "text-slate-400" : "text-slate-600"}`}>
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="text-center text-[10px] text-slate-500 font-mono progress-credits border-t border-slate-850 pt-4">
                      NATIONAL OFFICE COGNITIVE INTAKE PIPELINE v3.5
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Standard Submission Form */}
            {(!intakeSuccess || !lastSubmittedRequest) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Right Form column (Span 2) */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  
                  {/* Decorative Banner */}
                  <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 p-6 text-white relative">
                    <div className="absolute top-4 left-4">
                      <Sparkles className="h-10 w-10 text-amber-400 opacity-20" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold font-heading mb-1 text-white flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-amber-400" />
                      استمارة تقديم معاملة إلكترونية رسمية
                    </h2>
                    <p className="text-xs text-slate-300 max-w-xl">
                      يرجى تعبئة كافة المعلومات والبيانات بدقة تامة. ستقوم المنظومة الذكية بقراءة التفاصيل تلقائياً، تقييم زمن الاستعجال، وإحالة المعاملة لشُعبة الاختصاص المباشرة بالمكتب الوطني.
                    </p>
                  </div>

                  {/* Informational Error */}
                  {intakeError && (
                    <div className="m-6 p-4 bg-red-50 border-r-4 border-red-500 rounded-l-lg flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-550 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-750 font-semibold">{intakeError}</p>
                    </div>
                  )}

                  <form onSubmit={handleCitizenSubmit} className="p-6 sm:p-8 space-y-6">
                    
                    {/* Section 1: Personal Credentials */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-slate-900 border-r-2 border-amber-500 pr-2.5 pb-0.5 uppercase tracking-wider mb-4">
                        الخطوة 1: البيانات الشخصية لمقدم المعاملة
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">الاسم ثلاثي أو رباعي (رسمي) <span className="text-red-550">*</span></label>
                          <div className="relative">
                            <User className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              required
                              placeholder="أحمد بن فيصل الأحمد"
                              value={applicantName}
                              onChange={(e) => setApplicantName(e.target.value)}
                              className="w-full text-sm pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">الرقم الوطني / السجل التجاري / الهوية <span className="text-red-550">*</span></label>
                          <div className="relative">
                            <Hash className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                              type="text"
                              required
                              placeholder="10XXXXXXXX"
                              value={nationalId}
                              onChange={(e) => setNationalId(e.target.value)}
                              className="w-full text-sm text-right pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono transition outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">البريد الإلكتروني للرد والمتابعة <span className="text-red-550">*</span></label>
                          <div className="relative">
                            <Mail className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                              type="email"
                              required
                              placeholder="example@mail.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full text-sm text-left pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono transition outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1.5">رقم جوال المتابعة النشط <span className="text-red-550">*</span></label>
                          <div className="relative text-left">
                            <Phone className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                              type="tel"
                              required
                              placeholder="05XXXXXXXX"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              className="w-full text-sm text-left pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-mono transition outline-none"
                            />
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Section 2: Service specifics */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <h3 className="text-sm font-bold text-slate-900 border-r-2 border-amber-500 pr-2.5 pb-0.5 uppercase tracking-wider mb-4">
                        الخطوة 2: تحديد الخدمة وتفاصيل الطلب المعالجة
                      </h3>

                      {/* Interactive Visual Category Selector */}
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">نوع الخدمة المحددة إلكترونياً <span className="text-red-550">*</span></label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                          {SERVICE_CATEGORIES.map((cat) => {
                            const isSelected = selectedCategory === cat.id;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`text-right p-3 rounded-lg border text-xs transition-all relative ${
                                  isSelected
                                    ? "bg-slate-900 border-slate-900 text-amber-400 shadow-sm"
                                    : "bg-slate-50 border-slate-250 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                                }`}
                              >
                                {isSelected && (
                                  <span className="absolute top-2 left-2 text-amber-400">
                                    <CheckCircle className="h-3.5 w-3.5 fill-slate-900" />
                                  </span>
                                )}
                                <span className="font-bold block text-sm mb-1">{cat.titleArabic}</span>
                                <span className={`block line-clamp-1 text-[11px] ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                                  {cat.description}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Request Title */}
                      <div className="space-y-1.5 pt-2">
                        <label className="block text-xs font-semibold text-slate-600">موضوع أو عنوان المعاملة <span className="text-red-550">*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: طلب تجديد رخصة تشغيل الرافعات الثقيلة بموقع الحقول الإنشائية"
                          value={requestTitle}
                          onChange={(e) => setRequestTitle(e.target.value)}
                          className="w-full text-sm px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                      </div>

                      {/* Request Detailed write-up and AI Assistant improver */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs font-semibold text-slate-600">شرح وتفاصيل الطلب الإداري <span className="text-red-550">*</span></label>
                          <button
                            type="button"
                            onClick={handleImproveStyleText}
                            disabled={isImproving || !requestDescription.trim()}
                            className={`text-xs px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-all ${
                              !requestDescription.trim() 
                                ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-amber-500 to-amber-600 border-amber-600 text-slate-950 hover:shadow shadow-amber-300/40"
                            }`}
                          >
                            {isImproving ? (
                              <>
                                <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                                <span>صياغة مذهلة جارية...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>تحسين الصياغة الإدارية بالذكاء الاصطناعي ✨</span>
                              </>
                            )}
                          </button>
                        </div>

                        {styleError && (
                          <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded">{styleError}</p>
                        )}

                        <div className="relative">
                          <textarea
                            rows={6}
                            required
                            placeholder="اكتب هنا كافة تفاصيل المعاملة والظروف والطلبات. بإمكانك الكتابة بالشكل البسيط المعتاد، ثم الضغط على زر المساعد بالأعلى لإعادة صياغة الطلب تلقائياً لأسلوب صياغ قانوني وخطابي رسمي بليغ يليق بجهات المكتب الوطني."
                            value={requestDescription}
                            onChange={(e) => setRequestDescription(e.target.value)}
                            className="w-full text-sm p-4 bg-slate-50 border border-slate-250 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none whitespace-pre-wrap leading-relaxed transition"
                          />
                        </div>
                        <span className="text-[10.5px] text-slate-400 block">
                          ** تنويه: يتم توفير الدعم اللغوي وصياغة الردود تلقائياً بناءً على سياسات الاتصال المتوافقة مع المكتب الوطني.
                        </span>
                      </div>

                    </div>

                    {/* Section 3: Attachment upload area */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <h3 className="text-sm font-bold text-slate-900 border-r-2 border-amber-500 pr-2.5 pb-0.5 uppercase tracking-wider mb-4">
                        الخطوة 3: إرفاق المستندات الداعمة وعقد المطابقة (اختياري)
                      </h3>

                      <div 
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                          dragActive 
                            ? "border-blue-500 bg-blue-50" 
                            : attachedFile 
                            ? "border-emerald-500 bg-emerald-50/40" 
                            : "border-slate-300 bg-slate-50 hover:bg-slate-100/70"
                        }`}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        />

                        {attachedFile ? (
                          <div className="space-y-2">
                            <div className="p-3 bg-emerald-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto shadow">
                              <FileCheck className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-slate-800">{attachedFile.name}</p>
                              <p className="text-xs text-slate-500 font-mono">الحجم التقريبي: {attachedFile.size}</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAttachedFile(null);
                              }}
                              className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded hover:bg-red-55 bg-white shadow-sm border border-red-200 mt-2"
                            >
                              إلغاء المرفق الحالي
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="p-3 bg-slate-200 text-slate-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                              <UploadCloud className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-slate-700">اسحب مستنداتك وأسقطها هنا، أو اضغط للتصفح من على جهازك</p>
                              <p className="text-xs text-slate-400">
                                الصيغ المدعومة لفرز الوثائق: PDF، أو مستندات أوفيس، أو صور واضحة (الحد الأقصى للتشفير الآلي: 10 ميجابايت).
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="pt-6 border-t border-slate-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Lock className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>بياناتكم مشفرة ومصانة برقم أمني خاص متوافق مع لوائح الأمن الوطني والخصوصية الرقمية.</span>
                      </div>
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 focus:ring-4 focus:ring-slate-350 transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
                      >
                        <Send className="h-4 w-4" />
                        تقديم الطلب وتحليله فورياً بالذكاء الاصطناعي 🚀
                      </button>
                    </div>

                  </form>
                </div>

                {/* Left Side Info Cards (Help/Policies Guide Column) */}
                <div className="space-y-6">
                  
                  {/* National Office Message Box */}
                  <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow relative overflow-hidden">
                    {/* Golden design accent bar */}
                    <div className="absolute top-0 right-0 w-2.5 h-full bg-amber-400"></div>
                    <div className="pr-2 space-y-4">
                      <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-amber-400" />
                        <h4 className="font-heading font-bold text-base text-amber-400">لوائح الاستقبال ومعالجة الطلبات</h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        يهدف "المكتب الوطني" لرقمنة كافة التراخيص والخدمات الإدارية بدعم تام للتحول الرقمي المستقبلي. عبر تفعيل محرك Gemini للذكاء الاصطناعي، يتم تصنيف ومعاينة طلباتكم بشكل لحظي لتقليل أوقات الانتظار من أسابيع إلى بضع دقائق فقط.
                      </p>
                      <div className="border-t border-slate-800 pt-3 space-y-2">
                        <div className="text-xs flex items-center gap-2 text-slate-300">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          <span>تصفية ومعالجة تلقائية استباقية</span>
                        </div>
                        <div className="text-xs flex items-center gap-2 text-slate-300">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          <span>تحرير مسودات الردود للموظفين</span>
                        </div>
                        <div className="text-xs flex items-center gap-2 text-slate-300">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          <span>رصد المعاملات الحرجية عاجلة الصرف</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Guide: Categories details */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Layers className="h-4.5 w-4.5 text-blue-600" />
                      أدلة الخدمات وتصنيفاتها الرسمية
                    </h4>
                    <div className="space-y-3">
                      {SERVICE_CATEGORIES.map((cat) => (
                        <div key={cat.id} className="text-xs border-r-2 border-slate-200 hover:border-blue-500 pr-2.5 py-0.5 transition-all">
                          <p className="font-bold text-slate-800">{cat.titleArabic}</p>
                          <p className="text-slate-500 line-clamp-1">{cat.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Environment Info card */}
                  <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 text-xs text-slate-500 space-y-2">
                    <h5 className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Database className="h-3.5 w-3.5 text-slate-600" />
                      محفظة الخادم السريعة للمكتب
                    </h5>
                    <p className="leading-relaxed">
                      يتم تسيير خوادم البوابة بشكل مباشر على المحيط السحابي الموحد. قائمة الطلبات الحالية يتم تخزينها مؤقتاً في متصفحك بشكل آمن عبر `localStorage` للسرعة والتكامل.
                    </p>
                    <button
                      type="button"
                      onClick={handleRestoreSampleDatabase}
                      className="text-[10.5px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                    >
                      <RefreshCcw className="h-3 w-3" />
                      إعادة جدولة وتنظيف قاعدة البيانات الافتراضية
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* AI Style Improver Result Drawer/Modal Comparison */}
            <AnimatePresence>
              {showStyleCompare && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col text-right overflow-hidden"
                  >
                    
                    {/* Modal head */}
                    <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-400" />
                        <h3 className="text-lg font-bold text-white font-heading">
                          مقارنة واعتماد المحسن اللغوي للذكاء الاصطناعي
                        </h3>
                      </div>
                      <button
                        onClick={() => setShowStyleCompare(false)}
                        className="text-slate-400 hover:text-white transition p-1 bg-slate-800 rounded-full"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Comparison Area */}
                    <div className="p-6 overflow-y-auto space-y-6">
                      
                      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-xs text-amber-900 leading-relaxed font-medium">
                        ✨ لقد قامت خوارزميات الذكاء الاصطناعي بقراءة وتحديد الكلمات الدلالية لطلبك، وتنسيقه ليتطابق مع صياغة خطابات الوزارات والاتحادات والمكاتب الوطنية بصياغة رفيعة وجذابة.
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* Original Section */}
                        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                          <span className="text-xs text-slate-450 font-bold block mb-2 uppercase">صياغتكم البسيطة المكتوبة:</span>
                          <div className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                            {originalCompareText || "لا يوجد نص مبدئي."}
                          </div>
                        </div>

                        {/* Enhanced AI Section */}
                        <div className="border-2 border-amber-400 bg-amber-50/10 rounded-xl p-4 relative">
                          <div className="absolute top-3 left-3 bg-amber-400 text-slate-950 px-2 py-0.5 text-[10px] font-bold rounded">
                            المحسن اللغوي للمكتب
                          </div>
                          <span className="text-xs text-amber-800 font-bold block mb-2 uppercase">الصياغة الإدارية البليغة المقترحة:</span>
                          <div className="text-sm text-slate-850 whitespace-pre-wrap font-medium leading-relaxed max-h-[300px] overflow-y-auto">
                            {aiImprovedText || "جاري جرد المعالجات..."}
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* Modal footer */}
                    <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowStyleCompare(false)}
                        className="px-5 py-2 hover:bg-slate-150 text-slate-700 text-sm font-semibold rounded-lg border border-slate-250 transition"
                      >
                        رجوع للصياغة الأصلية
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRequestDescription(aiImprovedText);
                          setShowStyleCompare(false);
                        }}
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold rounded-lg transition shadow-md shadow-amber-300/30"
                      >
                        تطبيق واعتماد النص الإداري المحسن للمكتب 🚀
                      </button>
                    </div>

                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </div>
        )}

        {/* ========================================================
            OFFICER / ADMIN CONFINED CASE REVIEW PORTAL (Tab (لوحة الإدارة))
            ======================================================== */}
        {activeTab === "officer" && (
          <div className="space-y-8">
            
            {/* Top Interactive Analytical charts section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Box Chart 1: Recharts category distribution */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">توزيع الطلبات حسب القطاع الخدمي</span>
                  <BarChart2 className="h-4 w-4 text-blue-500" />
                </div>
                
                <div className="h-48 w-full font-sans">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryChartMetadata} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="#64748B" />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="#64748B" />
                      <Tooltip 
                        contentStyle={{ direction: "rtl", textAlign: "right", borderRadius: "8px", fontSize: "11px" }}
                        formatter={(value) => [`${value} طلب`, "الحجم"]}
                      />
                      <Bar dataKey="عدد الطلبات" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-[11px] text-slate-450 leading-normal text-center pt-1">
                  المخزون البياني الموزع لطلبات المواطنين والمؤسسات.
                </div>
              </div>

              {/* Box Chart 2: Status distribution pie */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">مؤشر سير دورة حياة الطلبات الميدانية</span>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>

                <div className="h-48 w-full flex items-center justify-center relative">
                  {statusPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {statusPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ direction: "rtl", textAlign: "right", fontSize: "11px", borderRadius: "8px" }}
                          formatter={(value) => [`${value} معاملة`, "الحجم"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-xs text-slate-400">لا يوجد بيانات لعرض الحالة الحالية</span>
                  )}
                  {/* Absolute Center Count */}
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-slate-800 font-heading">{totalCount}</span>
                    <span className="text-[9px] text-slate-400 font-bold">معاملة كلية</span>
                  </div>
                </div>

                {/* Pie legend */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] text-slate-500 pt-1">
                  {statusPieData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                      <span className="truncate">{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box Chart 3: Urgency metrics distribution */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">مقياس درجات الاستعجال الذكي (Gemini AI)</span>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>

                <div className="h-48 w-full flex items-center justify-center relative">
                  {urgencyPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={urgencyPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
                          outerRadius={70}
                          paddingAngle={0}
                          dataKey="value"
                        >
                          {urgencyPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ direction: "rtl", textAlign: "right", fontSize: "11px", borderRadius: "8px" }}
                          formatter={(value) => [`${value} معاملة`, "الحجم"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-xs text-slate-400">تحليل الأولوية قيد التوليد...</span>
                  )}
                </div>

                {/* Urgency legend */}
                <div className="flex justify-center gap-4 text-[10.5px] text-slate-500 pt-1">
                  {urgencyPieData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span>{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Officer Search, filtering and structural grid view */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              {/* List of Requests Box (Column Span 2) */}
              <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                
                {/* Search Header */}
                <div className="p-5 border-b border-slate-150 bg-slate-50/80 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 font-heading">قائمة فرز ومعاينة المعاملات الواردة</h2>
                      <p className="text-xs text-slate-500">تم الترتيب تلقائياً من الأحدث للأقدم لسهولة الاستعراض والمراقبة الفورية</p>
                    </div>
                    <button
                      onClick={handleRestoreSampleDatabase}
                      className="text-xs text-blue-600 hover:text-blue-800 font-bold border border-blue-200 bg-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-50/40 transition flex items-center gap-1.5"
                    >
                      <RefreshCcw className="h-3.5 w-3.5" />
                      إعادة جدولة البيانات الافتراضية
                    </button>
                  </div>

                  {/* Filter controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    {/* Search query input */}
                    <div className="relative col-span-1">
                      <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="ابحث بالاسم، الهوية، رقم المتابعة..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full text-xs pr-9 pl-3 py-2.5 bg-white border border-slate-205 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    {/* Sector Category filter */}
                    <div className="relative">
                      <Filter className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400" />
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full text-xs pr-9 pl-3 py-2.5 bg-white border border-slate-205 rounded-lg outline-none appearance-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-medium"
                      >
                        <option value="all">كل قطاعات الخدمات (افتراضي)</option>
                        {SERVICE_CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.titleArabic}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Status filter */}
                    <div className="relative">
                      <Settings className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-400" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full text-xs pr-9 pl-3 py-2.5 bg-white border border-slate-205 rounded-lg outline-none appearance-none focus:ring-1 focus:ring-blue-500 focus:border-blue-55 font-medium"
                      >
                        <option value="all">كل حالات سير العمل</option>
                        <option value="new">جديد (بانتظار الفرز والتحليل)</option>
                        <option value="processing">قيد الدراسة الميدانية</option>
                        <option value="accepted">مقبول ومعتمد</option>
                        <option value="rejected">مرفوض</option>
                        <option value="completed">مكتمل ومغلق</option>
                      </select>
                      <ChevronDown className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                    </div>

                  </div>
                </div>

                {/* Table list view */}
                <div className="overflow-x-auto">
                  {filteredRequests.length > 0 ? (
                    <table className="w-full text-sm text-right">
                      <thead className="text-xs text-slate-450 bg-slate-100/80 uppercase font-bold border-b border-slate-200">
                        <tr>
                          <th className="px-5 py-3 text-right">عنوان المعاملة / الكود</th>
                          <th className="px-4 py-3">اسم المستعلم</th>
                          <th className="px-4 py-3">أولوية الاستعجال (AI)</th>
                          <th className="px-4 py-3">التصنيف</th>
                          <th className="px-4 py-3">الحالة التنفيذية</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.map((req) => {
                          const isSelected = selectedRequest?.id === req.id;
                          const categoryMeta = SERVICE_CATEGORIES.find(c => c.id === req.category);
                          return (
                            <tr
                              key={req.id}
                              onClick={() => setSelectedRequest(req)}
                              className={`border-b border-slate-150 hover:bg-slate-50 cursor-pointer transition-colors ${
                                isSelected ? "bg-blue-50/70 border-r-4 border-r-blue-600 font-medium" : ""
                              }`}
                            >
                              {/* Title / Tracking */}
                              <td className="px-5 py-4">
                                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 block w-max mb-1">
                                  {req.trackingNumber}
                                </span>
                                <p className="text-slate-800 font-bold truncate max-w-[280px]">{req.title}</p>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(req.createdAt).toLocaleDateString('ar-SA')}
                                </span>
                              </td>

                              {/* Applicant */}
                              <td className="px-4 py-4">
                                <p className="text-slate-800 font-bold">{req.applicantName}</p>
                                <span className="text-[11px] text-slate-400 font-mono">{req.nationalId}</span>
                              </td>

                              {/* Urgency evaluated by AI */}
                              <td className="px-4 py-4">
                                {req.aiAnalysis ? (
                                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded ${
                                    req.aiAnalysis.urgency === "high"
                                      ? "bg-red-50 text-red-700 border border-red-200"
                                      : req.aiAnalysis.urgency === "medium"
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                      req.aiAnalysis.urgency === "high" ? "bg-red-500 animate-pulse" : req.aiAnalysis.urgency === "medium" ? "bg-amber-500" : "bg-emerald-500"
                                    }`}></span>
                                    {req.aiAnalysis.urgency === "high" ? "عاجل جداً" : req.aiAnalysis.urgency === "medium" ? "متوسط" : "عادي"}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 text-xs">قيد الفرز</span>
                                )}
                              </td>

                              {/* Category */}
                              <td className="px-4 py-4 text-xs text-slate-700 font-semibold">
                                {categoryMeta?.titleArabic || req.category}
                              </td>

                              {/* Executing Worker workflow Status */}
                              <td className="px-4 py-4">
                                <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full ${
                                  req.status === "new"
                                    ? "bg-blue-100 text-blue-850"
                                    : req.status === "processing"
                                    ? "bg-amber-100 text-amber-850"
                                    : req.status === "accepted"
                                    ? "bg-emerald-100 text-emerald-850"
                                    : req.status === "rejected"
                                    ? "bg-red-100 text-red-850"
                                    : "bg-indigo-100 text-indigo-850"
                                }`}>
                                  {req.status === "new" && "جديد فرز آلي"}
                                  {req.status === "processing" && "قيد الدراسة"}
                                  {req.status === "accepted" && "مقبول معتمد"}
                                  {req.status === "rejected" && "طلب مرفوض"}
                                  {req.status === "completed" && "مكتمل مغلق"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-12 text-center space-y-3">
                      <div className="p-3 bg-slate-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-slate-400">
                        <Search className="h-6 w-6" />
                      </div>
                      <h4 className="font-heading font-bold text-sm text-slate-800">لا يوجد معاملات مطابقة لفرز البحث</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        جرب تعديل منسق عوامل البحث أو فلاتر تصنيف القطاع الخدمي، أو اضغط على استرجاع المعاملات الافتراضية بالأعلى.
                      </p>
                    </div>
                  )}
                </div>

                {/* Grid Footer information */}
                <div className="p-4 border-t border-slate-150 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
                  <span>تم تصفية وإخراج <strong>{filteredRequests.length}</strong> من إجمالي <strong>{totalCount}</strong> معاملة للعملاء والمؤسسات.</span>
                  <span className="font-mono">المكتب الوطني - خوادم المركز الرئيسي</span>
                </div>

              </div>

              {/* Individual Master Review Split Panel (Column Span 1) */}
              <div className="space-y-6">
                
                {selectedRequest ? (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
                  >
                    {/* Header */}
                    <div className="bg-slate-900 text-white p-5">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-xs font-bold text-amber-400 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded">
                          {selectedRequest.trackingNumber}
                        </span>
                        <button
                          onClick={() => setSelectedRequest(null)}
                          className="text-slate-400 hover:text-white transition p-0.5 bg-slate-800 rounded-full"
                          title="إغلاق اللوحة"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <h3 className="text-sm font-bold font-heading line-clamp-2 text-white">{selectedRequest.title}</h3>
                      <span className="text-[10.5px] text-slate-400 block mt-1">تاريخ المعاملة: {new Date(selectedRequest.createdAt).toLocaleString('ar-SA')}</span>
                    </div>

                    {/* Split details body */}
                    <div className="p-5 overflow-y-auto max-h-[80vh] space-y-6 text-sm divide-y divide-slate-100">
                      
                      {/* Section 1: Customer Profile */}
                      <div className="space-y-3 pb-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">الملف الأمني للمستعلم</h4>
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-medium space-y-2 text-xs">
                          <p className="text-slate-800 flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-slate-600 shrink-0" /><strong>اسم مقدم المعاملة:</strong> {selectedRequest.applicantName}</p>
                          <p className="text-slate-850 flex items-center gap-1.5"><Hash className="h-3.5 w-3.5 text-slate-600 shrink-0" /><strong>رقم السجل/الهوية:</strong> <span className="font-mono">{selectedRequest.nationalId}</span></p>
                          <p className="text-slate-850 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-600 shrink-0" /><strong>البريد الإلكتروني:</strong> <span className="font-mono text-blue-600">{selectedRequest.email}</span></p>
                          <p className="text-slate-855 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-600 shrink-0" /><strong>رقم الهاتف المباشر:</strong> <span className="font-mono">{selectedRequest.phone}</span></p>
                        </div>
                      </div>

                      {/* Section 2: Request description & Attachment */}
                      <div className="space-y-3 pt-4 pb-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">تفاصيل المعاملة والمرفقات الفنية</h4>
                        <div className="bg-indigo-50/20 p-4 rounded-xl border border-indigo-100 text-slate-800 leading-relaxed text-xs font-medium space-y-3 whitespace-pre-wrap">
                          {selectedRequest.description}
                        </div>

                        {selectedRequest.fileName && (
                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4.5 w-4.5 text-blue-600 shrink-0" />
                              <span className="font-bold text-slate-850 truncate max-w-[150px]">{selectedRequest.fileName}</span>
                            </div>
                            <span className="font-mono text-[10.5px] text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">{selectedRequest.fileSize || "ملف مرفق"}</span>
                          </div>
                        )}
                      </div>

                      {/* Section 3: AI Audit Response Analysis */}
                      {selectedRequest.aiAnalysis && (
                        <div className="space-y-3 pt-4 pb-4">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="h-4.5 w-4.5 text-amber-500" />
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">مخرجات ومعاونة الذكاء الاصطناعي للمكتب</h4>
                          </div>

                          <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-4 text-xs">
                            
                            {/* Summary */}
                            <div className="space-y-1">
                              <span className="text-[10px] text-amber-400 font-bold block">إيجاز ملخص المعاملة (AI Summary):</span>
                              <p className="text-slate-200 leading-relaxed italic bg-slate-950 p-2.5 rounded border border-slate-850">
                                "{selectedRequest.aiAnalysis.summary}"
                              </p>
                            </div>

                            {/* Urgency Evaluation */}
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[10.5px]">
                                <span className="text-slate-400 font-bold">تقييم درجة الاستعجال:</span>
                                <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                                  selectedRequest.aiAnalysis.urgency === "high" 
                                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                    : selectedRequest.aiAnalysis.urgency === "medium"
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                }`}>
                                  {selectedRequest.aiAnalysis.urgency === "high" ? "عاجل وحرج" : selectedRequest.aiAnalysis.urgency === "medium" ? "متوسط" : "عادي"}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-850">
                                <strong>مبررات الأولوية:</strong> {selectedRequest.aiAnalysis.urgencyReason}
                              </p>
                            </div>

                            {/* Missing Requirements checklist */}
                            {selectedRequest.aiAnalysis.missingDetails && selectedRequest.aiAnalysis.missingDetails.length > 0 && (
                              <div className="space-y-1.5 border-t border-slate-800 pt-3">
                                <span className="text-[10px] text-amber-400 font-bold block">الأوراق الناقصة الواجب التحقق منها:</span>
                                <div className="space-y-1 bg-slate-950 p-2.5 rounded border border-slate-850">
                                  {selectedRequest.aiAnalysis.missingDetails.map((detail, index) => (
                                    <div key={index} className="flex items-center gap-1.5 text-[11px]">
                                      <input type="checkbox" className="rounded accent-amber-400" id={`chk-${index}`} />
                                      <label htmlFor={`chk-${index}`} className="text-slate-300 cursor-pointer">{detail}</label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        </div>
                      )}

                      {/* Section 4: Admin Official Actions form */}
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-1.5">
                          <Edit className="h-4 w-4 text-blue-600" />
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">القرارات الإدارية للمسؤول</h4>
                        </div>

                        {/* Status override */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-600">تحديث حالة المعاملة الرسمية:</label>
                          <select
                            value={officerStatus}
                            onChange={(e) => setOfficerStatus(e.target.value as RequestStatus)}
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-205 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 font-bold"
                          >
                            <option value="new">جديد (بانتظار التحقق)</option>
                            <option value="processing">قيد المراجعة والدراسة الفنية</option>
                            <option value="accepted">تم القبول والاعتماد الرسمي</option>
                            <option value="rejected">مرفوض (مع توفير الأسباب)</option>
                            <option value="completed">منتهي الإجراء ومغلق</option>
                          </select>
                        </div>

                        {/* Officer Internal Comments */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-600">ملاحظات وقرارات المسؤول الداخلية (غير معروضة للعامة):</label>
                          <textarea
                            rows={3}
                            placeholder="اكتب هنا ملاحظاتك الإدارية الداخلية، تكليفات مهندسي الكشف، أو أسباب الرفض لمراجعتها من الموظفين الآخرين..."
                            value={officerComments}
                            onChange={(e) => setOfficerComments(e.target.value)}
                            className="w-full text-xs p-3 bg-slate-50 border border-slate-205 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
                          />
                        </div>

                        {/* AI auto drafted Response approval/editing */}
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-600">نص الرد الرسمي النهائي (سيرسل للعميل بالبريد):</label>
                          <textarea
                            rows={5}
                            placeholder="نص الرد الرسمي الصادر عن المكتب الوطني..."
                            value={officerResponse}
                            onChange={(e) => setOfficerResponse(e.target.value)}
                            className="w-full text-xs p-3 bg-slate-50 border border-slate-205 rounded-lg outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 font-mono text-slate-800 leading-relaxed bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (selectedRequest.aiAnalysis?.suggestedResponse) {
                                setOfficerResponse(selectedRequest.aiAnalysis.suggestedResponse);
                              }
                            }}
                            className="text-[10.5px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1.5"
                          >
                            <RefreshCcw className="h-3 w-3" />
                            استرجاع مسودة الذكاء الاصطناعي الأصلية
                          </button>
                        </div>

                        {/* Save Action Buttons */}
                        <button
                          type="button"
                          onClick={handleSaveOfficerUpdate}
                          disabled={isSavingOfficerUpdates}
                          className="w-full py-3 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-lg transition-all duration-150 shadow flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isSavingOfficerUpdates ? (
                            <>
                              <RefreshCcw className="h-4 w-4 animate-spin" />
                              <span>جارٍ حفظ التحديثات وتسجيل القرارات...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 text-emerald-400" />
                              <span>حفظ واعتماد التحديثات والإرسال للعميل</span>
                            </>
                          )}
                        </button>

                      </div>

                    </div>
                  </motion.div>
                ) : (
                  <div className="bg-slate-100 rounded-2xl border-2 border-dashed border-slate-250 p-8 text-center space-y-3">
                    <div className="p-3 bg-slate-250 text-slate-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                      <Eye className="h-6 w-6" />
                    </div>
                    <h4 className="font-heading font-bold text-sm text-slate-800">بوابة المراجعة التفاعلية لمسؤولي المكتب</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      الرجاء النقر وتحديد أي معاملة من الجدول الأيمن لاستعراض تفاصيلها المعمقة، تحليل الذكاء الاصطناعي (Gemini UI)، وإطلاق قرارات التحديث الرسمية وتعديل الردود وحالة سير العمل.
                    </p>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </main>

      {/* ====================================
          FOOTER AREA
          ==================================== */}
      <footer className="bg-slate-900 text-white border-t border-slate-850 py-10 px-4 sm:px-6 lg:px-8 mt-20 relative z-15">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-right">
            <h4 className="font-heading font-bold text-sm text-amber-400 flex items-center justify-center md:justify-start gap-2">
              <Building className="h-4 w-4" />
              المكتب الوطني - البوابات الموحدة للخدمات الذكية
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
              منصة حكومية سيادية لاستقبال وتدبير معاملات الخدمات الإلكترونية للمواطنين والمؤسسات، مؤمنة بالكامل ومتكاملة مع محرك الذكاء الاصطناعي للتصنيف والفرز الاستباقي.
            </p>
          </div>
          <div className="text-center md:text-left text-xs text-slate-500 font-mono space-y-1">
            <p>© {new Date().getFullYear()} المكتب الوطني. جميع الحقوق محفوظة.</p>
            <p>تفعيل التحليل الإداري الآلي المعتمد: v3.5.0-Release</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
