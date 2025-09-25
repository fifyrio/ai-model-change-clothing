import * as fs from 'fs';
import * as path from 'path';
import { AIService } from './ai-service.js';
import { getImageFiles, imageToBase64, delay } from './utils.js';

// 主函数
async function main(): Promise<void> {
    const targetDir: string = process.argv[2] || 'chuandai';
    const fullPath: string = path.resolve(targetDir);
    
    console.log('正在使用模型: OpenAI GPT-5-mini');
    console.log(`正在扫描目录: ${fullPath}`);
    console.log('使用方法: npm run analyze [目录名]\n');
    
    if (!fs.existsSync(fullPath)) {
        console.error(`目录不存在: ${fullPath}`);
        process.exit(1);
    }
    
    const imageFiles: string[] = getImageFiles(fullPath);
    
    if (imageFiles.length === 0) {
        console.log('未找到任何图片文件');
        return;
    }
    
    console.log(`找到 ${imageFiles.length} 个图片文件:`);
    imageFiles.forEach(file => console.log(`  - ${path.basename(file)}`));
    console.log('');
    
    const aiService = new AIService();
    
    for (let i: number = 0; i < imageFiles.length; i++) {
        const imagePath: string = imageFiles[i];
        const filename: string = path.basename(imagePath);
        
        console.log(`正在分析图片 ${i + 1}/${imageFiles.length}: ${filename}`);
        
        try {
            const base64Image: string | null = imageToBase64(imagePath);
            if (!base64Image) {
                console.log(`跳过文件: ${filename} (读取失败)`);
                continue;
            }
            
            const result = await aiService.analyzeImage(base64Image, filename);
            
            if (result.success) {
                console.log(`\n=== ${filename} 的穿搭分析 (${result.modelName}) ===`);
                console.log(result.analysis);
                console.log('\n' + '='.repeat(50) + '\n');
            } else {
                console.error(`分析 ${filename} 时出错:`, result.error);
            }
            
        } catch (error: any) {
            console.error(`分析 ${filename} 时出错:`, error.message);
        }
        
        // 为了避免触发API限制，在请求之间添加短暂延迟
        if (i < imageFiles.length - 1) {
            await delay(1000);
        }
    }
    
    console.log('所有图片分析完成！');
}

// 运行脚本
main().catch((error: any) => {
    console.error('脚本运行出错:', error.message);
    process.exit(1);
});