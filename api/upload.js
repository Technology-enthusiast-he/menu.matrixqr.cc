import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';


export const config = {
    api: {
        bodyParser: false,
    },
};

const S3 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

export default async function handler(req, res) {
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        
        const buffers = [];
        for await (const chunk of req) {
            buffers.push(chunk);
        }
        const fileBuffer = Buffer.concat(buffers);

        if (!fileBuffer || fileBuffer.length === 0) {
            return res.status(400).json({ error: 'Empty file uploaded' });
        }

        
        const ext = req.headers['content-type']?.split('/')[1] || 'jpg';
        const filename = `menu-${Date.now()}.${ext}`;

        
        await S3.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: filename,
            Body: fileBuffer,
            ContentType: req.headers['content-type'] || 'image/jpeg',
        }));

        
        const domain = process.env.R2_PUBLIC_DOMAIN.replace(/\/$/, '');
        const publicUrl = `${domain}/${filename}`;

        return res.status(200).json({ success: true, url: publicUrl });
    } catch (err) {
        console.error('R2 Upload Error:', err);
        return res.status(500).json({ error: err.message || 'Server Internal Error' });
    }
}
