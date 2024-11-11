const { rollDice } = require('../utils');
const { diceEmojis } = require('../emojis');

const hasRoleToRoll = (member) => {
    const allowedRoles = ['Lắc Tài Xỉu', 'set host'];
    return member.roles.cache.some(role => allowedRoles.includes(role.name));
};

module.exports = async (message, isDitMe, isDuma) => {
    if (!hasRoleToRoll(message.member)) {
        return message.channel.send("<a:canhbao:1302598129300013116> Bạn cần quyền `Lắc Tài Xỉu` hoặc `set host`!");
    }

    try {
        const initialMessage = await message.channel.send('<a:lac:1305457531518455870> <a:lac:1305457531518455870> <a:lac:1305457531518455870>');
        const rollingMessage = await message.channel.send('**<a:danglac:1305461120764743731> Đang lắc...**');
        const finalResults = [null, null, null];
        let rollCount = 0;

        const rollingInterval = setInterval(async () => {
            finalResults[rollCount] = rollDice(isDitMe, isDuma);
            const diceEmojisString = finalResults.map(result => result ? diceEmojis[result] : '<a:lac:1305457531518455870>').join(' ');
            await initialMessage.edit(diceEmojisString);
            rollCount++;

            if (rollCount >= 3) {
                clearInterval(rollingInterval);
                const total = finalResults.reduce((acc, num) => acc + num, 0);
                const resultType = total <= 10 ? 'Xỉu' : 'Tài';
                const parity = total % 2 === 0 ? 'Chẵn' : 'Lẻ';
                await rollingMessage.edit(`**<a:money:1305461123121811539> ${total}・${resultType}・${parity} <a:money:1305461123121811539>**`);
                
                // Thêm log cho lệnh
                console.log(`Lệnh bởi ${message.author.tag}: Kết quả Tài Xỉu: ${finalResults.join(', ')} ${resultType} ${parity}`);
            }
        }, 2000);
    } catch (error) {
        console.error('Lỗi khi xử lý Tài Xỉu:', error);
        await message.channel.send('Đã xảy ra lỗi khi lắc tài xỉu!');
    }
};
