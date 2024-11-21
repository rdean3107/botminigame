require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, Events, ActivityType } = require('discord.js');
const fs = require('fs');
const { onReady } = require('./events/ready');
const { onMessageCreate } = require('./events/messageCreate');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
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
    { name: 'chơi với meo béo ', type: ActivityType.Playing },
    { name: 'meo béo nhảy', type: ActivityType.Watching },
    { name: 'meo béo hát', type: ActivityType.Listening },
    { name: 'trực tuyến', type: ActivityType.Streaming, url: 'https://discord.com/channels/1228364336142094387/1298926022514704384' },
];

// Khởi động bot
client.once(Events.ClientReady, async () => {
    await onReady(client);
    console.log(`Bot đã sẵn sàng! Đăng nhập với tư cách: ${client.user.tag}`);

    // Thay đổi trạng thái hoạt động liên tục
    let activityIndex = 0;
    setInterval(() => {
        const activity = activities[activityIndex];
        client.user.setActivity(activity.name, { type: activity.type, url: activity.url });
        activityIndex = (activityIndex + 1) % activities.length;
    }, 10000); // Thay đổi trạng thái mỗi 10 giây

    // Đặt trạng thái ban đầu
    client.user.setPresence({
        activities: [{ name: 'trò chuyện với bạn', type: ActivityType.Custom }],
        status: 'online',
    });

    // Thay đổi trạng thái định kỳ
    let presenceIndex = 0;
    const presenceStatuses = ['online', 'idle', 'dnd'];
    setInterval(() => {
        client.user.setPresence({
            activities: [{ name: 'trò chuyện với bạn', type: ActivityType.Custom }],
            status: presenceStatuses[presenceIndex],
        });
        presenceIndex = (presenceIndex + 1) % presenceStatuses.length;
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
    try {
        fs.writeFileSync('config.json', JSON.stringify(config, null, 4));
        console.log('Cấu hình đã được lưu thành công.');
    } catch (error) {
        console.error('Lỗi khi ghi tệp config.json:', error);
    }
};

module.exports = { config, writeConfig }; // Xuất config và hàm ghi cấu hình
