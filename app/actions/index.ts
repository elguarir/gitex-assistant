'use server';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Function to generate a UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.TEBI_REGION!,
  credentials: {
    accessKeyId: process.env.TEBI_ACCESS_KEY_ID!,
    secretAccessKey: process.env.TEBI_SECRET_ACCESS_KEY!,
  },
  endpoint: process.env.TEBI_S3_ENDPOINT!,
});

// Define response type
type UploadResult = {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
};

export async function uploadPdfToS3(file: File): Promise<UploadResult> {
  try {
    if (!file || !file.type.includes('pdf')) {
      return {
        success: false,
        error: 'Invalid file. Please upload a PDF file.',
      };
    }

    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    // Generate a unique filename
    const fileExtension = file.name.split('.').pop() || 'pdf';
    const fileName = `${generateUUID()}.${fileExtension}`;
    const key = `uploads/${fileName}`;

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    // Create the file URL for Tebi storage
    const url = `${process.env.AWS_S3_ENDPOINT}/${process.env.AWS_BUCKET_NAME}/${key}`;

    return {
      success: true,
      url,
      key,
    };
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    return {
      success: false,
      error: 'Failed to upload file. Please try again later.',
    };
  }
}
