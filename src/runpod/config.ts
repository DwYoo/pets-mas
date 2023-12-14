require('dotenv').config(); // Load environment variables from .env file

export class InferPrompt {
    text:string;
    constructor(petClass:string) {
        this.text = `artistic photo of zwc ${petClass} wearing Santa costume, small cute santa hat, Christmas tree, Christmas style, Christmas concept, (Christmas:1.3), presents, (zwc cat:1.4), (midnight:1.5), (fancy:1.5), twinkle, colorful background, fancy wallpaper, a professional photo, 4k`
    }
}

export let inferenceRequestData= {
    "input": {
        "output_path": "",
        "prompt": {
            "3": {
                "inputs": {
                "seed": 157691551724910,
                "steps": 30,
                "cfg": 8,
                "sampler_name": "euler",
                "scheduler": "normal",
                "denoise": 1,
                "model": [
                    "11",
                    0
                ],
                "positive": [
                    "6",
                    0
                ],
                "negative": [
                    "7",
                    0
                ],
                "latent_image": [
                    "5",
                    0
                ]
                },
                "class_type": "KSampler"
            },
            "4": {
                "inputs": {
                "ckpt_name": "sd_xl_base_1.0.safetensors"
                },
                "class_type": "CheckpointLoaderSimple"
            },
            "5": {
                "inputs": {
                "width": 1024,
                "height": 1024,
                "batch_size": 3
                },
                "class_type": "EmptyLatentImage"
            },
            "6": {
                "inputs": {
                "text": "artistic photo of zwc cat wearing Santa costume, small cute santa hat, Christmas tree, Christmas style, Christmas concept, (Christmas:1.3), presents, (zwc cat:1.4), (midnight:1.5), (fancy:1.5), twinkle, colorful background, fancy wallpaper, a professional photo, 4k",
                "clip": [
                    "11",
                    1
                ]
                },
                "class_type": "CLIPTextEncode"
            },
            "7": {
                "inputs": {
                "text": "text, watermark, low quality, day, bad body, monotone background, white wall, white background, bad hat",
                "clip": [
                    "11",
                    1
                ]
                },
                "class_type": "CLIPTextEncode"
            },
            "8": {
                "inputs": {
                "samples": [
                    "3",
                    0
                ],
                "vae": [
                    "4",
                    2
                ]
                },
                "class_type": "VAEDecode"
            },
            "11": {
                "inputs": {
                "lora_name": "test/models/ms_zwc_cat_v11.safetensors",
                "strength_model": 1,
                "strength_clip": 1,
                "model": [
                    "4",
                    0
                ],
                "clip": [
                    "4",
                    1
                ]
                },
                "class_type": "S3Bucket_Load_LoRA"
            },
            "25": {
                "inputs": {
                "filename_prefix": "ComfyUI",
                "images": [
                    "8",
                    0
                ]
                },
                "class_type": "SaveImage"
            }
        }
    }
};

export let trainRequestData={
  "input": {
      "zipfile_path": "", //이미지 zipfile경로
      "output_path": "", 
      "train": {
        "token_word": "zwc",
        "class_word": "pet",
        "training_repeats": 40,
        "project_name": "zwc_pet",
        "max_train_steps": 1500,
        "learning_rate": 0.0001,
        "save_every_n_steps": 2000,
        "optimizer_type": "adafactor",
        "lr_scheduler": "constant_with_warmup",
        "lr_warmup_steps": 50,
        "train_text_encoder": false,
        "train_batch_size": 1,
        "resolution": 1024,
        "full_bf16": true,
        "mixed_precision": "bf16",
        "save_precision": "bf16",
        "save_model_as": "safetensors",
        "network_alpha": 1,
        "network_dim": 16
      },
  }
}