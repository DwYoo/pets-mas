import {S3Client, PutObjectCommand, GetObjectCommand} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import Archiver from 'archiver';
import fs from 'fs';

import {TrainImage } from '../../prisma/generated/client'
import {PrismaClient } from '../../prisma/generated/client'

const prisma:PrismaClient = new PrismaClient()

require('dotenv').config(); // Load environment variables from .env file

// When no region or credentials are provided, the SDK will use the
// region and credentials from the local AWS config.

const bucketRegion = String(process.env.S3_REGION)
const accessId = String(process.env.S3_PUBLIC_KEY)
const secretKey = String(process.env.S3_SECRET_KEY)

const s3Client = new S3Client({
    credentials: {
        accessKeyId: accessId,
        secretAccessKey: secretKey,
    },
    region: bucketRegion,
    }
);

async function uploadTrainImageSet(files: Express.Multer.File[], userId: string, petClass:string, zipPath:string): Promise<void> {

    let trainImageSet = await prisma.trainImageSet.findFirst({
        where: {
          userId: userId
        }
      });

      const folderPath:string = zipPath.replace("_images.zip", "")

      if (!trainImageSet) {
        trainImageSet = await prisma.trainImageSet.create({
          data: {
            userId: userId,
            folderPath: folderPath,
            petClass: petClass,
            zipPath: zipPath 
          }
        });
      } else {
        await prisma.trainImageSet.update({
          where: {
            id: trainImageSet.id
          },
          data: {
            folderPath: folderPath,
            zipPath: zipPath 
          }
        });
      }

    for (const file of files) {
      const fileName = file.originalname;
      const filePath = `${folderPath}/${fileName}`;
      console.log(`fileName: ${fileName}`)

      const uploadParams = {
        Bucket: String(process.env.S3_BUCKET_NAME),
        Body: file.buffer,
        Key: `pets-mas/${filePath}`,
        ContentType: file.mimetype
      };

      // S3에 파일 업로드
      const response = await s3Client.send(new PutObjectCommand(uploadParams));
      console.log('Uploaded train image set to S3:', trainImageSet)
      console.log(response)


      // TrainImage 생성
      await prisma.trainImage.create({
        data: {
          setId: trainImageSet.id,
          filePath: filePath
        }
      });
    }
  }

  async function uploadZip(files: Express.Multer.File[], userId: string): Promise<string> {
    try {
      const zipFileName = `${Date.now()}_images.zip`;
      const localZipPath = `/tmp/${zipFileName}`;  // 임시 로컬 파일 경로
      const s3ZipPath = `pets-mas/users/${userId}/train/${zipFileName}`;
      const output = fs.createWriteStream(localZipPath);
      const archive = Archiver('zip', { zlib: { level: 9 } });
      
      archive.pipe(output);

      files.forEach(file => {
          archive.append(file.buffer, { name: file.originalname });
      });

      await archive.finalize();

      // 로컬에서 ZIP 파일 생성 완료 대기
      await new Promise<void>((resolve, reject) => {
          output.on('close', resolve);
          output.on('error', reject);
      });

      // S3에 ZIP 파일 업로드
      const fileStream = fs.createReadStream(localZipPath);
      const uploadParams = {
          Bucket: String(process.env.S3_BUCKET_NAME),
          Key: s3ZipPath,
          Body: fileStream
      };
      
      await s3Client.send(new PutObjectCommand(uploadParams));

      // 로컬의 임시 ZIP 파일 삭제 (옵션)
      fs.unlinkSync(localZipPath);

      console.log("Zip file uploaded to S3 successfully");
      return s3ZipPath.replace("pets-mas/","");

    } catch (error) {
      console.error(`Error while creating or uploading zip file: ${error}`);
      throw error;  
    }
}

async function deleteTrainImageSet(userId: string) {


}


async function generateSignedUrls(trainImages: TrainImage[]) {
return await Promise.all(
    trainImages.map(image =>
    getSignedUrl(s3Client, new GetObjectCommand({
        Bucket: String(process.env.S3_BUCKET_NAME),
        Key: image.filePath
    }), { expiresIn: 180 })
    )
);
}

export {s3Client, uploadTrainImageSet, uploadZip, generateSignedUrls}


