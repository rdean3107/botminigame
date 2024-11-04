require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');
const { onReady } = require('./events/ready');
const { onMessageCreate } = require('./events/messageCreate'); // Import đúng hàm

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once('ready', () => onReady(client));

// Xử lý tin nhắn
client.on('messageCreate', (message) => onMessageCreate(message, config)); // Sử dụng hàm onMessageCreate

// Thiết lập máy chủ express
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot đang hoạt động!'));
app.listen(PORT, () => console.log(`Máy chủ đang chạy trên cổng ${PORT}`));

// Đăng nhập vào bot
client.login(process.env.DISCORD_TOKEN);
