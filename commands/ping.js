module.exports = async (message) => {
    const msg = await message.channel.send('🏓 Đang kiểm tra độ trễ...');
    const ping = msg.createdTimestamp - message.createdTimestamp; // Tính độ trễ

    // Tính thời gian hoạt động của bot
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const uptimeString = `${hours} giờ, ${minutes} phút, ${seconds} giây`;

    await msg.edit(`🏓 Độ trễ: ${ping}ms\n⏱️ Bot đã hoạt động: ${uptimeString}`);
};
