// commands/setPrefix.js
module.exports = (message, args, config) => {
    if (args.length < 2) {
        return message.channel.send('Vui lòng cung cấp prefix mới! Ví dụ: `zsetprefix !`');
    }

    const newPrefix = args[1];
    const guildId = message.guild.id;

    // Cập nhật config với prefix mới
    config[guildId] = { ...config[guildId], prefix: newPrefix };

    // Lưu lại config (tùy thuộc vào cách bạn lưu trữ config của mình)
    // Ví dụ: nếu bạn sử dụng JSON
    // fs.writeFileSync('config.json', JSON.stringify(config, null, 4));

    message.channel.send(`Prefix đã được thay đổi thành \`${newPrefix}\``);
};
