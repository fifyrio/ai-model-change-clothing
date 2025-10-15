import OpenAI from 'openai';
import { openRouterConfig, AI_MODELS } from './config';
import { MessageContent, ImageAnalysisResult } from './types';
import { GPT_ANALYZE_CLOTHING_PROMPT, XIAOHONGSHU_TITLE_PROMPT } from './prompts';

// AI服务类
export class AIService {
    private client: OpenAI;

    constructor() {
        this.client = new OpenAI({
            baseURL: openRouterConfig.baseURL,
            apiKey: openRouterConfig.apiKey,
        });
    }

    // 调用GPT模型分析图片
    async analyzeWithGPT(base64Image: string, filename: string): Promise<string> {
        console.log('📡 正在调用GPT API...');
        console.log('🔧 模型:', AI_MODELS.GPT);

        const content: MessageContent[] = [
            {
                type: "text",
                text: GPT_ANALYZE_CLOTHING_PROMPT
            },
            {
                type: "image_url",
                image_url: { url: base64Image }
            }
        ];

        try {
            const completion = await this.client.chat.completions.create({
                model: AI_MODELS.GPT,
                messages: [{ role: "user", content }],
                max_tokens: 4000,
                temperature: 0.7
            }, {
                headers: {
                    "HTTP-Referer": openRouterConfig.siteUrl,
                    "X-Title": openRouterConfig.siteName
                }
            });

            if (completion.choices?.[0]?.message?.content) {
                const responseContent = completion.choices[0].message.content;
                console.log('✅ 响应内容长度:', responseContent.length);
                return responseContent;
            }

            throw new Error('GPT API响应格式错误或内容为空');
        } catch (error: any) {
            console.error('🚨 GPT API调用失败:', error.message);
            throw error;
        }
    }

    // 分析图片接口 - 只使用GPT模型
    async analyzeImage(base64Image: string, filename: string): Promise<ImageAnalysisResult> {
        const startTime = new Date();

        try {
            const analysis = await this.analyzeWithGPT(base64Image, filename);

            return {
                filename,
                modelName: 'OpenAI GPT-5-mini',
                analysis,
                timestamp: startTime,
                success: true
            };
        } catch (error: any) {
            return {
                filename,
                modelName: 'OpenAI GPT-5-mini',
                analysis: '',
                timestamp: startTime,
                success: false,
                error: error.message
            };
        }
    }

    // 生成小红书爆款标题
    async generateXiaohongshuTitle(clothingDescription: string, imageCount: number): Promise<string> {
        console.log('📝 正在生成小红书标题...');
        console.log('🔧 模型:', AI_MODELS.GPT);

        const prompt = XIAOHONGSHU_TITLE_PROMPT
            .replace('{clothingDescription}', clothingDescription)
            .replace('{imageCount}', imageCount.toString());

        try {
            const completion = await this.client.chat.completions.create({
                model: AI_MODELS.GPT,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 2000,
                temperature: 0.8
            }, {
                headers: {
                    "HTTP-Referer": openRouterConfig.siteUrl,
                    "X-Title": openRouterConfig.siteName
                }
            });

            if (completion.choices?.[0]?.message?.content) {
                const title = completion.choices[0].message.content.trim();
                console.log('✅ 标题生成成功');
                return title;
            }

            throw new Error('标题生成失败：API响应格式错误或内容为空');
        } catch (error: any) {
            console.error('🚨 标题生成失败:', error.message);
            throw error;
        }
    }
}
