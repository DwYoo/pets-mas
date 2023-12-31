import { Request, Response } from "express";
import multer from 'multer';
import {PrismaClient, TrainImage } from '../../prisma/generated/client'

import { RunpodClient, RunpodResponse } from "../runpod/client";
import {s3Client, uploadTrainImageSet, uploadZip, generateSignedUrls} from "../utils/s3/client"

require('dotenv').config();

const runpodClient:RunpodClient = new RunpodClient(String(process.env.INFER_ENDPOINT), String(process.env.TRAIN_ENDPOINT), process.env.RUNPOD_SECRET);
const prisma:PrismaClient = new PrismaClient();


export default class TrainController {

  async postImageSetAndTrain(req: Request, res: Response) {
    try {
      console.log("Recieved request")
      const userId:string = req.params.user_id;
      const files: Express.Multer.File[] = req.files as Express.Multer.File[];
      const petClass:string = req.body.class;
      const petName:string = req.body.name;
      console.log("req body", req.body);
      console.log("req files", req.files);

      const zipPath = await uploadZip(files, userId);
      console.log(`petClass: ${petClass}, zipPath: ${zipPath}`)

      await uploadTrainImageSet(files, userId, petClass, petName, zipPath);

      const runpodResponse:RunpodResponse = await runpodClient.train(
        `lora_${Date.now()}`,
        petClass,
        zipPath, 
        `users/${userId}/lora`,
        `${process.env.WEBHOOK_ENDPOINT}/webhook/train/${userId}`
        )
      
      res.status(200).json({
        message: "Train images uploaded, training in process.",
        runpodResponse: JSON.stringify(runpodResponse)
      });
    
      await prisma.user.update({
          where: {
            id: userId
          },
          data: {
            userStatus: 1,
            playCount: 0,
            inferSuccess: 0,
            currentJobId: runpodResponse.id
          }
        })


    } catch (error) {
      console.error(error);
      res.status(500).send("Error processing request");
    }
}

  async getTrainImageSet(req: Request, res: Response) {
    const userId: string = req.params.user_id;
    const imageSet = await prisma.trainImageSet.findFirst({
      where: { userId: userId },
      include: { trainImages: true }
    });
  
    if (!imageSet) {
      return res.send({}); // imageSet이 없는 경우, 빈 객체 반환
    }
  
    const imageUrls = await generateSignedUrls(imageSet.trainImages);
    const imageUrlsMap = imageSet.trainImages.reduce<{ [key: number]: string }>((acc, image, index) => {
      acc[image.id] = imageUrls[index];
      return acc;
    }, {});
  
    res.send(imageUrlsMap);
  }

}

