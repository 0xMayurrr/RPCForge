import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Activity, Clock, Server, AlertCircle, RefreshCw, Users, Database, Zap, HardDrive, Cpu } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export default function App() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ totalRequests: 0, users: [], mostUsedMethods: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchData = async () => {
    try {
      const [logsRes, statsRes] = await Promise.all([
        axios.get('http://localhost:3000/logs'),
        axios.get('http://localhost:3000/stats')
      ]);
      setLogs(logsRes.data.reverse()); // Put newest first
      setStats(statsRes.data);
      setError(null);
      setLastRefreshed(new Date());
    } catch (err) {
      setError('Failed to fetch data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Compute time series data uniquely format
  const timeSeriesData = useMemo(() => {
    const timeMap = {};
    [...logs].reverse().forEach(log => {
      try {
        const dateObj = parseISO(log.time);
        const timeKey = format(dateObj, 'HH:mm:ss');
        timeMap[timeKey] = (timeMap[timeKey] || 0) + 1;
      } catch (e) {}
    });
    return Object.entries(timeMap).map(([time, count]) => ({
      time,
      count
    }));
  }, [logs]);

  // Chart configuration for seamless animations and premium looks
  const lineChartData = {
    labels: timeSeriesData.map(d => d.time),
    datasets: [
      {
        label: 'Requests per Second',
        data: timeSeriesData.map(d => d.count),
        borderColor: '#818cf8', // Indigo 400
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(129, 140, 248, 0.5)'); // Top glow
          gradient.addColorStop(1, 'rgba(129, 140, 248, 0.0)'); // Fades out
          return gradient;
        },
        borderWidth: 3,
        pointBackgroundColor: '#1e1b4b',
        pointBorderColor: '#818cf8',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4, // Smooth curved lines
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'easeOutQuart' },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
        ticks: { color: '#64748b', stepSize: 1, padding: 10 },
        border: { display: false }
      },
      x: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#64748b', maxTicksLimit: 8, maxRotation: 0, padding: 10 },
        border: { display: false }
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 14,
        cornerRadius: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y} Requests`
        }
      },
    },
  };

  const topMethods = stats.mostUsedMethods.slice(0, 6);

  const barChartData = {
    labels: topMethods.map(m => m.name),
    datasets: [
      {
        data: topMethods.map(m => m.count),
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
          gradient.addColorStop(0, '#3b82f6'); // Blue 500
          gradient.addColorStop(1, '#a855f7'); // Purple 500
          return gradient;
        },
        borderRadius: 6,
        barThickness: 14,
      },
    ],
  };

  const barChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800, easing: 'easeOutQuart' },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
        ticks: { color: '#64748b', stepSize: 1, padding: 10 },
        border: { display: false }
      },
      y: {
        grid: { display: false, drawBorder: false },
        ticks: { color: '#cbd5e1', font: { family: 'ui-monospace, Consolas, monospace', size: 12 }, padding: 10 },
        border: { display: false }
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f1f5f9',
        bodyColor: '#94a3b8',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 14,
        cornerRadius: 12,
        displayColors: false,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#030712] p-4 sm:p-6 lg:p-8 font-sans selection:bg-indigo-500/30 text-slate-300">
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
        
        {/* Header Ribbon */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/5 gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 ring-1 ring-indigo-500/30 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.15)] relative overflow-hidden group">
               <div className="absolute inset-0 bg-indigo-500/20 blur-xl group-hover:bg-indigo-400/30 transition-colors"></div>
               <Server className="w-7 h-7 text-indigo-400 relative z-10" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400">
                RPCForge Node
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                Production Environment <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-xs sm:text-sm text-slate-400 bg-white/[0.02] px-4 py-2 rounded-lg border border-white/5">
            {lastRefreshed && (
              <span className="flex items-center gap-2 font-medium">
                <RefreshCw className="w-4 h-4 text-slate-500 animate-[spin_4s_linear_infinite]" />
                Live Feed Active
              </span>
            )}
          </div>
        </header>

        {loading && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20"></div>
              <div className="w-12 h-12 rounded-full border-t-2 border-indigo-500 animate-spin absolute inset-0"></div>
            </div>
            <p className="text-slate-400 mt-6 font-medium animate-pulse">Initializing Dashboard...</p>
          </div>
        ) : error && logs.length === 0 ? (
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-10 text-center flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-white mb-2">Node Unreachable</h3>
            <p className="text-slate-400 max-w-sm">{error}</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* KPI Cards / Hero Stat Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {[
                { label: 'Global Traffic', value: stats.totalRequests, icon: <Activity className="w-5 h-5 text-blue-400" />, color: 'blue' },
                { label: 'Registered Keys', value: stats.users.length, icon: <Users className="w-5 h-5 text-indigo-400" />, color: 'indigo' },
                { label: 'Distinct Methods', value: stats.mostUsedMethods.length, icon: <Cpu className="w-5 h-5 text-purple-400" />, color: 'purple' },
                { label: 'Cache Hits', value: logs.filter(l => l.cached).length, icon: <Zap className="w-5 h-5 text-emerald-400" />, sub: 'recent', color: 'emerald' }
              ].map((kpi, i) => (
                <div key={i} className="group relative bg-[#0B1120] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className={`absolute inset-0 bg-gradient-to-br from-${kpi.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl`} />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400 mb-2">{kpi.label}</p>
                      <div className="flex items-baseline gap-2">
                        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{kpi.value.toLocaleString()}</h2>
                        {kpi.sub && <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">{kpi.sub}</span>}
                      </div>
                    </div>
                    <div className={`p-2.5 rounded-xl bg-${kpi.color}-500/10`}>
                      {kpi.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Core Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
              
              {/* Traffic Timeline */}
              <div className="lg:col-span-3 bg-[#0B1120] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-semibold text-white">Network Traffic</h3>
                    <p className="text-xs text-slate-500 mt-1">Real-time throughput analysis</p>
                  </div>
                </div>
                <div className="h-[280px] w-full">
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
              </div>

              {/* Method Popularity */}
              <div className="lg:col-span-2 bg-[#0B1120] border border-white/5 rounded-2xl p-6">
                <div>
                  <h3 className="text-base font-semibold text-white">Method Distribution</h3>
                  <p className="text-xs text-slate-500 mt-1">Top invoked RPC endpoints</p>
                </div>
                {stats.mostUsedMethods.length === 0 ? (
                  <div className="h-[280px] flex items-center justify-center text-sm text-slate-500">Awaiting traffic...</div>
                ) : (
                  <div className="h-[280px] w-full mt-6">
                    <Bar data={barChartData} options={barChartOptions} />
                  </div>
                )}
              </div>
            </div>

            {/* API Keys Utilization & Live Data Log */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* API Keys Monitor */}
              <div className="xl:col-span-1 space-y-4">
                <div className="bg-[#0B1120] border border-white/5 rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-2 mb-6">
                    <HardDrive className="w-5 h-5 text-slate-400" />
                    <h3 className="text-base font-semibold text-white">API Tier Usage</h3>
                  </div>
                  <div className="space-y-3">
                    {stats.users.sort((a,b) => b.requests - a.requests).map((user) => {
                      // Calculate percentage based on top user
                      const maxReq = Math.max(...stats.users.map(u => u.requests), 1);
                      const pct = Math.round((user.requests / maxReq) * 100);
                      
                      return (
                        <div key={user.apiKey} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors relative overflow-hidden group">
                          {/* Progress bar background */}
                          <div 
                            className="absolute left-0 top-0 bottom-0 bg-indigo-500/10 transition-all duration-1000 ease-out z-0" 
                            style={{ width: `${pct}%` }} 
                          />
                          <div className="relative z-10 flex justify-between items-center">
                            <span className="font-mono text-sm tracking-tight text-slate-300 font-medium">{user.apiKey}</span>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg font-bold text-white">{user.requests.toLocaleString()}</span>
                              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">req</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Seamless Live Stream Table */}
              <div className="xl:col-span-2">
                <div className="bg-[#0B1120] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                  <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </div>
                      <h3 className="text-base font-semibold text-white">Live Event Stream</h3>
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 bg-white/5 text-slate-400 rounded-md">
                      Latest {Math.min(logs.length, 50)} Logs
                    </span>
                  </div>
                  
                  <div className="overflow-x-auto max-h-[460px] overflow-y-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 bg-[#0f172a]/95 backdrop-blur-md z-10 shadow-sm">
                        <tr className="text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                          <th className="px-6 py-4 border-b border-white/5">Endpoint / Method</th>
                          <th className="px-6 py-4 border-b border-white/5">Identity</th>
                          <th className="px-6 py-4 border-b border-white/5">Resolution</th>
                          <th className="px-6 py-4 border-b border-white/5 text-right">Time executed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 relative">
                        {logs.slice(0, 50).map((log, index) => {
                          let formattedDate, timeAgo = '';
                          try {
                            const dateObj = parseISO(log.time);
                            formattedDate = format(dateObj, 'MMM dd, HH:mm:ss');
                            const diffS = Math.floor((new Date() - dateObj) / 1000);
                            timeAgo = diffS < 6 ? 'Just now' : diffS < 60 ? `${diffS}s ago` : '';
                          } catch(e) {}
                          
                          return (
                            <tr key={index} className="hover:bg-white/[0.02] transition-colors group">
                              <td className="px-6 py-3.5">
                                <span className="font-mono text-[13px] font-semibold text-slate-200">
                                  {log.method}
                                </span>
                              </td>
                              <td className="px-6 py-3.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded textxs font-mono text-slate-300 bg-white/5 border border-white/5">
                                  {log.userKey}
                                </span>
                              </td>
                              <td className="px-6 py-3.5">
                                {log.cached ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <Zap className="w-3 h-3" /> CACHED
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                    <Server className="w-3 h-3" /> FETCHED
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-3.5 text-right">
                                <div className="flex flex-col items-end justify-center">
                                  <span className="text-[13px] text-slate-300 font-medium">{formattedDate}</span>
                                  {timeAgo && <span className="text-[11px] text-indigo-400 font-medium">{timeAgo}</span>}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {logs.length === 0 && (
                          <tr>
                            <td colSpan="4" className="px-6 py-12 text-center text-slate-500 text-sm">
                              No requests captured yet. Fire some traffic!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
