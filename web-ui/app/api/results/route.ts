import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Path to generated directory (parent directory of web-ui)
    const generatedDir = path.join(process.cwd(), '..', 'generated');

    // Read all files in the directory
    const files = await readdir(generatedDir);

    // Filter for image files and get their stats
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    const imageFiles: Array<{
      name: string;
      path: string;
      timestamp: number;
    }> = [];

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.includes(ext)) {
        const filePath = path.join(generatedDir, file);
        try {
          const stats = await stat(filePath);
          imageFiles.push({
            name: file,
            path: `/generated/${file}`,
            timestamp: stats.mtimeMs,
          });
        } catch (error) {
          console.error(`Error reading file stats for ${file}:`, error);
        }
      }
    }

    // Sort by timestamp (newest first)
    imageFiles.sort((a, b) => b.timestamp - a.timestamp);

    return NextResponse.json({
      success: true,
      count: imageFiles.length,
      images: imageFiles,
    });
  } catch (error) {
    console.error('Error reading generated directory:', error);
    return NextResponse.json(
      { error: 'Failed to read generated images' },
      { status: 500 }
    );
  }
}
