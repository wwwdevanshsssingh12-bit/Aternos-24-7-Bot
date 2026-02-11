module.exports = {
  apps: [{
    name: "aternos-bot",
    script: "./index.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '220M', // <--- Restart if it hits 220MB
    node_args: "--max-old-space-size=200", // <--- Force Node to use max 200MB
    exp_backoff_restart_delay: 100
  }]
}
