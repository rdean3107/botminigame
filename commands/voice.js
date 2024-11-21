const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
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
                const resource = createAudioResource(path.join(__dirname, 'silence.ogg')); // file âm thanh tĩnh

                player.play(resource);
                connection.subscribe(player);

                player.on(AudioPlayerStatus.Idle, () => {
                    player.play(createAudioResource(path.join(__dirname, 'silence.ogg')));
                });

                message.reply('Đã tham gia voice channel và sẽ không tự động rời khỏi channel.');
            } catch (error) {
                console.error('Lỗi khi tham gia voice channel:', error);
                message.reply('Không thể tham gia voice channel, vui lòng thử lại.');
            }
        }
        
        // Nếu lệnh là 'leave', bot sẽ rời khỏi voice channel
        else if (action === 'leave') {
            const connection = getVoiceConnection(message.guild.id);
            if (connection) {
                connection.destroy();
                message.reply('Đã rời khỏi voice channel!');
            } else {
                message.reply('Bot không ở trong voice channel nào.');
            }
        }
    }
};
