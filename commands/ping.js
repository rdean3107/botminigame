module.exports = async (message) => {
    const msg = await message.channel.send('🏓 Đang kiểm tra độ trễ...');
    const messagePing = msg.createdTimestamp - message.createdTimestamp; // Độ trễ tin nhắn
    const apiPing = Math.round(message.client.ws.ping); // Độ trễ API

    // Tính thời gian hoạt động của bot
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    await msg.edit(`🏓 Pong!\nĐộ trễ tin nhắn\n${messagePing}ms\nĐộ trễ API\n${apiPing}ms\nThời gian hoạt động\n${uptimeString}\n\nYêu cầu bởi ${message.author}`);
};
