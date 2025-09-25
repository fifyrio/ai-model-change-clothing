#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { analyzeSingleImage } from './analyze-fashion.js';
import { ImageGenerator } from './image-generator.js';
import { saveBase64Image } from './utils.js';
import { SUPPORTED_IMAGE_FORMATS } from './config.js';

// 获取目录中所有支持的图片文件
function getImageFiles(dirPath: string): string[] {
    const files = fs.readdirSync(dirPath);
    return files
        .filter(file => {
            const ext = path.extname(file).toLowerCase();
            return SUPPORTED_IMAGE_FORMATS.includes(ext);
        })
        .map(file => path.join(dirPath, file));
}

// 处理单张图片
async function processSingleImage(imagePath: string, modelImageUrl: string, imageIndex: number, totalImages: number): Promise<void> {
    const fileName = path.basename(imagePath);
    
    console.log(`\n📷 [${imageIndex}/${totalImages}] 处理图片: ${fileName}`);
    console.log('='.repeat(50));

    try {
        // 第一步：分析参考图片提取穿搭细节
        console.log('🔍 分析图片，提取穿搭细节...');

        const analysisResult = await analyzeSingleImage(imagePath);

        if (!analysisResult.success) {
            console.error('❌ 分析失败:', analysisResult.error);
            return;
        }

        const clothingDetails = analysisResult.analysis;
        console.log('✅ 穿搭细节提取完成:');
        console.log('---');
        console.log(clothingDetails.substring(0, 200) + '...');
        console.log('---');

        // 第二步：使用提取的穿搭细节生成新图片
        console.log('🎨 生成新图片...');

        const imageGenerator = new ImageGenerator();
        const generationResult = await imageGenerator.generateImage(clothingDetails, modelImageUrl);

        if (!generationResult.success) {
            console.error('❌ 生成图片失败:', generationResult.error);
            return;
        }

        if (generationResult.result) {
            console.log('✅ 图片生成完成');

            // 检查是否包含生成的图片
            if (generationResult.result.startsWith('http') || generationResult.result.startsWith('data:image/')) {
                try {
                    // 保存图片到 generated 目录，使用原图片名作为前缀
                    const baseFileName = path.parse(fileName).name;
                    const modelName = `Batch_${baseFileName}`;
                    const savedPath = saveBase64Image(generationResult.result, 'generated', modelName);

                    console.log('📁 图片已保存到:', savedPath);

                } catch (saveError: any) {
                    console.error('❌ 保存图片失败:', saveError.message);
                    console.log('📝 生成结果:', generationResult.result);
                }
            } else {
                // 如果不是图片数据，直接显示结果
                console.log('📝 生成结果:', generationResult.result);
            }
        }

        // 添加延时避免API限制
        console.log('⏳ 等待3秒...');
        await new Promise(resolve => setTimeout(resolve, 3000));

    } catch (error: any) {
        console.error('❌ 处理图片时出错:', error.message);
    }
}

// 生成随机模特图片URL
function getRandomModelUrl(name: string = 'lin'): string {
    const host = "https://pub-9e76573778404f65b02c3ea29d2db5f9.r2.dev";
    const randomNumber = Math.floor(Math.random() * 10) + 1; // 1-10之间的随机数
    return `${host}/${name}/frame_${randomNumber}.jpg`;
}

async function main() {
    const inputParam = process.argv[2];
    const nameParam = process.argv[3];

    // 检查参数
    if (!inputParam) {
        console.error('请提供模特图片URL或使用random参数');
        console.error('用法: npm run batch "模特图片URL" 或 npm run batch random [name]');
        console.error('示例: npm run batch "https://example.com/model.jpg"');
        console.error('示例: npm run batch random  (默认使用lin，随机选择frame_1到frame_10)');
        console.error('示例: npm run batch random Qiao  (使用Qiao目录，随机选择frame_1到frame_10)');
        process.exit(1);
    }

    // 处理random参数
    let modelImageUrl: string;
    if (inputParam.toLowerCase() === 'random') {
        const modelName = nameParam || 'lin'; // 如果没有提供name参数，默认使用'lin'
        modelImageUrl = getRandomModelUrl(modelName);
        console.log('🎲 使用随机模特图片URL:', modelImageUrl);
        console.log('📂 使用模特目录:', modelName);
    } else {
        modelImageUrl = inputParam;
    }

    const chuandaiDir = './chuandai';
    
    // 检查chuandai目录是否存在
    if (!fs.existsSync(chuandaiDir)) {
        console.error(`目录不存在: ${chuandaiDir}`);
        console.error('请确保chuandai目录存在并包含要处理的图片');
        process.exit(1);
    }

    // 获取所有图片文件
    const imageFiles = getImageFiles(chuandaiDir);
    
    if (imageFiles.length === 0) {
        console.error(`在 ${chuandaiDir} 目录中未找到支持的图片文件`);
        console.error('支持的格式:', SUPPORTED_IMAGE_FORMATS.join(', '));
        process.exit(1);
    }

    console.log('🚀 === 批量处理开始 ===');
    console.log('📂 扫描目录:', path.resolve(chuandaiDir));
    console.log('📷 找到图片:', imageFiles.length, '张');
    console.log('🖼️  模特图片URL:', modelImageUrl);
    console.log('📁 支持格式:', SUPPORTED_IMAGE_FORMATS.join(', '));
    
    try {
        // 逐一处理每张图片
        for (let i = 0; i < imageFiles.length; i++) {
            await processSingleImage(imageFiles[i], modelImageUrl, i + 1, imageFiles.length);
        }

        console.log('\n🎉 === 所有图片处理完成！===');
        console.log(`📊 总计处理: ${imageFiles.length} 张图片`);

    } catch (error: any) {
        console.error('❌ 批处理过程中出错:', error.message);
        process.exit(1);
    }
}

main().catch((error: any) => {
    console.error('❌ 脚本运行出错:', error.message);
    process.exit(1);
});