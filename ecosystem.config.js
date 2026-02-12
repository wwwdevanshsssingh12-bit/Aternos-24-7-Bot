module.exports = {
  apps: [{
    name: "Guardian_Bot",
    script: "./index.js",
    watch: false,
    // 1. Auto-Restart if it crashes
    autorestart: true,
    // 2. Restart if it uses too much RAM (Prevents phone lag)
    max_memory_restart: "300M",
    // 3. Wait 10s between restarts so you don't get IP banned
    restart_delay: 10000,
    // 4. Log settings (Turn off to save space if needed)
    out_file: "/dev/null",
    error_file: "/dev/null"
  }]
}
