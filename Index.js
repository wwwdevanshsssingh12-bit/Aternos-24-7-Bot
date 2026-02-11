const mineflayer = require('mineflayer')

// --- CONFIGURATION ---
const config = {
  host: 'Blasters.aternos.me', // <--- PUT IP HERE
  port: 15754,
  version: "1.21.1",
  baseUsername: 'Devansh_Bot'
}

let bot

// Get random username to avoid "Name Taken" kicks
function getUsername() {
  return config.baseUsername + '_' + Math.floor(Math.random() * 1000)
}

function createBot() {
  const currentUsername = getUsername()
  console.log(`[INIT] Connecting as ${currentUsername}...`)

  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: currentUsername,
    version: config.version,
    // EXTREME OPTIMIZATION (Saves RAM)
    viewDistance: 'tiny', 
    colorsEnabled: false,
    skinParts: { showJacket: false, showHat: false, showCape: false, showLeftSleeve: false, showRightSleeve: false, showLeftPants: false, showRightPants: false }
  })

  bot.on('login', () => {
    console.log(`[SUCCESS] ${currentUsername} is online!`)
    bot.chat('I am online.')
  })

  // ANTI-AFK: Random movement every 30-60 seconds
  bot.on('spawn', () => {
    setInterval(() => {
      const yaw = Math.random() * Math.PI - (0.5 * Math.PI)
      bot.look(yaw, 0)
      if (Math.random() > 0.5) bot.swingArm()
      if (Math.random() > 0.8 && bot.entity.onGround) bot.setControlState('jump', true)
      bot.setControlState('jump', false)
    }, 45000) 
  })

  // AUTO-RECONNECT
  bot.on('end', () => {
    console.log('[DISCONNECTED] Reconnecting in 15s...')
    setTimeout(createBot, 15000)
  })

  bot.on('error', (err) => console.log(`[ERROR] ${err.message}`))
  bot.on('kicked', console.log)
}

createBot()
    
