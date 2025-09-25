# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Build the project**: `npm run build`
- **Analyze fashion images**: `npm run analyze [directory]` (defaults to 'chuandai' directory)
- **Generate clothing images**: `npm run generate "clothing description" [image URL]`
- **Install dependencies**: `npm install`

## Project Architecture

### Core Purpose
This is an AI-powered fashion tool that:
1. **Analyzes fashion images** using GPT-5-mini to generate detailed clothing descriptions
2. **Generates new clothing images** using Gemini 2.5 Flash with image preview capabilities

### Key Components

#### Service Layer
- **`AIService`** (`ai-service.ts`): Handles fashion image analysis using OpenAI GPT models
- **`ImageGenerator`** (`image-generator.ts`): Manages clothing image generation using Gemini models

#### Configuration
- **`config.ts`**: OpenRouter API configuration, model definitions, and supported image formats
- **`types.ts`**: TypeScript type definitions for API responses and data structures
- **`prompts.ts`**: AI model prompts for analysis and generation tasks

#### Utilities
- **`utils.ts`**: Image processing utilities (base64 conversion, file operations, image saving)

#### Entry Points
- **`analyze-fashion.ts`**: CLI tool for batch analyzing fashion images in directories
- **`generate.ts`**: CLI tool for generating new clothing images based on descriptions

### AI Models Integration
- Uses **OpenRouter** as the API gateway
- **GPT-5-mini**: For detailed fashion analysis and clothing description extraction
- **Gemini 2.5 Flash Image Preview**: For generating new clothing images on existing models

### Image Processing
- Supports common image formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`
- Converts images to base64 for API transmission
- Saves generated images to `generated/` directory with timestamps

### Environment Setup
Requires `.env` file with:
- `OPENROUTER_API_KEY`: OpenRouter API key for model access
- `SITE_URL`: Application URL (optional, defaults to localhost:3000)
- `SITE_NAME`: Application name (optional, defaults to "Fashion Analysis Tool")

### TypeScript Configuration
- ES2020 target with ESNext modules
- Strict typing enabled
- Source maps and declarations generated in `dist/` directory
- Uses ts-node with ESM for direct TypeScript execution

## Development Notes

- The project uses ES modules (type: "module" in package.json)
- All TypeScript files use `.js` extensions in imports due to ESM requirements
- API calls include rate limiting delays (1 second between requests)
- Generated images are automatically saved with descriptive filenames and timestamps
- Error handling includes detailed logging for debugging API issues