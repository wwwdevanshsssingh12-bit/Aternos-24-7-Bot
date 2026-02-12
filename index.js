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

createBot()
