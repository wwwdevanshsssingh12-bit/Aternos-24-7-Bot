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
  host: 'Blasters.aternos.me', // Your Server IP
  port: 15754,                 // Your Port
  version: "1.21.1",           // Force Version to fix crashes
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
}

// --- 4. OVERPOWERED ANTI-AFK LOGIC ---
function startOverpoweredAntiAfk(bot) {
  // Set up the "physics" for the bot (so it knows how to walk)
  const defaultMove = new Movements(bot)
  defaultMove.allow1by1towers = false // Don't build weird towers
  bot.pathfinder.setMovements(defaultMove)

  // Loop every 10-20 seconds to decide what to do
  setInterval(() => {
    
    // ACTION 1: AUTO-SWIM (If in water)
    if (bot.entity.isInWater) {
      console.log('[ACTION] Swimming...')
      bot.setControlState('jump', true) // Swim up
      bot.setControlState('sprint', true) // Swim fast
      setTimeout(() => {
         bot.setControlState('jump', false)
         bot.setControlState('sprint', false)
      }, 2000)
      return // Skip walking if swimming
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
      bot.pathfinder.setGoal(goal).catch(err => {
        // If it can't walk there, just jump and look around
        console.log('[INFO] Path failed, doing backup jump.')
        randomLook(bot)
        bot.setControlState('jump', true)
        setTimeout(() => bot.setControlState('jump', false), 500)
      })
    }
  }, 15000) // Runs every 15 seconds

  // ACTION 3: CONSTANT HEAD ROTATION (Looks very real)
  setInterval(() => {
    randomLook(bot)
  }, 3000)
}

function randomLook(bot) {
  const yaw = Math.random() * Math.PI - (0.5 * Math.PI)
  const pitch = Math.random() * Math.PI - (0.5 * Math.PI)
  bot.look(yaw, pitch)
}

createBot()
        
