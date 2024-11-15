const math = require('mathjs');  // Import mathjs

module.exports = {
    name: 'm',  // Tên lệnh là 'm'
    description: 'Tính toán phép toán đã nhập.',
    async execute(message, args) {
        // Kết hợp các phần của phép tính (trong trường hợp có khoảng trắng)
        let expression = args.join(' ').trim();

        // Loại bỏ bất kỳ tiền tố nào (giả sử là các từ trước phép toán)
        expression = expression.replace(/^\S+\s*/, '').trim();  // Loại bỏ bất kỳ chuỗi không phải là phép toán (ví dụ: "pm", "lệnh", ...)

        // Thông báo debug: Kiểm tra giá trị expression
        console.log("Expression received: ", expression);

        // Kiểm tra nếu biểu thức trống
        if (!expression) {
            return message.reply('Vui lòng cung cấp một phép tính để thực hiện. Ví dụ: `prefix+m 1+2*3/6`');
        }

        try {
            // Thực hiện tính toán
            const result = math.evaluate(expression);

            // Trả kết quả
            message.reply(`<:tick:1306785771881107456> **OCB**, Kết quả của phép toán là: **${result}**`);
        } catch (error) {
            // Nếu phép toán không hợp lệ, thông báo lỗi
            console.error('Error calculating expression: ', error);  // Thông báo lỗi debug
            return message.reply('Có lỗi xảy ra khi tính toán phép toán! Vui lòng kiểm tra lại cú pháp.');
        }
    }
};
