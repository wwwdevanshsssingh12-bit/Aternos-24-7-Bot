const mineflayer = require('mineflayer')
const express = require('express')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { GoalNear } = goals

// --- 1. KEEP-ALIVE WEB SERVER ---
const app = express()
const port = process.env.PORT || 3000
app.get('/', (req, res) => res.send('Bot is running!'))
app.listen(port, () => console.log(`Web server running on port ${port}`))

// --- 2. BOT SETTINGS ---
const config = {
  // ⚠️ IMPORTANT: Use the DynIP (e.g., lion.aternos.host) from the Connect page!
  host: 'hammerjaw.aternos.host', 
  port: 15754,
  version: "1.21.1",
  baseUsername: 'OP_Guardian'
}

// Global variable to store the "Zombie" timer
let afkInterval

function createBot() {
  const username = config.baseUsername + '_' + Math.floor(Math.random() * 1000)
  
  console.log(`[INIT] Connecting as ${username}...`)

  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: username,
    version: config.version,
    auth: 'offline',
    checkTimeoutInterval: 60 * 1000, 
    viewDistance: 'tiny'
  })

  bot.loadPlugin(pathfinder)

  bot.on('login', () => {
    console.log(`[SUCCESS] ${username} joined!`)
  })

  bot.on('spawn', () => {
    console.log('[INFO] Spawned. Starting Anti-AFK...')
    startOverpoweredAntiAfk(bot)
  })

  bot.on('end', (reason) => {
    console.log(`[DISCONNECT] Reason: ${reason}`)
    
    // 🛑 KILL THE ZOMBIE TIMER
    if (afkInterval) {
      console.log('[CLEANUP] Stopping AFK timer...')
      clearInterval(afkInterval)
    }

    console.log('[RECONNECT] Restarting in 30 seconds...')
    setTimeout(createBot, 30000)
  })

  bot.on('error', (err) => console.log(`[ERROR] ${err.message}`))
  bot.on('kicked', (reason) => console.log(`[KICKED] Reason: ${reason}`))
}

function startOverpoweredAntiAfk(bot) {
  const defaultMove = new Movements(bot)
  defaultMove.allow1by1towers = false 
  defaultMove.canDig = false 
  bot.pathfinder.setMovements(defaultMove)

  // Save the timer to 'afkInterval' so we can stop it later
  afkInterval = setInterval(() => {
    
    // Safety Check: If bot is disconnected, stop trying to walk
    if (!bot || !bot.entity) return

    if (bot.entity.isInWater) {
      bot.setControlState('jump', true) 
      bot.setControlState('sprint', true) 
      return 
    } else {
      bot.setControlState('jump', false) 
    }

    if (!bot.pathfinder.isMoving()) {
      const entity = bot.entity
      const range = 4 + Math.random() * 4 
      const randomX = (Math.random() - 0.5) * range * 2
      const randomZ = (Math.random() - 0.5) * range * 2
      
      const goal = new GoalNear(
        entity.position.x + randomX, 
        entity.position.y, 
        entity.position.z + randomZ, 
        1
      )
      
      // Only log if ACTUALLY connected
      console.log(`[ACTION] Moving to new spot...`)
      
      try {
        bot.pathfinder.setGoal(goal)
      } catch (err) { }
    }
  }, 15000) 
}

createBot()
        
