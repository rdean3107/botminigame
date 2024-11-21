const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'voice',
    description: 'Lệnh để bot tham gia và rời khỏi voice channel.',

    async execute(message, action) {
        // Kiểm tra nếu người dùng đang ở trong voice channel
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply('Bạn cần vào một voice channel trước!');
        }

        const silencePath = path.join(__dirname, 'silence.ogg');
        
        // Kiểm tra sự tồn tại của tệp âm thanh tĩnh (silence.ogg)
        if (!fs.existsSync(silencePath)) {
            return message.reply('Tệp âm thanh tĩnh không tồn tại. Vui lòng kiểm tra lại.');
        }

        // Kiểm tra quyền của bot trong voice channel
        if (!voiceChannel.permissionsFor(message.guild.me).has('CONNECT') || !voiceChannel.permissionsFor(message.guild.me).has('SPEAK')) {
            return message.reply('Bot không có đủ quyền để tham gia và phát âm thanh trong voice channel.');
        }

        // Nếu lệnh là 'join', bot sẽ tham gia voice channel
        if (action === 'join') {
            try {
                const connection = joinVoiceChannel({
                    channelId: voiceChannel.id,
                    guildId: message.guild.id,
                    adapterCreator: message.guild.voiceAdapterCreator,
                });

                // Tạo audio player và phát file âm thanh tĩnh
                const player = createAudioPlayer();
                const resource = createAudioResource(silencePath);

                player.play(resource);
                connection.subscribe(player);

                player.on(AudioPlayerStatus.Idle, () => {
                    player.play(createAudioResource(silencePath)); // Phát lại âm thanh tĩnh mỗi khi âm thanh hiện tại kết thúc
                });

                message.reply('Bot đã tham gia voice channel và sẽ ở lại 24/7.');
            } catch (error) {
                console.error('Lỗi khi tham gia voice channel:', error);
                message.reply('Không thể tham gia voice channel, vui lòng thử lại.');
            }
        }
        
        // Nếu lệnh là 'leave', bot sẽ rời khỏi voice channel
        else if (action === 'leave') {
            const connection = getVoiceConnection(message.guild.id);
            if (connection) {
                connection.destroy(); // Rời khỏi voice channel
                message.reply('Bot đã rời khỏi voice channel!');
            } else {
                message.reply('Bot không ở trong voice channel nào.');
            }
        }
    },

    // Hàm kiểm tra và tái kết nối bot nếu bị mất kết nối
    reconnectIfDisconnected(guildId) {
        const connection = getVoiceConnection(guildId);
        if (!connection) {
            console.log('Bot đã bị mất kết nối, đang cố gắng kết nối lại...');
            // Gửi yêu cầu tham gia lại nếu không có kết nối
            // Bạn có thể bổ sung mã logic để bot tham gia lại voice channel ở đây
        }
    }
};
