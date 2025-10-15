import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
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

    // Execute the batch command from the parent directory
    const projectDir = path.join(process.cwd(), '..');
    const command = `npm run batch random ${character}`;

    console.log(`Executing command: ${command} in directory: ${projectDir}`);

    const { stdout, stderr } = await execAsync(command, {
      cwd: projectDir,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
    });

    return NextResponse.json({
      success: true,
      character,
      output: stdout,
      errors: stderr || null,
      message: 'Generation completed successfully'
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
