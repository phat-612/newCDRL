/////////////////////////this is drive....//////////////////////////////
const fs = require('fs');
const { google } = require('googleapis');
const NodePersist = require('node-persist');
const path = require('path');

// Create a new Google Drive instance
const drive = google.drive('v3');

// Initialize the NodePersist storage
const storage = NodePersist.create({
    dir: '.credentials',
});

// Function to initialize storage asynchronously
const initStorage = async () => {
    await storage.init();
};

// Authorize the client
const auth = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    `${process.env.WEB_URL}:${process.env.PORT}`,
);
async function getNewAccessTokenUsingRefreshToken(refreshToken) {
    try {
        auth.setCredentials({ refresh_token: refreshToken });
        const refreshedTokens = await auth.getAccessToken();
        return refreshedTokens.res.data;
    } catch (error) {
        console.log('SYSTEM | DRIVE | Lỗi làm mới mã truy cập:', error);
    }
}
// Generate an access token and refresh token if not available
const getAccessToken = async () => {
    let tokens = await storage.getItem('tokens');
    let token;

    if (tokens) {
        const now = new Date().getTime();
        if (tokens.expiry_date && tokens.expiry_date > now) {
            token = tokens.access_token;
        } else if (tokens.refresh_token) {
            try {
                const new_tokens = await getNewAccessTokenUsingRefreshToken(tokens.refresh_token);
                token = new_tokens.access_token;
                await storage.setItem('tokens', new_tokens);
            } catch (error) {
                console.log('SYSTEM | DRIVE | Error refreshing access token:', error);
            }
        }
    }

    if (!token) {
        const authUrl = auth.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/drive'],
        });

        console.log('SYSTEM | DRIVE | Authorize this app by visiting this URL:', authUrl);

        const code = await getCodeFromUser();
        tokens = await getAccessTokenFromCode(code);
        await storage.setItem('tokens', tokens);
    }

    auth.setCredentials(tokens);
};

// Function to get authorization code from user
const getCodeFromUser = () => {
    return new Promise((resolve) => {
        // In this example, we assume the user manually enters the code in the terminal
        const readline = require('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question('SYSTEM | DRIVE | Enter the authorization code: ', (code) => {
            rl.close();
            resolve(decodeURIComponent(code));
        });
    });
};

// Function to exchange authorization code for access token
const getAccessTokenFromCode = (code) => {
    return new Promise((resolve, reject) => {
        auth.getToken(code, (err, token) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(token);
        });
    });
};

// Upload the file to Google Drive
exports.uploadFileToDrive = async (filePath, description, id_folder = '1CyiiQwVN1_99jYcbQvy4M3JeI1m4zyKR') => {
    await initStorage();
    await getAccessToken();
    const fileName = path.basename(filePath);
    const fileMetadata = {
        name: fileName,
        parents: [id_folder],
        description: description, // Bổ sung mô tả vào đây
    };

    const media = {
        mimeType: 'application/octet-stream',
        body: fs.createReadStream(filePath),
    };

    try {
        const res = await drive.files.create({
            auth,
            resource: fileMetadata,
            media: media,
            fields: 'id',
        });

        fs.unlink(filePath, (err) => {
            if (err) {
                console.log('SYSTEM | DRIVE | ERR |', err);
                return;
            }
        });
        const permission = {
            role: 'reader', // Quyền truy cập đọc
            type: 'anyone', // Cho phép mọi người truy cập
        };

        await drive.permissions.create({
            fileId: res.data.id,
            resource: permission,
            fields: 'id',
            auth: auth,
        });

        return res.data.id;
    } catch (err) {
        console.log('SYSTEM | DRIVE | ERR | uploading file:', err);
    }
};

const getFileName = async (fileId) => {
    const drive = google.drive({ version: 'v3', auth });

    try {
        const response = await drive.files.get({
            fileId,
            fields: 'name',
        });

        const fileName = response.data.name;
        return fileName;
    } catch (error) {
        console.log('SYSTEM | DRIVE | Error retrieving file name:', error);
    }
};

// Download the file from Google Drive
exports.downloadFileFromDrive = async (fileId) => {
    await initStorage();
    await getAccessToken();
    const res = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream', auth });

    // let fileName = await getFileName(fileId);
    // const destFilePath = path.join(destDirectory, fileName);
    // const destFile = fs.createWriteStream(destFilePath);

    return new Promise((resolve, reject) => {
        const chunks = [];

        res.data
            .on('data', (chunk) => {
                chunks.push(chunk);
            })
            .on('end', () => {
                const fileContent = Buffer.concat(chunks).toString('utf8');
                resolve(fileContent);
            })
            .on('error', (err) => {
                console.log('SYSTEM | DRIVE | Error downloading file:', err);
                reject(err);
            });
        // .pipe(destFile);
    });
};

exports.downloadFileFromDriveforUser = async (fileId, res) => {
    await initStorage();
    await getAccessToken();
    const fileStream = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'stream', auth });

    // Get the file name from Google Drive API or use a fixed filename
    let fileName = await getFileName(fileId);
    // Set the Content-Disposition header with the desired filename
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Pipe the file stream to the response object
    fileStream.data
        .on('data', (chunk) => {
            res.write(chunk);
        })
        .on('end', () => {
            res.end();
        })
        .on('error', (err) => {
            console.log('SYSTEM | DRIVE | Error sending file:', err);
            res.status(500).end(); // Or handle the error in an appropriate way
        });
};

exports.getDriveFileLinkAndDescription = async (fileId) => {
    await initStorage();
    await getAccessToken();
    const fileMetadata = await drive.files.get({ fileId, fields: 'id,description', auth });
    const directLink = `https://drive.google.com/thumbnail?id=${fileMetadata.data.id}&sz=s4000`;

    return { fileDescription: fileMetadata.data.description, fileLink: directLink };
};
exports.deleteFileFromDrive = async (fileId) => {
    await initStorage();
    await getAccessToken();
    try {
        await drive.files.delete({
            fileId: fileId,
            auth: auth,
        });
    } catch (err) {
        console.log('SYSTEM | DRIVE | Error deleting file:', err);
    }
};
// ------------------------------------------------------------------------------------------------------
