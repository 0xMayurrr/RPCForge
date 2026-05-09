import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { format, parseISO, subHours } from 'date-fns';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  Layers, 
  LayoutDashboard, 
  Terminal, 
  Key, 
  Download, 
  LogOut, 
  Copy, 
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Shield,
  Activity,
  User,
  ExternalLink,
  ChevronRight,
  Search,
  Settings,
  Menu,
  X,
  AlertCircle,
  Globe,
  Bell,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://rpcforge-production.up.railway.app';

const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return { headers: { Authorization: `Bearer ${session?.access_token}` } };
};

export default function Dashboard() {
  const [tab, setTab] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ totalRequests: 0, totalErrors: 0, users: [], mostUsedMethods: [] });
  const [keys, setKeys] = useState([]);
  const [wsStatus, setWsStatus] = useState('connecting');
  const [user, setUser] = useState(null);
  const [userRecord, setUserRecord] = useState(null);
  const [copied, setCopied] = useState(false);
  const [keyLoading, setKeyLoading] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [billing, setBilling] = useState({ plan: 'free', status: 'active', current_period_end: null });
  const [billingLoading, setBillingLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chainBreakdown, setChainBreakdown] = useState([]);
  const [heatmapData, setHeatmapData] = useState(Array(24).fill(0));
  const [latencyData, setLatencyData] = useState({ eth: 0, polygon: 0, overall: 0 });
  const [expandedKey, setExpandedKey] = useState(null);
  const [keyAnalytics, setKeyAnalytics] = useState({});
  const [alertSettings, setAlertSettings] = useState({ threshold: 80, email: true, inapp: true });
  const [showAlert, setShowAlert] = useState(false);
  const [playgroundChain, setPlaygroundChain] = useState('eth');
  const [playgroundMethod, setPlaygroundMethod] = useState('eth_blockNumber');
  const [playgroundParams, setPlaygroundParams] = useState({});
  const [playgroundResponse, setPlaygroundResponse] = useState(null);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const wsRef = useRef(null);

  const navigate = useNavigate();

  // ── Auth Logic ──────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { setAuthLoading(false); navigate('/signup'); return; }
      setUser(session.user);
      supabase.from('users').select('*').eq('id', session.user.id).single()
        .then(({ data }) => { setUserRecord(data); })
        .finally(() => setAuthLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) navigate('/signup');
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Payment notifications ───────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'success') {
      showToast('Subscription activated! Welcome to the pro tier.', 'success');
      window.history.replaceState({}, '', '/dashboard');
    } else if (payment === 'cancelled') {
      showToast('Payment was cancelled.', 'error');
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Fetching Data ───────────────────────────────────────────────────────
  const fetchBilling = async () => {
    try {
      const headers = await getAuthHeaders();
      const r = await axios.get(`${BASE_URL}/billing/status`, headers);
      setBilling(r.data);
    } catch {}
  };
  
  useEffect(() => { if (tab === 'billing') fetchBilling(); }, [tab]);

  const fetchKeys = async () => {
    try { 
      const headers = await getAuthHeaders();
      const r = await axios.get(`${BASE_URL}/keys`, headers); 
      setKeys(r.data); 
    } catch {}
  };
  
  useEffect(() => { if (tab === 'keys') fetchKeys(); }, [tab]);

  const fetchStats = async () => {
    try { 
      const headers = await getAuthHeaders();
      const r = await axios.get(`${BASE_URL}/stats`, headers); 
      setStats(r.data); 
    } catch {}
  };

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 10000);
    return () => clearInterval(id);
  }, []);

  // ── NEW: Fetch chain breakdown ─────────────────────────────────────────
  const fetchChainBreakdown = async () => {
    if (!user) return;
    try {
      const last24h = subHours(new Date(), 24).toISOString();
      const { data, error } = await supabase
        .from('request_logs')
        .select('chain')
        .eq('user_id', user.id)
        .gte('created_at', last24h);
      
      if (error) throw error;
      
      const counts = {};
      data.forEach(log => {
        counts[log.chain] = (counts[log.chain] || 0) + 1;
      });
      
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      const breakdown = [
        { chain: 'ETH', count: counts.eth || 0, color: '#378ADD' },
        { chain: 'POL', count: counts.polygon || 0, color: '#8247E5' },
        { chain: 'BSC', count: counts.bsc || 0, color: '#F3BA2F' },
        { chain: 'ARB', count: counts.arbitrum || 0, color: '#28A0F0' },
        { chain: 'SEP', count: counts.sepolia || 0, color: '#6467f2' },
      ].map(c => ({ ...c, pct: total > 0 ? ((c.count / total) * 100).toFixed(1) : 0 }));
      
      setChainBreakdown(breakdown);
    } catch {}
  };

  // ── NEW: Fetch heatmap data ────────────────────────────────────────────
  const fetchHeatmap = async () => {
    if (!user) return;
    try {
      const last24h = subHours(new Date(), 24).toISOString();
      const { data, error } = await supabase
        .from('request_logs')
        .select('created_at')
        .eq('user_id', user.id)
        .gte('created_at', last24h);
      
      if (error) throw error;
      
      const hourly = Array(24).fill(0);
      data.forEach(log => {
        const hour = new Date(log.created_at).getHours();
        hourly[hour]++;
      });
      
      setHeatmapData(hourly);
    } catch {}
  };

  // ── NEW: Fetch latency data ────────────────────────────────────────────
  const fetchLatency = async () => {
    if (!user) return;
    try {
      const last24h = subHours(new Date(), 24).toISOString();
      const { data, error } = await supabase
        .from('request_logs')
        .select('chain, response_time_ms')
        .eq('user_id', user.id)
        .gte('created_at', last24h)
        .not('response_time_ms', 'is', null);
      
      if (error) throw error;
      
      const ethTimes = data.filter(d => d.chain === 'eth').map(d => d.response_time_ms);
      const polTimes = data.filter(d => d.chain === 'polygon').map(d => d.response_time_ms);
      const allTimes = data.map(d => d.response_time_ms);
      
      const avg = arr => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
      
      setLatencyData({
        eth: avg(ethTimes),
        polygon: avg(polTimes),
        overall: avg(allTimes)
      });
    } catch {}
  };

  // ── NEW: Fetch key analytics ───────────────────────────────────────────
  const fetchKeyAnalytics = async (apiKey) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('request_logs')
        .select('method, status, created_at')
        .eq('api_key', apiKey)
        .order('created_at', { ascending: false })
        .limit(500);
      
      if (error) throw error;
      
      const totalReqs = data.length;
      const errors = data.filter(d => d.status >= 400).length;
      const errorRate = totalReqs > 0 ? ((errors / totalReqs) * 100).toFixed(1) : 0;
      
      const methodCounts = {};
      data.forEach(d => {
        methodCounts[d.method] = (methodCounts[d.method] || 0) + 1;
      });
      const topMethod = Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
      
      // Last 7 days sparkline
      const last7Days = Array(7).fill(0);
      data.forEach(d => {
        const daysAgo = Math.floor((Date.now() - new Date(d.created_at).getTime()) / (1000 * 60 * 60 * 24));
        if (daysAgo < 7) last7Days[6 - daysAgo]++;
      });
      
      setKeyAnalytics(prev => ({
        ...prev,
        [apiKey]: { totalReqs, errorRate, topMethod, sparkline: last7Days }
      }));
    } catch {}
  };

  // ── NEW: Load alert settings ───────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const loadAlerts = async () => {
      const { data } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setAlertSettings({
          threshold: data.alert_threshold || 80,
          email: data.email_alerts !== false,
          inapp: data.inapp_alerts !== false
        });
      }
    };
    loadAlerts();
  }, [user]);

  // ── NEW: Save alert settings ───────────────────────────────────────────
  const saveAlertSettings = async () => {
    if (!user) return;
    try {
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          alert_threshold: alertSettings.threshold,
          email_alerts: alertSettings.email,
          inapp_alerts: alertSettings.inapp
        });
      showToast('Alert settings saved', 'success');
    } catch {
      showToast('Failed to save settings', 'error');
    }
  };

  // ── NEW: Check usage alerts ────────────────────────────────────────────
  useEffect(() => {
    if (!user || !alertSettings.inapp) return;
    const dismissed = localStorage.getItem('alert_dismissed_date');
    const today = new Date().toDateString();
    if (dismissed === today) return;
    
    // Check if usage exceeds threshold
    const dailyLimit = billing.plan === 'free' ? 100000 : billing.plan === 'dev' ? 1000000 : 10000000;
    const usagePct = (stats.totalRequests / dailyLimit) * 100;
    
    if (usagePct >= alertSettings.threshold) {
      setShowAlert(true);
    }
  }, [stats, alertSettings, user, billing]);

  // ── NEW: Playground request ────────────────────────────────────────────
  const sendPlaygroundRequest = async () => {
    if (!keys[0]) {
      showToast('No API key found', 'error');
      return;
    }
    
    setPlaygroundLoading(true);
    setPlaygroundResponse(null);
    
    try {
      const startTime = Date.now();
      const res = await fetch(`${BASE_URL}/${playgroundChain}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': keys[0].apiKey
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: playgroundMethod,
          params: buildPlaygroundParams(),
          id: 1
        })
      });
      
      const latency = Date.now() - startTime;
      const data = await res.json();
      const cacheHit = res.headers.get('x-cache-hit') === 'true';
      
      setPlaygroundResponse({ data, latency, cacheHit, status: res.status });
    } catch (err) {
      setPlaygroundResponse({ error: err.message });
    } finally {
      setPlaygroundLoading(false);
    }
  };

  const buildPlaygroundParams = () => {
    switch (playgroundMethod) {
      case 'eth_getBalance':
        return [playgroundParams.address || '0x0000000000000000000000000000000000000000', playgroundParams.blockTag || 'latest'];
      case 'eth_getBlockByNumber':
        return [playgroundParams.blockNumber || 'latest', false];
      case 'eth_call':
        return [{ to: playgroundParams.to, data: playgroundParams.data }, 'latest'];
      case 'eth_getTransactionCount':
        return [playgroundParams.address || '0x0000000000000000000000000000000000000000', 'latest'];
      default:
        return [];
    }
  };

  // ── NEW: Fetch dashboard extras on tab change ──────────────────────────
  useEffect(() => {
    if (tab === 'dashboard' && user) {
      fetchChainBreakdown();
      fetchHeatmap();
      fetchLatency();
    }
    if (tab === 'playground' && user) {
      fetchKeys();
    }
  }, [tab, user]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const startCheckout = async (plan) => {
    setBillingLoading(true);
    try {
      const headers = await getAuthHeaders();
      const r = await axios.post(`${BASE_URL}/billing/create-checkout`, { plan }, headers);
      window.location.href = r.data.url;
    } catch (e) {
      showToast(e?.response?.data?.error || 'Checkout failed', 'error');
    } finally {
      setBillingLoading(false);
    }
  };

  const openPortal = async () => {
    setBillingLoading(true);
    try {
      const headers = await getAuthHeaders();
      const r = await axios.post(`${BASE_URL}/billing/create-portal`, {}, headers);
      window.location.href = r.data.url;
    } catch (e) {
      showToast(e?.response?.data?.error || 'Portal failed', 'error');
    } finally {
      setBillingLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied to clipboard', 'success');
  };

  const createKey = async (tier) => {
    setKeyLoading(true);
    setKeyError('');
    try {
      const headers = await getAuthHeaders();
      await axios.post(`${BASE_URL}/keys`, { tier }, headers);
      await fetchKeys();
      showToast(`${tier.charAt(0).toUpperCase() + tier.slice(1)} key created successfully`, 'success');
    } catch (e) {
      setKeyError(e?.response?.data?.error || e.message || 'Failed to create key');
    } finally {
      setKeyLoading(false);
    }
  };

  const revokeKey = async (key) => {
    if (!confirm('Are you sure you want to revoke this API key? This cannot be undone.')) return;
    try {
      const headers = await getAuthHeaders();
      await axios.delete(`${BASE_URL}/keys/${key}`, headers);
      await fetchKeys();
      showToast('Key revoked successfully', 'info');
    } catch (e) {
      showToast('Failed to revoke key', 'error');
    }
  };

  const exportLogs = (formatType) => {
    let content, mime, ext;
    if (formatType === 'json') {
      content = JSON.stringify(logs, null, 2); mime = 'application/json'; ext = 'json';
    } else {
      const rows = logs.map(l => `${l.time},${l.method},${l.userKey},${l.cached},${l.error}`);
      content = ['time,method,userKey,cached,error', ...rows].join('\n');
      mime = 'text/csv'; ext = 'csv';
    }
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([content], { type: mime })),
      download: `rpcforge-logs-${new Date().toISOString().slice(0,10)}.${ext}`
    });
    a.click(); URL.revokeObjectURL(a.href);
  };

  // ── WebSocket ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    function connect() {
      if (cancelled) return;
      const wsUrl = BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onopen = () => { if (!cancelled) setWsStatus('live'); };
      ws.onclose = () => { if (!cancelled) { setWsStatus('reconnecting'); setTimeout(connect, 3000); } };
      ws.onerror = () => { if (!cancelled) ws.close(); };
      ws.onmessage = (e) => {
        if (cancelled) return;
        const data = JSON.parse(e.data);
        if (data.type === 'init') setLogs(data.logs);
        else setLogs(prev => [data, ...prev].slice(0, 500));
      };
    }
    const t = setTimeout(connect, 50);
    return () => { cancelled = true; clearTimeout(t); wsRef.current?.close(); wsRef.current = null; };
  }, [authLoading]);

  // ── Visuals ─────────────────────────────────────────────────────────────
  const timeSeriesData = useMemo(() => {
    const map = {};
    [...logs].reverse().slice(0, 100).forEach(log => {
      try { const k = format(parseISO(log.time), 'HH:mm:ss'); map[k] = (map[k] || 0) + 1; } catch {}
    });
    return Object.entries(map).map(([time, count]) => ({ time, count }));
  }, [logs]);

  const lineChartData = {
    labels: timeSeriesData.map(d => d.time),
    datasets: [{
      data: timeSeriesData.map(d => d.count),
      borderColor: '#6467f2',
      backgroundColor: (ctx) => {
        const { ctx: c, chartArea } = ctx.chart;
        if (!chartArea) return null;
        const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        g.addColorStop(0, 'rgba(100,103,242,0.2)'); g.addColorStop(1, 'rgba(100,103,242,0)');
        return g;
      },
      borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, fill: true, tension: 0.4,
    }],
  };

  const lineChartOptions = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 0 },
    scales: { 
      x: { display: false }, 
      y: { 
        display: true, 
        grid: { color: 'rgba(39, 39, 42, 0.5)', drawBorder: false },
        ticks: { color: '#71717a', font: { size: 10 } }
      } 
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#18181b', titleColor: '#fafafa', bodyColor: '#a1a1aa',
        borderColor: '#27272a', borderWidth: 1, padding: 12, displayColors: false,
        callbacks: { label: (c) => `${c.parsed.y} Requests` }
      },
    },
  };

  const cacheHitRate = logs.length > 0 ? ((logs.filter(l => l.cached).length / logs.length) * 100).toFixed(1) : 0;
  const errorRate = logs.length > 0 ? ((logs.filter(l => l.error).length / logs.length) * 100).toFixed(1) : 0;

  if (authLoading) return (
    <div className="h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
      <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-zinc-500 font-medium text-sm animate-pulse">Authenticating session...</p>
    </div>
  );

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex overflow-hidden font-sans selection:bg-primary/30">
      {/* Mobile Sidebar Overlay */}
      {!isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 h-full bg-zinc-900 border-r border-zinc-800 transition-all duration-300 flex flex-col ${
        isSidebarOpen ? 'w-56' : 'w-16'
      }`}>
        {/* Sidebar Header */}
        <div className="h-14 flex items-center px-4 gap-2 border-b border-zinc-800/50">
          <div className="flex items-center gap-2 shrink-0">
            <img src="/logo.svg" alt="RPCForge" className="h-7 w-7 shrink-0" />
            {isSidebarOpen && <span className="font-extrabold text-base tracking-tight text-zinc-100">RPC<span className="text-primary">Forge</span></span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {[
            { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Overview' },
            { id: 'logs', icon: <Terminal size={20} />, label: 'Request Logs' },
            { id: 'keys', icon: <Key size={20} />, label: 'API Keys' },
            { id: 'billing', icon: <CreditCard size={20} />, label: 'Billing' },
            { id: 'playground', icon: <Zap size={20} />, label: 'Playground' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-all group ${
                tab === item.id 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <span className={`shrink-0 ${tab === item.id ? 'text-primary' : 'group-hover:text-zinc-200'}`}>
                {item.icon}
              </span>
              {isSidebarOpen && <span className="text-xs font-bold">{item.label}</span>}
              {tab === item.id && isSidebarOpen && <ChevronRight size={12} className="ml-auto opacity-50" />}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-800/50 space-y-3">
          {isSidebarOpen && (
            <div className="bg-zinc-950/50 rounded-xl p-3 border border-zinc-800">
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Active Plan</p>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-200 capitalize">{billing.plan}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-primary/20 text-primary rounded">PRO</span>
              </div>
              <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full w-2/3" />
              </div>
            </div>
          )}
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all group"
          >
            <LogOut size={18} className="shrink-0 group-hover:rotate-12 transition-transform" />
            {isSidebarOpen && <span className="text-xs font-bold">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-zinc-950/50 backdrop-blur-md border-b border-zinc-800/50 px-6 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 md:block hidden"
            >
              <Menu size={18} />
            </button>
            <h2 className="text-base font-bold capitalize text-zinc-100">{tab.replace('-', ' ')}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
              <div className={`size-1.5 rounded-full animate-pulse ${
                wsStatus === 'live' ? 'bg-emerald-500' : 'bg-amber-500'
              }`} />
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                {wsStatus}
              </span>
            </div>

            <div className="flex items-center gap-2 pl-4 border-l border-zinc-800">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-bold text-zinc-100">{user?.email?.split('@')[0]}</p>
                <p className="text-[9px] text-zinc-500 font-medium">ID: {user?.id?.slice(0, 8)}</p>
              </div>
              <div className="size-8 bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 border border-zinc-700">
                <User size={16} />
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* ── OVERVIEW TAB ── */}
            {tab === 'dashboard' && (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Requests', val: stats.totalRequests.toLocaleString(), icon: <Activity size={18} />, color: 'text-zinc-400' },
                    { label: 'Error Rate', val: `${errorRate}%`, icon: <XCircle size={18} />, color: 'text-zinc-400' },
                    { label: 'Cache Hits', val: `${cacheHitRate}%`, icon: <Zap size={18} />, color: 'text-zinc-400' },
                    { label: 'Active Keys', val: keys.length || stats.users.length, icon: <Key size={18} />, color: 'text-zinc-400' },
                  ].map((s, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:border-zinc-700 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <span className={s.color}>{s.icon}</span>
                      </div>
                      <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1">{s.label}</p>
                      <h3 className="text-2xl font-bold text-zinc-100">{s.val}</h3>
                    </div>
                  ))}
                </div>

                {/* Charts and Lists */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-base font-bold text-zinc-100">Traffic Throughput</h3>
                        <p className="text-[11px] text-zinc-500 font-medium">Real-time request volume</p>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-lg">
                        <span className="size-1 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Live</span>
                      </div>
                    </div>
                    <div className="h-[240px] w-full">
                      <Line data={lineChartData} options={lineChartOptions} />
                    </div>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                    <h3 className="text-base font-bold text-zinc-100 mb-4">Popular Methods</h3>
                    <div className="space-y-4">
                      {stats.mostUsedMethods.slice(0, 5).map((m, i) => {
                        const total = stats.mostUsedMethods.reduce((a, b) => a + b.count, 0);
                        const pct = total > 0 ? (m.count / total * 100).toFixed(0) : 0;
                        return (
                          <div key={m.name} className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                              <span className="text-zinc-200">{m.name}</span>
                              <span className="text-zinc-500">{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                              <div 
                                className="h-full bg-primary rounded-full transition-all duration-1000" 
                                style={{ width: `${pct}%`, opacity: 1 - (i * 0.15) }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      {stats.mostUsedMethods.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center py-12">
                          <Terminal size={40} className="text-zinc-800 mb-4" />
                          <p className="text-sm text-zinc-500 font-medium">No traffic data yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Activity Mini-table */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                  <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-zinc-100">Live Traffic Feed</h3>
                    <button onClick={() => setTab('logs')} className="text-[10px] font-bold text-primary hover:text-white transition-colors uppercase tracking-widest">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-zinc-950/50 text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                        <tr>
                          <th className="px-4 py-3">Timestamp</th>
                          <th className="px-4 py-3">Method</th>
                          <th className="px-4 py-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {logs.slice(0, 5).map((l, i) => (
                          <tr key={i} className="text-[11px] hover:bg-zinc-800/30 transition-colors">
                            <td className="px-4 py-2.5 text-zinc-500 font-mono">
                              {format(parseISO(l.time), 'HH:mm:ss.SSS')}
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="px-2 py-0.5 bg-zinc-800 rounded text-zinc-300 font-mono text-[10px]">{l.method}</span>
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              {l.error ? (
                                <span className="text-red-400 font-bold text-[10px]">FAILED</span>
                              ) : (
                                <span className="text-emerald-500 font-bold text-[10px]">SUCCESS</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* FEATURE 1: Chain-wise Breakdown */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-base font-bold text-zinc-100 mb-4">Requests by Chain</h3>
                  <div className="space-y-3">
                    {chainBreakdown.map((chain, i) => (
                      <div key={chain.chain} className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="size-1.5 rounded-full" style={{ backgroundColor: chain.color }} />
                            <span className="text-xs font-bold text-zinc-300">{chain.chain}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-500 font-mono">{chain.count.toLocaleString()}</span>
                            <span className="text-[10px] text-zinc-500 font-bold">{chain.pct}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                          <div 
                            className="h-full rounded-full transition-all duration-[800ms] ease-out"
                            style={{ 
                              width: `${chain.pct}%`, 
                              backgroundColor: chain.color,
                              opacity: 0.8
                            }}
                          />
                        </div>
                      </div>
                    ))}
                    {chainBreakdown.length === 0 && (
                      <div className="py-12 text-center">
                        <Activity size={40} className="text-zinc-800 mx-auto mb-4" />
                        <p className="text-sm text-zinc-500">No chain data yet</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* FEATURE 2: Heatmap */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-base font-bold text-zinc-100 mb-4">Request Volume — Last 24 Hours</h3>
                  <div className="space-y-3">
                    <div className="heatmap-grid">
                      {heatmapData.map((count, hour) => {
                        const max = Math.max(...heatmapData);
                        let height, bg, shadow;
                        if (count === 0) {
                          height = '8px';
                          bg = 'rgb(39, 39, 42)';
                          shadow = 'none';
                        } else if (count < max * 0.3) {
                          height = '20px';
                          bg = 'rgb(88, 28, 135)';
                          shadow = 'none';
                        } else if (count < max * 0.7) {
                          height = '36px';
                          bg = 'rgb(147, 51, 234)';
                          shadow = 'none';
                        } else {
                          height = '52px';
                          bg = '#6467f2';
                          shadow = '0 0 8px rgba(100, 103, 242, 0.6)';
                        }
                        
                        return (
                          <div
                            key={hour}
                            className="relative group cursor-pointer"
                            style={{ height, backgroundColor: bg, boxShadow: shadow, borderRadius: '4px', transition: 'all 0.3s' }}
                            title={`${hour}:00 — ${count} requests`}
                          >
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-950 border border-zinc-700 rounded text-[10px] font-mono text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              {hour}:00 — {count} req
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500 px-1">
                      <span>0</span>
                      <span>6</span>
                      <span>12</span>
                      <span>18</span>
                      <span>23</span>
                    </div>
                  </div>
                </div>

                {/* FEATURE 3: Latency Tracker */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                  <h3 className="text-base font-bold text-zinc-100 mb-4">Avg Response Time</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Ethereum', value: latencyData.eth, key: 'eth' },
                      { label: 'Polygon', value: latencyData.polygon, key: 'polygon' },
                      { label: 'Overall', value: latencyData.overall, key: 'overall' }
                    ].map(metric => {
                      const getStatus = (ms) => {
                        if (ms < 50) return { color: 'text-green-400', label: 'Fast' };
                        if (ms < 150) return { color: 'text-yellow-400', label: 'Normal' };
                        return { color: 'text-red-400', label: 'Slow' };
                      };
                      const status = getStatus(metric.value);
                      
                      return (
                        <div key={metric.key} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-center">
                          <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-2">{metric.label}</p>
                          <p className={`text-2xl font-bold font-mono mb-1.5 ${status.color}`}>
                            {metric.value}<span className="text-base">ms</span>
                          </p>
                          <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold ${status.color} bg-current/10`}>
                            {status.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ── LOGS TAB ── */}
            {tab === 'logs' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div>
                    <h3 className="text-base font-bold text-zinc-100 mb-1">Network Inspector</h3>
                    <p className="text-[11px] text-zinc-500 font-medium">Global RPC traffic log</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => exportLogs('csv')} className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold rounded-lg border border-zinc-700 transition-all">
                      <Download size={14} /> CSV
                    </button>
                    <button onClick={() => exportLogs('json')} className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-bold rounded-lg border border-zinc-700 transition-all">
                      <Download size={14} /> JSON
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-zinc-900 z-10 border-b border-zinc-800 text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                      <tr>
                        <th className="px-5 py-3">Timestamp</th>
                        <th className="px-5 py-3">RPC Method</th>
                        <th className="px-5 py-3">Origin Key</th>
                        <th className="px-5 py-3">Cache</th>
                        <th className="px-5 py-3 text-right">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {logs.map((l, i) => (
                        <tr key={i} className="hover:bg-zinc-800/30 transition-colors group">
                          <td className="px-5 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Clock size={12} className="text-zinc-600" />
                              <span className="text-[11px] text-zinc-400 font-mono">
                                {format(parseISO(l.time), 'HH:mm:ss.SSS')}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-primary text-[10px] font-bold font-mono">
                              {l.method}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px]">
                              {l.userKey.slice(0, 8)}...{l.userKey.slice(-4)}
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            {l.cached ? (
                              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[9px]">
                                <Zap size={10} fill="currentColor" />
                                HIT
                              </div>
                            ) : (
                              <span className="text-zinc-600 font-bold text-[9px]">MISS</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              l.error 
                                ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            }`}>
                              {l.error ? <XCircle size={9} /> : <CheckCircle2 size={9} />}
                              {l.error ? 'ERROR' : 'OK'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {logs.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-5 py-16 text-center">
                            <Activity size={40} className="text-zinc-800 mx-auto mb-3" />
                            <p className="text-zinc-500 font-medium text-sm">No traffic detected yet</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── KEYS TAB ── */}
            {tab === 'keys' && (
              <div className="space-y-5">
                {/* FEATURE 5: Usage Alert Banner */}
                {showAlert && alertSettings.inapp && (
                  <div className="bg-amber-950/80 border border-amber-800 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell size={18} className="text-amber-200" />
                      <div>
                        <p className="text-xs font-bold text-amber-200">
                          ⚠️ You've used {((stats.totalRequests / 100000) * 100).toFixed(0)}% of your daily limit.
                        </p>
                        <p className="text-[10px] text-amber-300/80">Upgrade to avoid interruptions.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setShowAlert(false);
                        localStorage.setItem('alert_dismissed_date', new Date().toDateString());
                      }}
                      className="p-1.5 hover:bg-amber-900/50 rounded-lg transition-colors"
                    >
                      <X size={14} className="text-amber-200" />
                    </button>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-100 mb-1">API Keys</h3>
                    <p className="text-xs text-zinc-500 font-medium">Manage and monitor your gateway credentials.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => createKey('free')} 
                      disabled={keyLoading}
                      className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-bold rounded-lg border border-zinc-800 transition-all disabled:opacity-50"
                    >
                      New Free Key
                    </button>
                    <button 
                      onClick={() => createKey('pro')} 
                      disabled={keyLoading}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-[11px] font-bold rounded-lg shadow-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Plus size={14} /> New Pro Key
                    </button>
                  </div>
                </div>

                {keyError && (
                  <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 text-red-400 text-xs font-medium">
                    <AlertCircle size={16} /> {keyError}
                  </div>
                )}

                {/* FEATURE 4: Key-level Analytics */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-zinc-950/50 text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] border-b border-zinc-800">
                      <tr>
                        <th className="px-5 py-3">Identifier</th>
                        <th className="px-5 py-3">Tier</th>
                        <th className="px-5 py-3 text-center">Requests</th>
                        <th className="px-5 py-3 text-center">Error Rate</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keys.map((k) => {
                        const errPct = k.requests > 0 ? ((k.errors / k.requests) * 100).toFixed(1) : '0.0';
                        const isExpanded = expandedKey === k.apiKey;
                        const analytics = keyAnalytics[k.apiKey];
                        
                        return (
                          <React.Fragment key={k.apiKey}>
                            <tr className="hover:bg-zinc-800/30 transition-colors group border-b border-zinc-800/50">
                              <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-xs text-zinc-300">{k.apiKey}</span>
                                  <button 
                                    onClick={() => copyToClipboard(k.apiKey)}
                                    className="p-1.5 text-zinc-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                  >
                                    <Copy size={14} />
                                  </button>
                                </div>
                              </td>
                              <td className="px-8 py-6">
                                <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                  k.tier === 'pro' 
                                    ? 'bg-primary/10 text-primary border-primary/20' 
                                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                                }`}>
                                  {k.tier}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-center text-xs font-bold text-zinc-400">
                                {k.requests.toLocaleString()}
                              </td>
                              <td className="px-8 py-6 text-center">
                                <span className={`text-xs font-bold ${
                                  parseFloat(errPct) > 5 ? 'text-red-400' : 'text-emerald-500'
                                }`}>
                                  {errPct}%
                                </span>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => {
                                      if (isExpanded) {
                                        setExpandedKey(null);
                                      } else {
                                        setExpandedKey(k.apiKey);
                                        if (!analytics) fetchKeyAnalytics(k.apiKey);
                                      }
                                    }}
                                    className="px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all flex items-center gap-1"
                                  >
                                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    Analytics
                                  </button>
                                  <button 
                                    onClick={() => revokeKey(k.apiKey)}
                                    className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan="5" className="px-0 py-0">
                                  <div 
                                    className="bg-zinc-800/50 border-t border-zinc-700 p-6 transition-all duration-300"
                                    style={{ maxHeight: isExpanded ? '500px' : '0', overflow: 'hidden' }}
                                  >
                                    {analytics ? (
                                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Total Requests</p>
                                          <p className="text-2xl font-bold text-zinc-100">{analytics.totalReqs.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Error Rate</p>
                                          <p className={`text-2xl font-bold ${
                                            parseFloat(analytics.errorRate) > 5 ? 'text-red-400' : 'text-emerald-500'
                                          }`}>{analytics.errorRate}%</p>
                                        </div>
                                        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Top Method</p>
                                          <p className="text-sm font-mono font-bold text-primary">{analytics.topMethod}</p>
                                        </div>
                                        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">Last 7 Days</p>
                                          <svg width="100%" height="40" className="mt-2">
                                            <polyline
                                              points={analytics.sparkline.map((v, i) => `${(i / 6) * 100},${40 - (v / Math.max(...analytics.sparkline, 1)) * 35}`).join(' ')}
                                              fill="none"
                                              stroke="#6467f2"
                                              strokeWidth="2"
                                            />
                                          </svg>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center py-8">
                                        <div className="size-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                      {keys.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-8 py-20 text-center text-zinc-500 text-sm font-medium italic">
                            No API keys found. Create one to start using the gateway.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* FEATURE 5: Usage Alerts Settings */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Bell size={20} className="text-primary" />
                    <h3 className="text-lg font-bold text-zinc-100">Usage Alerts</h3>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-3">
                        Alert me when daily usage reaches
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={alertSettings.threshold}
                          onChange={(e) => setAlertSettings(prev => ({ ...prev, threshold: parseInt(e.target.value) || 80 }))}
                          className="w-24 px-4 py-2 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 font-mono text-center focus:outline-none focus:border-primary transition-colors"
                        />
                        <span className="text-zinc-400 text-sm">% of my limit</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
                        <span className="text-sm font-medium text-zinc-300">Email me when limit reached</span>
                        <input
                          type="checkbox"
                          checked={alertSettings.email}
                          onChange={(e) => setAlertSettings(prev => ({ ...prev, email: e.target.checked }))}
                          className="size-5 rounded bg-zinc-800 border-zinc-700 text-primary focus:ring-primary focus:ring-offset-0"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
                        <span className="text-sm font-medium text-zinc-300">Show in-app warning banner</span>
                        <input
                          type="checkbox"
                          checked={alertSettings.inapp}
                          onChange={(e) => setAlertSettings(prev => ({ ...prev, inapp: e.target.checked }))}
                          className="size-5 rounded bg-zinc-800 border-zinc-700 text-primary focus:ring-primary focus:ring-offset-0"
                        />
                      </label>
                    </div>
                    
                    <button
                      onClick={saveAlertSettings}
                      className="px-6 py-3 bg-primary hover:bg-primary/90 text-white text-sm font-bold rounded-xl transition-colors"
                    >
                      Save Alert Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── BILLING TAB ── */}
            {tab === 'billing' && (
              <div className="max-w-4xl space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-zinc-100 mb-1">Billing & Subscription</h3>
                  <p className="text-sm text-zinc-500 font-medium">Manage your subscription and view your current usage.</p>
                </div>

                {/* Current Plan Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                  
                  <div className="flex flex-col md:flex-row gap-8 justify-between relative z-10">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Subscription</p>
                      <div className="flex items-center gap-4">
                        <h4 className="text-4xl font-extrabold text-zinc-100 capitalize">{billing.plan}</h4>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold rounded-full uppercase tracking-widest">
                          {billing.status}
                        </span>
                      </div>
                      {billing.current_period_end && (
                        <p className="text-sm text-zinc-500 font-medium flex items-center gap-2">
                          <Clock size={16} /> Next renewal on {format(new Date(billing.current_period_end), 'MMMM dd, yyyy')}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-end gap-3">
                      {billing.plan !== 'free' && (
                        <button 
                          onClick={openPortal} 
                          disabled={billingLoading}
                          className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-sm font-bold rounded-xl border border-zinc-700 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          <Settings size={18} /> Manage Billing
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: 'dev', name: 'Growth', price: '$9', color: 'indigo', features: ['1M req/day', '60 req/min', 'Priority support'] },
                    { id: 'pro', name: 'Professional', price: '$29', color: 'primary', features: ['10M req/day', '200 req/min', 'Custom security'], highlighted: true },
                    { id: 'team', name: 'Team Scale', price: '$99', color: 'purple', features: ['Unlimited req', '500 req/min', 'Private cluster'] },
                  ].map((p) => {
                    const isCurrent = billing.plan === p.id;
                    return (
                      <div key={p.id} className={`bg-zinc-900 border rounded-3xl p-8 flex flex-col h-full transition-all ${
                        isCurrent ? 'border-primary/50 ring-1 ring-primary/50' : 'border-zinc-800 hover:border-zinc-700'
                      }`}>
                        <div className="mb-6">
                          <h5 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">{p.name}</h5>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-extrabold text-zinc-100">{p.price}</span>
                            <span className="text-zinc-500 text-sm font-medium">/mo</span>
                          </div>
                        </div>

                        <ul className="space-y-4 flex-1 mb-10">
                          {p.features.map(f => (
                            <li key={f} className="flex items-center gap-3 text-sm text-zinc-500 font-medium">
                              <CheckCircle2 size={16} className="text-primary" /> {f}
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => startCheckout(p.id)}
                          disabled={billingLoading || isCurrent}
                          className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all ${
                            isCurrent 
                              ? 'bg-primary/10 text-primary border border-primary/20 cursor-default' 
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700'
                          }`}
                        >
                          {isCurrent ? 'Current Plan' : `Upgrade to ${p.name}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── FEATURE 6: PLAYGROUND TAB ── */}
            {tab === 'playground' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-zinc-100 mb-1">RPC Playground</h3>
                  <p className="text-sm text-zinc-500 font-medium">Test RPC methods directly from your browser.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* LEFT: Request Builder */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
                    <h4 className="text-lg font-bold text-zinc-100">Request Builder</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Chain</label>
                      <select
                        value={playgroundChain}
                        onChange={(e) => setPlaygroundChain(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 focus:outline-none focus:border-primary transition-colors"
                      >
                        <option value="eth">Ethereum Mainnet</option>
                        <option value="polygon">Polygon</option>
                        <option value="bsc">BSC</option>
                        <option value="arbitrum">Arbitrum</option>
                        <option value="sepolia">Sepolia Testnet</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">Method</label>
                      <select
                        value={playgroundMethod}
                        onChange={(e) => {
                          setPlaygroundMethod(e.target.value);
                          setPlaygroundParams({});
                        }}
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 font-mono focus:outline-none focus:border-primary transition-colors"
                      >
                        <option value="eth_blockNumber">eth_blockNumber</option>
                        <option value="eth_getBalance">eth_getBalance</option>
                        <option value="eth_gasPrice">eth_gasPrice</option>
                        <option value="eth_getTransactionCount">eth_getTransactionCount</option>
                        <option value="net_version">net_version</option>
                        <option value="eth_chainId">eth_chainId</option>
                        <option value="eth_getBlockByNumber">eth_getBlockByNumber</option>
                        <option value="eth_call">eth_call</option>
                      </select>
                    </div>

                    {/* Dynamic params */}
                    {playgroundMethod === 'eth_getBalance' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-2">Address</label>
                          <input
                            type="text"
                            placeholder="0x..."
                            value={playgroundParams.address || ''}
                            onChange={(e) => setPlaygroundParams(prev => ({ ...prev, address: e.target.value }))}
                            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 font-mono focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-2">Block Tag</label>
                          <input
                            type="text"
                            placeholder="latest"
                            value={playgroundParams.blockTag || 'latest'}
                            onChange={(e) => setPlaygroundParams(prev => ({ ...prev, blockTag: e.target.value }))}
                            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 font-mono focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                      </>
                    )}

                    {playgroundMethod === 'eth_getTransactionCount' && (
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Address</label>
                        <input
                          type="text"
                          placeholder="0x..."
                          value={playgroundParams.address || ''}
                          onChange={(e) => setPlaygroundParams(prev => ({ ...prev, address: e.target.value }))}
                          className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 font-mono focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    )}

                    {playgroundMethod === 'eth_getBlockByNumber' && (
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">Block Number</label>
                        <input
                          type="text"
                          placeholder="latest"
                          value={playgroundParams.blockNumber || 'latest'}
                          onChange={(e) => setPlaygroundParams(prev => ({ ...prev, blockNumber: e.target.value }))}
                          className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 font-mono focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    )}

                    {playgroundMethod === 'eth_call' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-2">To Address</label>
                          <input
                            type="text"
                            placeholder="0x..."
                            value={playgroundParams.to || ''}
                            onChange={(e) => setPlaygroundParams(prev => ({ ...prev, to: e.target.value }))}
                            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 font-mono focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-2">Data</label>
                          <input
                            type="text"
                            placeholder="0x..."
                            value={playgroundParams.data || ''}
                            onChange={(e) => setPlaygroundParams(prev => ({ ...prev, data: e.target.value }))}
                            className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 font-mono focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">API Key</label>
                      <input
                        type="text"
                        value={keys[0]?.apiKey || 'No key available'}
                        disabled
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-500 font-mono"
                      />
                    </div>

                    <button
                      onClick={sendPlaygroundRequest}
                      disabled={playgroundLoading || !keys[0]}
                      className="w-full py-4 bg-primary hover:bg-primary/90 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {playgroundLoading ? (
                        <>
                          <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Zap size={18} />
                          Send Request
                        </>
                      )}
                    </button>
                  </div>

                  {/* RIGHT: Response Viewer */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-bold text-zinc-100">Response</h4>
                      {playgroundResponse && !playgroundResponse.error && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(playgroundResponse.data, null, 2));
                            showToast('Response copied', 'success');
                          }}
                          className="p-2 text-zinc-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        >
                          <Copy size={16} />
                        </button>
                      )}
                    </div>

                    {playgroundResponse && !playgroundResponse.error && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="px-3 py-1 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-mono text-zinc-300">
                          {playgroundMethod}
                        </span>
                        <span className="px-3 py-1 bg-zinc-950 border border-zinc-700 rounded-lg text-xs font-bold text-primary">
                          {playgroundResponse.latency}ms
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          playgroundResponse.cacheHit 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-zinc-950 border border-zinc-700 text-zinc-500'
                        }`}>
                          {playgroundResponse.cacheHit ? 'CACHE HIT' : 'CACHE MISS'}
                        </span>
                      </div>
                    )}

                    <div className={`bg-zinc-950 rounded-xl p-6 font-mono text-sm overflow-x-auto custom-scrollbar min-h-[400px] ${
                      playgroundResponse?.error ? 'border-2 border-red-500/50' : 'border border-zinc-800'
                    }`}>
                      {playgroundResponse ? (
                        playgroundResponse.error ? (
                          <div className="text-red-400">
                            <p className="font-bold mb-2">Error:</p>
                            <p>{playgroundResponse.error}</p>
                          </div>
                        ) : (
                          <pre className="text-zinc-300 leading-relaxed">
                            {JSON.stringify(playgroundResponse.data, null, 2)
                              .split('\n')
                              .map((line, i) => {
                                let colored = line;
                                // Keys in purple
                                colored = colored.replace(/"([^"]+)":/g, '<span style="color:#6467f2">"$1"</span>:');
                                // Strings in green
                                colored = colored.replace(/: "([^"]*)"/g, ': <span style="color:#5DCAA5">"$1"</span>');
                                // Numbers in yellow
                                colored = colored.replace(/: (\d+)/g, ': <span style="color:#FAC775">$1</span>');
                                // Booleans in red
                                colored = colored.replace(/: (true|false)/g, ': <span style="color:#F09595">$1</span>');
                                return <div key={i} dangerouslySetInnerHTML={{ __html: colored }} />;
                              })}
                          </pre>
                        )
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                          <Terminal size={48} className="mb-4" />
                          <p className="text-sm">Send a request to see the response</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── NODES TAB ── */}
            {tab === 'nodes' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-zinc-100 mb-1">Global Node Status</h3>
                  <p className="text-sm text-zinc-500 font-medium">Real-time status of our distributed RPC clusters.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { chain: 'Ethereum Mainnet', nodes: 24, load: '42%', status: 'Operational' },
                    { chain: 'Polygon PoS', nodes: 12, load: '18%', status: 'Operational' },
                    { chain: 'BSC Smart Chain', nodes: 16, load: '64%', status: 'Operational' },
                    { chain: 'Arbitrum One', nodes: 8, load: '22%', status: 'Operational' },
                    { chain: 'Sepolia Testnet', nodes: 4, load: '5%', status: 'Operational' },
                    { chain: 'Optimism', nodes: 0, load: '0%', status: 'Maintenance' },
                  ].map((c) => (
                    <div key={c.chain} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="size-10 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-center text-zinc-500">
                          <Globe size={20} />
                        </div>
                        <div className={`flex items-center gap-2 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                          c.status === 'Operational' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          <span className={`size-1.5 rounded-full ${
                            c.status === 'Operational' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                          }`} />
                          {c.status}
                        </div>
                      </div>
                      <h4 className="text-zinc-100 font-bold mb-4">{c.chain}</h4>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800/50">
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Active Nodes</p>
                          <p className="text-lg font-bold text-zinc-300">{c.nodes}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Network Load</p>
                          <p className="text-lg font-bold text-zinc-300">{c.load}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Global Toast */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 border ${
          toast.type === 'success' ? 'bg-zinc-900 border-emerald-500/50 text-emerald-400' 
          : toast.type === 'error' ? 'bg-zinc-900 border-red-500/50 text-red-400'
          : 'bg-zinc-900 border-zinc-700 text-zinc-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : toast.type === 'error' ? <XCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-bold">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
