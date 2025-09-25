import * as fs from 'fs';
import * as path from 'path';
import { SUPPORTED_IMAGE_FORMATS } from './config.js';

// 获取 MIME 类型
export function getMimeType(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.bmp': 'image/bmp',
        '.webp': 'image/webp'
    };
    return mimeTypes[extension] || 'image/jpeg';
}

// 将图片文件转换为 base64
export function imageToBase64(imagePath: string): string | null {
    try {
        const imageBuffer: Buffer = fs.readFileSync(imagePath);
        const base64String: string = imageBuffer.toString('base64');
        const mimeType: string = getMimeType(path.extname(imagePath).toLowerCase());
        return `data:${mimeType};base64,${base64String}`;
    } catch (error: any) {
        console.error(`读取图片文件失败 ${imagePath}:`, error.message);
        return null;
    }
}

// 获取目录下的所有图片文件
export function getImageFiles(directory: string): string[] {
    try {
        const files: string[] = fs.readdirSync(directory);
        return files.filter((file: string) => {
            const ext: string = path.extname(file).toLowerCase();
            return SUPPORTED_IMAGE_FORMATS.includes(ext);
        }).map((file: string) => path.join(directory, file));
    } catch (error: any) {
        console.error('读取目录失败:', error.message);
        return [];
    }
}

// 延迟函数
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 保存 base64 图片到文件
export function saveBase64Image(base64Data: string, outputDir: string, fileName: string): string {
    try {
        // 确保输出目录存在
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // 提取 base64 数据和文件扩展名
        const matches = base64Data.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
        if (!matches) {
            throw new Error('无效的 base64 图片格式');
        }

        const imageType = matches[1]; // png, jpeg, etc.
        const base64Content = matches[2];
        
        // 生成文件名
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fullFileName = `${fileName}_${timestamp}.${imageType}`;
        const filePath = path.join(outputDir, fullFileName);

        // 将 base64 转换为 buffer 并保存
        const imageBuffer = Buffer.from(base64Content, 'base64');
        fs.writeFileSync(filePath, imageBuffer);

        return filePath;
    } catch (error: any) {
        console.error('保存图片失败:', error.message);
        throw error;
    }
}