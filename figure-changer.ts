#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { ImageGenerator } from './image-generator.js';
import { getImageFiles, imageToBase64, delay } from './utils.js';

// 身材变换器类
export class FigureChanger {
    private imageGenerator: ImageGenerator;
    private targetFigure: string;

    constructor() {
        this.imageGenerator = new ImageGenerator();
        // this.targetFigure = 'Voluptuous body, Small waist, wide hips';
        this.targetFigure = 'Voluptuous body';
    }

    // 为单个图片变换身材
    async changeFigure(imagePath: string): Promise<void> {
        const fileName = path.basename(imagePath, path.extname(imagePath));
        const outputDir = path.join('generated', 'figure-changed');
        
        console.log(`\n🔄 处理图片: ${fileName}`);

        // 将本地图片转换为base64格式
        const imageBase64 = imageToBase64(imagePath);
        if (!imageBase64) {
            console.error(`❌ 无法读取图片: ${imagePath}`);
            return;
        }

        try {
            console.log(`  🎯 变换身材为: ${this.targetFigure}...`);
            
            // 构建生成提示
            const prompt = `Transform the person in this image to have the following body characteristics: ${this.targetFigure}.
            保持人物的面部特征、服装风格、姿势和背景完全一致。
            只改变身材比例，让身材更加性感迷人。
            确保服装贴合新的身材比例。
            保持图片的整体风格和质量。
            女生皮肤雪白白皙。`;
            
            // 生成图片
            const result = await this.imageGenerator.generateImage(prompt, imageBase64);
            
            if (result.success && result.result) {
                // 确保输出目录存在
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }
                
                // 保存生成的图片
                try {
                    // 检查是否是base64格式的图片或URL
                    if (result.result.startsWith('data:image/') || result.result.startsWith('http')) {
                        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                        const outputFileName = `Figure_${fileName}_${timestamp}.png`;
                        const outputPath = path.join(outputDir, outputFileName);
                        
                        if (result.result.startsWith('data:image/')) {
                            // Base64格式
                            const base64Data = result.result.split(',')[1];
                            const imageBuffer = Buffer.from(base64Data, 'base64');
                            fs.writeFileSync(outputPath, imageBuffer);
                            console.log(`  ✅ 身材变换已保存: ${outputPath}`);
                        } else {
                            // URL格式 - 记录URL
                            console.log(`  🔗 身材变换结果URL: ${result.result}`);
                            fs.writeFileSync(outputPath.replace('.png', '.txt'), result.result);
                            console.log(`  ✅ URL已保存: ${outputPath.replace('.png', '.txt')}`);
                        }
                    } else {
                        console.log(`  📝 身材变换结果: ${result.result}`);
                    }
                } catch (saveError: any) {
                    console.error(`  ❌ 保存身材变换结果失败:`, saveError.message);
                }
            } else {
                console.log(`  ❌ 身材变换失败: ${result.error || '未知错误'}`);
            }
            
            // 添加延迟避免API限制
            await delay(2000);
            
        } catch (error: any) {
            console.error(`  ❌ 身材变换时出错:`, error.message);
        }
        
        console.log(`📝 ${fileName} 的身材变换完成`);
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
        console.log(`🎯 目标身材: ${this.targetFigure}`);
        
        // 处理每个图片文件
        for (let i = 0; i < imageFiles.length; i++) {
            const imagePath = imageFiles[i];
            console.log(`\n⏳ 进度: ${i + 1}/${imageFiles.length}`);
            
            try {
                await this.changeFigure(imagePath);
            } catch (error: any) {
                console.error(`❌ 处理图片失败 ${imagePath}:`, error.message);
                continue;
            }
        }
        
        console.log(`\n🎉 批量身材变换完成！`);
        console.log(`📁 生成的图片保存在: generated/figure-changed/`);
    }
}

// 主函数
async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const directory = args[0] || 'figureChanger';
    
    console.log('💃 AI 身材变换器');
    console.log('==========================================');
    console.log('🎯 目标身材: Voluptuous body, Small waist, wide hips');
    console.log('==========================================');
    
    try {
        const changer = new FigureChanger();
        await changer.processDirectory(directory);
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