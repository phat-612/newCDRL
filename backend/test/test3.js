const fs = require('fs');
const path = require('path');

function printDirectoryTree(folderPath, indent = '') {
    const folderName = path.basename(folderPath);

    if (folderName !== 'node_modules') {
        console.log(indent + folderName + '/');
        
        if (fs.existsSync(folderPath)) {
            const items = fs.readdirSync(folderPath).sort();
            items.forEach(item => {
                const itemPath = path.join(folderPath, item);
                if (fs.statSync(itemPath).isDirectory()) {
                    printDirectoryTree(itemPath, indent + '    ');
                }
            });
        }
    }
}
const folderPath = 'C:\\Users\\Ruri Meiko\\Desktop\\Code\\Git\\newCDRL\\';
printDirectoryTree(folderPath);
