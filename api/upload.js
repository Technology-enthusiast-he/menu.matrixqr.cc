import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const MAX_FILE_SIZE = 4 * 1024 * 1024;

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
    const origin = req.headers.origin;
    const requestHost = req.headers.host;

    if (origin) {
        try {
            const originHost = new URL(origin).host;
            if (!requestHost || originHost !== requestHost) {
                return res.status(403).json({ error: 'Cross-origin uploads are not allowed' });
            }
        } catch (error) {
            return res.status(403).json({ error: 'Invalid request origin' });
        }

        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }

    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        if (!origin) {
            return res.status(403).end();
        }
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const contentType = String(req.headers['content-type'] || '')
        .split(';')[0]
        .trim()
        .toLowerCase();

    if (contentType !== 'image/webp') {
        return res.status(415).json({ error: 'Only WEBP image uploads are supported' });
    }

    const contentLength = Number(req.headers['content-length'] || 0);
    if (contentLength > MAX_FILE_SIZE) {
        return res.status(413).json({ error: 'File exceeds the 4 MB upload limit' });
    }

    const requiredEnv = [
        'R2_ACCOUNT_ID',
        'R2_ACCESS_KEY_ID',
        'R2_SECRET_ACCESS_KEY',
        'R2_BUCKET_NAME',
        'R2_PUBLIC_DOMAIN',
    ];
    if (requiredEnv.some((key) => !process.env[key])) {
        console.error('R2 upload configuration is incomplete');
        return res.status(500).json({ error: 'Upload service is not configured' });
    }

    try {
        const buffers = [];
        let totalBytes = 0;

        for await (const chunk of req) {
            totalBytes += chunk.length;
            if (totalBytes > MAX_FILE_SIZE) {
                return res.status(413).json({ error: 'File exceeds the 4 MB upload limit' });
            }
            buffers.push(chunk);
        }

        const fileBuffer = Buffer.concat(buffers);

        if (fileBuffer.length < 12) {
            return res.status(400).json({ error: 'Invalid WEBP image' });
        }

        const isWebp =
            fileBuffer.toString('ascii', 0, 4) === 'RIFF' &&
            fileBuffer.toString('ascii', 8, 12) === 'WEBP';

        if (!isWebp) {
            return res.status(400).json({ error: 'Invalid WEBP image' });
        }

        const filename = `menu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

        await S3.send(new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: filename,
            Body: fileBuffer,
            ContentType: 'image/webp',
        }));

        const domain = process.env.R2_PUBLIC_DOMAIN.replace(/\/$/, '');
        const publicUrl = `${domain}/${filename}`;

        return res.status(200).json({ success: true, url: publicUrl });
    } catch (err) {
        console.error('R2 upload failed:', err);
        return res.status(500).json({ error: 'Upload failed. Please try again.' });
    }
}
