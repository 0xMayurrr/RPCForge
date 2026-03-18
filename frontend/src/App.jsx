import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts';
import { Activity, Clock, Server, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchLogs = async () => {
    try {
      const response = await axios.get('http://localhost:3000/logs');
      // The endpoint returns an array like [{ method: 'eth_blockNumber', time: '2026-03-18T10:00:00Z' }]
      setLogs(response.data.reverse()); // Put newest first
      setError(null);
      setLastRefreshed(new Date());
    } catch (err) {
      setError('Failed to fetch logs. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const intervalId = setInterval(fetchLogs, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Compute stats
  const totalRequests = logs.length;

  const methodCounts = useMemo(() => {
    const counts = {};
    logs.forEach(log => {
      counts[log.method] = (counts[log.method] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [logs]);

  const uniqueMethods = methodCounts.length;

  // Compute time series data (grouping by minute or hour, let's group by Hour for simplicity or Day)
  const timeSeriesData = useMemo(() => {
    const timeMap = {};
    [...logs].reverse().forEach(log => {
      try {
        const dateObj = parseISO(log.time);
        // Format to display like "HH:mm"
        const timeKey = format(dateObj, 'HH:mm');
        timeMap[timeKey] = (timeMap[timeKey] || 0) + 1;
      } catch (e) {
        // Handle invalid dates
      }
    });
    return Object.entries(timeMap).map(([timeKey, count]) => ({
      time: timeKey,
      requests: count
    }));
  }, [logs]);

  return (
    <div className="min-h-screen p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between pb-4 border-b border-dark-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <Server className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Mini RPC Provider</h1>
              <p className="text-sm text-slate-400">Node infrastructure dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            {lastRefreshed && (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                Last updated: {format(lastRefreshed, 'HH:mm:ss')}
              </span>
            )}
          </div>
        </header>

        {loading && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-500 mb-4" />
            <p className="text-slate-400">Connecting to node...</p>
          </div>
        ) : error && logs.length === 0 ? (
          <div className="glass-panel p-8 text-center flex flex-col items-center border-red-500/20">
            <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
            <h3 className="text-lg font-medium text-white mb-2">Connection Error</h3>
            <p className="text-slate-400">{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="glass-panel p-12 text-center flex flex-col items-center">
            <Activity className="w-12 h-12 text-slate-500 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Requests Yet</h3>
            <p className="text-slate-400">Send an RPC request to your node to see it here.</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-panel p-5 flex items-center space-x-4">
                <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">Total Requests</p>
                  <p className="text-3xl font-bold text-white">{totalRequests}</p>
                </div>
              </div>
              <div className="glass-panel p-5 flex items-center space-x-4">
                <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">Unique Methods</p>
                  <p className="text-3xl font-bold text-white">{uniqueMethods}</p>
                </div>
              </div>
              <div className="glass-panel p-5 flex items-center space-x-4">
                <div className="p-3 bg-green-500/20 rounded-lg text-green-400">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-lg font-bold text-white">Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Line Chart */}
              <div className="glass-panel p-5">
                <h3 className="text-lg font-medium text-white mb-4">Requests Over Time</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="time" stroke="#94a3b8" tick={{fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#3b82f6' }}
                      />
                      <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{r: 8}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="glass-panel p-5">
                <h3 className="text-lg font-medium text-white mb-4">Methods Breakdown</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={methodCounts} layout="vertical" margin={{ left: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                      <XAxis type="number" stroke="#94a3b8" tick={{fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8', fontSize: 12}} tickLine={false} axisLine={false} width={100} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                        cursor={{fill: '#334155', opacity: 0.4}}
                      />
                      <Bar dataKey="count" fill="#60a5fa" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Recent Requests Table */}
            <div className="glass-panel overflow-hidden">
              <div className="px-5 py-4 border-b border-dark-700/50 flex justify-between items-center bg-dark-800/50">
                <h3 className="text-lg font-medium text-white">Recent Requests</h3>
                <span className="text-xs font-medium px-2 py-1 bg-dark-700 text-slate-300 rounded-md">
                  Showing latest {Math.min(logs.length, 50)}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-dark-900/50 text-slate-400 text-sm uppercase tracking-wider">
                      <th className="px-5 py-3 font-medium">Method</th>
                      <th className="px-5 py-3 font-medium text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700/50">
                    {logs.slice(0, 50).map((log, index) => {
                      let formattedDate = log.time;
                      try {
                        formattedDate = format(parseISO(log.time), 'MMM dd, yyyy HH:mm:ss');
                      } catch(e) {}
                      
                      return (
                        <tr key={index} className="hover:bg-dark-700/30 transition-colors">
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20">
                              {log.method}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right text-sm text-slate-400 whitespace-nowrap">
                            {formattedDate}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
