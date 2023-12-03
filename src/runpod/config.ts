require('dotenv').config(); // Load environment variables from .env file
  
export const inferenceRequestData= JSON.stringify({
  input: {
    prompt: {
      '3': {
        inputs: {
          seed: 797061021937642,
          steps: 20,
          cfg: 8,
          sampler_name: 'euler',
          scheduler: 'normal',
          denoise: 1,
          model: ['11', 0],
          positive: ['6', 0],
          negative: ['7', 0],
          latent_image: ['5', 0],
        },
        class_type: 'KSampler',
      },
      '4': {
        inputs: {
          ckpt_name: 'sd_xl_base_1.0.safetensors',
        },
        class_type: 'CheckpointLoaderSimple',
      },
      '5': {
        inputs: {
          width: 512,
          height: 512,
          batch_size: 2,
        },
        class_type: 'EmptyLatentImage',
      },
      '6': {
        inputs: {
          text: 'A photo of zwc cat',
          clip: ['11', 1],
        },
        class_type: 'CLIPTextEncode',
      },
      '7': {
        inputs: {
          text: 'text, watermark',
          clip: ['11', 1],
        },
        class_type: 'CLIPTextEncode',
      },
      '8': {
        inputs: {
          samples: ['3', 0],
          vae: ['4', 2],
        },
        class_type: 'VAEDecode',
      },
      '11': {
        inputs: {
          lora_name: 'models/admin.safetensors',
          strength_model: 1,
          strength_clip: 1,
          model: ['4', 0],
          clip: ['4', 1],
        },
        class_type: 'S3Bucket_Load_LoRA',
      },
      '13': {
        inputs: {
          filename_prefix: 'ComfyUI',
          images: ['8', 0],
        },
        class_type: 'SaveImage',
      },
    },
  },
}
);
