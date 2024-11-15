const math = require('mathjs');  // Import mathjs

module.exports = {
    name: 'm',  // Tên lệnh
    description: 'Tính toán phép toán đã nhập.',
    async execute(message, args) {
        // Kiểm tra nếu không có phép toán hoặc chỉ nhập 'pm'
        if (args.length === 0 || (args.length === 1 && args[0].toLowerCase() === 'pm')) {
            return message.reply('Vui lòng cung cấp một phép tính để thực hiện. Ví dụ: `p m 1+2-3`');
        }

        // Kết hợp các tham số thành biểu thức phép tính
        let expression = args.join(' ').trim();

        // Xử lý nếu biểu thức bắt đầu bằng 'pm'
        if (expression.toLowerCase().startsWith('pm ')) {
            expression = expression.slice(3).trim();  // Loại bỏ 'pm' và khoảng trắng sau đó
        }

        try {
            // Ghi log để kiểm tra biểu thức
            console.log(`Expression: "${expression}"`);

            // Thực hiện phép tính với math.evaluate
            const result = math.evaluate(expression);

            // Đưa ra kết quả tính toán
            return message.reply(`<:tick:1306785771881107456> **OCB**, Kết quả của phép toán là: **${result}**`);
        } catch (error) {
            // Ghi log lỗi để chẩn đoán
            console.error(`Calculation error: ${error}`);
            return message.reply('Có lỗi xảy ra khi tính toán phép toán! Vui lòng kiểm tra lại cú pháp.');
        }
    }
};
