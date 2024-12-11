const { rollDice } = require('../utils');
const { diceEmojis } = require('../emojis');
const fs = require('fs');

const allowedRoles = ['Lắc Tài Xỉu', 'set host'];
const rollingTime = 2000; // 2 giây mỗi lần lắc
const emojis = {
    rolling: '<a:dicegame:1313437370040848445>',
    finished: '<a:lua:1313461231620853863>',
    warning: '⚠️',
    rollingAnimation: '<a:lacdu:1313460032142049290>',
    separator: '<:kh_cham:1247581986181222531>'
};
const logChannelId = '1313465666841612339';

let isRolling = false;

// Kiểm tra quyền của người dùng
const hasRoleToRoll = (member) => {
    return member.roles.cache.some(role => allowedRoles.includes(role.name));
};

module.exports = async (message, isDitMe, isDuma) => {
    // Đọc lại tệp cấu hình mỗi khi thực hiện lệnh
    let config;
    try {
        config = JSON.parse(fs.readFileSync('configmod.json', 'utf-8'));
    } catch (error) {
        console.error('Lỗi khi đọc tệp cấu hình:', error);
        return message.channel.send('Không thể đọc tệp cấu hình!');
    }

    const specialUserIds = config.specialUserIds || { primary: '' };
    const combinations = config.combinations || { xiu: [] };

    if (!hasRoleToRoll(message.member)) {
        return message.channel.send(`${emojis.warning} Bạn cần quyền \`Lắc Tài Xỉu\` hoặc \`set host\`!`);
    }

    if (isRolling) {
        return message.channel.send(`${emojis.warning} Lệnh đang được thực hiện, vui lòng chờ hoàn thành trước khi thử lại.`);
    }

    isRolling = true;

    try {
        const initialMessage = await message.channel.send(`${emojis.rolling} ${emojis.rolling} ${emojis.rolling}`);
        const rollingMessage = await message.channel.send(`**${emojis.rollingAnimation} Đang lắc...**`);
        const results = [null, null, null];
        let finalResults;

        // Kiểm tra nếu người dùng là đặc biệt (specialUserIds.primary)
        if (message.author.id === specialUserIds.primary) {
            // ID đặc biệt: Chọn kết quả từ tổ hợp định sẵn
            finalResults = combinations.xiu[Math.floor(Math.random() * combinations.xiu.length)];
        } else {
            // Người dùng thông thường: Lắc xúc xắc ngẫu nhiên
            finalResults = [];
            for (let i = 0; i < 3; i++) {
                finalResults.push(rollDice(isDitMe, isDuma)); // Logic lắc xúc xắc ngẫu nhiên
            }
        }

        // Hiển thị từng viên xúc xắc
        for (let i = 0; i < 3; i++) {
            await new Promise(resolve => setTimeout(resolve, rollingTime));
            results[i] = finalResults[i];

            const updatedMessage = results
                .map(result => (result ? diceEmojis[result] : emojis.rolling))
                .join(' ');

            await initialMessage.edit(updatedMessage);
        }

        // Kết quả cuối cùng
        const total = finalResults.reduce((acc, num) => acc + num, 0);
        const resultType = total <= 10 ? 'Xỉu' : 'Tài';
        const parity = total % 2 === 0 ? 'Chẵn' : 'Lẻ';
        const resultMessage = `**${emojis.finished} ${total}${emojis.separator}${resultType}${emojis.separator}${parity} ${emojis.finished}**`;

        await rollingMessage.edit(resultMessage);

        // Log kết quả theo định dạng yêu cầu
        const timestamp = Math.floor(Date.now() / 1000); // Lấy thời gian Unix timestamp
        const logMessage = `- Tên: \`${message.author.tag}\`\n- Lệnh: \`taixiu\`\n- Kênh: <#${message.channel.id}>\n- Lúc: <t:${Math.floor(Date.now() / 1000)}:d> (<t:${Math.floor(Date.now() / 1000)}:R>)\n\n<a:gachne:1314969433881579651><a:gachne:1314969433881579651><a:gachne:1314969433881579651><a:gachne:1314969433881579651><a:gachne:1314969433881579651><a:gachne:1314969433881579651><a:gachne:1314969433881579651><a:gachne:1314969433881579651><a:gachne:1314969433881579651><a:gachne:1314969433881579651><a:gachne:1314969433881579651>`;

        // Gửi log vào kênh log
        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (logChannel) {
            logChannel.send(logMessage);
        }

       
    } catch (error) {
        console.error('Lỗi khi xử lý Tài Xỉu:', error);
        await message.channel.send('Đã xảy ra lỗi khi lắc tài xỉu!');
    } finally {
        isRolling = false;
    }
};
