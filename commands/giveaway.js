const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const ms = require('ms');

module.exports = {
    name: 'giveaway',
    description: 'Tạo một giveaway với phần thưởng, thời gian và số lượng người thắng cuộc.',
    execute: async (message, args) => {
        // Kiểm tra quyền hạn của người dùng
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('Bạn không có quyền quản lý tin nhắn để tạo giveaway.');
        }

        // Kiểm tra và xử lý các tham số
        if (args.length < 3) {
            return message.reply('Cần cung cấp đủ thông tin hợp lệ: thời gian (ví dụ: 10s), số người thắng và phần thưởng.');
        }

        // Loại bỏ prefix 'xga' khỏi tham số đầu vào
        args.shift(); // Loại bỏ prefix 'xga'

        // Tách tham số từ args
        const [timeInput, winnerCountInput, ...prizeArray] = args;
        const prize = prizeArray.join(" "); // Kết hợp các phần thưởng lại thành một chuỗi
        const winnerCount = parseInt(winnerCountInput);
        const time = ms(timeInput); // Chuyển đổi thời gian sang milliseconds

        // Log các giá trị để kiểm tra
        console.log('Thời gian:', timeInput);
        console.log('Số người thắng:', winnerCountInput);
        console.log('Phần thưởng:', prize);

        // Kiểm tra tính hợp lệ của các tham số
        if (!time || isNaN(time) || time <= 0) {
            return message.reply('Thời gian không hợp lệ, vui lòng cung cấp thời gian hợp lệ (ví dụ: 10s, 1m, 1h).');
        }

        if (!winnerCount || isNaN(winnerCount) || winnerCount < 1) {
            return message.reply('Số người thắng không hợp lệ, vui lòng cung cấp số người thắng hợp lệ.');
        }

        if (!prize || prize.trim().length === 0) {
            return message.reply('Phần thưởng không thể trống.');
        }

        // Gửi thông báo trước khi tạo giveaway
        message.channel.send('<a:kh_laplanh:1258677300866842755><a:kh_duoi1:1247720973642498170> **GIVEAWAYS** <a:kh_duoi2:1247720919397433495><a:kh_laplanh:1258677300866842755>');

        // Tạo embed giveaway
        const giveawayEmbed = new EmbedBuilder()
            .setTitle(prize)
            .setDescription(`
                Bấm: <a:kh_hun:1239924970188967946> để tham gia giveaway!
                <a:kh_hun:1239924970188967946>・Kết thúc trong: ${ms(time, { long: true })}
                <a:kh_hun:1239924970188967946>・Làm bởi: ${message.author.tag}
                Số người thắng: ${winnerCount}
            `)
            .setColor('#FF0000')
            .setThumbnail(message.author.displayAvatarURL());

        // Gửi embed vào channel
        const giveawayMessage = await message.channel.send({ embeds: [giveawayEmbed] });

        // React với emoji để tham gia
        await giveawayMessage.react('<a:kh_hun:1239924970188967946>');

        // Xử lý khi giveaway kết thúc
        setTimeout(async () => {
            const reactions = await giveawayMessage.reactions.cache.get('1239924970188967946');
            if (reactions) {
                const users = await reactions.users.fetch();
                const participants = users.filter(user => !user.bot);
                const winnersList = participants.random(winnerCount);

                if (winnersList.length > 0) {
                    const winnersText = winnersList.map(user => `<@${user.id}>`).join(', ');
                    message.channel.send(`<a:kh_hun:1239924970188967946> Chúc mừng ${winnersText} đã trúng **${prize}**!`);
                } else {
                    message.channel.send('Không có người tham gia giveaway!');
                }
            } else {
                message.channel.send('Không có người tham gia giveaway!');
            }
        }, time);  // Đợi cho đến khi giveaway kết thúc
    },
};
