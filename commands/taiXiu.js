const { rollDice } = require('../utils');
const { diceEmojis } = require('../emojis');

const allowedRoles = ['Lắc Tài Xỉu', 'set host'];
const rollingTime = 2000;
const emojis = {
    rolling: '<a:dicegame:1313437370040848445>',
    finished: '<a:lua:1313461231620853863>',
    warning: '⚠️',
    rollingAnimation: '<a:lacdu:1313460032142049290>',
    separator: '<:kh_cham:1247581986181222531>'
};
const logChannelId = '1313465666841612339'; // Thay bằng ID của kênh bạn muốn gửi log

const hasRoleToRoll = (member) => {
    return member.roles.cache.some(role => allowedRoles.includes(role.name));
};

module.exports = async (message, isDitMe, isDuma) => {
    if (!hasRoleToRoll(message.member)) {
        return message.channel.send(`${emojis.warning} Bạn cần quyền \`Lắc Tài Xỉu\` hoặc \`set host\`!`);
    }

    try {
        const initialMessage = await message.channel.send(`${emojis.rolling} ${emojis.rolling} ${emojis.rolling}`);
        const rollingMessage = await message.channel.send(`**${emojis.rollingAnimation} Đang lắc...**`);
        const finalResults = [null, null, null];
        let rollCount = 0;

        const rollingInterval = setInterval(async () => {
            finalResults[rollCount] = rollDice(isDitMe, isDuma);
            const diceEmojisString = finalResults
                .map(result => result ? diceEmojis[result] : emojis.rolling)
                .join(' ');
            await initialMessage.edit(diceEmojisString);
            rollCount++;

            if (rollCount >= 3) {
                clearInterval(rollingInterval);
                const total = finalResults.reduce((acc, num) => acc + num, 0);
                const resultType = total <= 10 ? 'Xỉu' : 'Tài';
                const parity = total % 2 === 0 ? 'Chẵn' : 'Lẻ';
                const resultMessage = `**${emojis.finished} ${total}${emojis.separator}${resultType}${emojis.separator}${parity} ${emojis.finished}**`;

                await rollingMessage.edit(resultMessage);

                // Lấy thời gian hiện tại theo định dạng [hh:mm:ss dd/MM/yyyy]
                const timestamp = new Date().toLocaleString('vi-VN', {
                    hour12: false,
                    timeZone: 'Asia/Ho_Chi_Minh'
                }).replace(/(\d{2}:\d{2}:\d{2}) (\d{2})\/(\d{2})\/(\d{4})/, '[$1 $3/$2/$4]');
                
                // Tạo log message theo định dạng yêu cầu
                const logMessage = `[${timestamp}] Lệnh bởi __${message.author.tag}__: Kết quả Tài Xỉu: ${finalResults.join(', ')} ${resultType} ${parity}`;

                // Gửi log vào kênh riêng với thời gian
                const logChannel = message.guild.channels.cache.get(logChannelId);
                if (logChannel) {
                    logChannel.send(logMessage);
                }

                console.log(logMessage);
            }
        }, rollingTime);
    } catch (error) {
        console.error('Lỗi khi xử lý Tài Xỉu:', error);
        await message.channel.send('Đã xảy ra lỗi khi lắc tài xỉu!');
    }
};
