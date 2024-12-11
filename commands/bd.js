const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

// Danh sách toàn cầu lưu trữ người tham gia
let globalParticipants = new Map();

// Các emoji được sử dụng trong trò chơi
const emojis = [
    "<a:1317knifeduck:1282378375045971988>", "<a:1030471081833812068ezgif:1313459874331492363>",
    "<a:2653kittypaw:1281794652630155326>", "<a:3064meongdrink:1289610165829763093>", "<a:3534_Dance_HK:1289625183199559793>",
    "<a:4221bobacat:1281774359299625095>", "<a:5473pianojump:1289610278144708649>", "<a:6026bunnycrazy:1289625218763063367>",
    "<a:6540hellokittybow:1289625220767809549>", "<a:emoji_54:1284871280570662952>", "<a:emoji_53:1284871154997137460>",
    "<a:meongfacetable70:1285599349241544830>", "<a:rgshybunnycute:1285599402425188432>", "<a:rose_bearsleep:1285599405965054056>"
];

// Mảng màu pastel ngẫu nhiên dùng để tạo màu cho embed
const pastelColors = [ 0xff7f8b];
const randomPastelColor = () => pastelColors[Math.floor(Math.random() * pastelColors.length)];

// Các quy tắc tính toán kết quả của các cược
const outcomeRules = {
    "tài lẻ": { "tài lẻ": 1, "xỉu chẵn": -1, "tài chẵn": 0, "xỉu lẻ": 0},
    "tài chẵn": { "tài chẵn": 1, "xỉu lẻ": -1, "tài lẻ": 0, "xỉu chẵn":0},
    "xỉu lẻ": { "xỉu lẻ": 1, "tài chẵn": -1, "tài lẻ": 0, "xỉu chẵn ": 0 },
    "xỉu chẵn": { "xỉu chẵn": 1, "tài lẻ": -1, "xỉu lẻ": 0, "tài chẵn": 0 },
    tài: { tài: 1, "tài lẻ": 1, "tài chẵn": 1, xỉu: -1, "xỉu lẻ": -1, "xỉu chẵn": -1 },
    xỉu: { xỉu: 1, "xỉu lẻ": 1, "xỉu chẵn": 1, tài: -1, "tài lẻ": -1, "tài chẵn": -1 },
    lẻ: { lẻ: 1, "tài lẻ": 1, "tài chẵn": -1, chẵn: -1, "xỉu lẻ": 1, "xỉu chẵn": -1 },
    chẵn: { chẵn: 1, "xỉu lẻ": -1, "xỉu chẵn": 1, lẻ: -1, "tài lẻ": -1, "tài chẵn": 1 },
    bầu: { bầu: 1, cua: -1, tôm: -1, cá: -1, gà: -1, nai: -1 },
    cua: { cua: 1, bầu: -1, tôm: -1, cá: -1, gà: -1, nai: -1 },
    tôm: { tôm: 1, bầu: -1, cua: -1, cá: -1, gà: -1, nai: -1 },
    cá: { cá: 1, bầu: -1, cua: -1, tôm: -1, gà: -1, nai: -1 },
    gà: { gà: 1, bầu: -1, cua: -1, tôm: -1, cá: -1, nai: -1 },
    nai: { nai: 1, bầu: -1, cua: -1, tôm: -1, cá: -1, gà: -1 },
};

