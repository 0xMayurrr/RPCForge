import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Terminal, Zap, Shield, Activity, Check } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background-dark text-slate-100 font-display selection:bg-primary/30 antialiased flex flex-col">
      {/* Navbar */}
      <nav className="h-16 border-b border-border-subtle bg-obsidian/50 backdrop-blur sticky top-0 z-50 px-8 flex items-center justify-between">
        <div className="flex items-center gap-3 w-48">
          <div className="size-8 bg-primary rounded flex items-center justify-center text-white shadow-[0_0_15px_rgba(100,103,242,0.4)]">
            <Layers className="size-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">RPCForge</span>
        </div>
        <div className="hidden md:flex items-center justify-center gap-8 text-sm font-medium text-slate-400 flex-1">
          <a href="#docs" className="hover:text-white transition-colors">Docs</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <Link to="/signup" className="hover:text-white transition-colors">Login</Link>
        </div>
        <div className="w-48 flex justify-end">
          <Link to="/signup" className="px-4 py-2 text-sm font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded transition-colors block text-center shadow-[0_0_15px_rgba(100,103,242,0.1)]">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-24 px-8 max-w-[1200px] mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full w-fit">
              <span className="size-2 bg-primary rounded-full animate-pulse" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-widest">RPCForge is Live</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1]">
              Your Personal <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">Ethereum RPC Provider</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-[480px]">
              High-performance, ultra-reliable Ethereum infrastructure for builders. Spin up your endpoint in seconds, monitor traffic in real-time, and scale easily.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <Link to="/signup" className="px-6 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-[0_0_20px_rgba(100,103,242,0.4)] transition-all">
                Get Free API Key
              </Link>
              <a href="#docs" className="px-6 py-3 text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors">
                View Docs
              </a>
            </div>
          </div>
          <div className="flex-1 w-full max-w-[500px]">
            <div className="bg-obsidian rounded-xl border border-border-subtle overflow-hidden shadow-2xl">
              <div className="h-10 bg-white/[0.02] border-b border-border-subtle flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="size-2.5 rounded-full bg-slate-700" />
                  <div className="size-2.5 rounded-full bg-slate-700" />
                  <div className="size-2.5 rounded-full bg-slate-700" />
                </div>
                <div className="ml-4 text-[11px] text-slate-500 font-mono">ethers.js snippet</div>
              </div>
              <div className="p-6 overflow-x-auto text-sm font-mono leading-relaxed">
                <pre>
                  <code className="text-slate-300">
                    <span className="text-primary">const</span> {'{'} ethers {'}'} = <span className="text-emerald-400">require</span>(<span className="text-yellow-300">'ethers'</span>);{'\n\n'}
                    <span className="text-slate-500">// Connect to your RPCForge endpoint</span>{'\n'}
                    <span className="text-primary">const</span> provider = <span className="text-primary">new</span> ethers.providers.JsonRpcProvider({'\n'}
                    {'  '}<span className="text-yellow-300">'https://eth-mainnet.rpcforge.com/v1/YOUR_KEY'</span>{'\n'}
                    );{'\n\n'}
                    <span className="text-primary">const</span> blockNumber = <span className="text-primary">await</span> provider.getBlockNumber();{'\n'}
                    console.log(<span className="text-yellow-300">`Latest block: `</span>, blockNumber);
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-obsidian border-y border-border-subtle">
          <div className="max-w-[1200px] mx-auto px-8">
            <div className="text-center max-w-[600px] mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Enterprise-grade Infrastructure</h2>
              <p className="text-slate-400">Everything you need to power your dApps, from robust failovers to granular controls.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <Zap className="size-6" />, title: 'Multi-node Failover', desc: 'Automatic routing to healthy nodes ensures maximum uptime.' },
                { icon: <Activity className="size-6" />, title: 'Live Dashboard', desc: 'Monitor your traffic and error rates in real-time with zero latency.' },
                { icon: <Shield className="size-6" />, title: 'Method Blacklist', desc: 'Protect your API key by blocking expensive or dangerous RPC methods.' },
                { icon: <Terminal className="size-6" />, title: 'Per-key Limits', desc: 'Granular control over request throughput on a per-key basis.' },
              ].map((f, i) => (
                <div key={i} className="p-6 bg-background-dark border border-border-subtle rounded-xl hover:bg-white/[0.02] transition-colors">
                  <div className="size-12 bg-primary/10 text-primary border border-primary/20 rounded-lg flex items-center justify-center mb-6">
                    {f.icon}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 max-w-[1200px] mx-auto px-8">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1">
              <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Start building in 3 steps</h2>
              <p className="text-slate-400 mb-10">From zero to functional endpoint in less than a minute.</p>
              <div className="flex flex-col gap-8">
                {[
                  { title: "Sign up", desc: "Create an account for entirely free to get access to the developer dashboard." },
                  { title: "Get your endpoint", desc: "Generate a highly-available API key with custom security configurations." },
                  { title: "Plug into your app", desc: "Drop the RPC URL into your web3 library and watch the requests flow." },
                ].map((s, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="size-8 shrink-0 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm border border-primary/20">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">{s.title}</h4>
                      <p className="text-sm text-slate-400">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full flex justify-center">
              <div className="relative size-64 md:size-96 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-primary/20 animate-[spin_10s_linear_infinite]" />
                <div className="size-32 bg-primary/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-primary/30 shadow-[0_0_50px_rgba(100,103,242,0.3)] z-10">
                  <Layers className="size-12 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24 bg-obsidian border-y border-border-subtle">
          <div className="max-w-[1000px] mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Simple, transparent pricing</h2>
              <p className="text-slate-400">Start for free, scale when you need to.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[800px] mx-auto">
              <div className="bg-background-dark border border-border-subtle p-8 rounded-2xl flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2">Free</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">$0</span>
                  <span className="text-sm text-slate-500">/ forever</span>
                </div>
                <ul className="flex flex-col gap-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="size-4 text-emerald-400" /> 20 requests / min
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="size-4 text-emerald-400" /> Commmunity Support
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="size-4 text-emerald-400" /> 1 API Key
                  </li>
                </ul>
                <Link to="/signup?plan=free" className="block w-full text-center py-2.5 rounded bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-colors border border-white/10 mt-auto">
                  Get Started
                </Link>
              </div>

              <div className="bg-obsidian border-2 border-primary p-8 rounded-2xl relative shadow-[0_0_30px_rgba(100,103,242,0.2)] flex flex-col">
                <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-primary text-[10px] font-bold uppercase tracking-widest text-white rounded-full">Popular</div>
                <h3 className="text-lg font-bold text-white mb-2">Pro</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">$29</span>
                  <span className="text-sm text-slate-500">/ month</span>
                </div>
                <ul className="flex flex-col gap-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="size-4 text-emerald-400" /> 100 requests / min
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="size-4 text-emerald-400" /> Priority Support
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="size-4 text-emerald-400" /> Unlimited API Keys
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="size-4 text-emerald-400" /> Dedicated Failover Nodes
                  </li>
                </ul>
                <Link to="/signup?plan=pro" className="block w-full text-center py-2.5 rounded bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-colors shadow-[0_0_15px_rgba(100,103,242,0.4)] mt-auto">
                  Upgrade to Pro
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-8 bg-background-dark text-center flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="size-4 text-primary" />
          <span className="font-bold tracking-tight text-white">RPCForge</span>
        </div>
        <p className="text-sm text-slate-500 mb-6 font-medium">Your Personal Ethereum RPC Provider.</p>
        <div className="flex gap-6 text-sm text-slate-400 font-medium">
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
        </div>
      </footer>
    </div>
  );
}
