const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const { GoalNear } = goals

const config = {
  // ⚠️ Make sure this Port is updated from Aternos!
  host: 'Blasters.aternos.me', 
  port: 15754,       
  version: "1.21.1", 
  username: 'Immortal_Bot'
}

let bot
let moveInterval // <--- FIX 1: Variable to track the timer

function createBot() {
  const name = config.username + '_' + Math.floor(Math.random() * 999)
  
  console.log(`[START] Connecting as ${name}...`)

  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: name,
    version: config.version,
    auth: 'offline',
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
  // <--- FIX 2: Stop the old timer if it exists so we don't have duplicates
  if (moveInterval) clearInterval(moveInterval)

  const moves = new Movements(bot)
  moves.canDig = false
  moves.allow1by1towers = false
  bot.pathfinder.setMovements(moves)

  // Move rarely (every 60s) to save battery
  moveInterval = setInterval(() => {
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
      // Move 2-4 blocks randomly (Increased range slightly for better detection)
      const goal = new GoalNear(p.x + (Math.random()*6-3), p.y, p.z + (Math.random()*6-3), 1)
      try { bot.pathfinder.setGoal(goal) } catch (e) {}
    }
  }, 60000) 
}

createBot()
    
