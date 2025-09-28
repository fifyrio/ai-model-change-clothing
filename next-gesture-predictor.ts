#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { ImageGenerator } from './image-generator.js';
import { getImageFiles, imageToBase64, delay } from './utils.js';
import { MessageContent } from './types.js';
import OpenAI from 'openai';
import { openRouterConfig, AI_MODELS } from './config.js';

// 动作分析结果接口
interface ActionAnalysis {
    actionType: string;        // 动作类型（瑜伽、舞蹈、日常等）
    currentAction: string;     // 当前具体动作
    actionStage: string;       // 动作阶段（开始、进行中、结束）
    bodyPosition: string;      // 身体各部位位置描述
    emotion: string;           // 情绪和意图
    confidence: number;        // 分析置信度
}

// 下一动作预测结果接口
interface NextActionPrediction {
    nextActions: Array<{
        action: string;
        probability: number;
        description: string;
    }>;
    reasoning: string;         // 预测理由
    selectedAction: string;    // 最终选择的动作
}

// 动作序列数据库
const ActionSequences: any = {
    yoga: {
        "mountain_pose": [
            { action: "tree_pose", probability: 0.8, description: "单腿站立的树式，提升平衡感" },
            { action: "warrior_1", probability: 0.7, description: "战士一式，增强腿部力量" },
            { action: "forward_fold", probability: 0.6, description: "前屈式，拉伸背部" }
        ],
        "downward_dog": [
            { action: "plank", probability: 0.9, description: "平板支撑，核心力量训练" },
            { action: "chaturanga", probability: 0.8, description: "四柱支撑，手臂力量" },
            { action: "upward_dog", probability: 0.7, description: "上犬式，背部伸展" }
        ]
    },
    dance: {
        "arms_up": [
            { action: "spin", probability: 0.8, description: "旋转动作，展现流动美感" },
            { action: "step_side", probability: 0.7, description: "侧步移动，改变位置" }
        ]
    },
    daily: {
        "sitting": [
            { action: "standing_up", probability: 0.9, description: "起身动作，从坐到站" },
            { action: "leaning_forward", probability: 0.7, description: "身体前倾，准备行动" }
        ]
    }
};

// 动作序列预测器类
export class NextGesturePredictor {
    private imageGenerator: ImageGenerator;
    private aiClient: OpenAI;

    constructor() {
        this.imageGenerator = new ImageGenerator();
        this.aiClient = new OpenAI({
            baseURL: openRouterConfig.baseURL,
            apiKey: openRouterConfig.apiKey,
        });
    }

    // 分析当前动作
    async analyzeCurrentAction(imagePath: string): Promise<ActionAnalysis> {
        const fileName = path.basename(imagePath, path.extname(imagePath));
        console.log(`🔍 分析动作: ${fileName}`);

        const imageBase64 = imageToBase64(imagePath);
        if (!imageBase64) {
            throw new Error(`无法读取图片: ${imagePath}`);
        }

        const analysisPrompt = `请详细分析这张图片中人物正在进行的动作：

1. 动作类型识别: 判断是瑜伽、舞蹈、运动、日常活动等
2. 具体动作描述: 详细描述当前的具体姿势和动作
3. 动作阶段: 判断是动作的开始、进行中还是结束阶段
4. 身体状态: 描述身体各部位的位置、角度和状态
5. 情绪意图: 分析动作传达的情绪和意图

请用简洁的文字描述，不需要JSON格式。`;

        try {
            const content: MessageContent[] = [
                { type: "text", text: analysisPrompt },
                { type: "image_url", image_url: { url: imageBase64 } }
            ];

            const completion = await this.aiClient.chat.completions.create({
                model: AI_MODELS.GPT,
                messages: [{ role: "user", content }],
                max_tokens: 1000,
                temperature: 0.3
            }, {
                headers: {
                    "HTTP-Referer": openRouterConfig.siteUrl,
                    "X-Title": openRouterConfig.siteName
                }
            });

            const responseText = completion.choices?.[0]?.message?.content;
            if (!responseText) {
                throw new Error('AI分析返回空结果');
            }

            console.log('📊 动作分析结果:', responseText);
            
            // 简化处理，返回基本结构
            return {
                actionType: "general",
                currentAction: responseText.substring(0, 100),
                actionStage: "unknown",
                bodyPosition: responseText,
                emotion: "neutral",
                confidence: 0.8
            };
        } catch (error: any) {
            console.error('❌ 动作分析失败:', error.message);
            throw error;
        }
    }

    // 预测下一个动作
    async predictNextAction(analysis: ActionAnalysis): Promise<NextActionPrediction> {
        console.log('🎯 预测下一个动作...');

        // 简化预测逻辑
        const possibleActions = [
            { action: "继续当前动作", probability: 0.8, description: "保持当前姿势或动作" },
            { action: "放松姿势", probability: 0.7, description: "回到自然放松状态" },
            { action: "转换动作", probability: 0.6, description: "切换到相关的下一个动作" }
        ];

        return {
            nextActions: possibleActions,
            reasoning: `基于当前动作的自然延续`,
            selectedAction: possibleActions[0].action
        };
    }

