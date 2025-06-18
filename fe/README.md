# BoothMe - AI Photo Booth

A web-based photo booth application that uses Stable Diffusion for AI-powered photo transformations.

## System Requirements

- Docker and Docker Compose
- NVIDIA GPU with CUDA support (for Stable Diffusion)
- At least 8GB RAM
- At least 10GB free disk space

## How To Run

1. Clone the repository:
bash
git clone https://github.com/sgraa/boothme.git
cd boothme


2. Download the Stable Diffusion model:
bash
mkdir -p sd_models
cd sd_models

Download the [Model](https://civitai.com/api/download/models/425083?type=Model&format=SafeTensor&size=full&fp=fp16) 

3. Start the application:
bash
docker compose up --build


4. Access the applications:
- Stable Diffusion WebUI: http://localhost:7860
- BoothMe Frontend: http://localhost:5173

5. Initial Setup:
- Open Stable Diffusion WebUI (http://localhost:7860)
- Go to Settings > Model
- Select "revAnimated_v2Rebirth.safetensors" as the model
- Click "Apply settings" and "Reload UI"
- Try generating a test image to ensure everything works

6. Start using BoothMe:
- Open http://localhost:5173 in your browser
- Click "Try BoothMe" to start
- Follow the on-screen instructions to take and transform photos

## Troubleshooting

If you encounter any issues:
1. Make sure your GPU is properly detected by Docker
2. Check if all containers are running: docker compose ps
3. Check container logs: docker compose logs
4. Ensure the model file is correctly downloaded and placed in sd_models directory

## Development

For development:
- Frontend code is in the fe directory
- Backend code is in the backend directory
- Stable Diffusion configuration is in the stable-diffusion directory