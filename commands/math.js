const math = require('mathjs');

module.exports = {
    name: 'm',  // Tên lệnh là 'm'
    description: 'Thực hiện phép tính toán học với các toán tử +, -, *, /',  // Mô tả lệnh
    execute(message, args) {
        // Ghép các tham số lại thành chuỗi phép toán
        const expression = args.join(' ').trim();  // Chuỗi phép toán

        // Cố gắng tính toán phép toán
        try {
            const result = math.evaluate(expression);  // Tính toán phép toán

            // Trả về kết quả theo định dạng yêu cầu
            return message.reply(`Kết quả của phép toán là: **${result}**`);
        } catch (error) {
            // Nếu có lỗi trong việc tính toán (như chuỗi không hợp lệ)
            return message.reply('Có lỗi khi thực hiện phép toán. Vui lòng kiểm tra lại cú pháp!');
        }
    }
};