    // 生成下一个动作的图片
    async generateNextGestureImage(
        imagePath: string,
        analysis: ActionAnalysis,
        prediction: NextActionPrediction
    ): Promise<void> {
        const fileName = path.basename(imagePath, path.extname(imagePath));
        const outputDir = path.join('generated', 'next-gestures');

        console.log(`🎨 生成下一动作图片: ${prediction.selectedAction}`);

        // 确保输出目录存在
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const imageBase64 = imageToBase64(imagePath);
        if (!imageBase64) {
            console.error(`❌ 无法读取原图片: ${imagePath}`);
            return;
        }

        // 构建生成提示
        const generatePrompt = `生成下一个动作的图片：

当前状态: ${analysis.currentAction}
下一个动作: ${prediction.selectedAction}

要求：
1. 保持人物的服装、身材、背景、光线完全一致
2. 自然地从当前姿势过渡到下一个动作
3. 动作要流畅自然，符合人体运动规律
4. 保持动作的美感和协调性

描述: ${prediction.nextActions[0]?.description || '自然的动作延续'}`;

        try {
            const result = await this.imageGenerator.generateImage(generatePrompt, imageBase64);

            if (result && result.success && result.result) {
                try {
                    // 保存生成的图片
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const actionName = prediction.selectedAction.replace(/\s+/g, '_');
                    const outputFileName = `${fileName}_next_${actionName}_${timestamp}.png`;
                    const outputPath = path.join(outputDir, outputFileName);

                    if (result.result.startsWith('data:image/')) {
                        // Base64格式
                        const base64Data = result.result.split(',')[1];
                        const imageBuffer = Buffer.from(base64Data, 'base64');
                        fs.writeFileSync(outputPath, imageBuffer);
                        console.log(`✅ 下一动作图片已保存: ${outputPath}`);
                    } else if (result.result.startsWith('http')) {
                        // URL格式
                        console.log(`🔗 下一动作图片URL: ${result.result}`);
                        fs.writeFileSync(outputPath.replace('.png', '.txt'), result.result);
                        console.log(`✅ URL已保存: ${outputPath.replace('.png', '.txt')}`);
                    } else {
                        console.log(`📝 生成结果: ${result.result}`);
                    }

                    // 不保存分析结果JSON文件

                } catch (saveError: any) {
                    console.error(`❌ 保存结果失败:`, saveError.message);
                }
            } else {
                console.log(`❌ 图片生成失败: ${result?.error || '未知错误'}`);
            }
        } catch (error: any) {
            console.error(`❌ 生成下一动作图片时出错:`, error.message);
        }
    }

    // 处理单个图片的完整流程
    async processImage(imagePath: string): Promise<void> {
        const fileName = path.basename(imagePath, path.extname(imagePath));
        console.log(`\n🎬 处理图片: ${fileName}`);

        try {
            // 1. 分析当前动作
            const analysis = await this.analyzeCurrentAction(imagePath);
            await delay(2000); // API限制

            // 2. 预测下一个动作
            const prediction = await this.predictNextAction(analysis);
            await delay(1000);

            // 3. 生成下一个动作的图片
            await this.generateNextGestureImage(imagePath, analysis, prediction);
            await delay(2000);

            console.log(`✅ ${fileName} 处理完成`);
        } catch (error: any) {
            console.error(`❌ 处理 ${fileName} 失败:`, error.message);
        }
    }

    // 批量处理目录中的所有图片
    async processDirectory(directory: string): Promise<void> {
        console.log(`🔍 扫描目录: ${directory}`);

        if (!fs.existsSync(directory)) {
            console.error(`❌ 目录不存在: ${directory}`);
            console.log(`💡 提示: 请确保 '${directory}' 目录存在并包含图片文件`);
            return;
        }

        const imageFiles = getImageFiles(directory);

        if (imageFiles.length === 0) {
            console.log(`📭 目录 '${directory}' 中没有找到支持的图片文件`);
            console.log('💡 支持的格式: .jpg, .jpeg, .png, .gif, .bmp, .webp');
            return;
        }

        console.log(`📊 找到 ${imageFiles.length} 个图片文件`);

        for (let i = 0; i < imageFiles.length; i++) {
            const imagePath = imageFiles[i];
            console.log(`\n⏳ 进度: ${i + 1}/${imageFiles.length}`);

            try {
                await this.processImage(imagePath);
            } catch (error: any) {
                console.error(`❌ 处理图片失败 ${imagePath}:`, error.message);
                continue;
            }
        }

        console.log(`\n🎉 动作序列预测完成！`);
        console.log(`📁 生成的图片保存在: generated/next-gestures/`);
    }
}

// 主函数
async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const directory = args[0] || 'nextGestures';

    console.log('🎬 AI动作序列预测器');
    console.log('==========================================');
    console.log('🎯 分析当前动作 → 预测下一动作 → 生成图片');
    console.log('==========================================');

    try {
        const predictor = new NextGesturePredictor();
        await predictor.processDirectory(directory);
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