import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Activity, Check, ArrowRight, Gauge, Lock, Terminal, Copy, CheckCircle2, Download, Code2 } from 'lucide-react';

const CLI_STEPS = [
  { type: 'cmd',    text: 'npm install -g rpcforge-cli' },
  { type: 'out',    text: '✓ Installed rpcforge-cli@1.0.2', color: '#34d399' },
  { type: 'gap' },
  { type: 'cmd',    text: 'rpcforge init' },
  { type: 'out',    text: '? Select chain › Ethereum Mainnet', color: '#71717a' },
  { type: 'out',    text: '⠋ Fetching your API keys...', color: '#52525b' },
  { type: 'out',    text: '✓ API key created: rpc_k_a1b2c3d4', color: '#34d399' },
  { type: 'out',    text: '✓ Endpoint configured', color: '#34d399' },
  { type: 'out',    text: '❯ https://rpcforge.onrender.com/eth', color: '#6467f2' },
  { type: 'gap' },
  { type: 'cmd',    text: 'rpcforge test' },
  { type: 'out',    text: '⠋ Sending test request to eth...', color: '#52525b' },
  { type: 'out',    text: '✓ Success! Latest block: 21,847,392', color: '#34d399' },
  { type: 'gap' },
  { type: 'cmd',    text: 'rpcforge stats' },
  { type: 'out',    text: '  Total Requests : 1,204', color: '#d4d4d8' },
  { type: 'out',    text: '  Total Errors   : 0', color: '#34d399' },
  { type: 'out',    text: '  Active Keys    : 3', color: '#d4d4d8' },
];

