#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { analyzeSingleImage } from './analyze-fashion.js';
import { ImageGenerator } from './image-generator.js';
import { saveBase64Image } from './utils.js';

async function main() {
    const referenceImagePath = process.argv[2];
    const modelImageUrl = process.argv[3];

    if (!referenceImagePath) {
        console.error('请提供参考图片路径作为第一个参数');
        console.error('用法: npm run batch "参考图片路径" "模特图片URL"');
        console.error('示例: npm run batch "./reference.jpg" "https://example.com/model.jpg"');
        process.exit(1);
    }

    if (!modelImageUrl) {
        console.error('请提供模特图片URL作为第二个参数');
        console.error('用法: npm run batch "参考图片路径" "模特图片URL"');
        console.error('示例: npm run batch "./reference.jpg" "https://example.com/model.jpg"');
        process.exit(1);
    }

    // 检查参考图片文件是否存在
    const fullReferenceImagePath = path.resolve(referenceImagePath);
    if (!fs.existsSync(fullReferenceImagePath)) {
        console.error(`参考图片文件不存在: ${fullReferenceImagePath}`);
        process.exit(1);
    }

    console.log('=== 批处理开始 ===');
    console.log('参考图片:', fullReferenceImagePath);
    console.log('模特图片URL:', modelImageUrl);
    console.log('');

    try {
        // 第一步：使用 analyze-fashion.ts 的方法分析参考图片提取穿搭细节
        console.log('🔍 第一步：分析参考图片，提取穿搭细节...');

        const analysisResult = await analyzeSingleImage(fullReferenceImagePath);

        if (!analysisResult.success) {
            console.error('❌ 分析参考图片失败:', analysisResult.error);
            process.exit(1);
        }

        const clothingDetails = analysisResult.analysis;
        console.log('✅ 穿搭细节提取完成:');
        console.log('---');
        console.log(clothingDetails);
        console.log('---');
        console.log('');

        // 第二步：使用提取的穿搭细节生成新图片
        console.log('🎨 第二步：使用提取的穿搭细节生成新图片...');

        const imageGenerator = new ImageGenerator();
        const generationResult = await imageGenerator.generateImage(clothingDetails, modelImageUrl);

        if (!generationResult.success) {
            console.error('❌ 生成图片失败:', generationResult.error);
            process.exit(1);
        }

        if (generationResult.result) {
            console.log('✅ 图片生成完成');

            // 检查是否包含生成的图片
            if (generationResult.result.startsWith('http') || generationResult.result.startsWith('data:image/')) {
                try {
                    // 保存图片到 generated 目录
                    const modelName = "BatchGenerated";
                    const savedPath = saveBase64Image(generationResult.result, 'generated', modelName);

                    console.log('📁 图片已保存到:', savedPath);
                    console.log('👗 使用的穿搭描述:', clothingDetails.substring(0, 100) + '...');

                } catch (saveError: any) {
                    console.error('❌ 保存图片失败:', saveError.message);
                    console.log('📝 生成结果:', generationResult.result);
                }
            } else {
                // 如果不是图片数据，直接显示结果
                console.log('📝 生成结果:', generationResult.result);
            }
        }

        console.log('');
        console.log('🎉 批处理完成！');

    } catch (error: any) {
        console.error('❌ 批处理过程中出错:', error.message);
        process.exit(1);
    }
}

main().catch((error: any) => {
    console.error('❌ 脚本运行出错:', error.message);
    process.exit(1);
});