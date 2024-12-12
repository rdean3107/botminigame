const { MessageEmbed } = require('discord.js');

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

    // Tạo embed
    const embed = new MessageEmbed()
        .setColor(0xff7f8b)
        .setTitle('🏓 Pong!')
        .addField('Độ trễ tin nhắn', `${messagePing}ms`, true)
        .addField('Độ trễ API', `${apiPing}ms`, true)
        .addField('Thời gian hoạt động', uptimeString, false)
        .setFooter(`Yêu cầu bởi ${message.author.tag}`, message.author.displayAvatarURL());

    await msg.edit({ content: null, embeds: [embed] });
};
