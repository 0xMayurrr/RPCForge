#!/usr/bin/env node
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import axios from 'axios';

const BASE_URL = 'https://rpcforge-production.up.railway.app';
const CHAINS = ['eth', 'polygon', 'bsc', 'arbitrum', 'sepolia'];
const ADMIN_SECRET = 'admin123';
const ADMIN = { headers: { 'x-admin-secret': ADMIN_SECRET } };

const command = process.argv[2];

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

// ── INIT ─────────────────────────────────────────────────────────────────────
async function init() {
  banner();
  console.log(chalk.bold.white('🔧  Setting up your RPCForge endpoint\n'));

  const { apiKey, chain } = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiKey',
      message: 'Enter your API key (or press Enter to generate one):',
    },
    {
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
    }
  ]);

  const spinner = ora('Connecting to RPCForge...').start();

  try {
    let key = apiKey.trim();

    if (!key) {
      const { data } = await axios.post(`${BASE_URL}/keys`, { tier: 'free' }, ADMIN);
      key = data.apiKey;
      spinner.succeed(chalk.green(`New free key generated: ${chalk.bold(key)}`));
    } else {
      // validate key
      const { data } = await axios.get(`${BASE_URL}/keys`, ADMIN);
      const found = data.find(k => k.apiKey === key);
      if (!found) {
        spinner.fail(chalk.red('API key not found. Run `rpcforge keys create` to make one.'));
        process.exit(1);
      }
      spinner.succeed(chalk.green(`Key validated — Tier: ${chalk.bold(found.tier.toUpperCase())}`));
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

  } catch {
    spinner.fail(chalk.red('Could not connect to RPCForge server. Is it running?'));
    console.log(chalk.gray('  Start it with: ') + chalk.white('node server.js'));
    process.exit(1);
  }
}

// ── TEST ──────────────────────────────────────────────────────────────────────
async function test() {
  const { apiKey, chain } = await inquirer.prompt([
    {
      type: 'input',
      name: 'apiKey',
      message: 'API key to test:',
      validate: v => v.trim() ? true : 'API key is required'
    },
    {
      type: 'list',
      name: 'chain',
      message: 'Select chain:',
      choices: CHAINS
    }
  ]);

  const spinner = ora(`Sending test request to ${chain}...`).start();
  try {
    const { data } = await axios.post(`${BASE_URL}/${chain}`, {
      jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1
    }, { headers: { 'x-api-key': apiKey.trim() } });

    if (data.result) {
      const block = parseInt(data.result, 16);
      spinner.succeed(chalk.green(`Success! Latest block: ${chalk.bold(block)}`));
    } else {
      spinner.fail(chalk.red(`RPC error: ${data.error?.message || 'Unknown error'}`));
    }
  } catch (err) {
    spinner.fail(chalk.red(`Request failed: ${err.response?.data?.error || err.message}`));
  }
}

// ── KEYS ──────────────────────────────────────────────────────────────────────
async function keys() {
  const sub = process.argv[3];

  if (sub === 'create') {
    const { tier } = await inquirer.prompt([{
      type: 'list',
      name: 'tier',
      message: 'Select tier:',
      choices: ['free', 'pro']
    }]);
    const spinner = ora('Creating key...').start();
    try {
      const { data } = await axios.post(`${BASE_URL}/keys`, { tier }, ADMIN);
      spinner.succeed(chalk.green(`Key created!`));
      console.log(chalk.gray('\n  API Key: ') + chalk.yellow.bold(data.apiKey));
      console.log(chalk.gray('  Tier:    ') + chalk.white(data.tier.toUpperCase()) + '\n');
    } catch {
      spinner.fail(chalk.red('Failed to create key. Is the server running?'));
    }
    return;
  }

  if (sub === 'revoke') {
    const { apiKey } = await inquirer.prompt([{
      type: 'input',
      name: 'apiKey',
      message: 'API key to revoke:',
      validate: v => v.trim() ? true : 'Required'
    }]);
    const spinner = ora('Revoking...').start();
    try {
      await axios.delete(`${BASE_URL}/keys/${apiKey.trim()}`, ADMIN);
      spinner.succeed(chalk.green('Key revoked.'));
    } catch {
      spinner.fail(chalk.red('Key not found or server unreachable.'));
    }
    return;
  }

  // list keys
  const spinner = ora('Fetching keys...').start();
  try {
    const { data } = await axios.get(`${BASE_URL}/keys`, ADMIN);
    spinner.stop();
    if (!data.length) { console.log(chalk.gray('  No keys found.')); return; }

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
  } catch {
    spinner.fail(chalk.red('Could not fetch keys. Is the server running?'));
  }
}

// ── STATS ─────────────────────────────────────────────────────────────────────
async function stats() {
  const spinner = ora('Fetching stats...').start();
  try {
    const { data } = await axios.get(`${BASE_URL}/stats`, ADMIN);
    spinner.stop();

    console.log('\n' + chalk.bold.white('  📊 RPCForge Stats\n'));
    console.log(chalk.gray('  Total Requests : ') + chalk.white.bold(data.totalRequests));
    console.log(chalk.gray('  Total Errors   : ') + (data.totalErrors > 0 ? chalk.red.bold(data.totalErrors) : chalk.green.bold(data.totalErrors)));
    console.log(chalk.gray('  Active Keys    : ') + chalk.white.bold(data.users.length));

    if (data.mostUsedMethods.length) {
      console.log('\n' + chalk.bold.white('  Top Methods:'));
      data.mostUsedMethods.slice(0, 5).forEach((m, i) => {
        console.log(chalk.gray(`  ${i + 1}. `) + chalk.cyan(m.name.padEnd(30)) + chalk.white(m.count + ' calls'));
      });
    }
    console.log();
  } catch {
    spinner.fail(chalk.red('Could not fetch stats. Is the server running?'));
  }
}

// ── HELP ──────────────────────────────────────────────────────────────────────
function help() {
  banner();
  console.log(chalk.bold.white('  Commands:\n'));
  const cmds = [
    ['rpcforge init',          'Setup your endpoint & get usage examples'],
    ['rpcforge test',          'Send a test eth_blockNumber request'],
    ['rpcforge keys',          'List all API keys'],
    ['rpcforge keys create',   'Create a new API key'],
    ['rpcforge keys revoke',   'Revoke an API key'],
    ['rpcforge stats',         'Show request stats'],
  ];
  cmds.forEach(([cmd, desc]) => {
    console.log('  ' + chalk.hex('#6467f2').bold(cmd.padEnd(30)) + chalk.gray(desc));
  });
  console.log();
}

// ── ROUTER ────────────────────────────────────────────────────────────────────
switch (command) {
  case 'init':   init();  break;
  case 'test':   test();  break;
  case 'keys':   keys();  break;
  case 'stats':  stats(); break;
  default:       help();  break;
}
