#!/usr/bin/env node
import { AIService } from './ai-service.js';

async function main() {
    const clothingDescription = process.argv[2] || "白色露肩连衣裙，搭配黑色高跟鞋";
    const imageCount = parseInt(process.argv[3] || "1");

    console.log('\n🧪 测试小红书标题生成功能');
    console.log('👗 服装描述:', clothingDescription);
    console.log('📸 图片数量:', imageCount);
    console.log('');

    const aiService = new AIService();

    try {
        const title = await aiService.generateXiaohongshuTitle(clothingDescription, imageCount);

        console.log('\n=== 📝 小红书爆款标题 ===');
        console.log(title);
        console.log('========================\n');

        console.log('✅ 标题生成测试成功！');
    } catch (error: any) {
        console.error('\n❌ 标题生成失败:', error.message);
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
