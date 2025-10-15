#!/usr/bin/env node
import { ImageGenerator } from './image-generator.js';
import { AIService } from './ai-service.js';

async function main() {
    const clothing = process.argv[2];
    const imageUrl = process.argv[3];

    if (!clothing) {
        console.error('❌ 请提供服装描述作为参数');
        console.error('用法: npm run generate "服装描述" [图片URL]');
        process.exit(1);
    }

    console.log('\n🎨 正在生成图片...');
    console.log('👗 服装描述:', clothing);
    if (imageUrl) {
        console.log('📸 使用图片:', imageUrl);
    } else {
        console.log('📸 使用默认模特图片');
    }
    console.log('');

    const generator = new ImageGenerator();
    const aiService = new AIService();
    const girlName = "Generated";

    try {
        // 使用优化后的 generateImage 方法，自动保存文件
        const result = await generator.generateImage(
            clothing,
            imageUrl,
            true,  // saveToFile = true
            girlName
        );

        if (result.success) {
            console.log('\n=== ✅ 图片生成成功 ===');

            // 统计生成的图片数量（当前只生成1张）
            const imageCount = 1;

            if (result.savedPath) {
                // 图片已自动保存
                console.log('📁 保存路径:', result.savedPath);
                if (result.metadataPath) {
                    console.log('📄 元数据路径:', result.metadataPath);
                }
                if (result.decodedImage) {
                    console.log('📦 图片信息:', {
                        mimeType: result.decodedImage.mimeType,
                        size: `${(result.decodedImage.size / 1024).toFixed(2)} KB`
                    });
                }
                console.log('👗 服装描述:', clothing);
            } else if (result.result) {
                // 处理其他类型的结果
                if (result.result.startsWith('http')) {
                    console.log('🔗 生成的图片URL:', result.result);
                    console.log('💡 请手动下载图片或使用其他工具处理URL');
                } else if (result.result.startsWith('data:image/')) {
                    console.log('📷 生成的图片 (data URI)');
                    console.log('💡 图片数据长度:', result.result.length);
                } else {
                    console.log('📝 生成结果:', result.result);
                    console.log('💡 响应不是有效的图片格式，可能是文本描述或错误信息');
                }
            } else {
                console.log('⚠️  生成成功但无内容返回');
            }

            // 生成小红书标题
            console.log('\n');
            try {
                const xiaohongshuTitle = await aiService.generateXiaohongshuTitle(clothing, imageCount);
                console.log('\n=== 📝 小红书爆款标题 ===');
                console.log(xiaohongshuTitle);
                console.log('========================\n');
            } catch (titleError: any) {
                console.warn('\n⚠️  小红书标题生成失败:', titleError.message);
                console.warn('图片已成功生成，但标题生成出现问题\n');
            }
        } else {
            console.error('\n❌ 生成图片失败:', result.error);
            process.exit(1);
        }

    } catch (error: any) {
        console.error('\n❌ 生成图片时出错:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
        process.exit(1);
    }
}

main().catch((error: any) => {
    console.error('❌ 脚本运行出错:', error.message);
    process.exit(1);
});