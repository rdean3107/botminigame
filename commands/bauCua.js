const { rollBauCua } = require('../utils');
const { bauCuaEmojis } = require('../emojis');

const hasRoleToRoll = (member) => {
    const allowedRoles = ['Lắc Bầu Cua', 'set host'];
    return member.roles.cache.some(role => allowedRoles.includes(role.name));
};

module.exports = async (message, isDitMe) => {
    if (!hasRoleToRoll(message.member)) {
        return message.channel.send("<a:canhbao:1302598129300013116> Bạn cần quyền `Lắc Bầu Cua` hoặc `set host`!");
    }

    try {
        const initialMessage = await message.channel.send('<a:lac:1302884217503612939> <a:lac:1302884217503612939> <a:lac:1302884217503612939>');
        const rollingMessage = await message.channel.send('**<a:danglac:1302588793202671616> Đang lắc Bầu Cua...**');
        const finalResults = [null, null, null];
        let rollCount = 0;

        const rollingInterval = setInterval(async () => {
            finalResults[rollCount] = rollBauCua(isDitMe);
            const bauCuaEmojisString = finalResults.map(result => result ? bauCuaEmojis[result] : '<a:lac:1302884217503612939>').join(' ');
            await initialMessage.edit(bauCuaEmojisString);
            rollCount++;

            if (rollCount >= 3) {
                clearInterval(rollingInterval);
                const resultsString = finalResults.join('<a:cham:1302892048671707207>'); // Kết quả cuối cùng
                await rollingMessage.edit(`**<a:money:1302576106435645491> ${resultsString} <a:money:1302576106435645491>**`);
                
                // Thêm log cho lệnh
                console.log(`Lệnh bởi ${message.author.tag}: Kết quả Bầu Cua: ${finalResults.join(', ')}`);
            }
        }, 2000);
    } catch (error) {
        console.error('Lỗi khi xử lý Bầu Cua:', error);
        await message.channel.send('Đã xảy ra lỗi khi lắc bầu cua!');
    }
};
