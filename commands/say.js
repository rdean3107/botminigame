module.exports = {
    name: 'say',
    description: 'Gửi tin nhắn đến một kênh cụ thể.',

    async execute(message, args) {
        const command = message.content.split(' ')[0];
        if (!command.includes('say')) return;

        args = message.content.slice(command.length).trim().split(/\s+/);

        if (args.length < 2) {
            return message.reply('Sử dụng đúng cú pháp: `<tên_kênh> <nội_dung>` hoặc `<tên_kênh> embed <nội_dung>`');
        }

        const channelInput = args[0].replace(/^<#|>$/g, '');
        let isEmbed = false;

        // Kiểm tra nếu có từ khóa "embed"
        if (args[1].toLowerCase() === 'embed') {
            isEmbed = true;
            args.splice(1, 1); // Loại bỏ từ "embed" khỏi danh sách
        }

        // Thay thế \n để xuống dòng trong nội dung
        const messageContent = args.slice(1).join(' ').replace(/\\n/g, '\n');

        const targetChannel = message.guild.channels.cache.find(
            channel => channel.id === channelInput || (channel.name === channelInput && channel.isTextBased())
        );

        if (!targetChannel) {
            const availableChannels = message.guild.channels.cache
                .filter(channel => channel.isTextBased())
                .map(channel => `#${channel.name}`)
                .join(', ');
            return message.reply(`Không tìm thấy kênh nào có tên hoặc ID là "${args[0]}". Các kênh khả dụng: ${availableChannels}`);
        }

        try {
            if (isEmbed) {
                const embedMessage = {
                    color: 0xff7f8b, // Màu pastel
                    description: messageContent, // Giữ nguyên xuống dòng
                };

                await targetChannel.send({ embeds: [embedMessage] });
            } else {
                await targetChannel.send({ content: messageContent }); // Giữ nguyên xuống dòng
            }

            message.reply(`Đã gửi tin nhắn đến kênh #${targetChannel.name}.`);
        } catch (error) {
            console.error(`Lỗi khi gửi tin nhắn đến kênh ${channelInput}:`, error);
            message.reply('Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại.');
        }
    }
};
