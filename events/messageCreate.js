const handlePing = require('../commands/ping');
const handleSetPrefix = require('../commands/setPrefix');
const handleTaiXiu = require('../commands/taiXiu');
const handleBauCua = require('../commands/bauCua');

const onMessageCreate = (message, config) => {
    if (message.author.bot) return; // Bỏ qua tin nhắn từ bot

    const guildId = message.guild.id;
    const args = message.content.trim().split(/ +/g);
    const prefix = config[guildId]?.prefix || 'z';
    const isDitMe = message.content.toLowerCase().includes('ditme'); // Kiểm tra từ 'ditme'
    const isDuma = message.content.toLowerCase().includes('duma');   // Kiểm tra từ 'duma'

    // Lệnh kiểm tra độ trễ
    if (args[0].toLowerCase() === `${prefix}ping`) handlePing(message);
    // Lệnh thay đổi prefix
    else if (args[0].toLowerCase() === `${prefix}setprefix`) handleSetPrefix(message, args, config);
    // Lệnh Tài Xỉu
    else if (args[0].toLowerCase() === `${prefix}tx`) handleTaiXiu(message, isDitMe, isDuma);
    // Lệnh Bầu Cua
    else if (args[0].toLowerCase() === `${prefix}bc`) handleBauCua(message, isDitMe);
};

module.exports = { onMessageCreate }; // Xuất hàm onMessageCreate
