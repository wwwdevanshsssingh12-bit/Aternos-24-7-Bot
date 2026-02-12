const mineflayer = require('mineflayer')
const express = require('express')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { GoalNear } = goals

// --- 1. KEEP-ALIVE WEB SERVER (For Render) ---
const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) => res.send('OP Bot is active and pathfinding!'))
app.listen(port, () => console.log(`Web server running on port ${port}`))

// --- 2. BOT SETTINGS ---
const config = {
  host: 'mantaray.aternos.host', // Your Server IP
  port: 15754,                 // Your Port
  version: "1.21.1",           // Force 1.21.1 (Fixes Version Mismatch)
  baseUsername: 'OP_Guardian'  
}

// --- 3. THE INTELLIGENT BOT ---
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

  // Load the Pathfinding Plugin
  bot.loadPlugin(pathfinder)

  // --- EVENTS ---

  bot.on('login', () => {
    console.log(`[SUCCESS] ${username} joined!`)
    bot.chat('I am online and moving!')
  })

  bot.on('spawn', () => {
    console.log('[INFO] AI activated. Starting random movements...')
    startOverpoweredAntiAfk(bot)
  })

  bot.on('end', (reason) => {
    console.log(`[DISCONNECT] Reason: ${reason}`)
    console.log('[RECONNECT] Restarting in 30 seconds...')
    setTimeout(createBot, 30000)
  })

  bot.on('error', (err) => console.log(`[ERROR] ${err.message}`))
  
  bot.on('kicked', (reason) => console.log(`[KICKED] Reason: ${reason}`))
}

// --- 4. OVERPOWERED ANTI-AFK LOGIC ---
function startOverpoweredAntiAfk(bot) {
  // Set up the "physics" for the bot
  const defaultMove = new Movements(bot)
  defaultMove.allow1by1towers = false 
  defaultMove.canDig = false // Don't break blocks
  bot.pathfinder.setMovements(defaultMove)

  // Loop every 15 seconds to decide what to do
  setInterval(() => {
    
    // ACTION 1: AUTO-SWIM (Priority)
    if (bot.entity.isInWater) {
      console.log('[ACTION] Swimming...')
      bot.setControlState('jump', true) // Swim up
      bot.setControlState('sprint', true) 
      return // Skip walking if swimming
    } else {
      bot.setControlState('jump', false) // Stop jumping if out of water
    }

    // ACTION 2: RANDOM WALK (Smart Pathfinding)
    if (!bot.pathfinder.isMoving()) {
      const entity = bot.entity
      // Pick a random spot 5-10 blocks away
      const range = 5 + Math.random() * 5 
      const randomX = (Math.random() - 0.5) * range * 2
      const randomZ = (Math.random() - 0.5) * range * 2
      
      const goal = new GoalNear(
        entity.position.x + randomX, 
        entity.position.y, 
        entity.position.z + randomZ, 
        1
      )
      
      console.log(`[ACTION] Walking to new spot...`)
      
      // FIX: Do not use .catch() here, it causes the crash.
      try {
        bot.pathfinder.setGoal(goal)
      } catch (err) {
        console.log("[WARN] Pathfinding error (ignored)")
      }
    }
  }, 15000) 

  // ACTION 3: CONSTANT HEAD ROTATION 
  setInterval(() => {
    const yaw = Math.random() * Math.PI - (0.5 * Math.PI)
    const pitch = Math.random() * Math.PI - (0.5 * Math.PI)
    bot.look(yaw, pitch)
  }, 3000)
}

createBot()
  
