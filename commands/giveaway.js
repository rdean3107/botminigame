const { EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
    name: 'ga',
    description: 'Tạo giveaway và chọn người thắng cuộc.',
    async execute(message, args) {
        const { channel } = message;

        // Kiểm tra quyền
        if (!message.member.permissions.has('MANAGE_GUILD')) {
            return message.reply('Bạn không có quyền quản lý server để tạo giveaway!');
        }

        // Kiểm tra cú pháp lệnh
        if (args.length < 3) {
            return message.reply('Vui lòng cung cấp đầy đủ thông tin. Cú pháp: `!ga <thời gian> <số người thắng> <giải thưởng>`');
        }

        const time = ms(args[0]);
        const winners = parseInt(args[1]);
        const prize = args.slice(2).join(' ');

        if (isNaN(time) || time <= 0) {
            return message.reply('Thời gian không hợp lệ! Vui lòng sử dụng định dạng như `1s`, `1m`, `1h`, `1d`.');
        }

        if (isNaN(winners) || winners <= 0) {
            return message.reply('Số người thắng cuộc không hợp lệ!');
        }

        const endTime = Date.now() + time;
        const endDate = new Date(endTime);
        const now = new Date();
        const isTomorrow = endDate.toDateString() !== now.toDateString();
        const timeString = isTomorrow
            ? `Ngày mai lúc ${endDate.getHours()}:${endDate.getMinutes().toString().padStart(2, '0')}`
            : `Hôm nay lúc ${endDate.getHours()}:${endDate.getMinutes().toString().padStart(2, '0')}`;

        // Gửi embed
        const giveawayEmbed = new EmbedBuilder()
            .setTitle(prize)
            .setDescription(`
                Bấm: <a:kh_hun:1239924970188967946> để tham gia giveaway!
                Thời gian còn lại: ${ms(time, { long: true })}
                Làm bởi: ${message.author.tag}
                ${winners} giải • ${timeString}
            `)
            .setColor('#FF0000')
            .setThumbnail(message.author.displayAvatarURL());

        try {
            const giveawayMessage = await channel.send({ embeds: [giveawayEmbed] });
            await giveawayMessage.react('<a:kh_hun:1239924970188967946>');

            // Xử lý kết quả sau khi hết thời gian
            setTimeout(async () => {
                try {
                    const reactions = giveawayMessage.reactions.cache.get('1239924970188967946');
                    if (!reactions) {
                        return channel.send('Không có ai tham gia giveaway!');
                    }

                    const users = await reactions.users.fetch();
                    const participants = users.filter(user => !user.bot).map(user => user.id);
                    if (participants.length === 0) {
                        return channel.send('Không có ai tham gia hợp lệ!');
                    }

                    const selectedWinners = participants.sort(() => 0.5 - Math.random()).slice(0, winners);
                    const winnersText = selectedWinners.map(id => `<@${id}>`).join(', ');

                    channel.send(`🎉 Chúc mừng ${winnersText}! Bạn đã trúng **${prize}** 🎉`);
                } catch (error) {
                    console.error('Lỗi khi chọn người thắng:', error);
                    channel.send('Đã xảy ra lỗi khi chọn người thắng!');
                }
            }, time);

        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn hoặc thêm reaction:', error);
            message.reply('Đã xảy ra lỗi khi tạo giveaway. Vui lòng thử lại.');
        }
    },
};
