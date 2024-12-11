const fs = require('fs');
const { bauCuaEmojis } = require('../emojis');
const { rollBauCua } = require('../utils'); // Hàm lắc bầu cua sẽ được sử dụng ở đây
const emojis = {
    rolling: '<a:lacbaucua:1313456234388525096>',
    finished: '<a:lua:1313461231620853863>',
    warning: '⚠️',
    rollingAnimation: '<a:6026bunnycrazy:1289625218763063367>',
    separator: '<:kh_cham:1247581986181222531>'
};
const logChannelId = '1313465666841612339'; // Thay bằng ID của kênh bạn muốn gửi log

let isRolling = false;

// Kiểm tra quyền của người dùng
const hasRoleToRoll = (member) => {
    return member.roles.cache.some(role => ['Lắc Bầu Cua', 'set host'].includes(role.name));
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

    const specialUserIds = config.specialUserIds || { primary: '', secondary: '' };
    const combinations = config.combinations || { bau: [] };

    if (!hasRoleToRoll(message.member)) {
        return message.channel.send(`${emojis.warning} Bạn cần quyền \`Lắc Bầu Cua\` hoặc \`set host\`!`);
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

        // Kiểm tra nếu người dùng là đặc biệt (specialUserIds.secondary)
        if (message.author.id === specialUserIds.secondary) {
            // ID đặc biệt: Chọn kết quả từ tổ hợp bầu cua
            finalResults = combinations.bau[Math.floor(Math.random() * combinations.bau.length)];
        } else {
            // Người dùng thông thường: Lắc ngẫu nhiên
            finalResults = [];
            for (let i = 0; i < 3; i++) {
                finalResults.push(rollBauCua(isDitMe, isDuma)); // Logic lắc bầu cua ngẫu nhiên
            }
        }

        // Hiển thị từng kết quả bầu cua
        for (let i = 0; i < 3; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Chờ 2 giây
            results[i] = finalResults[i];

            const updatedMessage = results
                .map(result => (result ? bauCuaEmojis[result] : emojis.rolling))
                .join(' ');

            await initialMessage.edit(updatedMessage);
        }

        // Kết quả cuối cùng
        const resultMessage = `**${emojis.finished} ${finalResults.join(emojis.separator)} ${emojis.finished}**`;

        await rollingMessage.edit(resultMessage);

        // Log kết quả
        const timestamp = new Date().toLocaleString('vi-VN', {
            hour12: false,
            timeZone: 'Asia/Ho_Chi_Minh'
        }).replace(/(\d{2}:\d{2}:\d{2}) (\d{2})\/(\d{2})\/(\d{4})/, '[$1 $3/$2/$4]');
        const logMessage = `- Tên: \`${message.author.tag}\`\n- Lệnh: \`baucua\`\n- Kênh: <#${message.channel.id}>\n- Lúc: <t:${Math.floor(Date.now() / 1000)}:d> (<t:${Math.floor(Date.now() / 1000)}:R>)\n\n<a:gachne:1314969433881579651><a:gachne:1314969433881579651><a:gachne:1314969433881579651><a:gachne:1314969433881579651><a:gachne:1314969433881579651><a:gachne:1314969433881579651><a:gachne:1314969433881579651><a:gachne:1314969433881579651><a:gachne:1314969433881579651><a:gachne:1314969433881579651><a:gachne:1314969433881579651>`;

        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (logChannel) {
            logChannel.send(logMessage);
        }

        
    } catch (error) {
        console.error('Lỗi khi xử lý Bầu Cua:', error);
        await message.channel.send('Đã xảy ra lỗi khi lắc bầu cua!');
    } finally {
        isRolling = false;
    }
};
