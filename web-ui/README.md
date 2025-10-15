# AI Fashion Image Generator - Web UI

A modern web interface for the AI Fashion Image Generator project, built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **Image Upload**: Upload fashion images directly to the `chuandai` directory
- **Character Selection**: Choose from three character models:
  - `lin`
  - `Qiao`
  - `lin_home_1`
- **Batch Generation**: Trigger the batch image generation process with a single click
- **Real-time Feedback**: Visual status updates for upload and generation progress
- **Responsive Design**: Beautiful, mobile-friendly UI with gradient backgrounds and smooth animations

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Parent project environment configured (`.env` file with API keys)

### Installation

The dependencies are already installed when you created the Next.js project. If needed, you can reinstall:

```bash
cd web-ui
npm install
```

### Running the Development Server

From the **parent directory**:

```bash
npm run web
```

Or directly from the `web-ui` directory:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. **Upload an Image**
   - Click the upload area or drag and drop an image
   - Supported formats: PNG, JPG, GIF (max 10MB)
   - Click "Upload to chuandai folder" to save the image

2. **Select a Character**
   - Choose one of the three available characters: `lin`, `Qiao`, or `lin_home_1`

3. **Generate Images**
   - Click the "Generate Images" button
   - This runs the command: `npm run batch random [character]`
   - Wait for the AI to process and generate new images

## API Routes

### POST `/api/upload`

Uploads an image file to the `chuandai` directory.

**Request**: FormData with `file` field

**Response**:
```json
{
  "success": true,
  "filename": "image.jpg",
  "message": "File uploaded successfully"
}
```

### POST `/api/generate`

Triggers the batch image generation process.

**Request**:
```json
{
  "character": "lin" | "Qiao" | "lin_home_1"
}
```

**Response**:
```json
{
  "success": true,
  "character": "lin",
  "output": "...",
  "message": "Generation completed successfully"
}
```

## Project Structure

```
web-ui/
├── app/
│   ├── api/
│   │   ├── upload/
│   │   │   └── route.ts      # File upload API
│   │   └── generate/
│   │       └── route.ts      # Batch generation API
│   ├── page.tsx              # Main UI page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── public/                   # Static assets
├── package.json
└── README.md
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Runtime**: Node.js with Turbopack

## Development

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### Upload fails

- Ensure the `chuandai` directory exists in the parent project
- Check file permissions

### Generation fails

- Verify the parent project's environment variables are configured
- Ensure the batch script is working: `npm run batch random lin`
- Check console logs for detailed error messages

## License

MIT
