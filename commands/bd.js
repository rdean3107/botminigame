const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

let gameActive = false; // Trạng thái trò chơi
let participants = new Map(); // Cập nhật lại danh sách người tham gia mỗi khi trò chơi mới bắt đầu

module.exports = {
    name: 'playgame',
    description: 'Tạo trò chơi tài xỉu với danh sách người tham gia và đặt cược.',
    execute: async (message) => {
        if (gameActive) {
            return message.reply('Lệnh tham gia đang được khởi tạo, vui lòng khởi tạo lại khi lệnh tham kết thúc.');
        }

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply('Bạn cần quyền quản lý tin nhắn để sử dụng lệnh này.');
        }

        // Đánh dấu trò chơi bắt đầu và thiết lập lại danh sách người tham gia
        gameActive = true;
        participants = new Map();  // Đặt lại danh sách người tham gia khi bắt đầu trò chơi mới

        // Cập nhật danh sách người tham gia
        const updateParticipantEmbed = () => {
            const participantList = Array.from(participants.values())
                .map(({ username, choice, bet }) => `- <@${username}> đã cược **${bet}** vào **${choice.toUpperCase()}**.`)
                .join('\n');

            return new EmbedBuilder()
                .setTitle('🎮 Danh sách người tham gia')
                .setDescription(participantList || 'Chưa có ai tham gia!')
                .setColor(0x00ff99)
                .setFooter({ text: `Người tạo: ${message.author.tag}` })
                .setTimestamp();
        };

        const introEmbed = new EmbedBuilder()
            .setTitle('🎮 Tham gia trò chơi ngay!')
            .setDescription('Nhấn vào nút **Tham gia** bên dưới để tham gia trò chơi và đặt cược.')
            .setColor(0x00ff99)
            .setFooter({ text: `Người tạo: ${message.author.tag}` })
            .setTimestamp();

        const joinButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('join_game')
                .setLabel('Tham gia')
                .setStyle(ButtonStyle.Primary),
        );

        const gameMessage = await message.channel.send({
            embeds: [introEmbed, updateParticipantEmbed()],
            components: [joinButton],
        });

        const countdownMessage = await message.channel.send("<a:emoji_57:1284871363034611742> Thời gian tham gia: 60s");

        let countdown = 60; // Thời gian đếm ngược bắt đầu từ 60 giây

        // Hàm để cập nhật thời gian đếm ngược
        const updateCountdown = setInterval(async () => {
            if (countdown === 0) {
                clearInterval(updateCountdown);
                // Sau khi hết thời gian, chỉ cập nhật thông báo đếm ngược mà không cần thông báo kết thúc.
                await countdownMessage.edit("<a:emoji_57:1284871363034611742> Thời gian tham gia đã kết thúc!");
                await gameMessage.edit({ components: [] }); // Hủy các nút khi hết thời gian
                gameActive = false; // Đặt lại trạng thái trò chơi sau khi kết thúc
            } else {
                await countdownMessage.edit(`<a:emoji_57:1284871363034611742> Thời gian tham gia: ${countdown}s`);
                countdown--;
            }
        }, 1000); // Cập nhật mỗi giây

        const collector = gameMessage.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (interaction) => {
            if (!interaction.isButton() || interaction.customId !== 'join_game') return;

            const { user } = interaction;
            if (participants.has(user.id)) {
                const replyMessage = await interaction.reply({ content: 'Bạn đã tham gia trò chơi rồi!', ephemeral: true });
                setTimeout(() => replyMessage.delete(), 3000); // Xóa tin nhắn sau 10 giây
                return;
            }

            // Yêu cầu người chơi nhập thông tin cược (số tiền và lựa chọn)
            const filter = (response) => response.author.id === user.id;
            const replyMessage = await interaction.reply({
                content: 'Vui lòng nhập số tiền cược và loại cược (ví dụ: "200 tài", "400 xỉu", "1000 bầu", "300 cua",...)',
                ephemeral: true,
            });

            setTimeout(() => replyMessage.delete(), 3000); // Xóa tin nhắn sau 10 giây

            // Thu thập câu trả lời của người chơi
            const collected = await message.channel.awaitMessages({
                filter,
                max: 1,
                time: 30000, // Thời gian chờ 30 giây
                errors: ['time'],
            });

            const betMessage = collected.first().content.trim().toLowerCase();
            const betParts = betMessage.split(' ');

            if (betParts.length !== 2) {
                const errorMessage = await interaction.followUp({ content: 'Định dạng không đúng. Vui lòng nhập đúng cú pháp: "Số tiền cược Loại cược" (ví dụ: "200 tài").', ephemeral: true });
                setTimeout(() => errorMessage.delete(), 3000); // Xóa tin nhắn sau 10 giây
                return;
            }

            const betAmount = parseInt(betParts[0], 10);
            const betChoice = betParts[1];

            // Kiểm tra số tiền cược hợp lệ
            if (isNaN(betAmount) || betAmount <= 0) {
                const errorMessage = await interaction.followUp({ content: 'Số tiền cược không hợp lệ!', ephemeral: true });
                setTimeout(() => errorMessage.delete(), 3000); // Xóa tin nhắn sau 10 giây
                return;
            }

            // Kiểm tra loại cược hợp lệ
            const validChoices = ['tài', 'xỉu', 'lẻ', 'chẵn', 'bầu', 'cua', 'tôm', 'cá', 'gà', 'nai'];
            if (!validChoices.includes(betChoice)) {
                const errorMessage = await interaction.followUp({ content: 'Lựa chọn cược không hợp lệ! Vui lòng chọn một trong các loại: tài, xỉu, lẻ, chẵn, bầu, cua, tôm, cá, gà, nai.', ephemeral: true });
                setTimeout(() => errorMessage.delete(), 3000); // Xóa tin nhắn sau 10 giây
                return;
            }

            // Lưu người tham gia và cược
            participants.set(user.id, { username: user.id, bet: betAmount, choice: betChoice });

            // Cập nhật danh sách người tham gia và tag người chơi vào embed
            await gameMessage.edit({ embeds: [introEmbed, updateParticipantEmbed()] });

            // Xóa tin nhắn nhập cược sau khi xử lý xong
            await collected.first().delete();
        });
    },
};
