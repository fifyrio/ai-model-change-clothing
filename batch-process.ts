#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { analyzeSingleImage } from './analyze-fashion.js';
import { ImageGenerator } from './image-generator.js';
import { saveBase64Image, saveImageMetadata } from './utils.js';
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
async function processSingleImage(imagePath: string, modelImageUrl: string, imageIndex: number, totalImages: number, useBase64Mode: boolean = false): Promise<void> {
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
        console.log(`🎨 生成新图片${useBase64Mode ? '（Base64模式）' : ''}...`);

        const imageGenerator = new ImageGenerator();
        const generationResult = useBase64Mode 
            ? await imageGenerator.generateImageBase64(clothingDetails, modelImageUrl)
            : await imageGenerator.generateImage(clothingDetails, modelImageUrl);

        if (!generationResult.success) {
            console.error('❌ 生成图片失败:', generationResult.error);
            return;
        }

        if (generationResult.result) {
            console.log(`✅ 图片生成完成:${generationResult.result}`);

            try {
                // 尝试解析JSON格式的响应（仅在Base64模式下）
                let imageData = generationResult.result;
                let description = '';
                
                if (useBase64Mode) {
                    try {
                        let jsonContent = generationResult.result.trim();
                        
                        // 如果包装在markdown代码块中，提取JSON内容
                        if (jsonContent.includes('```json')) {
                            const match = jsonContent.match(/```json\s*(\{[\s\S]*?\})\s*```/);
                            if (match) {
                                jsonContent = match[1];
                            }
                        }
                        
                        // 尝试解析JSON
                        if (jsonContent.startsWith('{')) {
                            const jsonResponse = JSON.parse(jsonContent);
                            
                            // 检查元数据，了解响应类型
                            if (jsonResponse._meta) {
                                console.log('📊 响应元信息:', jsonResponse._meta);
                                if (jsonResponse._meta.has_truncated_base64) {
                                    console.log('⚠️  检测到base64数据被截断，尝试使用images字段');
                                }
                                if (jsonResponse._meta.check_images_field) {
                                    console.log('💡 提示：检查API响应的images字段获取完整图片');
                                }
                            }
                            
                            if (jsonResponse.image_data && jsonResponse.image_data.length > 100) {
                                imageData = jsonResponse.image_data;
                                description = jsonResponse.description || '';
                                console.log('📝 图片描述:', description);
                            } else if (jsonResponse.description) {
                                description = jsonResponse.description;
                                console.log('📝 图片描述:', description);
                                console.log('ℹ️  未获得完整图片数据，但生成请求已发送');
                            }
                        }
                    } catch (jsonError) {
                        console.log('📝 非JSON响应，直接处理为图片数据');
                    }
                }

                // 检查是否包含生成的图片
                if (imageData.startsWith('http') || imageData.startsWith('data:image/')) {
                    // 保存图片到 generated 目录，使用原图片名作为前缀
                    const baseFileName = path.parse(fileName).name;
                    const modelName = `Batch_${baseFileName}${useBase64Mode ? '_base64' : ''}`;
                    const savedPath = saveBase64Image(imageData, 'generated', modelName);

                    // 保存图片元数据到 JSON 文件
                    const metadataPath = saveImageMetadata(savedPath, {
                        clothingDescription: clothingDetails,
                        generationTimestamp: generationResult.timestamp
                    });

                    console.log('📁 图片已保存到:', savedPath);
                    console.log('📄 元数据已保存到:', metadataPath);
                    if (description) {
                        console.log('💬 描述:', description);
                    }
                } else {
                    // 如果不是图片数据，显示结果类型
                    console.log('📝 生成结果类型:', typeof imageData);
                    console.log('📄 内容预览:', imageData.substring(0, 200) + (imageData.length > 200 ? '...' : ''));
                }

            } catch (saveError: any) {
                console.error('❌ 保存图片失败:', saveError.message);
                console.log('📝 原始生成结果:', generationResult.result.substring(0, 500) + '...');
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

    // 检查是否为 lin_home_* 特殊模式（使用固定的 frame_1.png）
    const linHomeMatch = name.match(/^lin_home_(\d+)$/);
    if (linHomeMatch) {
        const homeNumber = linHomeMatch[1];
        return `${host}/lin_home_${homeNumber}/frame_1.png`;
    }

    // 保持原有的随机逻辑
    const randomNumber = Math.floor(Math.random() * 10) + 1; // 1-10之间的随机数
    return `${host}/${name}/frame_${randomNumber}.jpg`;
}

async function main() {
    const inputParam = process.argv[2];
    const nameParam = process.argv[3];
    const modeParam = process.argv[4];

    // 检查参数
    if (!inputParam) {
        console.error('请提供模特图片URL或使用random参数');
        console.error('用法: npm run batch "模特图片URL" [name] [mode]');
        console.error('示例: npm run batch "https://example.com/model.jpg"');
        console.error('示例: npm run batch random  (默认使用lin，随机选择frame_1到frame_10)');
        console.error('示例: npm run batch random Qiao  (使用Qiao目录，随机选择frame_1到frame_10)');
        console.error('示例: npm run batch random lin_home_1  (使用lin_home_1目录的frame_1.png)');
        console.error('示例: npm run batch random lin_home_2  (使用lin_home_2目录的frame_1.png)');
        console.error('示例: npm run batch random Qiao base64  (使用Base64模式)');
        process.exit(1);
    }

    // 处理random参数和Base64模式
    let modelImageUrl: string;
    let useBase64Mode = false;
    
    if (inputParam.toLowerCase() === 'random') {
        const modelName = nameParam || 'lin'; // 如果没有提供name参数，默认使用'lin'
        modelImageUrl = getRandomModelUrl(modelName);
        console.log('🎲 使用随机模特图片URL:', modelImageUrl);
        console.log('📂 使用模特目录:', modelName);
        
        // 检查是否启用Base64模式
        useBase64Mode = Boolean((nameParam && nameParam.toLowerCase() === 'base64') || (modeParam && modeParam.toLowerCase() === 'base64'));
    } else {
        modelImageUrl = inputParam;
        // 检查是否启用Base64模式
        useBase64Mode = Boolean((nameParam && nameParam.toLowerCase() === 'base64') || (modeParam && modeParam.toLowerCase() === 'base64'));
    }
    
    if (useBase64Mode) {
        console.log('🔄 启用Base64模式 - 将尝试获取JSON格式的base64图片数据');
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
    console.log('⚙️  处理模式:', useBase64Mode ? 'Base64模式（尝试获取JSON格式数据）' : '普通模式');
    console.log('📁 支持格式:', SUPPORTED_IMAGE_FORMATS.join(', '));
    
    try {
        // 逐一处理每张图片
        for (let i = 0; i < imageFiles.length; i++) {
            await processSingleImage(imageFiles[i], modelImageUrl, i + 1, imageFiles.length, useBase64Mode);
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