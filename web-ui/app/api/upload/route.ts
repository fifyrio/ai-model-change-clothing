import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readdir, unlink } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    // Save to chuandai directory (parent directory of web-ui)
    const uploadsDir = path.join(process.cwd(), '..', 'chuandai');

    // Clear all files in chuandai directory before uploading
    let clearedCount = 0;
    try {
      const existingFiles = await readdir(uploadsDir);
      for (const file of existingFiles) {
        const filePath = path.join(uploadsDir, file);
        try {
          await unlink(filePath);
          clearedCount++;
        } catch (error) {
          console.error(`Error deleting ${file}:`, error);
        }
      }
      console.log(`Cleared ${clearedCount} file(s) from chuandai directory`);
    } catch (error) {
      console.error('Error clearing chuandai directory:', error);
    }

    const uploadedFiles: string[] = [];
    const errors: { filename: string; error: string }[] = [];

    // Process all files
    for (const file of files) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = path.join(uploadsDir, file.name);

        await writeFile(filePath, buffer);
        uploadedFiles.push(file.name);
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        errors.push({
          filename: file.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const message = clearedCount > 0
      ? `Cleared ${clearedCount} existing file(s). Successfully uploaded ${uploadedFiles.length} of ${files.length} new file(s)`
      : `Successfully uploaded ${uploadedFiles.length} of ${files.length} file(s)`;

    return NextResponse.json({
      success: uploadedFiles.length > 0,
      uploadedCount: uploadedFiles.length,
      totalCount: files.length,
      clearedCount,
      uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
      message
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
