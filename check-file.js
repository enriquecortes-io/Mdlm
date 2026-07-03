const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON),
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

(async () => {
  try {
    const file = await drive.files.get({
      fileId: '1RGTEE6-rjf1P7oi7DjwtKNSOtEZWswnB',
      fields: 'name,size,mimeType,parents,webContentLink',
    });
    console.log('✅ EXISTE:', JSON.stringify(file.data, null, 2));
  } catch (e) {
    console.log('❌ NO EXISTE:', e.message);
  }
})();
