const fs = require('fs');
const handlePing = require('../commands/ping');
const handleSetPrefix = require('../commands/setPrefix');
const handleTaiXiu = require('../commands/taiXiu');
const handleBauCua = require('../commands/bauCua');
const handleRanDom = require('../commands/random');
const handleMath = require('../commands/math');
const handleGiveAway = require('../commands/giveaway');
const handleVoice = require('../commands/voice');
const handleBd = require('../commands/bd');

// Bảng ánh xạ lệnh và hàm xử lý
const commandHandlers = {
    ping: handlePing,
    setprefix: handleSetPrefix,
    tx: handleTaiXiu,
    bc: handleBauCua,
    rd: handleRanDom,
    m: handleMath,
    ga: handleGiveAway,
    join: (message, args) => handleVoice.execute(message, 'join'),
    leave: (message, args) => handleVoice.execute(message, 'leave'),
    bd: handleBd,
};

const onMessageCreate = (message, config) => {
    if (message.author.bot) return; // Bỏ qua tin nhắn từ bot

    const guildId = message.guild.id;
    const args = message.content.trim().split(/ +/g);
    const prefix = config[guildId]?.prefix || 'k'; // Lấy prefix từ config hoặc mặc định là 'k'

    const command = args[0].slice(prefix.length).toLowerCase(); // Loại bỏ prefix khỏi lệnh và chuyển về chữ thường
    const isDitMe = message.content.toLowerCase().includes('ditme');
    const isDuma = message.content.toLowerCase().includes('duma');

    // Kiểm tra lệnh có hợp lệ không
    if (!args[0].toLowerCase().startsWith(prefix.toLowerCase())) return; // Kiểm tra prefix không phân biệt chữ hoa/thường
    if (!commandHandlers[command]) return; // Bỏ qua nếu lệnh không tồn tại

    try {
        // Chuyển đối số bổ sung cho từng lệnh cụ thể
        if (command === 'tx') {
            return commandHandlers[command](message, isDitMe, isDuma);
        } else if (command === 'bc') {
            return commandHandlers[command](message, isDitMe);
        } else if (['rd', 'm', 'ga', 'bd'].includes(command)) {
            return commandHandlers[command].execute(message, args);
        } else {
            return commandHandlers[command](message, args, config); // Gọi các lệnh còn lại
        }
    } catch (error) {
        console.error(`Lỗi khi xử lý lệnh ${command}:`, error);
        message.reply(`❌ Đã xảy ra lỗi khi thực hiện lệnh: **${command}**. Vui lòng thử lại.`);
    }
};

module.exports = { onMessageCreate }; // Xuất hàm onMessageCreate
