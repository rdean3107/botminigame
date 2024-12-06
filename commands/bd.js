const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

let gameActive = false; // Trạng thái trò chơi
let participants = new Map(); // Cập nhật lại danh sách người tham gia mỗi khi trò chơi mới bắt đầu

const emojis = [
    '<a:1317knifeduck:1282378375045971988>',
    '<a:1030471081833812068ezgif:1313459874331492363>',
    '<a:2653kittypaw:1281794652630155326>',
    '<a:3064meongdrink:1289610165829763093>',
    '<a:3534_Dance_HK:1289625183199559793>',
    '<a:4221bobacat:1281774359299625095>',
    '<a:5473pianojump:1289610278144708649>',
    '<a:6026bunnycrazy:1289625218763063367>',
    '<a:6540hellokittybow:1289625220767809549>',
    '<a:emoji_54:1284871280570662952>',
    '<a:emoji_53:1284871154997137460>',
    '<a:meongfacetable70:1285599349241544830>',
    '<a:rgshybunnycute:1285599402425188432>',
    '<a:rose_bearsleep:1285599405965054056>',
];

// Mảng các màu pastel đậm nhạt
const pastelColors = [
   0xA1C6D7, // Pastel blue
    0x7A9BBA, // Light pastel blue
    0xA1D98C, // Pastel green
    0xFF7F8B, // Light pastel pink
    0xFF9A9A, // Light pastel red
    0xFFE16A, // Pastel yellow
];

const randomPastelColor = () => {
    return pastelColors[Math.floor(Math.random() * pastelColors.length)];
};

