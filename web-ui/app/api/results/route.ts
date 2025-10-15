import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat, readFile } from 'fs/promises';
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
      xiaohongshuTitle?: string;
    }> = [];

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (imageExtensions.includes(ext)) {
        const filePath = path.join(generatedDir, file);
        try {
          const stats = await stat(filePath);

          // 尝试读取对应的 JSON 元数据文件
          let xiaohongshuTitle: string | undefined;
          const jsonFileName = file.replace(ext, '.json');
          const jsonFilePath = path.join(generatedDir, jsonFileName);

          try {
            const jsonContent = await readFile(jsonFilePath, 'utf-8');
            const metadata = JSON.parse(jsonContent);
            xiaohongshuTitle = metadata.xiaohongshuTitle;
          } catch (jsonError) {
            // JSON 文件不存在或解析失败，继续处理
          }

          imageFiles.push({
            name: file,
            path: `/generated/${file}`,
            timestamp: stats.mtimeMs,
            xiaohongshuTitle,
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
