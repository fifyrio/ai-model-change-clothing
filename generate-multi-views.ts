#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { ImageGenerator } from './image-generator.js';
import { getImageFiles, imageToBase64, delay } from './utils.js';

// 多角度视图生成器类
export class MultiViewGenerator {
    private imageGenerator: ImageGenerator;

    constructor() {
        this.imageGenerator = new ImageGenerator();
    }

    // 为单个图片生成多角度视图
    async generateMultiViews(imagePath: string): Promise<void> {
        const fileName = path.basename(imagePath, path.extname(imagePath));
        const outputDir = path.join('generated', 'multi-views');
        
        console.log(`\n🔄 处理图片: ${fileName}`);

        // 将本地图片转换为base64格式
        const imageBase64 = imageToBase64(imagePath);
        if (!imageBase64) {
            console.error(`❌ 无法读取图片: ${imagePath}`);
            return;
        }

        // 定义要生成的三个角度
        const views = [
            { name: 'front', description: '正面视图 - 人物面向观众的正面角度' },
            { name: 'side', description: '侧面视图 - 人物完整的侧面轮廓' },
            { name: 'back', description: '背面视图 - 人物背对观众的背面角度' }
        ];

        for (const view of views) {
            try {
                console.log(`  📸 生成${view.description}...`);
                
                // 构建生成提示
                const prompt = `Generate a ${view.name} view of the person in this image. 
                保持人物的服装、身材比例和风格完全一致。
                ${view.description}。
                确保服装细节和人物特征保持原图的一致性。
                背景可以保持简洁统一。`;
                
                // 生成图片
                const result = await this.imageGenerator.generateImage(prompt, imageBase64);
                
                if (result.success && result.result) {
                    // 确保输出目录存在
                    if (!fs.existsSync(outputDir)) {
                        fs.mkdirSync(outputDir, { recursive: true });
                    }
                    
                    // 保存生成的图片
                    try {
                        // 检查是否是base64格式的图片
                        if (result.result.startsWith('data:image/') || result.result.startsWith('http')) {
                            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                            const outputFileName = `${fileName}_${view.name}_${timestamp}.png`;
                            const outputPath = path.join(outputDir, outputFileName);
                            
                            if (result.result.startsWith('data:image/')) {
                                // Base64格式
                                const base64Data = result.result.split(',')[1];
                                const imageBuffer = Buffer.from(base64Data, 'base64');
                                fs.writeFileSync(outputPath, imageBuffer);
                            } else {
                                // URL格式 - 记录URL
                                console.log(`  🔗 ${view.name}视图URL: ${result.result}`);
                                fs.writeFileSync(outputPath.replace('.png', '.txt'), result.result);
                            }
                            
                            console.log(`  ✅ ${view.name}视图已保存: ${outputPath}`);
                        } else {
                            console.log(`  📝 ${view.name}视图结果: ${result.result}`);
                        }
                    } catch (saveError: any) {
                        console.error(`  ❌ 保存${view.name}视图失败:`, saveError.message);
                    }
                } else {
                    console.log(`  ❌ ${view.name}视图生成失败: ${result.error || '未知错误'}`);
                }
                
                // 添加延迟避免API限制
                await delay(2000);
                
            } catch (error: any) {
                console.error(`  ❌ 生成${view.description}时出错:`, error.message);
            }
        }
        
        console.log(`📝 ${fileName} 的多角度视图生成完成`);
    }

    // 批量处理目录中的所有图片
    async processDirectory(directory: string): Promise<void> {
        console.log(`🔍 扫描目录: ${directory}`);
        
        // 检查目录是否存在
        if (!fs.existsSync(directory)) {
            console.error(`❌ 目录不存在: ${directory}`);
            console.log(`💡 提示: 请确保 '${directory}' 目录存在并包含图片文件`);
            return;
        }

        // 获取所有图片文件
        const imageFiles = getImageFiles(directory);
        
        if (imageFiles.length === 0) {
            console.log(`📭 目录 '${directory}' 中没有找到支持的图片文件`);
            console.log('💡 支持的格式: .jpg, .jpeg, .png, .gif, .bmp, .webp');
            return;
        }

        console.log(`📊 找到 ${imageFiles.length} 个图片文件`);
        
        // 处理每个图片文件
        for (let i = 0; i < imageFiles.length; i++) {
            const imagePath = imageFiles[i];
            console.log(`\n⏳ 进度: ${i + 1}/${imageFiles.length}`);
            
            try {
                await this.generateMultiViews(imagePath);
            } catch (error: any) {
                console.error(`❌ 处理图片失败 ${imagePath}:`, error.message);
                continue;
            }
        }
        
        console.log(`\n🎉 批量多角度视图生成完成！`);
        console.log(`📁 生成的图片保存在: generated/multi-views/`);
    }
}

// 主函数
async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const directory = args[0] || 'randomGesture';
    
    console.log('🎨 多角度人物视图生成器');
    console.log('==========================================');
    
    try {
        const generator = new MultiViewGenerator();
        await generator.processDirectory(directory);
    } catch (error: any) {
        console.error('❌ 程序执行错误:', error.message);
        process.exit(1);
    }
}

// 运行主函数
main().catch((error: any) => {
    console.error('❌ 脚本运行出错:', error.message);
    process.exit(1);
});