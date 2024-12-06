const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

let gameActive = false; // Trạng thái trò chơi
let participants = new Map(); // Cập nhật lại danh sách người tham gia mỗi khi trò chơi mới bắt đầu

module.exports = {
    name: 'playgame',
    description: 'Tạo trò chơi tài xỉu với danh sách người tham gia và đặt cược.',
    execute: async (message) => {
        if (gameActive) {
            return message.reply('Lệnh tham gia đang được khởi tạo, vui lòng khởi tạo lại khi lệnh tham gia kết thúc.');
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
                return interaction.reply({ content: 'Bạn đã tham gia trò chơi rồi!', ephemeral: true });
            }

            // Hiển thị Modal để đặt cược
            const betModal = new ModalBuilder()
                .setCustomId('bet_modal')
                .setTitle('Đặt cược')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('bet_amount')
                            .setLabel('Số tiền cược')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true),
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('bet_choice')
                            .setLabel('Chọn Tài, Xỉu, Chẵn, Lẻ hoặc Bầu, Cua...')
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true),
                    ),
                );

            await interaction.showModal(betModal);
        });

        // Lắng nghe các Modal Submit
        message.client.on('interactionCreate', async (interaction) => {
            if (!interaction.isModalSubmit() || interaction.customId !== 'bet_modal') return;

            const { user } = interaction;
            const betAmount = interaction.fields.getTextInputValue('bet_amount');
            const betChoice = interaction.fields.getTextInputValue('bet_choice').trim().toLowerCase();

            // Kiểm tra lựa chọn hợp lệ
            const validChoices = ['tài', 'xỉu', 'chẵn', 'lẻ', 'bầu', 'cua', 'tôm', 'cá', 'gà', 'nai'];
            if (!validChoices.includes(betChoice)) {
                return interaction.reply({ content: 'Lựa chọn không hợp lệ. Bạn chỉ có thể chọn "Tài", "Xỉu", "Chẵn", "Lẻ", "Bầu", "Cua", "Tôm", "Cá", "Gà", "Nai".', ephemeral: true });
            }

            // Kiểm tra số tiền cược hợp lệ
            const parsedBet = parseInt(betAmount, 10);
            if (isNaN(parsedBet) || parsedBet <= 0) {
                return interaction.reply({ content: 'Số tiền cược không hợp lệ!', ephemeral: true });
            }

            // Lưu người tham gia và đặt cược
            participants.set(user.id, { username: user.id, bet: parsedBet, choice: betChoice });

            // Cập nhật danh sách người tham gia
            await gameMessage.edit({ embeds: [introEmbed, updateParticipantEmbed()] });

            // Đảm bảo chỉ deferUpdate một lần và tránh lỗi Interaction đã được xử lý
            if (!interaction.replied) {
                await interaction.deferUpdate();
            }
        });
    },
};
