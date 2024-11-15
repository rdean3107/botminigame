const fs = require('fs');
const handlePing = require('../commands/ping');
const handleSetPrefix = require('../commands/setPrefix'); // Nhập hàm handleSetPrefix
const handleTaiXiu = require('../commands/taiXiu');
const handleBauCua = require('../commands/bauCua');
const handleRanDom = require('../commands/random');
const handleMath = require('../commands/math');
const handleGiveAway = require('../commands/giveaway')

const onMessageCreate = (message, config) => {
    if (message.author.bot) return; // Bỏ qua tin nhắn từ bot

    const guildId = message.guild.id;
    const args = message.content.trim().split(/ +/g);
    const prefix = config[guildId]?.prefix || 'z'; // Lấy prefix từ config hoặc mặc định là 'z'
    const isDitMe = message.content.toLowerCase().includes('ditme'); // Kiểm tra từ 'ditme'
    const isDuma = message.content.toLowerCase().includes('duma');   // Kiểm tra từ 'duma'

    // Lệnh kiểm tra độ trễ
    if (args[0].toLowerCase() === `${prefix}ping`) {
        handlePing(message);
    } 
    // Lệnh thay đổi prefix
    else if (args[0].toLowerCase() === `${prefix}setprefix`) {
        handleSetPrefix(message, args, config); // Gọi hàm handleSetPrefix
    } 
    // Lệnh Tài Xỉu
    else if (args[0].toLowerCase() === `${prefix}tx`) {
        handleTaiXiu(message, isDitMe, isDuma);
    } 
    // Lệnh Bầu Cua
    else if (args[0].toLowerCase() === `${prefix}bc`) {
        handleBauCua(message, isDitMe);
    } 
    // Lệnh Random
    else if (args[0].toLowerCase() === `${prefix}rd`) {
        handleRanDom.execute(message, args); // Gọi hàm execute từ random.js
    } 
    // Lệnh Math
    else if (args[0].toLowerCase() === `${prefix}m`) {
        handleMath.execute(message, args); // Gọi hàm handleMath
    } 
    // Lệnh Giveaway
    else if (args[0].toLowerCase() === `${prefix}ga`) {  // Đảm bảo là `prefix + ga`
        handleGiveAway.execute(message, args); // Gọi hàm execute từ giveaway.js
    }
};

module.exports = { onMessageCreate }; // Xuất hàm onMessageCreate
