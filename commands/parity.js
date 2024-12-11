const fs = require('fs');
const path = require('path');

// Đường dẫn đến tệp cấu hình JSON
const configPath = path.join(__dirname, '..', 'configmod.json');
let config;

// Kiểm tra sự tồn tại của tệp cấu hình
if (!fs.existsSync(configPath)) {
    console.error('Tệp cấu hình không tồn tại!');
    message.channel.send('Tệp cấu hình không tồn tại.');
    return;
}

// Đọc tệp cấu hình JSON
try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
} catch (error) {
    console.error('Lỗi khi đọc tệp cấu hình:', error);
    message.channel.send('Không thể đọc tệp cấu hình.');
    return;
}

// ID của người dùng được phép sửa cấu hình
const allowedUserId = '756114367791235122'; // Thay bằng ID người dùng được phép

// Hàm viết hoa chữ cái đầu
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// Hàm để cập nhật các tổ hợp trong config.json
const updateCombinations = (type, values, message) => {
    let updatedCombination;

    if (type === 'xiu') {
        // Kiểm tra số lượng giá trị, chỉ cho phép 3 giá trị
        if (values.length !== 3) {
            return message.channel.send('Lỗi: Cần cung cấp chính xác 3 giá trị cho tổ hợp Xíu (ví dụ: "1 2 3").');
        }

        // Chuyển các giá trị thành số và kiểm tra giá trị từ 1 đến 6
        updatedCombination = values.map(value => parseInt(value, 10));

        if (updatedCombination.some(value => isNaN(value) || value < 1 || value > 6)) {
            return message.channel.send('Lỗi: Tất cả các giá trị của tổ hợp Xíu phải nằm trong khoảng từ 1 đến 6.');
        }

        config.combinations[type] = [updatedCombination];
    } else if (type === 'bau' || type === 'cua') {
        // Kiểm tra số lượng giá trị, chỉ cho phép 3 giá trị hợp lệ
        if (values.length !== 3) {
            return message.channel.send('Lỗi: Cần cung cấp chính xác 3 giá trị hợp lệ cho tổ hợp Bầu (ví dụ: "Cá Bầu Cua").');
        }

        // Các giá trị hợp lệ cho Bầu Cua
        const validItems = ['Bầu', 'Cua', 'Tôm', 'Cá', 'Nai', 'Gà'];
        updatedCombination = values.map(capitalize).filter(item => validItems.includes(item));

        if (updatedCombination.length === 3) {
            config.combinations[type] = [updatedCombination];
        } else {
            message.channel.send('Lỗi: Cần cung cấp chính xác 3 giá trị hợp lệ cho tổ hợp Bầu (ví dụ: "Cá Bầu Cua").');
            return;
        }
    }

    try {
        // Lưu lại các thay đổi vào tệp cấu hình
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
        message.channel.send(`Đã thay đổi tổ hợp ${capitalize(type)}: ${updatedCombination.join(', ')} trong cấu hình.`);
    } catch (error) {
        console.error('Lỗi khi lưu tệp cấu hình:', error);
        message.channel.send('Không thể cập nhật cấu hình.');
    }
};

// Hàm để cập nhật ID primary trong config.json
const updatePrimaryId = (id, message) => {
    config.specialUserIds.primary = id;

    try {
        // Lưu lại thay đổi ID primary vào tệp cấu hình
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
        message.channel.send(`Đã thay đổi ID Primary thành: ${id}`);
    } catch (error) {
        console.error('Lỗi khi lưu tệp cấu hình:', error);
        message.channel.send('Không thể cập nhật ID Primary.');
    }
};

// Hàm để cập nhật ID secondary trong config.json
const updateSecondaryId = (id, message) => {
    config.specialUserIds.secondary = id;

    try {
        // Lưu lại thay đổi ID secondary vào tệp cấu hình
        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
        message.channel.send(`Đã thay đổi ID Secondary thành: ${id}`);
    } catch (error) {
        console.error('Lỗi khi lưu tệp cấu hình:', error);
        message.channel.send('Không thể cập nhật ID Secondary.');
    }
};

// Hàm xử lý lệnh kpx, kpb, kpp, kps
module.exports = async (message, args) => {
    const userId = message.author.id;

    // Chỉ cho phép người dùng có ID được chỉ định sửa cấu hình
    const isConfigCommand = ['x', 'b', 'p', 's'].includes(args[0]?.toLowerCase());
    if (isConfigCommand && userId !== allowedUserId) {
        return message.channel.send('Bạn không có quyền sửa cấu hình.');
    }

    // Xử lý lệnh kpx (cập nhật tổ hợp Xíu)
    if (args[0].toLowerCase() === 'x') {
        if (args.length < 2) {
            return message.channel.send('Vui lòng cung cấp ít nhất 1 giá trị cho tổ hợp Xíu.');
        }

        const values = args.slice(1); // Các giá trị người dùng nhập vào
        updateCombinations('xiu', values, message);
    }
    // Xử lý lệnh kpb (cập nhật tổ hợp Bầu)
    else if (args[0].toLowerCase() === 'b') {
        if (args.length < 2) {
            return message.channel.send('Vui lòng cung cấp ít nhất 1 giá trị cho tổ hợp Bầu.');
        }

        const values = args.slice(1); // Các giá trị người dùng nhập vào
        updateCombinations('bau', values, message);
    }
    // Xử lý lệnh kpp (cập nhật ID primary)
    else if (args[0].toLowerCase() === 'p') {
        const primaryId = args[1];
        if (!primaryId) {
            return message.channel.send('Vui lòng cung cấp ID Primary.');
        }

        updatePrimaryId(primaryId, message);
    }
    // Xử lý lệnh kps (cập nhật ID secondary)
    else if (args[0].toLowerCase() === 's') {
        const secondaryId = args[1];
        if (!secondaryId) {
            return message.channel.send('Vui lòng cung cấp ID Secondary.');
        }

        updateSecondaryId(secondaryId, message);
    } else {
        message.channel.send('Lệnh không hợp lệ.');
    }
};
