const fs = require('fs');
const path = require('path');

const folderPath = 'views'; // Thay thế bằng đường dẫn thư mục của bạn

fs.readdir(folderPath, (err, files) => {
    if (err) {
        console.error('Lỗi khi đọc thư mục:', err);
        return;
    }

    console.log('Các tập tin trong thư mục:');
    files.forEach(file => {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
            console.log(file);
        }
    });
});
