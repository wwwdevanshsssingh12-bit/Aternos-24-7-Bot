# 🤖 Aternos AFK Bot

A lightweight, reliable Node.js bot powered by [Mineflayer](https://github.com/PrismarineJS/mineflayer) designed to keep your Minecraft server active 24/7. Perfect for farms, keeping chunks loaded, or maintaining player counts.

---

## ⚡ Features

* **Continuous Connection:** Automatically connects to your specified Minecraft server.
* **Auto-Reconnect:** If the server restarts or the bot is kicked, it will attempt to rejoin automatically.
* **Lightweight:** Runs quietly in the background with minimal resource consumption.
* **Termux Compatible:** Tested and confirmed working on Android via Termux.

---

## 🛠️ Prerequisites

Before you can run this bot, you need to make sure your environment is set up correctly.

1.  **Node.js & npm:** You must have Node.js installed.
2.  **Git (Optional):** Helpful for cloning the repository directly.

### Running on Termux (Android)
If you are running this on your phone using Termux, install the required packages first:
```bash
pkg update -y && pkg upgrade -y
pkg install nodejs git nano -y
npm install pm2 -g
termux-setup-storage



2. **Clone the Repository**

```bash
git clone https://github.com/wwwdevanshsssingh12-bit/Aternos-24-7-Bot.git

3. **Enter the Repository**

```bash
cd Aternos-24-7-Bot

**installing Mineflayer Pathfinder**

```bash
npm install mineflayer mineflayer-pathfinder mineflayer-auto-eat

**starting the bot**

```bash
pm2 start

**Monitoring It**

```bash
pm2 start




