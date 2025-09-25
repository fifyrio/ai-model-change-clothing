#!/usr/bin/env node
import { ImageGenerator } from './image-generator.js';
import { saveBase64Image } from './utils.js';

async function main() {
    const clothing = process.argv[2];
    const imageUrl = process.argv[3];
    
    if (!clothing) {
        console.error('请提供服装描述作为参数');
        console.error('用法: npm run generate "服装描述" [图片URL]');
        process.exit(1);
    }
    
    console.log('正在生成图片...');
    console.log('服装描述:', clothing);
    if (imageUrl) {
        console.log('使用图片:', imageUrl);
    } else {
        console.log('使用默认模特图片');
    }
    
    const generator = new ImageGenerator();
    
    try {
        const result = await generator.generateImage(clothing, imageUrl);
        const girlName = "Lin";
        
        if (result.success && result.result) {
            console.log('\n=== 图片生成结果 ===');
            
            // 检查是否包含生成的图片
            if (result.result !== "") {                
                const imageUrl = result.result;
                
                try {
                    // 保存图片到 generated 目录
                    const fileName = clothing.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_');
                    const savedPath = saveBase64Image(imageUrl, 'generated', girlName);
                    
                    console.log('✅ 图片已成功生成并保存');
                    console.log('📁 保存路径:', savedPath);
                    console.log('👗 服装描述:', clothing);
                    
                } catch (saveError: any) {
                    console.error('❌ 保存图片失败:', saveError.message);                    
                }
            } else {
                // 如果不是图片数据，直接显示结果
                console.log('📝 生成结果:', result.result);
            }
        } else {
            console.error('❌ 生成图片时出错:', result.error);
            process.exit(1);
        }
        
    } catch (error: any) {
        console.error('❌ 生成图片时出错:', error.message);
        process.exit(1);
    }
}

main().catch((error: any) => {
    console.error('❌ 脚本运行出错:', error.message);
    process.exit(1);
});