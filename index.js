const mineflayer = require('mineflayer')
const express = require('express')

// --- 1. KEEP-ALIVE WEB SERVER (For Render/UptimeRobot) ---
const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send('I am alive! Bot is running.')
})

app.listen(port, () => {
  console.log(`Web server is listening on port ${port}`)
})

// --- 2. BOT CONFIGURATION ---
const config = {
  // Use the DynIP from your screenshots to avoid connection blocks
  host: 'bonito.aternos.host', 
  port: 15754,       
  version: "1.21.1", 
  baseUsername: 'Devansh_Pro' 
}

let bot

// --- 3. BOT FUNCTIONS ---

// Generate a random username so Aternos doesn't block "Duplicate User"
function getUsername() {
  return config.baseUsername + '_' + Math.floor(Math.random() * 1000)
}

function createBot() {
  const currentUsername = getUsername()
  console.log(`[INIT] Connecting to server as ${currentUsername}...`)

  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: currentUsername,
    version: config.version,
    // Optimization to save RAM on Render/Termux
    viewDistance: 'tiny',
    colorsEnabled: false,
    skinParts: { showJacket: false, showHat: false, showCape: false, showLeftSleeve: false, showRightSleeve: false, showLeftPants: false, showRightPants: false }
  })

  // Event: Bot succesfully joined
  bot.on('login', () => {
    console.log(`[SUCCESS] ${currentUsername} has joined the server!`)
    bot.chat('I am online and keeping the server alive.')
  })

  // Event: Anti-AFK (Look around and jump occasionally)
  bot.on('spawn', () => {
    console.log('[INFO] Bot spawned, starting Anti-AFK...')
    setInterval(() => {
      // Look in random directions
      const yaw = Math.random() * Math.PI - (0.5 * Math.PI)
      const pitch = Math.random() * Math.PI - (0.5 * Math.PI)
      bot.look(yaw, pitch)
      
      // Swing arm
      if (Math.random() > 0.5) bot.swingArm()
      
      // Jump if on ground (helps prevent idle kicks)
      if (Math.random() > 0.8 && bot.entity.onGround) {
        bot.setControlState('jump', true)
        bot.setControlState('jump', false)
      }
    }, 45000) // Run every 45 seconds
  })

  // Event: Error Handling (Don't crash, just log it)
  bot.on('error', (err) => {
    console.log(`[ERROR] ${err.message}`)
  })

  // Event: Disconnected (Auto-Reconnect)
  bot.on('end', () => {
    console.log('[WARN] Bot disconnected! Reconnecting in 30 seconds...')
    setTimeout(createBot, 30000) // Wait 30s before trying again
  })

  // Event: Kicked (Log the reason)
  bot.on('kicked', (reason) => {
    console.log(`[KICKED] Reason: ${reason}`)
  })
}

// Start the bot
createBot()
