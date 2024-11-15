const math = require('mathjs');  // Sử dụng mathjs

module.exports = {
    name: 'm',  // Đặt tên lệnh là 'm'
    description: 'Tính toán phép toán đã nhập.',
    async execute(message, args) {
        // Kiểm tra nếu không có tham số hoặc chỉ có 'pm' mà không có phép toán
        if (args.length === 0 || (args.length === 1 && args[0].toLowerCase() === 'pm')) {
            return message.reply('Vui lòng cung cấp một phép tính để thực hiện. Ví dụ: `pm 1+2-3`');
        }

        // Kết hợp các phần của phép tính (trong trường hợp có khoảng trắng)
        let expression = args.join(' ');

        // Kiểm tra nếu phép toán bắt đầu bằng 'pm ' và loại bỏ nó, không phân biệt chữ hoa hay chữ thường
        if (expression.toLowerCase().startsWith('pm ')) {
            expression = expression.slice(3);  // Loại bỏ 'pm ' (3 ký tự)
        }

        try {
            // Tính toán phép toán
            const result = math.evaluate(expression);

            // Gửi kết quả
            message.reply(`<:tick:1306785771881107456> **OCB**, Kết quả của phép toán là: **${result}**`);
        } catch (error) {
            // Nếu phép toán không hợp lệ, thông báo lỗi
            return message.reply('Có lỗi xảy ra khi tính toán phép toán! Vui lòng kiểm tra lại cú pháp.');
        }
    }
};
