import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readdir, rename, mkdir } from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { character } = body;

    if (!character) {
      return NextResponse.json(
        { error: 'Character is required' },
        { status: 400 }
      );
    }

    // Validate character option
    const validCharacters = ['lin', 'Qiao', 'lin_home_1'];
    if (!validCharacters.includes(character)) {
      return NextResponse.json(
        { error: 'Invalid character. Must be one of: lin, Qiao, lin_home_1' },
        { status: 400 }
      );
    }

    // Move all images from generated to generated/cache before generation
    const projectDir = path.join(process.cwd(), '..');
    const generatedDir = path.join(projectDir, 'generated');
    const cacheDir = path.join(generatedDir, 'cache');

    let movedCount = 0;
    try {
      // Ensure cache directory exists
      await mkdir(cacheDir, { recursive: true });

      // Read all files in generated directory
      const files = await readdir(generatedDir);

      // Filter for image files and exclude subdirectories
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.json'];
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (imageExtensions.includes(ext)) {
          const sourcePath = path.join(generatedDir, file);
          const destPath = path.join(cacheDir, file);

          try {
            await rename(sourcePath, destPath);
            movedCount++;
          } catch (error) {
            console.error(`Error moving ${file}:`, error);
          }
        }
      }

      console.log(`Moved ${movedCount} file(s) to cache directory`);
    } catch (error) {
      console.error('Error moving files to cache:', error);
    }

    // Execute the batch command from the parent directory
    const command = `npm run batch random ${character}`;

    console.log(`Executing command: ${command} in directory: ${projectDir}`);

    const { stdout, stderr } = await execAsync(command, {
      cwd: projectDir,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
    });

    return NextResponse.json({
      success: true,
      character,
      movedCount,
      output: stdout,
      errors: stderr || null,
      message: `Moved ${movedCount} file(s) to cache. Generation completed successfully`
    });
  } catch (error: unknown) {
    console.error('Generation error:', error);

    // Type guard for error with stdout/stderr
    const execError = error as { stdout?: string; stderr?: string; message?: string };

    return NextResponse.json(
      {
        error: 'Failed to generate images',
        details: execError.message || 'Unknown error',
        output: execError.stdout || null,
        stderr: execError.stderr || null
      },
      { status: 500 }
    );
  }
}
