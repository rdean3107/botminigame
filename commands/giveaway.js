const { EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
    name: 'ga',
    description: 'Tạo giveaway và chọn người thắng cuộc.',
    async execute(message, args) {
        const { guild, channel } = message;

        // Kiểm tra nếu người dùng có quyền quản lý server
        if (!message.member.permissions.has('MANAGE_GUILD')) {
            return message.reply('Bạn không có quyền quản lý server để tạo giveaway!');
        }

        // Kiểm tra cú pháp lệnh
        if (args.length < 3) {
            return message.reply('Vui lòng cung cấp đầy đủ thông tin. Cú pháp: `!ga <thời gian> <số người thắng> <giải thưởng>`');
        }

        const timeInput = args[0];  // Thời gian giveaway (sử dụng chuỗi có đơn vị như 1s, 1m, 1h, 1d)
        const winners = parseInt(args[1]);  // Số người thắng cuộc
        const prize = args.slice(2).join(' ');  // Giải thưởng của giveaway

        // Kiểm tra số người thắng cuộc
        if (isNaN(winners) || winners <= 0) {
            return message.reply('Số người thắng cuộc không hợp lệ!');
        }

        // Hàm chuyển đổi thời gian
        const parseTime = (timeStr) => {
            const regex = /^(\d+)([smhd])$/;
            const match = timeStr.match(regex);
            if (!match) return NaN;

            const amount = parseInt(match[1]);
            const unit = match[2];

            switch (unit) {
                case 's': return amount * 1000; // giây
                case 'm': return amount * 60 * 1000; // phút
                case 'h': return amount * 60 * 60 * 1000; // giờ
                case 'd': return amount * 24 * 60 * 60 * 1000; // ngày
                default: return NaN;
            }
        };

        // Chuyển đổi thời gian và kiểm tra tính hợp lệ
        const time = parseTime(timeInput);
        if (isNaN(time) || time <= 0) {
            return message.reply('Thời gian giveaway không hợp lệ! Hãy sử dụng định dạng hợp lệ như 1s, 1m, 1h, hoặc 1d.');
        }

        // Tính toán thời gian kết thúc
        const endTime = Date.now() + time;
        const endDate = new Date(endTime);

        // Tính toán xem giveaway kết thúc vào ngày mai hay hôm nay
        const isTomorrow = endDate.getDate() !== new Date().getDate();
        const timeString = isTomorrow ? `Ngày mai lúc ${endDate.getHours()}:${endDate.getMinutes() < 10 ? '0' + endDate.getMinutes() : endDate.getMinutes()}` : `Hôm nay lúc ${endDate.getHours()}:${endDate.getMinutes() < 10 ? '0' + endDate.getMinutes() : endDate.getMinutes()}`;

        // Gửi dòng trang trí trước embed
        message.channel.send('<a:kh_laplanh:1258677300866842755><a:kh_duoi1:1247720973642498170> **GIVEAWAYS** <a:kh_duoi2:1247720919397433495><a:kh_laplanh:1258677300866842755>');
        
        const giveawayEmbed = new EmbedBuilder()
        .setTitle(`${prize}`) // Đảm bảo sử dụng dấu backtick ` để hiển thị giá trị prize trong title
        .setDescription(`
        Bấm: <a:kh_hun:1239924970188967946> để tham gia giveaway!
        <a:kh_hun:1239924970188967946>・Kết thúc trong: ${ms(time, { long: true })}
        <a:kh_hun:1239924970188967946>・Làm bởi: ${message.author.tag}
        ${winners} giải • ${timeString}
        `)
        .setColor('#FF0000') // Màu đỏ hoặc bất kỳ mã màu nào bạn muốn
        .setThumbnail(message.author.displayAvatarURL()) // Lấy ảnh đại diện của người tạo giveaway
        
        // Gửi tin nhắn giveaway
        const giveawayMessage = await channel.send({
            embeds: [giveawayEmbed],
        });

        // React với emoji để người dùng tham gia giveaway
        await giveawayMessage.react('<a:kh_hun:1239924970188967946>');

        // Xử lý khi hết thời gian giveaway
        setTimeout(async () => {
            const reactions = await giveawayMessage.reactions.cache.get('1239924970188967946'); // ID emoji của bạn
            if (reactions) {
                // Lấy người tham gia từ reaction
                const users = await reactions.users.fetch();
                const winnerArray = Array.from(users.values());
                // Lọc ra người trúng thưởng (loại bỏ bot)
                const winnersList = winnerArray.filter(user => !user.bot);
                const winnersText = winnersList.slice(0, winners).map(user => `<@${user.id}>`).join(', ') || 'Không có người tham gia';

                // Thông báo kết quả bằng văn bản (text)
                message.channel.send(
                    `<a:kh_hun:1239924970188967946> Chúc mừng ${winnersText}! đã trúng **${prize}**`
                );
            } else {
                message.channel.send('Không có ai tham gia giveaway!');
            }
        }, time);  // Thời gian chờ đến khi giveaway kết thúc
    },
};
