const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { GoalNear } = goals

const config = {
  // Try the MAIN IP first on Termux. If it fails, use the DynIP.
  host: 'Blasters.aternos.me', 
  port: 15754,       
  version: "1.21.1", 
  username: 'Immortal_Bot'
}

let bot

function createBot() {
  const name = config.username + '_' + Math.floor(Math.random() * 999)
  
  // Only log start/end to keep Termux clean
  console.log(`[START] Connecting as ${name}...`)

  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: name,
    version: config.version,
    auth: 'offline',
    // LOW BATTERY MODE
    viewDistance: 'tiny',
    colorsEnabled: false,
    checkTimeoutInterval: 60000
  })

  bot.loadPlugin(pathfinder)

  bot.on('login', () => console.log(`[ONLINE] Bot is hidden and active.`))
  bot.on('spawn', () => startStealthMovement(bot))
  
  // PM2 handles the restart, so we just exit the process on error
  bot.on('end', () => process.exit(0))
  bot.on('error', () => process.exit(0))
  bot.on('kicked', () => process.exit(0))
}

function startStealthMovement(bot) {
  const moves = new Movements(bot)
  moves.canDig = false
  moves.allow1by1towers = false
  bot.pathfinder.setMovements(moves)

  // Move rarely (every 60s) to save battery
  setInterval(() => {
    if (!bot || !bot.entity) return

    // Anti-Drown
    if (bot.entity.isInWater) {
      bot.setControlState('jump', true)
      return
    } else {
      bot.setControlState('jump', false)
    }

    // Micro-movements
    if (!bot.pathfinder.isMoving()) {
      const p = bot.entity.position
      // Move 2 blocks randomly
      const goal = new GoalNear(p.x + (Math.random()*4-2), p.y, p.z + (Math.random()*4-2), 1)
      try { bot.pathfinder.setGoal(goal) } catch (e) {}
    }
  }, 60000) 
}

// --- DISCORD WEBHOOK MODULE ---
const https = require('https');

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1472177759462887590/uQhdBC-wjaicVRfCjKbdMdaoGTu0aetIIOMjM7wD1WIuUdIwhiffncuW0yOUYAvwlAus'; 

function sendDiscordLog(status, details) {
  if (!DISCORD_WEBHOOK_URL || DISCORD_WEBHOOK_URL === 'YOUR_WEBHOOK_URL_HERE') return;

  const statusMap = {
    'ONLINE': { color: 3066993, title: '🟢 Bot Online', emoji: '🤖' },
    'OFFLINE': { color: 15158332, title: '🔴 Bot Offline', emoji: '⚠️' },
    'ERROR': { color: 10038562, title: '❌ Bot Error', emoji: '❗' }
  };

  const log = statusMap[status] || statusMap['ERROR'];
  const timestamp = new Date().toISOString();

  const data = JSON.stringify({
    username: 'Immortal Guardian Logs',
    avatar_url: 'https://i.imgur.com/K6K7X6k.png',
    embeds: [{
      title: `${log.emoji} ${log.title}`,
      description: details,
      color: log.color,
      fields: [
        { name: 'Server', value: config.host, inline: true },
        { name: 'Username', value: config.username, inline: true }
      ],
      footer: { text: 'Termux 24/7 Monitoring' },
      timestamp: timestamp
    }]
  });

  const url = new URL(DISCORD_WEBHOOK_URL);
  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    }
  };

  const req = https.request(options);
  req.on('error', (e) => console.error('Webhook Error:', e));
  req.write(data);
  req.end();
}

// --- INTEGRATING WITH YOUR BOT EVENTS ---
// (Add these lines inside your createBot function where the events are handled)

bot.on('login', () => {
  console.log(`[ONLINE] Bot joined.`);
  sendDiscordLog('ONLINE', `**${config.username}** successfully joined **${config.host}**.`);
});

bot.on('error', (err) => {
  sendDiscordLog('ERROR', `A critical error occurred: \`\`\`${err.message}\`\`\``);
  process.exit(0);
});

bot.on('kicked', (reason) => {
  const reasonText = typeof reason === 'string' ? reason : JSON.stringify(reason);
  sendDiscordLog('OFFLINE', `Bot was kicked from the server.\n**Reason:** \`\`\`${reasonText}\`\`\``);
  process.exit(0);
});

bot.on('end', (reason) => {
  sendDiscordLog('OFFLINE', `Connection ended: **${reason}**. PM2 will attempt restart in 15s.`);
});
    
createBot()
