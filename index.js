require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, Events, ActivityType } = require('discord.js');
const fs = require('fs');
const { onReady } = require('./events/ready');
const { onMessageCreate } = require('./events/messageCreate');
const sodium = require('libsodium-wrappers');  // Import libsodium-wrappers

// Khởi tạo libsodium-wrappers
sodium.ready.then(() => {
    console.log('libsodium is ready');  // Thông báo khi libsodium được khởi tạo thành công
}).catch(err => {
    console.error('Error initializing libsodium:', err);  // Xử lý lỗi nếu không khởi tạo được
});

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates],
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

// Danh sách các trạng thái hoạt động
const activities = [
    { name: 'với Discord.js', type: ActivityType.Playing },
    { name: 'các thành viên', type: ActivityType.Watching },
    { name: 'âm nhạc', type: ActivityType.Listening },
    { name: 'trực tuyến', type: ActivityType.Streaming, url: 'https://discord.com/channels/1104076132409684059/1285012160690524231' },
];

// Khởi động bot
client.once(Events.ClientReady, async () => {
    await onReady(client);
    console.log(`Bot đã sẵn sàng! Đăng nhập với tư cách: ${client.user.tag}`);

    // Thay đổi trạng thái hoạt động liên tục
    let index = 0; // Bắt đầu từ trạng thái đầu tiên
    setInterval(() => {
        const activity = activities[index];
        client.user.setActivity(activity.name, { type: activity.type, url: activity.url });
        index = (index + 1) % activities.length; // Cập nhật chỉ số, quay lại đầu nếu vượt quá
    }, 10000); // Thay đổi trạng thái mỗi 10 giây (10000 ms)

    // Đặt trạng thái ban đầu
    client.user.setPresence({
        activities: [{ name: 'trò chuyện với bạn', type: ActivityType.Custom }],
        status: 'online', // Trạng thái ban đầu là 'online'
    });

    // Thay đổi trạng thái định kỳ (ví dụ mỗi 30 giây)
    let presenceIndex = 0; // Chỉ số cho trạng thái
    const presenceStatuses = ['online', 'idle', 'dnd']; // Danh sách trạng thái
    setInterval(() => {
        client.user.setPresence({
            activities: [{ name: 'trò chuyện với bạn', type: ActivityType.Custom }],
            status: presenceStatuses[presenceIndex], // Cập nhật trạng thái
        });
        presenceIndex = (presenceIndex + 1) % presenceStatuses.length; // Cập nhật chỉ số, quay lại đầu nếu vượt quá
    }, 30000); // Thay đổi trạng thái mỗi 30 giây
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
