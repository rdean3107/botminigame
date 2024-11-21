const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    name: 'voice',
    description: 'Lệnh để bot tham gia và rời khỏi voice channel.',

    async execute(message) {
        // Lệnh "!join" để bot tham gia voice channel
        if (message.content === '!join') {
            if (message.member.voice.channel) {
                try {
                    joinVoiceChannel({
                        channelId: message.member.voice.channel.id,
                        guildId: message.guild.id,
                        adapterCreator: message.guild.voiceAdapterCreator,
                    });
                    message.reply('Đã tham gia voice channel!');
                } catch (error) {
                    console.error('Lỗi khi tham gia voice channel:', error);
                    message.reply('Không thể tham gia voice channel, vui lòng thử lại.');
                }
            } else {
                message.reply('Bạn cần vào một voice channel trước!');
            }
        }
        // Lệnh "!leave" để bot rời khỏi voice channel
        else if (message.content === '!leave') {
            const voiceChannel = message.member.voice.channel;
            if (voiceChannel) {
                const connection = getVoiceConnection(message.guild.id);
                if (connection) {
                    try {
                        connection.destroy();
                        message.reply('Đã rời khỏi voice channel!');
                    } catch (error) {
                        console.error('Lỗi khi rời khỏi voice channel:', error);
                        message.reply('Không thể rời khỏi voice channel, vui lòng thử lại.');
                    }
                } else {
                    message.reply('Bot không ở trong voice channel nào.');
                }
            } else {
                message.reply('Bạn cần ở trong một voice channel để sử dụng lệnh này.');
            }
        }
    },
};
