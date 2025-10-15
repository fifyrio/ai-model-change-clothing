import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
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

    return NextResponse.json({
      success: uploadedFiles.length > 0,
      uploadedCount: uploadedFiles.length,
      totalCount: files.length,
      uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully uploaded ${uploadedFiles.length} of ${files.length} file(s)`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