function CliTerminal() {
  const bodyRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    let cancelled = false;

    const sleep = ms => new Promise(r => setTimeout(r, ms));

    const appendLine = (html) => {
      if (cancelled) return;
      const div = document.createElement('div');
      div.innerHTML = html;
      div.style.opacity = '0';
      div.style.transform = 'translateY(4px)';
      div.style.transition = 'opacity 0.15s ease, transform 0.15s ease';
      body.insertBefore(div, cursorRef.current);
      requestAnimationFrame(() => {
        div.style.opacity = '1';
        div.style.transform = 'translateY(0)';
      });
      body.scrollTop = body.scrollHeight;
    };

    const typeCmd = async (text) => {
      if (cancelled) return;
      const div = document.createElement('div');
      div.style.display = 'flex';
      div.style.alignItems = 'center';
      div.style.gap = '8px';
      div.style.marginBottom = '2px';
      div.innerHTML = `<span style="color:#6467f2">❯</span><span style="color:#fff"></span>`;
      body.insertBefore(div, cursorRef.current);
      const span = div.querySelector('span:last-child');
      for (let i = 0; i <= text.length; i++) {
        if (cancelled) return;
        span.textContent = text.slice(0, i);
        body.scrollTop = body.scrollHeight;
        await sleep(42);
      }
      await sleep(280);
    };

    const run = async () => {
      while (!cancelled) {
        body.querySelectorAll(':not(#cursor-line)').forEach(el => el.remove());
        for (const step of CLI_STEPS) {
          if (cancelled) return;
          if (step.type === 'gap') {
            appendLine('<div style="height:10px"></div>');
            await sleep(80);
          } else if (step.type === 'cmd') {
            await typeCmd(step.text);
          } else {
            appendLine(`<div style="padding-left:16px;font-size:12px;color:${step.color};margin-bottom:2px">${step.text}</div>`);
            await sleep(55);
          }
        }
        await sleep(2800);
      }
    };

    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="bg-zinc-800/50 px-4 py-3 border-b border-zinc-700 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="size-3 rounded-full bg-red-500/80" />
          <div className="size-3 rounded-full bg-yellow-500/80" />
          <div className="size-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-zinc-500 font-mono">terminal — rpcforge</span>
        <div className="w-12" />
      </div>
      <div
        ref={bodyRef}
        className="p-5 font-mono text-sm overflow-hidden"
        style={{ height: '288px' }}
      >
        <div id="cursor-line" ref={cursorRef} className="flex items-center gap-2">
          <span style={{ color: '#6467f2' }}>❯</span>
          <span className="inline-block w-2 h-[14px] bg-zinc-500" style={{ animation: 'blink 1s step-end infinite' }} />
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [demoResponse, setDemoResponse] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const runDemo = async () => {
    setDemoLoading(true);
    setDemoResponse(null);
    try {
      const res = await fetch('https://rpcforge.onrender.com/eth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_DEMO_API_KEY || '' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 })
      });
      const data = await res.json();
      setDemoResponse(data);
    } catch (err) {
      setDemoResponse({ error: 'Could not reach server. Try again.' });
    }
    setDemoLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(`curl -X POST https://rpcforge.onrender.com/eth \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-primary/30 antialiased overflow-x-hidden">
      {/* Navbar */}
      <nav className="h-16 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50 px-6 md:px-8 flex items-center justify-between transition-all duration-300">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="RPCForge" className="h-8 w-8 logo-icon logo-glow" />
          <span className="text-lg font-bold tracking-tight text-white">RPC<span className="text-primary">Forge</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors duration-200">Pricing</a>
          <a href="https://www.npmjs.com/package/rpcforge-cli" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200 flex items-center gap-1">
            <Terminal className="size-3" />
            CLI
          </a>
        </div>
        <div className="flex gap-3">
          <Link to="/signup" className="hidden sm:block px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors duration-200">
            Sign In
          </Link>
          <Link to="/signup" className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-primary to-indigo-500 hover:from-primary/90 hover:to-indigo-500/90 text-white rounded-lg transition-all duration-200 shadow-lg shadow-primary/30">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-indigo-500/10 border border-primary/20 rounded-full mb-6 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">Self-Hosted RPC Gateway</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
              <span className="inline-block text-white">Enterprise</span>{' '}
              <span className="inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-purple-500 animate-gradient">
                  RPC Gateway
                </span>
              </span>
              <br />
              <span className="inline-block text-white">You Control</span>
            </h1>
            
            <p className="text-base md:text-lg text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Self-hosted Ethereum infrastructure with unlimited requests, real-time monitoring, and zero vendor lock-in
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/signup" className="group w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-primary to-indigo-500 hover:from-primary/90 hover:to-indigo-500/90 rounded-xl transition-all duration-200 shadow-lg shadow-primary/30 flex items-center justify-center gap-2">
                Get Started Free
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#pricing" className="group w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-xl transition-all duration-200 flex items-center justify-center gap-2">
                View Pricing
              </a>
            </div>
          </div>

          {/* Code Preview */}
          <div className="max-w-3xl mx-auto relative mt-12">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-indigo-500/20 blur-3xl -z-10" />
            
            <div className="bg-zinc-900/90 backdrop-blur-xl rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl">
              <div className="h-12 bg-zinc-800/50 border-b border-zinc-700 flex items-center justify-between px-4">
                <div className="flex gap-2">
                  <div className="size-3 rounded-full bg-red-500/80" />
                  <div className="size-3 rounded-full bg-yellow-500/80" />
                  <div className="size-3 rounded-full bg-green-500/80" />
                </div>
                <div className="text-xs text-zinc-500 font-mono">Quick Start</div>
                <div className="w-16" />
              </div>
              <div className="p-6 text-left overflow-x-auto">
                <pre className="text-sm font-mono leading-relaxed">
                  <code className="text-zinc-300">
                    <span className="text-purple-400">import</span> {'{'} ethers {'}'} <span className="text-purple-400">from</span> <span className="text-emerald-400">'ethers'</span>;{'\n\n'}
                    <span className="text-blue-400">const</span> <span className="text-white">provider</span> = <span className="text-blue-400">new</span> ethers.<span className="text-yellow-400">JsonRpcProvider</span>({'{'}{'{\n'}
                    {'  '}<span className="text-white">url</span>: <span className="text-emerald-400">'https://rpcforge.com/eth'</span>,{'\n'}
                    {'  '}<span className="text-white">headers</span>: {'{'} <span className="text-emerald-400">'x-api-key'</span>: <span className="text-emerald-400">'YOUR_KEY'</span> {'}'}{'}\n'}
                    {'}'});
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Static Glow Orbs - no animation for performance */}
        <div className="absolute top-20 left-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute bottom-20 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 md:px-8 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-xs font-semibold text-primary uppercase tracking-widest mb-4">
              How It Works
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Three Steps to Your Own RPC
            </h2>
            <p className="text-base text-zinc-400 max-w-2xl mx-auto">
              Deploy production-ready infrastructure in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="size-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Sign Up Free</h3>
              <p className="text-sm text-zinc-400">Create your account and get instant API key</p>
            </div>
            <div className="text-center">
              <div className="size-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Configure Nodes</h3>
              <p className="text-sm text-zinc-400">Add your Ethereum node URLs or use defaults</p>
            </div>
            <div className="text-center">
              <div className="size-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Start Building</h3>
              <p className="text-sm text-zinc-400">Integrate with ethers.js, viem, or any RPC client</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section className="py-20 px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-xs font-semibold text-primary uppercase tracking-widest mb-4">
              Try It Now
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Test RPCForge Live
            </h2>
            <p className="text-base text-zinc-400">
              No signup required — see it in action
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="bg-zinc-800/50 px-6 py-4 border-b border-zinc-700 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Terminal className="size-4" />
                <span className="font-mono">Live Request</span>
              </div>
              <button
                onClick={copyCode}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
              >
                {copied ? <CheckCircle2 className="size-3" /> : <Copy className="size-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="p-6">
              <pre className="text-sm font-mono text-zinc-300 mb-6 overflow-x-auto">
                <code>
{`curl -X POST https://rpcforge.onrender.com/eth \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'`}
                </code>
              </pre>

              <button
                onClick={runDemo}
                disabled={demoLoading}
                className="w-full py-3 bg-white hover:bg-zinc-100 disabled:bg-zinc-700 text-zinc-900 disabled:text-zinc-500 font-semibold rounded-xl transition-colors mb-4"
              >
                {demoLoading ? 'Sending Request...' : 'Run Demo Request'}
              </button>

              {demoResponse && (
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                  <div className="text-xs text-zinc-500 mb-2 font-mono">Response:</div>
                  <pre className="text-sm font-mono text-emerald-400 overflow-x-auto">
                    {JSON.stringify(demoResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-zinc-500 mb-4">Ready to use your own API key?</p>
            <Link to="/signup" className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
              Get Your Free API Key
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CLI Section */}
      <section className="py-20 px-6 md:px-8 bg-zinc-900/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-indigo-500/5 pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Info */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-xs font-semibold text-primary uppercase tracking-widest mb-6">
                <Terminal className="size-3" />
                Command Line Interface
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Manage Everything
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">From Your Terminal</span>
              </h2>
              <p className="text-base text-zinc-400 mb-8 leading-relaxed">
                Full-featured CLI for power users. Create keys, test endpoints, monitor stats — all without leaving your terminal.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="size-8 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="size-4 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">Instant Setup</h3>
                    <p className="text-sm text-zinc-500">One command to configure your entire RPC infrastructure</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="size-8 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Code2 className="size-4 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">Developer First</h3>
                    <p className="text-sm text-zinc-500">Built for automation, CI/CD, and scripting workflows</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="size-8 bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity className="size-4 text-zinc-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">Real-time Stats</h3>
                    <p className="text-sm text-zinc-500">Monitor requests, errors, and performance metrics</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://www.npmjs.com/package/rpcforge-cli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold rounded-xl transition-colors"
                >
                  <Download className="size-4" />
                  Install CLI
                </a>
                <a
                  href="https://github.com/0xMayurrr/RPCForge/tree/main/cli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-xl transition-colors"
                >
                  View Docs
                  <ArrowRight className="size-4" />
                </a>
              </div>
            </div>

            {/* Right: Terminal Demo */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-indigo-500/20 blur-3xl opacity-50" />
              <div className="relative">
                <CliTerminal />
              </div>

              {/* Floating command cards */}
              <div className="absolute -right-4 top-1/4 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 shadow-xl hidden xl:block">
                rpcforge test
              </div>
              <div className="absolute -left-4 bottom-1/4 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 shadow-xl hidden xl:block">
                rpcforge stats
              </div>
            </div>
          </div>

          {/* Available Commands */}
          <div className="mt-16 pt-12 border-t border-zinc-800">
            <h3 className="text-lg font-semibold text-white mb-6 text-center">Available Commands</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { cmd: 'rpcforge init', desc: 'Setup endpoint & get examples' },
                { cmd: 'rpcforge test', desc: 'Send test RPC request' },
                { cmd: 'rpcforge keys', desc: 'List all API keys' },
                { cmd: 'rpcforge keys create', desc: 'Create new API key' },
                { cmd: 'rpcforge keys revoke', desc: 'Revoke an API key' },
                { cmd: 'rpcforge stats', desc: 'View request statistics' },
              ].map((item, i) => (
                <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
                  <code className="text-sm text-primary font-mono">{item.cmd}</code>
                  <p className="text-xs text-zinc-500 mt-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 md:py-20 px-6 md:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-xs font-semibold text-primary uppercase tracking-widest mb-4">
              Features
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-base text-zinc-400 max-w-2xl mx-auto">
              Production-grade infrastructure with enterprise features
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Zap className="size-5" />, title: 'Multi-node Failover', desc: 'Automatic routing for maximum uptime' },
              { icon: <Activity className="size-5" />, title: 'Real-time Dashboard', desc: 'Monitor traffic and performance' },
              { icon: <Lock className="size-5" />, title: 'Method Blacklist', desc: 'Block dangerous RPC methods' },
              { icon: <Gauge className="size-5" />, title: 'Rate Limiting', desc: 'Control throughput per key' },
            ].map((f, i) => (
              <div key={i} className="group p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all duration-300">
                <div className="size-10 bg-zinc-800 rounded-lg flex items-center justify-center mb-4 text-zinc-300">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-white mb-1.5">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 md:py-20 px-6 md:px-8 bg-gradient-to-b from-zinc-900/50 to-transparent relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-xs font-semibold text-primary uppercase tracking-widest mb-4">
              Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple Pricing
            </h2>
            <p className="text-base text-zinc-400">Start free, scale as you grow</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Free */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex flex-col hover:border-zinc-700 transition-colors duration-200">
              <h3 className="text-lg font-bold text-white mb-1">Free</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">$0</span>
              </div>
              <ul className="flex flex-col gap-3 mb-6 flex-1">
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="size-4 text-zinc-400 flex-shrink-0" /> 100k req/day
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="size-4 text-zinc-400 flex-shrink-0" /> 20 req/min
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="size-4 text-zinc-400 flex-shrink-0" /> Community
                </li>
              </ul>
              <Link to="/signup?plan=free" className="w-full text-center py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm transition-all duration-200">
                Get Started
              </Link>
            </div>

            {/* Dev */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex flex-col hover:border-zinc-700 transition-colors duration-200">
              <h3 className="text-lg font-bold text-white mb-1">Dev</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">$9</span>
                <span className="text-base text-zinc-500">/mo</span>
              </div>
              <ul className="flex flex-col gap-3 mb-6 flex-1">
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="size-4 text-zinc-400 flex-shrink-0" /> 1M req/day
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="size-4 text-zinc-400 flex-shrink-0" /> 60 req/min
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="size-4 text-zinc-400 flex-shrink-0" /> Email support
                </li>
              </ul>
              <Link to="/signup?plan=dev" className="w-full text-center py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm transition-all duration-200">
                Choose Dev
              </Link>
            </div>

            {/* Pro - Featured */}
            <div className="bg-zinc-900/80 border border-zinc-600 p-6 rounded-2xl relative flex flex-col transition-colors duration-200">
              <div className="absolute top-0 right-6 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-primary to-indigo-500 text-xs font-bold uppercase tracking-widest text-white rounded-full shadow-lg">
                Popular
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Pro</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">$29</span>
                <span className="text-base text-zinc-500">/mo</span>
              </div>
              <ul className="flex flex-col gap-3 mb-6 flex-1">
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="size-4 text-zinc-400 flex-shrink-0" /> 10M req/day
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="size-4 text-zinc-400 flex-shrink-0" /> 200 req/min
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="size-4 text-zinc-400 flex-shrink-0" /> Priority support
                </li>
              </ul>
              <Link to="/signup?plan=pro" className="w-full text-center py-2.5 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 font-bold text-sm transition-colors duration-200">
                Choose Pro
              </Link>
            </div>

            {/* Team */}
            <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl flex flex-col hover:border-zinc-700 transition-colors duration-200">
              <h3 className="text-lg font-bold text-white mb-1">Team</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">$99</span>
                <span className="text-base text-zinc-500">/mo</span>
              </div>
              <ul className="flex flex-col gap-3 mb-6 flex-1">
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="size-4 text-zinc-400 flex-shrink-0" /> Unlimited
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="size-4 text-zinc-400 flex-shrink-0" /> 500 req/min
                </li>
                <li className="flex items-center gap-2 text-sm text-zinc-400">
                  <Check className="size-4 text-zinc-400 flex-shrink-0" /> Dedicated
                </li>
              </ul>
              <Link to="/signup?plan=team" className="w-full text-center py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm transition-all duration-200">
                Choose Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 px-6 md:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-base text-zinc-400 mb-8">
            Deploy your RPC infrastructure in minutes
          </p>
          <Link to="/signup" className="group inline-flex items-center gap-3 px-8 py-4 text-base font-semibold text-zinc-900 bg-white hover:bg-zinc-100 rounded-xl transition-colors duration-200">
            Get Started Free
            <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 md:px-8 bg-zinc-950 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="RPCForge" className="h-5 w-5" />
            <span className="font-bold text-white">RPC<span className="text-primary">Forge</span></span>
          </div>
          <div className="flex gap-6 text-sm text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
