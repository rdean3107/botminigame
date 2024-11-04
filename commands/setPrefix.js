const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../config.json'); // Đường dẫn đến file config.json

// Đọc file config
const readConfig = () => {
    if (fs.existsSync(configPath)) {
        const data = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(data);
    }
    return {};
};

// Ghi file config
const writeConfig = (config) => {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
};

module.exports = (message, args, config) => {
    // Kiểm tra sự tồn tại của prefix mới
    if (args.length < 2) {
        return message.channel.send('Vui lòng cung cấp prefix mới! Ví dụ: `zsetprefix !`');
    }

    const newPrefix = args[1].trim(); // Trim khoảng trắng ở đầu và cuối
    const guildId = message.guild.id;

    // Cập nhật config với prefix mới
    if (!config[guildId]) {
        config[guildId] = {}; // Khởi tạo cấu hình cho guild nếu chưa tồn tại
    }
    
    config[guildId].prefix = newPrefix;

    // Ghi lại config vào file
    writeConfig(config);

    message.channel.send(`Prefix đã được thay đổi thành \`${newPrefix}\``);
};
