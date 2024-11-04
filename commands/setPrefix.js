const handlePing = require('../commands/ping');
const handleSetPrefix = require('../commands/setPrefix');
const handleTaiXiu = require('../commands/taiXiu');
const handleBauCua = require('../commands/bauCua');

const onMessageCreate = (message, config) => {
    if (message.author.bot) return;

    const guildId = message.guild.id;
    const args = message.content.trim().split(/ +/g);
    const prefix = config[guildId]?.prefix || 'z';
    const isDitMe = message.content.toLowerCase().includes('ditme');
    const isDuma = message.content.toLowerCase().includes('duma');

    if (args[0].toLowerCase() === `${prefix}ping`) handlePing(message);
    else if (args[0].toLowerCase() === `${prefix}setprefix`) handleSetPrefix(message, args, config);
    else if (args[0].toLowerCase() === `${prefix}tx`) handleTaiXiu(message, isDitMe, isDuma);
    else if (args[0].toLowerCase() === `${prefix}bc`) handleBauCua(message, isDitMe);
};

module.exports = { onMessageCreate };
