const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { GoalNear } = goals

const config = {
  host: 'Blasters.aternos.me', // Main IP usually works on Termux!
  port: 15754,                 // Check Aternos for the current port
  version: "1.21.1",           // Forces stability
  username: 'Immortal_Bot'
}

let bot

function createBot() {
  // Random name prevents "Already Logged In" error
  const name = config.username + '_' + Math.floor(Math.random() * 999)
  
  // Minimal logging to save battery
  console.log(`[START] Connecting as ${name}...`)

  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: name,
    version: config.version,
    auth: 'offline',
    // LOW POWER MODE SETTINGS
    viewDistance: 'tiny',       // Don't load far chunks (Saves RAM)
    colorsEnabled: false,       // Plain text logs (Saves CPU)
    physicsEnabled: true,       // Needed for AI, but we limit it below
    checkTimeoutInterval: 60000 // Wait 60s before timing out
  })

  bot.loadPlugin(pathfinder)

  bot.on('login', () => {
    console.log(`[ONLINE] Bot is hidden and running.`)
  })

  bot.on('spawn', () => {
    startStealthMovement(bot)
  })

  bot.on('end', (reason) => {
    console.log(`[OFFLINE] Reconnecting in 30s...`)
    setTimeout(createBot, 30000)
  })
  
  // Hide errors to keep terminal clean
  bot.on('error', () => {}) 
  bot.on('kicked', () => {})
}

function startStealthMovement(bot) {
  const moves = new Movements(bot)
  moves.canDig = false
  moves.allow1by1towers = false
  bot.pathfinder.setMovements(moves)

  // Move rarely (every 45 seconds) to save battery/heat
  setInterval(() => {
    if (!bot || !bot.entity) return

    // 1. Anti-Drown (Only runs if in water)
    if (bot.entity.isInWater) {
      bot.setControlState('jump', true)
      return
    } else {
      bot.setControlState('jump', false)
    }

    // 2. Small random movements
    if (!bot.pathfinder.isMoving()) {
      const p = bot.entity.position
      // Move only 2-3 blocks (very light calculation)
      const goal = new GoalNear(p.x + (Math.random()*4-2), p.y, p.z + (Math.random()*4-2), 1)
      
      try { bot.pathfinder.setGoal(goal) } catch (e) {}
    }
  }, 45000) 
}

createBot()
