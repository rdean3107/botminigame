// Biến lưu thời gian của lệnh random gần nhất
let lastRandomTime = 0;  
// Khoảng thời gian tối thiểu giữa 2 lệnh random (5000ms = 5 giây)
const timeWindow = 5000; 

// Mảng chứa các ID người dùng cho các trường hợp đặc biệt
const specialUserIdsForContinuous = ['756114367791235122', '756114367791235122'];  // ID người dùng cho random 2 lệnh liên tục
const specialUserIdsForMaxInTime = ['598892208384638977', '873617944410726481'];  // ID người dùng cho random max trong khoảng thời gian cụ thể
const specialUserIdsForBoth = ['756114367791235122', '756114367791235122'];  // ID người dùng muốn sử dụng cả 2 lệnh đặc biệt

// Hàm để tạo một số ngẫu nhiên giữa min và max
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;  // Công thức random
}

// Hàm chính xử lý lệnh random
module.exports = {
    name: 'rd',  // Tên lệnh
    description: 'Tạo một số ngẫu nhiên giữa hai giá trị, mặc định từ 0 đến 10.',  // Mô tả lệnh
    execute(message, args) {
        let min = 0;  // Giá trị min mặc định là 0
        let max = 10; // Giá trị max mặc định là 10

        // Nếu có tham số, kiểm tra và thay đổi min/max
        if (args.length === 1) {
            const parsedMax = parseInt(args[0]);  // Chỉ có max
            if (!isNaN(parsedMax)) {
                max = parsedMax;  // Gán max nếu tham số hợp lệ
            }
        } else if (args.length === 2) {
            const parsedMin = parseInt(args[0]);  // Có cả min và max
            const parsedMax = parseInt(args[1]);
            if (!isNaN(parsedMin)) {
                min = parsedMin;  // Gán min nếu tham số hợp lệ
            }
            if (!isNaN(parsedMax)) {
                max = parsedMax;  // Gán max nếu tham số hợp lệ
            }
        }

        // Đảm bảo min luôn nhỏ hơn hoặc bằng max
        if (min > max) [min, max] = [max, min];  // Nếu min > max thì đổi chỗ

        // Lấy tên người dùng trong server
        const userDisplayName = message.guild.members.cache.get(message.author.id).displayName;

        // Kiểm tra nếu người dùng là người cụ thể cho random 2 lệnh liên tục
        if (specialUserIdsForContinuous.includes(message.author.id)) {
            const currentTime = new Date().getTime();  // Lấy thời gian hiện tại (tính bằng ms)
            const timeDifference = currentTime - lastRandomTime;  // Tính thời gian chênh lệch giữa 2 lần random
            let randomNumber;

            // Nếu khoảng thời gian giữa 2 lệnh nhỏ hơn hoặc bằng 5 giây
            if (timeDifference <= timeWindow) {
                randomNumber = min;  // Lệnh thứ 2 luôn trả về số min (0)
            } else {
                randomNumber = getRandomNumber(min, max);  // Lệnh đầu tiên trả về số random bình thường
            }

            // Cập nhật lại thời gian của lần random hiện tại
            lastRandomTime = currentTime;

            // Trả về kết quả random với định dạng mong muốn
            return message.reply(`<:dice:1306755354389909554> **${userDisplayName}**, bạn đã nhận được số ngẫu nhiên: **${randomNumber}**`);
        }

        // Kiểm tra nếu người dùng là người cụ thể và muốn random max trong khoảng thời gian cụ thể (20s-30s và 50s-60s)
        if (specialUserIdsForMaxInTime.includes(message.author.id)) {
            const currentTime = new Date();  // Lấy thời gian hiện tại
            const currentSeconds = currentTime.getSeconds();  // Lấy giây của thời gian hiện tại

            // Nếu giây trong khoảng từ 20s đến 30s hoặc từ 50s đến 60s, trả số max
            if ((currentSeconds >= 20 && currentSeconds < 30) || (currentSeconds >= 50 && currentSeconds < 60)) {
                return message.reply(`<:dice:1306755354389909554> **${userDisplayName}**, bạn đã nhận được số ngẫu nhiên: **${max}**`);
            } else {
                return message.reply(`<:dice:1306755354389909554> **${userDisplayName}**, bạn đã nhận được số ngẫu nhiên: **${getRandomNumber(min, max)}**`);  // Nếu không trong khoảng trên, random bình thường
            }
        }

        // Nếu không phải là người có ID cụ thể, thực hiện random bình thường
        let randomNumber = getRandomNumber(min, max);  // Random giữa min và max

        // Trả về kết quả cho người dùng với định dạng mong muốn
        message.reply(`<:dice:1306755354389909554> **${userDisplayName}**, bạn đã nhận được số ngẫu nhiên: **${randomNumber}**`);
    }
};