module.exports = {
    name: "playgame",
    description: "Tạo trò chơi tài xỉu với danh sách người tham gia và đặt cược.",
    execute: async (message) => {
        // Kiểm tra quyền của người sử dụng
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply({ content: "Bạn cần quyền quản lý tin nhắn để sử dụng lệnh này.", ephemeral: true });
        }

        // Biến trạng thái trò chơi
        let gameActive = true; // Trò chơi bắt đầu, mặc định là đang chơi
        let participants = globalParticipants.size > 0 ? globalParticipants : new Map();

        // Hàm cập nhật danh sách người tham gia
        const updateParticipantEmbed = () => {
            const participantList = Array.from(participants.values()).map(
                ({ username, balance, choice = "", bet = 0 }) =>
                    `${emojis[Math.floor(Math.random() * emojis.length)]} <@${username}> - Số dư: **${balance}** - Cược: **${bet}** vào **${choice.toUpperCase() || "Chưa chọn"}**`
            ).join("\n");

            return new EmbedBuilder()
                .setTitle("🎮 Danh sách người chơi")
                .setDescription(participantList || "Chưa có ai tham gia! Hãy tham gia ngay nào!")
                .setColor(randomPastelColor())
                .setFooter({ text: `Người tạo: ${message.author.tag}` })
                .setTimestamp();
        };

        // Gửi lời mời tham gia trò chơi
        const introEmbed = new EmbedBuilder()
            .setTitle("🎮 **Tham gia trò chơi ngay!**")
            .setDescription(
                `${emojis[Math.floor(Math.random() * emojis.length)]} **Bấm vào nút "Tham gia" dưới đây** để tham gia trò chơi và đặt cược ngay!\n\n**Các loại cược có sẵn**:\n\n- Tài Xỉu: **Tài** hoặc **Xỉu**\n- Tài Xỉu Chẵn Lẻ: **Tài Chẵn**, **Tài Lẻ**, **Xỉu Chẵn**, **Xỉu Lẻ**\n- Bầu Cua Tôm Cá Gà Nai: **Bầu**, **Cua**, **Tôm**, **Cá**, **Gà**, **Nai**\n\nChúc bạn may mắn!`,
            )
            .setColor(randomPastelColor())
            .setFooter({ text: `Người tạo: ${message.author.tag}` })
            .setTimestamp();

        // Tạo các nút bấm để tham gia trò chơi hoặc kết thúc trò chơi
        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("join_game").setLabel("Tham gia ngay!").setStyle(ButtonStyle.Secondary).setEmoji("<a:7087pinkpandawave:1289625225130020936>"),
            new ButtonBuilder().setCustomId("end_game").setLabel("Kết thúc").setStyle(ButtonStyle.Secondary).setEmoji("<a:rgshybunnycute:1285599402425188432>"),
            new ButtonBuilder().setCustomId("set_balance").setLabel("Set Số Dư").setStyle(ButtonStyle.Secondary).setEmoji("<:money:1315658278688129084>") // Nút Set Số Dư
        );

        // Gửi thông báo mời tham gia trò chơi
        let gameMessage = await message.channel.send({ embeds: [introEmbed], components: [actionRow] });

        const collector = gameMessage.createMessageComponentCollector({ time: 0 });

        // Xử lý khi có người tham gia hoặc kết thúc trò chơi
        collector.on("collect", async (interaction) => {
            const { user } = interaction;
        
            if (interaction.customId === "join_game") {
                if (!gameActive) {
                    return interaction.reply({ content: "Trò chơi đã kết thúc. Không thể tham gia nữa.", ephemeral: true });
                }
        
                if (!participants.has(user.id)) {
                    participants.set(user.id, { username: user.id, balance: 0, choice: "", bet: 0 });
                }
        
                // Cập nhật danh sách người chơi
                await gameMessage.edit({ embeds: [introEmbed, updateParticipantEmbed()], components: [actionRow] });
        
                const joinMessage = await interaction.reply({
                    content: 'Bạn đã tham gia trò chơi! Vui lòng nhập số tiền cược và loại cược (ví dụ: "300 tài", "1000 xỉu", "500 tài chẵn", "200 bầu", "100 cua").',
                    ephemeral: true,
                });
        
                setTimeout(() => joinMessage.delete().catch(() => {}), 10000);
        
                // Lọc và xử lý thông tin cược của người chơi
                const filter = (response) => response.author.id === user.id && response.content.match(/^\d+\s+(tài|xỉu|lẻ|chẵn|tài\s+chẵn|tài\s+lẻ|xỉu\s+chẵn|xỉu\s+lẻ|bầu|cua|tôm|cá|gà|nai)$/i);
                const collectorMessage = message.channel.createMessageCollector({ filter, time: 20000 }); // 20s để nhập cược
        
                collectorMessage.on("collect", (betMessage) => {
                    const [betAmount, ...choiceParts] = betMessage.content.split(" ");
                    const choice = choiceParts.join(" ").toLowerCase();
                    const player = participants.get(user.id);
        
                    // Cập nhật lựa chọn và số tiền cược của người chơi
                    player.choice = choice;
                    player.bet = parseInt(betAmount, 10);
        
                    gameMessage.edit({ embeds: [introEmbed, updateParticipantEmbed()], components: [actionRow] });
        
                    betMessage.reply({ content: "Cược của bạn đã được ghi nhận!", ephemeral: true }).then((response) => {
                        setTimeout(() => response.delete().catch(() => {}), 3000);
                    });
        
                    collectorMessage.stop();
                });
        
                collectorMessage.on("end", (collected, reason) => {
                    if (reason === "time") {
                        // Nếu hết thời gian mà không có cược
                        interaction.followUp({
                            content: "Bạn đã hết thời gian để nhập cược. Không có cược được ghi nhận.",
                            ephemeral: true,
                        });
                    }
                });
            }
        
            if (interaction.customId === "end_game") {
                if (interaction.user.id !== message.author.id) {
                    return interaction.reply({ content: "Chỉ người tạo trò chơi mới có quyền kết thúc trò chơi!", ephemeral: true });
                }

                // Đặt gameActive thành false khi kết thúc trò chơi
                gameActive = false;

                const resultMessage = await interaction.reply({
                    content: "Vui lòng nhập kết quả cuối cùng (ví dụ: tài, xỉu, tài chẵn, bầu, cua, tôm).",
                    ephemeral: true,
                });

                setTimeout(() => resultMessage.delete().catch(() => {}), 5000);

                // Lọc kết quả và tính toán số dư của người chơi
                const filter = (response) =>
                    response.author.id === interaction.user.id && response.content.match(/^(tài|xỉu|lẻ|chẵn|tài\s+chẵn|tài\s+lẻ|xỉu\s+chẵn|xỉu\s+lẻ|bầu|cua|tôm|cá|gà|nai)$/i);

                const resultCollector = message.channel.createMessageCollector({ filter, max: 1 });

                resultCollector.on("collect", async (resultMessage) => {
                    const winningChoice = resultMessage.content.toLowerCase();
                
                    // Cập nhật số dư người chơi theo kết quả
                    participants.forEach((data) => {
                        const { bet, choice } = data;
                        const result = outcomeRules[choice] ? outcomeRules[choice][winningChoice] : 0;
                
                        if (result === 1) data.balance += bet;
                        if (result === -1) data.balance -= bet;
                
                        data.choice = "";
                        data.bet = 0;
                    });
                
                    globalParticipants = participants;
                
                    // Gửi kết quả trò chơi
                    await message.channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("🎮 Kết quả trò chơi")
                                .setDescription(`<a:rgshybunnycute:1285599402425188432> ***Kết quả:*** **${winningChoice.toUpperCase()}**`)
                                .setColor(randomPastelColor())
                                .addFields({ name: "Người chơi", value: updateParticipantEmbed().data.description })
                                .setTimestamp(),
                        ],
                    });
                    // Xóa nút bấm sau khi kết thúc trò chơi
                    gameMessage.edit({ components: [] });
                });
    
            }
        
            if (interaction.customId === "set_balance") {
                if (user.id !== message.author.id) {
                    return interaction.reply({ content: "Chỉ người tạo trò chơi mới có thể thay đổi số dư!", ephemeral: true });
                }
        
                const filter = (response) => response.author.id === user.id && response.content.match(/^<@!?(\d+)> \d+$/);
                await interaction.reply({ content: 'Vui lòng tag người chơi và nhập số dư mới của họ (ví dụ: <@1234567890> 1000)', ephemeral: true })
    .then((msg) => {
        setTimeout(() => {
            msg.delete().catch(() => {}); // Xóa tin nhắn sau 5 giây
        }, 5000);
    });

        
                const collectorMessage = message.channel.createMessageCollector({ filter, time: 30000 });
        
                collectorMessage.on("collect", (msg) => {
                    const [, taggedUserId, newBalance] = msg.content.match(/^<@!?(\d+)> (\d+)$/);
                    const player = participants.get(taggedUserId); // Lấy người chơi theo ID
        
                    if (player) {
                        player.balance = parseInt(newBalance, 10); // Cập nhật số dư
                        msg.reply(`Số dư của <@${taggedUserId}> đã được cập nhật thành **${newBalance}**`);
                        gameMessage.edit({ embeds: [introEmbed, updateParticipantEmbed()], components: [actionRow] }); // Cập nhật lại danh sách người chơi
                    } else {
                        msg.reply(`Không tìm thấy người chơi với ID <@${taggedUserId}>`);
                    }
        
                    collectorMessage.stop();
                });
        
                collectorMessage.on("end", (collected, reason) => {
                    if (reason === "time") {
                        interaction.followUp({ content: "Bạn đã hết thời gian để thay đổi số dư.", ephemeral: true });
                    }
                });
            }
        });
        
    },
};
