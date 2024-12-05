const { rollBauCua } = require('../utils');
const { bauCuaEmojis } = require('../emojis');

const allowedRoles = ['Lắc Bầu Cua', 'set host'];
const rollingTime = 2000;  // 2 giây mỗi lần lắc
const emojis = {
    rolling: '<a:lacbaucua:1313456234388525096>',
    finished: '<a:lua:1313461231620853863>',
    warning: '⚠️',
    rollingAnimation: '<a:lacdu:1313460032142049290>',
    separator: '<:kh_cham:1247581986181222531>'
};
const logChannelId = '1313465666841612339'; // Thay bằng ID của kênh bạn muốn gửi log

// Biến khóa trạng thái
let isRolling = false;

const hasRoleToRoll = (member) => {
    return member.roles.cache.some(role => allowedRoles.includes(role.name));
};

module.exports = async (message, isDitMe) => {
    if (!hasRoleToRoll(message.member)) {
        return message.channel.send(`${emojis.warning} Bạn cần quyền \`Lắc Bầu Cua\` hoặc \`set host\`!`);
    }

    if (isRolling) {
        return message.channel.send(`${emojis.warning} Lệnh đang được thực hiện, vui lòng chờ hoàn thành trước khi thử lại.`);
    }

    isRolling = true; // Đặt trạng thái lệnh đang chạy

    try {
        const initialMessage = await message.channel.send(`${emojis.rolling} ${emojis.rolling} ${emojis.rolling}`);  // Hiển thị quá trình lắc
        const rollingMessage = await message.channel.send(`**${emojis.rollingAnimation} Đang lắc...**`);
        const finalResults = [null, null, null];

        // Lắc từng cục một, mỗi lần 2 giây
        for (let rollCount = 0; rollCount < 3; rollCount++) {
            // Chờ 2 giây trước khi hiển thị mỗi cục lắc
            await new Promise(resolve => setTimeout(resolve, rollingTime));

            finalResults[rollCount] = rollBauCua(isDitMe);
            const bauCuaEmojisString = finalResults
                .map(result => result ? bauCuaEmojis[result] : emojis.rolling)
                .join(' ');

            // Cập nhật kết quả sau mỗi 2 giây
            await initialMessage.edit(bauCuaEmojisString);
        }

        // Cập nhật kết quả cuối cùng ngay lập tức sau khi tất cả đã lắc xong
        const resultsString = finalResults.join(emojis.separator);
        await rollingMessage.edit(`**${emojis.finished} ${resultsString} ${emojis.finished}**`);

        // Lấy thời gian hiện tại theo định dạng [hh:mm:ss dd/MM/yyyy]
        const timestamp = new Date().toLocaleString('vi-VN', {
            hour12: false, 
            timeZone: 'Asia/Ho_Chi_Minh'
        }).replace(/(\d{2}:\d{2}:\d{2}) (\d{2})\/(\d{2})\/(\d{4})/, '[$1 $3/$2/$4]');

        // Chuyển tên emoji thành tên chữ tương ứng (ví dụ: "cua", "tom", ...)
        const resultNames = finalResults.map(result => {
            if (result !== null) {
                return bauCuaEmojis[result].name || result;  // Lấy tên nếu có
            }
            return result;
        });

        // Tạo log message theo định dạng yêu cầu
        const logMessage = `[${timestamp}] Lệnh bởi __${message.author.tag}__: Kết quả Bầu Cua: ${resultNames.join(', ')}`;

        // Gửi log vào kênh riêng với thời gian
        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (logChannel) {
            logChannel.send(logMessage);
        }

        console.log(logMessage);
    } catch (error) {
        console.error('Lỗi khi xử lý Bầu Cua:', error);
        await message.channel.send('Đã xảy ra lỗi khi lắc bầu cua!');
    } finally {
        isRolling = false; // Mở khóa sau khi lệnh hoàn thành
    }
};
