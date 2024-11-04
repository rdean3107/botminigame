require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const { onReady } = require('./events/ready');
const { onMessageCreate } = require('./events/messageCreate');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Đọc cấu hình từ tệp JSON
let config;
try {
    const data = fs.readFileSync('config.json', 'utf8');
    config = JSON.parse(data);
} catch (error) {
    console.error('Lỗi khi đọc tệp config.json:', error);
    config = {}; // Khởi tạo config rỗng nếu không tìm thấy tệp
}

// Khởi động bot
client.once('ready', () => onReady(client));

// Xử lý tin nhắn
client.on('messageCreate', (message) => onMessageCreate(message, config));

// Thiết lập máy chủ express
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('Bot đang hoạt động!'));
app.listen(PORT, () => console.log(`Máy chủ đang chạy trên cổng ${PORT}`));

// Đăng nhập vào bot
client.login(process.env.DISCORD_TOKEN);

// Hàm để ghi cấu hình vào tệp JSON
const writeConfig = () => {
    fs.writeFileSync('config.json', JSON.stringify(config, null, 4));
};

module.exports = { config, writeConfig }; // Xuất config và hàm ghi cấu hình
