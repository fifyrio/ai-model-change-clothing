import OpenAI from 'openai';
import { openRouterConfig, AI_MODELS } from './config.js';
import { MessageContent, ImageAnalysisResult } from './types.js';
import { GPT_ANALYZE_PROMPT } from './prompts.js';

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
        const content: MessageContent[] = [
            {
                type: "text",
                text: GPT_ANALYZE_PROMPT
            },
            {
                type: "image_url",
                image_url: { url: base64Image }
            }
        ];

        const completion = await this.client.chat.completions.create({
            model: AI_MODELS.GPT,
            messages: [{ role: "user", content }],
            max_tokens: 1500,
            temperature: 0.7
        }, {
            headers: {
                "HTTP-Referer": openRouterConfig.siteUrl,
                "X-Title": openRouterConfig.siteName
            }
        });

        if (completion.choices?.[0]?.message?.content) {
            return completion.choices[0].message.content;
        }
        throw new Error('GPT API响应格式错误或内容为空');
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
}