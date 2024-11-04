module.exports = async (message) => {
    const msg = await message.channel.send('🏓 Đang kiểm tra độ trễ...');
    const ping = msg.createdTimestamp - message.createdTimestamp; // Tính độ trễ
    await msg.edit(`🏓 Độ trễ: ${ping}ms`);
};
