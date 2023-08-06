/////////////////////////this is drive....//////////////////////////////
const fs = require('fs');
const { google } = require('googleapis');
const NodePersist = require('node-persist');
const path = require('path');
// Load the credentials from the JSON file
const credentials = require('./bimat.json');
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
    credentials.web.client_id,
    credentials.web.client_secret,
    credentials.web.redirect_uris && credentials.web.redirect_uris.length > 0 ? credentials.web.redirect_uris[0] : 'http://localhost:8181'
);
const getNewAccessTokenUsingRefreshToken = async (refreshToken) => {
    const { tokens } = await auth.refreshAccessToken(refreshToken);
    return tokens.access_token;
};
// Generate an access token and refresh token if not available
const getAccessToken = async () => {
    let tokens = await storage.getItem('tokens');
    let token;

    if (tokens) {
        // If there are tokens in storage, check if the access token is expired
        const now = new Date().getTime();
        if (tokens.expiry_date && tokens.expiry_date > now) {
            // Access token is not expired, use it directly
            token = tokens.access_token;
        } else if (tokens.refresh_token) {
            // Access token is expired, but we have a refresh token, use it to get a new access token
            token = await getNewAccessTokenUsingRefreshToken(tokens.refresh_token);
            await storage.setItem('tokens', {
                ...tokens,
                access_token: token,
                expiry_date: new Date().getTime() + (tokens.expires_in * 1000), // Set the new expiry date
            });
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

        token = tokens.access_token;
        await storage.setItem('tokens', {
            ...tokens,
            expiry_date: new Date().getTime() + (tokens.expires_in * 1000), // Set the expiry date
        });
    }

    auth.setCredentials({ access_token: token });
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
exports.uploadFileToDrive = async (filePath, id_folder = '1CyiiQwVN1_99jYcbQvy4M3JeI1m4zyKR') => {
    await initStorage();
    await getAccessToken();
    const fileName = path.basename(filePath);
    const fileMetadata = {
        name: fileName,
        parents: [id_folder]
    };
    // console.log('SYSTEM | DRIVE | Cbi úp lên');

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


        // console.log('SYSTEM | DRIVE | File uploaded successfully! File ID:', res.data.id);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('SYSTEM | DRIVE | ERR |', err);
                return;
            }
            // console.log('SYSTEM | DRIVE | File local deleted successfully');
        });
        return res.data.id;
    } catch (err) {
        console.error('SYSTEM | DRIVE | ERR | uploading file:', err);
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
        // console.log('File name:', fileName);
        return fileName;
    } catch (error) {
        console.error('Error retrieving file name:', error);
    }
}

// Download the file from Google Drive
exports.downloadFileFromDrive = async (fileId) => {
    await initStorage();
    await getAccessToken();
    const res = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream', auth }
    );

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
                // console.log('SYSTEM | DRIVE | File downloaded successfully!');
                const fileContent = Buffer.concat(chunks).toString('utf8');
                resolve(fileContent);
            })
            .on('error', (err) => {
                console.error('SYSTEM | DRIVE | Error downloading file:', err);
                reject(err);
            })
        // .pipe(destFile);

        // console.log('SYSTEM | DRIVE | File reading successfully!');
    });
};

exports.downloadFileFromDriveforUser = async (fileId, res) => {
    await initStorage();
    await getAccessToken();
    const fileStream = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream', auth }
    );

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
            // console.log('SYSTEM | DRIVE | File sent successfully!');
            res.end();
        })
        .on('error', (err) => {
            console.error('SYSTEM | DRIVE | Error sending file:', err);
            res.status(500).end(); // Or handle the error in an appropriate way
        });

    // console.log('SYSTEM | DRIVE | File reading successfully!');
};

exports.deleteFileFromDrive = async (fileId) => {
    await initStorage();
    await getAccessToken();
    try {
        await drive.files.delete({
            fileId: fileId,
            auth: auth,
        });
        // console.log('SYSTEM | DRIVE | File deleted successfully!');
    } catch (err) {
        console.error('SYSTEM | DRIVE | Error deleting file:', err);
    }
};
// ------------------------------------------------------------------------------------------------------

