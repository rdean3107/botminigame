const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'voice',
    description: 'Lệnh để bot tham gia và rời khỏi voice channel.',

    async execute(message) {
        // Lệnh "!join" để bot tham gia voice channel
        if (message.content === '!join') {
            if (message.member.voice.channel) {
                try {
                    // Tham gia voice channel
                    const connection = joinVoiceChannel({
                        channelId: message.member.voice.channel.id,
                        guildId: message.guild.id,
                        adapterCreator: message.guild.voiceAdapterCreator,
                    });

                    // Tạo audio player và âm thanh tĩnh
                    const player = createAudioPlayer();
                    const resource = createAudioResource(path.join(__dirname, 'silence.ogg'), {
                        inputType: 0, // Đảm bảo định dạng âm thanh tĩnh
                    });

                    // Phát âm thanh tĩnh ngay khi bot vào channel
                    player.play(resource);
                    connection.subscribe(player);

                    // Lắng nghe khi player chuyển sang trạng thái Idle để phát lại âm thanh
                    player.on(AudioPlayerStatus.Idle, () => {
                        const resource = createAudioResource(path.join(__dirname, 'silence.ogg'));
                        player.play(resource);
                    });

                    message.reply('Đã tham gia voice channel và sẽ không tự động rời khỏi channel.');

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
                        connection.destroy(); // Rời khỏi voice channel
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