module.exports = {
    name: 'playgame',
    description: 'Tạo trò chơi tài xỉu với danh sách người tham gia và đặt cược.',
    execute: async (message) => {
        if (gameActive) {
            return message.reply('Lệnh tham gia đang được khởi tạo, vui lòng thử lại sau khi kết thúc lệnh hiện tại.');
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
                .map(({ username, choice, bet }) => `${emojis[Math.floor(Math.random() * emojis.length)]} <@${username}> cược **${bet}** vào **${choice.toUpperCase()}**.`)
                .join('\n');

            return new EmbedBuilder()
                .setTitle('🎮 Danh sách người tham gia')
                .setDescription(participantList || 'Chưa có ai tham gia! Hãy tham gia ngay nào!')
                .setColor(randomPastelColor())  // Random màu pastel cho embed
                .setFooter({ text: `Người tạo: ${message.author.tag}` })
                .setTimestamp()
                .setThumbnail('https://cdn.discordapp.com/attachments/1284728005012361276/1314621830933381142/image.png?ex=6754707c&is=67531efc&hm=a45c0a4832a3f38dd27588b746c3fbf17a2b6a5486e104d87c3dd88eb5ad3c9f&')
        };

        // Embed giới thiệu trò chơi với chú thích và emoji ngẫu nhiên
        const introEmbed = new EmbedBuilder()
            .setTitle('🎮 **Tham gia trò chơi ngay!**')
            .setDescription(`${emojis[Math.floor(Math.random() * emojis.length)]} **Bấm vào nút "Tham gia" dưới đây** để tham gia trò chơi và đặt cược ngay!\n\nChúc bạn may mắn!`)
            .setColor(randomPastelColor())  // Random màu pastel cho embed
            .setThumbnail(message.guild.iconURL())  // Thumbnail là avatar của server
            .setFooter({ text: `Người tạo: ${message.author.tag}` })
            .setTimestamp();

        const joinButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('join_game')
                .setLabel('Tham gia ngay!')
                .setStyle(ButtonStyle.Secondary)  // Màu xanh lá cây
                .setEmoji('🎮')
        );

        const gameMessage = await message.channel.send({
            embeds: [introEmbed],
            components: [joinButton],
        });

        const countdownMessage = await message.channel.send("<a:emoji_57:1284871363034611742> **Thời gian tham gia**: 60s");

        let countdown = 60; // Thời gian đếm ngược bắt đầu từ 60 giây

        // Hàm để cập nhật thời gian đếm ngược
        const updateCountdown = setInterval(async () => {
            if (countdown === 0) {
                clearInterval(updateCountdown);
                // Sau khi hết thời gian, chỉ cập nhật thông báo đếm ngược mà không cần thông báo kết thúc.
                await countdownMessage.edit("<a:emoji_57:1284871363034611742> **Thời gian tham gia đã kết thúc!**");
                await gameMessage.edit({ components: [] }); // Hủy các nút khi hết thời gian
                gameActive = false; // Đặt lại trạng thái trò chơi sau khi kết thúc

                // Xóa tất cả các embed cũ
                await gameMessage.delete();

                // Tạo một tin nhắn mới để chỉ chứa danh sách người tham gia
                await message.channel.send({ embeds: [updateParticipantEmbed()] });

            } else {
                await countdownMessage.edit(`<a:emoji_57:1284871363034611742> **Thời gian tham gia**: ${countdown}s`);
                countdown--;
            }
        }, 1000); // Cập nhật mỗi giây

        const collector = gameMessage.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (interaction) => {
            if (!interaction.isButton() || interaction.customId !== 'join_game') return;

            const { user } = interaction;
            if (participants.has(user.id)) {
                const reply = await interaction.reply({ content: 'Bạn đã tham gia trò chơi rồi!', ephemeral: true });

                // Xóa tin nhắn sau 5 đến 8 giây
                const randomTimeout = Math.floor(Math.random() * (8000 - 5000 + 1)) + 5000;  // Từ 5000ms đến 8000ms
                setTimeout(() => reply.delete(), randomTimeout);
                return;
            }

            // Yêu cầu người chơi nhập thông tin cược
            const filter = (response) => response.author.id === user.id;
            const reply = await interaction.reply({
                content: '📝 **Vui lòng nhập số tiền cược và loại cược** (ví dụ: "200 tài", "400 xỉu", "1000 bầu", "300 cua",...)',
                ephemeral: true,  // Tin nhắn sẽ mất sau 5 đến 8 giây
            });

            // Xóa tin nhắn yêu cầu nhập cược sau 5 đến 8 giây (không xóa thông báo lỗi)
            const randomTimeout = Math.floor(Math.random() * (8000 - 5000 + 1)) + 5000;  // Từ 5000ms đến 8000ms
            setTimeout(() => reply.delete(), randomTimeout);

            let validBet = false;
            let betAmount, betChoice;

            // Lặp lại quá trình nhập cược nếu cược không hợp lệ
            while (!validBet) {
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
                    // Chỉ hiển thị thông báo này khi cú pháp không đúng
                    const invalidReply = await interaction.followUp({ content: '❌ **Định dạng không đúng!**\nVui lòng nhập đúng cú pháp: "Số tiền cược Loại cược" (ví dụ: "200 tài").', ephemeral: true });
                    // Không xóa thông báo lỗi định dạng
                    continue;
                }

                betAmount = parseInt(betParts[0], 10);
                betChoice = betParts[1];

                // Kiểm tra số tiền cược hợp lệ
                if (isNaN(betAmount) || betAmount <= 0) {
                    const invalidBetReply = await interaction.followUp({ content: '❌ **Số tiền cược không hợp lệ!**', ephemeral: true });
                    // Không xóa thông báo lỗi số tiền cược
                    continue;
                }

                // Kiểm tra loại cược hợp lệ
                const validChoices = ['tài', 'xỉu', 'lẻ', 'chẵn', 'bầu', 'cua', 'tôm', 'cá', 'gà', 'nai'];
                if (!validChoices.includes(betChoice)) {
                    const invalidChoiceReply = await interaction.followUp({ content: '❌ **Lựa chọn cược không hợp lệ!**\nVui lòng chọn một trong các loại: tài, xỉu, lẻ, chẵn, bầu, cua, tôm, cá, gà, nai.', ephemeral: true });
                    // Không xóa thông báo lỗi lựa chọn cược
                    continue;
                }

                // Nếu tất cả hợp lệ, thoát khỏi vòng lặp
                validBet = true;

                // Lưu người tham gia và cược
                participants.set(user.id, { username: user.id, bet: betAmount, choice: betChoice });

                // Cập nhật danh sách người tham gia
                await gameMessage.edit({ embeds: [introEmbed, updateParticipantEmbed()] });

                // Xóa tin nhắn nhập cược sau khi xử lý xong
                await collected.first().delete();
            }
        });
    },
};
