require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, Events, ActivityType } = require('discord.js'); // Thêm ActivityType
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
client.once(Events.ClientReady, async () => {
    await onReady(client);
    
    console.log(`Bot đã sẵn sàng! Đăng nhập với tư cách: ${client.user.tag}`);

    // Thêm thông báo hoạt động cho bot
    client.user.setActivity('với Discord.js', { type: ActivityType.Playing });

    // Nếu bạn muốn sử dụng các hoạt động khác, hãy bỏ chú thích các dòng dưới đây
    // client.user.setActivity('các thành viên', { type: ActivityType.Watching });
    // client.user.setActivity('âm nhạc', { type: ActivityType.Listening });
    // client.user.setActivity('trực tuyến', { type: ActivityType.Streaming, url: 'https://twitch.tv/tên_của_bạn' });
});

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
