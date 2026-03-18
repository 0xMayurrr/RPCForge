import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Layers, LayoutDashboard, Terminal, Key, Download, LogOut, Copy } from 'lucide-react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const ADMIN = { headers: { 'x-admin-secret': 'admin123' } };
const BASE_URL = 'https://rpcforge-production.up.railway.app';

export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ totalRequests: 0, totalErrors: 0, users: [], mostUsedMethods: [] });
  const [keys, setKeys] = useState([]);
  const [wsStatus, setWsStatus] = useState('connecting');
  const [user, setUser] = useState(null);
  const [userRecord, setUserRecord] = useState(null);
  const [copied, setCopied] = useState(false);
  const wsRef = useRef(null);
  const navigate = useNavigate();

  // ── Auth guard ───────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate('/signup'); return; }
      setUser(session.user);
      supabase.from('users').select('*').eq('id', session.user.id).single()
        .then(({ data }) => setUserRecord(data));
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const copyKey = () => {
    navigator.clipboard.writeText(userRecord?.api_key || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── WebSocket live feed ──────────────────────────────────────────────────
  useEffect(() => {
    function connect() {
      const ws = new WebSocket('wss://rpcforge-production.up.railway.app');
      wsRef.current = ws;
      ws.onopen = () => setWsStatus('live');
      ws.onclose = () => { setWsStatus('reconnecting'); setTimeout(connect, 3000); };
      ws.onerror = () => ws.close();
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'init') setLogs(data.logs);
        else setLogs(prev => [data, ...prev].slice(0, 500));
      };
    }
    connect();
    return () => wsRef.current?.close();
  }, []);

  // ── Stats polling ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try { const r = await axios.get('https://rpcforge-production.up.railway.app/stats', ADMIN); setStats(r.data); } catch {}
    };
    fetch();
    const id = setInterval(fetch, 5000);
    return () => clearInterval(id);
  }, []);

  // ── Key manager ──────────────────────────────────────────────────────────
  const fetchKeys = async () => {
    try { const r = await axios.get('https://rpcforge-production.up.railway.app/keys', ADMIN); setKeys(r.data); } catch {}
  };
  useEffect(() => { if (tab === 'keys') fetchKeys(); }, [tab]);

  const createKey = async (tier) => {
    await axios.post('https://rpcforge-production.up.railway.app/keys', { tier }, ADMIN);
    fetchKeys();
  };
  const revokeKey = async (key) => {
    await axios.delete(`https://rpcforge-production.up.railway.app/keys/${key}`, ADMIN);
    fetchKeys();
  };

  // ── Export logs ──────────────────────────────────────────────────────────
  const exportLogs = (type) => {
    let content, mime, ext;
    if (type === 'json') {
      content = JSON.stringify(logs, null, 2); mime = 'application/json'; ext = 'json';
    } else {
      const rows = logs.map(l => `${l.time},${l.method},${l.userKey},${l.cached},${l.error}`);
      content = ['time,method,userKey,cached,error', ...rows].join('\n');
      mime = 'text/csv'; ext = 'csv';
    }
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([content], { type: mime })),
      download: `rpc-logs.${ext}`
    });
    a.click(); URL.revokeObjectURL(a.href);
  };

  // ── Chart data ───────────────────────────────────────────────────────────
  const timeSeriesData = useMemo(() => {
    const map = {};
    [...logs].reverse().forEach(log => {
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
        g.addColorStop(0, 'rgba(100,103,242,0.3)'); g.addColorStop(1, 'rgba(100,103,242,0)');
        return g;
      },
      borderWidth: 2, pointRadius: 0, pointHoverRadius: 6, fill: true, tension: 0.4,
    }],
  };

  const lineChartOptions = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 0 },
    scales: { x: { display: false }, y: { display: false, beginAtZero: true } },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17,17,30,0.9)', titleColor: '#fff', bodyColor: '#cbd5e1',
        borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 10, displayColors: false,
        callbacks: { label: (c) => `${c.parsed.y} Requests` }
      },
    },
  };

  const cacheHitRate = logs.length > 0 ? ((logs.filter(l => l.cached).length / logs.length) * 100).toFixed(1) : 0;
  const errorRate = logs.length > 0 ? ((logs.filter(l => l.error).length / logs.length) * 100).toFixed(1) : 0;

  const wsColors = { live: 'emerald', reconnecting: 'yellow', connecting: 'slate' };
  const wsColor = wsColors[wsStatus] || 'slate';

  return (
    <div className="flex h-screen overflow-hidden bg-background-dark text-slate-100 antialiased selection:bg-primary/30 font-display dark">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border-subtle bg-obsidian flex flex-col shrink-0">
        <div className="p-6 flex flex-col gap-8 h-full">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="size-8 bg-primary rounded flex items-center justify-center text-white shadow-[0_0_15px_rgba(100,103,242,0.4)]">
                <Layers className="size-5" />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-white">RPCForge</h1>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Environment</p>
              <button className="w-full flex items-center px-3 py-2 bg-primary/10 border border-primary/20 rounded text-xs font-semibold text-primary cursor-default">
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary animate-pulse"></span>
                  Production
                </span>
              </button>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-1">
            {[
              { id: 'dashboard', icon: <LayoutDashboard className="size-5" />, label: 'Dashboard' },
              { id: 'logs', icon: <Terminal className="size-5" />, label: 'Network Logs' },
              { id: 'keys', icon: <Key className="size-5" />, label: 'API Keys' },
            ].map(({ id, icon, label }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left ${tab === id ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                {icon}
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </nav>

          {/* User info + logout */}
          {userRecord && (
            <div className="flex flex-col gap-3 pt-4 border-t border-border-subtle">
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Your API Key</p>
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                  <span className="text-xs font-mono text-slate-300 truncate flex-1">{userRecord.api_key}</span>
                  <button onClick={copyKey} className="shrink-0 text-slate-400 hover:text-white transition-colors">
                    <Copy className="size-3.5" />
                  </button>
                </div>
                {copied && <p className="text-[10px] text-emerald-400 text-center">Copied!</p>}
                <span className={`text-[10px] font-bold text-center px-2 py-0.5 rounded mt-1 ${
                  userRecord.tier === 'pro' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-slate-400'
                }`}>{userRecord.tier.toUpperCase()} TIER</span>
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full">
                <LogOut className="size-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          )}        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-background-dark custom-scrollbar">
        <header className="h-16 border-b border-border-subtle bg-obsidian/50 backdrop-blur sticky top-0 z-50 px-8 flex items-center justify-between">
          <div className={`flex items-center gap-2 px-3 py-1.5 bg-${wsColor}-500/10 border border-${wsColor}-500/20 rounded-full`}>
            <span className={`size-2 bg-${wsColor}-500 rounded-full animate-pulse`}></span>
            <span className={`text-[11px] font-bold text-${wsColor}-500 uppercase tracking-tighter`}>
              {wsStatus === 'live' ? 'Live Feed Active' : wsStatus === 'reconnecting' ? 'Reconnecting...' : 'Connecting...'}
            </span>
          </div>
        </header>

        <div className="p-8 flex flex-col gap-6 max-w-[1600px] mx-auto w-full">

          {/* ── DASHBOARD TAB ── */}
          {tab === 'dashboard' && <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Requests', value: stats.totalRequests.toLocaleString(), badge: 'Live', badgeColor: 'emerald', border: 'primary' },
                { label: 'Active API Keys', value: stats.users.length, badge: 'Utilized', badgeColor: 'slate', border: 'indigo' },
                { label: 'Cache Hit Rate', value: `${cacheHitRate}%`, badge: 'Optimal', badgeColor: 'emerald', border: 'emerald' },
                { label: 'Error Rate', value: `${errorRate}%`, badge: errorRate > 5 ? 'High' : 'Low', badgeColor: errorRate > 5 ? 'red' : 'emerald', border: 'red' },
              ].map(({ label, value, badge, badgeColor, border }) => (
                <div key={label} className={`glass-panel p-5 rounded-xl border-l-2 border-l-${border}-500/50`}>
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-xs text-slate-400 font-medium">{label}</p>
                    <span className={`text-[11px] font-bold text-${badgeColor}-500 bg-${badgeColor}-500/10 px-1.5 py-0.5 rounded`}>{badge}</span>
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight text-white">{value}</h2>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-panel p-6 rounded-xl flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">Requests Over Time</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Real-time throughput analysis</p>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded bg-primary/20 text-primary border border-primary/20">WebSocket</span>
                </div>
                <div className="h-[300px] relative w-full">
                  {timeSeriesData.length > 0
                    ? <Line data={lineChartData} options={lineChartOptions} />
                    : <div className="flex h-full items-center justify-center text-slate-500 text-sm">Waiting for incoming traffic...</div>}
                </div>
              </div>

              <div className="glass-panel p-6 rounded-xl">
                <h3 className="text-sm font-bold text-white tracking-tight mb-4">Top Method Distribution</h3>
                <div className="flex flex-col gap-5">
                  {stats.mostUsedMethods.slice(0, 5).map((method, i) => {
                    const total = stats.mostUsedMethods.reduce((a, c) => a + c.count, 0);
                    const pct = total > 0 ? ((method.count / total) * 100).toFixed(1) : 0;
                    const opacities = ['', '/80', '/60', '/40', '/20'];
                    return (
                      <div key={method.name}>
                        <div className="flex justify-between text-[11px] mb-1.5">
                          <span className="text-slate-200 font-mono">{method.name}</span>
                          <span className="text-slate-400">{pct}% ({method.count})</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full bg-primary${opacities[i]} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {stats.mostUsedMethods.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No methods tracked yet.</p>}
                </div>
              </div>
            </div>
          </>}

          {/* ── LOGS TAB ── */}
          {tab === 'logs' && (
            <div className="glass-panel rounded-xl overflow-hidden">
              <div className="p-6 border-b border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold text-white">Live Network Logs</h3>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 rounded border border-primary/20">
                    <span className="size-1.5 bg-primary rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold text-primary uppercase">Live</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => exportLogs('csv')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors">
                    <Download className="size-3.5" /> CSV
                  </button>
                  <button onClick={() => exportLogs('json')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors">
                    <Download className="size-3.5" /> JSON
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto max-h-[600px] custom-scrollbar overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-obsidian/95 backdrop-blur z-10 border-b border-border-subtle">
                    <tr>
                      {['Timestamp', 'Method', 'Cache', 'Status', 'API Key'].map(h => (
                        <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {logs.slice(0, 200).map((log, i) => {
                      let ts;
                      try { ts = format(parseISO(log.time), 'yyyy-MM-dd HH:mm:ss.SSS'); } catch {}
                      return (
                        <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                          <td className="px-6 py-3 text-xs font-mono text-slate-400 whitespace-nowrap">{ts}</td>
                          <td className="px-6 py-3">
                            <span className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">{log.method}</span>
                          </td>
                          <td className="px-6 py-3">
                            {log.cached
                              ? <span className="text-emerald-400 text-[11px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">⚡ HIT</span>
                              : <span className="text-slate-400 text-[11px] font-bold bg-slate-500/10 px-2 py-0.5 rounded border border-slate-500/20">MISS</span>}
                          </td>
                          <td className="px-6 py-3">
                            {log.error
                              ? <span className="text-red-400 text-[11px] font-bold bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">ERROR</span>
                              : <span className="text-emerald-400 text-[11px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">OK</span>}
                          </td>
                          <td className="px-6 py-3 text-xs font-mono text-slate-300">{log.userKey}</td>
                        </tr>
                      );
                    })}
                    {logs.length === 0 && (
                      <tr><td colSpan="5" className="px-6 py-12 text-center text-xs text-slate-500">No logs yet. Send RPC requests to populate.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── KEYS TAB ── */}
          {tab === 'keys' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">API Key Manager</h3>
                <div className="flex gap-2">
                  <button onClick={() => createKey('free')}
                    className="px-4 py-2 text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors">
                    + Free Key
                  </button>
                  <button onClick={() => createKey('pro')}
                    className="px-4 py-2 text-xs font-semibold bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary rounded transition-colors">
                    + Pro Key
                  </button>
                </div>
              </div>

              <div className="glass-panel rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="border-b border-border-subtle">
                    <tr>
                      {['API Key', 'Tier', 'Requests', 'Errors', 'Error Rate', 'Action'].map(h => (
                        <th key={h} className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {keys.map((k) => {
                      const errPct = k.requests > 0 ? ((k.errors / k.requests) * 100).toFixed(1) : '0.0';
                      return (
                        <tr key={k.apiKey} className="hover:bg-white/[0.03] transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-slate-200">{k.apiKey}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${k.tier === 'pro' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
                              {k.tier.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-300">{k.requests}</td>
                          <td className="px-6 py-4 text-xs text-slate-300">{k.errors}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold ${parseFloat(errPct) > 5 ? 'text-red-400' : 'text-emerald-400'}`}>{errPct}%</span>
                          </td>
                          <td className="px-6 py-4">
                            <button onClick={() => revokeKey(k.apiKey)}
                              className="px-3 py-1 text-[11px] font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded transition-colors">
                              Revoke
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {keys.length === 0 && (
                      <tr><td colSpan="6" className="px-6 py-12 text-center text-xs text-slate-500">No keys found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
