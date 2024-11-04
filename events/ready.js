const onReady = (client) => {
    console.log(`Bot đã đăng nhập với tên: ${client.user.tag}`);
};

module.exports = { onReady }; // Export dưới dạng đối tượng
