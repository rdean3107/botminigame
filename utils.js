const rollDice = (isDitMe, isDuma) => {
    if (isDitMe) return 6; // Trả về 6 nếu có từ "ditme"
    if (isDuma) return 1;  // Trả về 1 nếu có từ "duma"
    return Math.floor(Math.random() * 6) + 1; // Lắc ngẫu nhiên nếu không có từ đặc biệt
};

const rollBauCua = (isDitMe) => {
    if (isDitMe) return 'Tôm'; // Trả về "Tôm" nếu có từ "ditme"
    const options = ['Bầu', 'Cua', 'Tôm', 'Cá', 'Gà', 'Nai'];
    return options[Math.floor(Math.random() * options.length)];
};

module.exports = {
    rollDice,
    rollBauCua
};
