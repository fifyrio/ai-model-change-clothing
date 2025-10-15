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

// 保存图片元数据到 JSON 文件
export function saveImageMetadata(
    imagePath: string,
    metadata: {
        clothingDescription: string;
        generationTimestamp: Date;
        xiaohongshuTitle?: string;
    }
): string {
    try {
        const outputDir = path.dirname(imagePath);
        const imageFileName = path.basename(imagePath, path.extname(imagePath));
        const jsonFileName = `${imageFileName}.json`;
        const jsonPath = path.join(outputDir, jsonFileName);

        const jsonData: any = {
            imageName: path.basename(imagePath),
            clothingDetails: metadata.clothingDescription,
            timestamp: metadata.generationTimestamp.toISOString()
        };

        // 添加小红书标题（如果存在）
        if (metadata.xiaohongshuTitle) {
            jsonData.xiaohongshuTitle = metadata.xiaohongshuTitle;
        }

        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
        return jsonPath;
    } catch (error: any) {
        console.error('保存元数据失败:', error.message);
        throw error;
    }
}

// 验证 URL 格式
export function isValidUrl(urlString: string): boolean {
    try {
        new URL(urlString);
        return true;
    } catch {
        return false;
    }
}

// 将 base64 编码的图片数据解码为 Buffer
export function decodeBase64Image(base64Data: string): Buffer {
    // 移除可能的空白字符和换行
    const cleanBase64 = base64Data.replace(/[\s\n\r]/g, '');

    // 解码 base64 并返回 Buffer
    return Buffer.from(cleanBase64, 'base64');
}

// 获取图片文件扩展名（从 MIME 类型）
export function getImageExtension(mimeType: string): string {
    const extensionMap: { [key: string]: string } = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'image/bmp': '.bmp'
    };
    return extensionMap[mimeType] || '.jpg'; // 默认使用 jpg
}

// 从 data URI 解析并保存图片
export function saveDataUriImage(dataUri: string, outputDir: string, fileName: string): string {
    try {
        // 确保输出目录存在
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // 解析 data URI 获取 mime type 和 base64 数据
        const matches = dataUri.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
            throw new Error('无效的 data URI 格式');
        }

        const [, mimeType, base64Data] = matches;

        // 解码 base64 图片数据
        const imageBuffer = decodeBase64Image(base64Data);

        // 生成文件名
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const extension = getImageExtension(mimeType);
        const fullFileName = `${fileName}_${timestamp}${extension}`;
        const filePath = path.join(outputDir, fullFileName);

        // 保存文件
        fs.writeFileSync(filePath, imageBuffer);

        console.log(`✅ 图片已保存: ${filePath} (${imageBuffer.length} bytes, ${mimeType})`);

        return filePath;
    } catch (error: any) {
        console.error('保存 data URI 图片失败:', error.message);
        throw error;
    }
}