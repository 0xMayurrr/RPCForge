#!/usr/bin/env node
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import axios from 'axios';

const BASE_URL = 'https://rpcforge.onrender.com';
const SUPABASE_URL = 'https://mbnsdxrhfvidrzqncyob.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ibnNkeHJoZnZpZHJ6cW5jeW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTU4MzgsImV4cCI6MjA4OTQ5MTgzOH0.Ry6DAqHJFAFMFBFBFBFBFBFBFBFBFBFBFBFBFBFBFBF';
const CHAINS = ['eth', 'polygon', 'bsc', 'arbitrum', 'sepolia'];

// ── Auth ──────────────────────────────────────────────────────────────────────
let _token = null;

async function getToken() {
  if (_token) return _token;

  // check env first
  if (process.env.RPCFORGE_TOKEN) {
    _token = process.env.RPCFORGE_TOKEN;
    return _token;
  }

  console.log(chalk.gray('\n  Login to your RPCForge account\n'));
  const { email, password } = await inquirer.prompt([
    { type: 'input',    name: 'email',    message: 'Email:',    validate: v => v.includes('@') || 'Enter a valid email' },
    { type: 'password', name: 'password', message: 'Password:', validate: v => v.length >= 6 || 'Min 6 characters' },
  ]);

  const spinner = ora('Signing in...').start();
  try {
    const { data } = await axios.post(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      { email, password },
      { headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' } }
    );
    _token = data.access_token;
    spinner.succeed(chalk.green('Signed in!'));
    console.log(chalk.gray(`  Tip: set RPCFORGE_TOKEN=${_token.slice(0, 20)}... to skip login next time\n`));
    return _token;
  } catch (err) {
    spinner.fail(chalk.red('Login failed: ' + (err.response?.data?.error_description || err.message)));
    process.exit(1);
  }
}

async function authHeaders() {
  const token = await getToken();
  return { headers: { Authorization: `Bearer ${token}` } };
}

// ── Banner ────────────────────────────────────────────────────────────────────
const banner = () => {
  console.log(chalk.hex('#6467f2').bold(`
  ██████╗ ██████╗  ██████╗███████╗ ██████╗ ██████╗  ██████╗ ███████╗
  ██╔══██╗██╔══██╗██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝ ██╔════╝
  ██████╔╝██████╔╝██║     █████╗  ██║   ██║██████╔╝██║  ███╗█████╗  
  ██╔══██╗██╔═══╝ ██║     ██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  
  ██║  ██║██║     ╚██████╗██║     ╚██████╔╝██║  ██║╚██████╔╝███████╗
  ╚═╝  ╚═╝╚═╝      ╚═════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝
  `));
  console.log(chalk.gray('  Your Personal Ethereum RPC Provider\n'));
};

// ── INIT ──────────────────────────────────────────────────────────────────────
async function init() {
  banner();
  console.log(chalk.bold.white('🔧  Setting up your RPCForge endpoint\n'));

  const { chain } = await inquirer.prompt([{
    type: 'list',
    name: 'chain',
    message: 'Select chain:',
    choices: [
      { name: 'Ethereum Mainnet   (eth)',      value: 'eth' },
      { name: 'Polygon Mainnet    (polygon)',   value: 'polygon' },
      { name: 'BSC Mainnet        (bsc)',       value: 'bsc' },
      { name: 'Arbitrum Mainnet   (arbitrum)',  value: 'arbitrum' },
      { name: 'Ethereum Sepolia   (sepolia)',   value: 'sepolia' },
    ]
  }]);

  const auth = await authHeaders();
  const spinner = ora('Fetching your API keys...').start();

  try {
    const { data: keys } = await axios.get(`${BASE_URL}/keys`, auth);
    spinner.stop();

    let key;
    if (keys.length === 0) {
      const creating = ora('No keys found — creating a free key...').start();
      const { data } = await axios.post(`${BASE_URL}/keys`, { tier: 'free' }, auth);
      key = data.apiKey;
      creating.succeed(chalk.green(`Free key created: ${chalk.bold(key)}`));
    } else {
      key = keys[0].apiKey;
      console.log(chalk.green(`  Using key: ${chalk.bold(key)} (${keys[0].tier.toUpperCase()})`));
    }

    const endpoint = `${BASE_URL}/${chain}`;

    console.log('\n' + chalk.bold.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.bold('  ✅ Your RPC Endpoint is ready!\n'));
    console.log(chalk.gray('  Chain:     ') + chalk.white.bold(chain.toUpperCase()));
    console.log(chalk.gray('  Endpoint:  ') + chalk.hex('#6467f2').bold(endpoint));
    console.log(chalk.gray('  API Key:   ') + chalk.yellow.bold(key));
    console.log(chalk.bold.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

    console.log(chalk.bold('  Usage examples:\n'));
    console.log(chalk.gray('  ethers.js:'));
    console.log(chalk.cyan(`    const provider = new ethers.JsonRpcProvider("${endpoint}", undefined,`));
    console.log(chalk.cyan(`      { headers: { "x-api-key": "${key}" } });\n`));
    console.log(chalk.gray('  curl:'));
    console.log(chalk.cyan(`    curl -X POST ${endpoint} \\`));
    console.log(chalk.cyan(`      -H "x-api-key: ${key}" \\`));
    console.log(chalk.cyan(`      -H "Content-Type: application/json" \\`));
    console.log(chalk.cyan(`      -d '{"jsonrpc":"2.0","method":"eth_blockNumber","id":1}'\n`));
    console.log(chalk.gray('  hardhat.config.js:'));
    console.log(chalk.cyan(`    networks: { ${chain}: { url: "${endpoint}", headers: { "x-api-key": "${key}" } } }\n`));
  } catch (err) {
    spinner.fail(chalk.red('Failed: ' + (err.response?.data?.error || err.message)));
    process.exit(1);
  }
}

// ── TEST ──────────────────────────────────────────────────────────────────────
async function test() {
  const { apiKey, chain } = await inquirer.prompt([
    { type: 'input', name: 'apiKey', message: 'API key to test:', validate: v => v.trim() ? true : 'Required' },
    { type: 'list',  name: 'chain',  message: 'Select chain:', choices: CHAINS },
  ]);

  const spinner = ora(`Sending test request to ${chain}...`).start();
  try {
    const { data } = await axios.post(
      `${BASE_URL}/${chain}`,
      { jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 },
      { headers: { 'x-api-key': apiKey.trim() } }
    );
    if (data.result) {
      spinner.succeed(chalk.green(`Success! Latest block: ${chalk.bold(parseInt(data.result, 16))}`));
    } else {
      spinner.fail(chalk.red(`RPC error: ${data.error?.message || 'Unknown'}`));
    }
  } catch (err) {
    spinner.fail(chalk.red(`Failed: ${err.response?.data?.error || err.message}`));
  }
}

// ── KEYS ──────────────────────────────────────────────────────────────────────
async function keys() {
  const sub = process.argv[3];
  const auth = await authHeaders();

  if (sub === 'create') {
    const { tier } = await inquirer.prompt([{
      type: 'list', name: 'tier', message: 'Select tier:',
      choices: ['free', 'dev', 'pro', 'team']
    }]);
    const spinner = ora('Creating key...').start();
    try {
      const { data } = await axios.post(`${BASE_URL}/keys`, { tier }, auth);
      spinner.succeed(chalk.green('Key created!'));
      console.log(chalk.gray('\n  API Key: ') + chalk.yellow.bold(data.apiKey));
      console.log(chalk.gray('  Tier:    ') + chalk.white(data.tier.toUpperCase()) + '\n');
    } catch (err) {
      spinner.fail(chalk.red('Failed: ' + (err.response?.data?.error || err.message)));
    }
    return;
  }

  if (sub === 'revoke') {
    const { apiKey } = await inquirer.prompt([{
      type: 'input', name: 'apiKey', message: 'API key to revoke:', validate: v => v.trim() ? true : 'Required'
    }]);
    const spinner = ora('Revoking...').start();
    try {
      await axios.delete(`${BASE_URL}/keys/${apiKey.trim()}`, auth);
      spinner.succeed(chalk.green('Key revoked.'));
    } catch (err) {
      spinner.fail(chalk.red('Failed: ' + (err.response?.data?.error || err.message)));
    }
    return;
  }

  // list
  const spinner = ora('Fetching keys...').start();
  try {
    const { data } = await axios.get(`${BASE_URL}/keys`, auth);
    spinner.stop();
    if (!data.length) { console.log(chalk.gray('\n  No keys found. Run `rpcforge keys create`\n')); return; }

    console.log('\n' + chalk.bold.white('  API Key                  Tier   Requests  Errors'));
    console.log(chalk.gray('  ' + '─'.repeat(52)));
    data.forEach(k => {
      const errPct = k.requests > 0 ? ((k.errors / k.requests) * 100).toFixed(1) : '0.0';
      const tierColor = k.tier === 'pro' ? chalk.hex('#6467f2') : chalk.gray;
      console.log(
        `  ${chalk.yellow(k.apiKey.padEnd(26))}${tierColor(k.tier.toUpperCase().padEnd(7))}${String(k.requests).padEnd(10)}${k.errors > 0 ? chalk.red(k.errors) : chalk.green(k.errors)}  ${chalk.gray(`(${errPct}% err)`)}`
      );
    });
    console.log();
  } catch (err) {
    spinner.fail(chalk.red('Failed: ' + (err.response?.data?.error || err.message)));
  }
}

// ── STATS ─────────────────────────────────────────────────────────────────────
async function stats() {
  const auth = await authHeaders();
  const spinner = ora('Fetching stats...').start();
  try {
    const { data } = await axios.get(`${BASE_URL}/stats`, auth);
    spinner.stop();

    console.log('\n' + chalk.bold.white('  📊 RPCForge Stats\n'));
    console.log(chalk.gray('  Total Requests : ') + chalk.white.bold(data.totalRequests));
    console.log(chalk.gray('  Total Errors   : ') + (data.totalErrors > 0 ? chalk.red.bold(data.totalErrors) : chalk.green.bold(data.totalErrors)));
    console.log(chalk.gray('  Active Keys    : ') + chalk.white.bold(data.users.length));

    if (data.mostUsedMethods?.length) {
      console.log('\n' + chalk.bold.white('  Top Methods:'));
      data.mostUsedMethods.slice(0, 5).forEach((m, i) => {
        console.log(chalk.gray(`  ${i + 1}. `) + chalk.cyan(m.name.padEnd(30)) + chalk.white(m.count + ' calls'));
      });
    }
    console.log();
  } catch (err) {
    spinner.fail(chalk.red('Failed: ' + (err.response?.data?.error || err.message)));
  }
}

// ── HELP ──────────────────────────────────────────────────────────────────────
function help() {
  banner();
  console.log(chalk.bold.white('  Commands:\n'));
  [
    ['rpcforge init',         'Setup your endpoint & get usage examples'],
    ['rpcforge test',         'Send a test eth_blockNumber request'],
    ['rpcforge keys',         'List your API keys'],
    ['rpcforge keys create',  'Create a new API key'],
    ['rpcforge keys revoke',  'Revoke an API key'],
    ['rpcforge stats',        'Show your request stats'],
  ].forEach(([cmd, desc]) => {
    console.log('  ' + chalk.hex('#6467f2').bold(cmd.padEnd(30)) + chalk.gray(desc));
  });
  console.log('\n' + chalk.gray('  Set RPCFORGE_TOKEN=<jwt> to skip login prompts\n'));
}

// ── ROUTER ────────────────────────────────────────────────────────────────────
switch (process.argv[2]) {
  case 'init':   init();  break;
  case 'test':   test();  break;
  case 'keys':   keys();  break;
  case 'stats':  stats(); break;
  default:       help();  break;
}
