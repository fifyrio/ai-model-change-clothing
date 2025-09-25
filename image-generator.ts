import OpenAI from 'openai';
import { openRouterConfig, AI_MODELS } from './config.js';
import { MessageContent, ImageGenerationResult } from './types.js';
import { IMAGE_GENERATION_PROMPT } from './prompts.js';

// 图片生成服务类
export class ImageGenerator {
    private client: OpenAI;

    constructor() {
        this.client = new OpenAI({
            baseURL: openRouterConfig.baseURL,
            apiKey: openRouterConfig.apiKey,
        });
    }

    // 调用Gemini模型生成图片描述
    async generateWithGemini(clothing: string, imageUrl: string): Promise<string> {
        const content: MessageContent[] = [
            {
                type: "text",
                text: `${IMAGE_GENERATION_PROMPT}:${clothing}`
            },
            {
                type: "image_url",
                image_url: { url: imageUrl }
            }
        ];

        const completion = await this.client.chat.completions.create({
            model: AI_MODELS.GEMINI,
            messages: [{ role: "user", content }],
            max_tokens: 1500,
            temperature: 0.7
        }, {
            headers: {
                "HTTP-Referer": openRouterConfig.siteUrl,
                "X-Title": openRouterConfig.siteName
            }
        });

        const choice = completion.choices?.[0];
        const message = choice?.message as any;
        
        // 优先检查是否有生成的图片
        if (message?.images && message.images.length > 0) {
          console.log("ww: 有生成的图片");
            const imageUrl = message.images[0]?.image_url?.url;
            if (imageUrl) {                                
                return `${imageUrl}`;
            }
        }
        
        // 如果没有图片，返回文本内容
        if (message?.content) {
            return message.content;
        }
        
        throw new Error('Gemini API响应格式错误或内容为空');
    }

    // 生成图片接口
    async generateImage(clothing: string, imageUrl: string = "https://pub-9e76573778404f65b02c3ea29d2db5f9.r2.dev/lin/front.png"): Promise<ImageGenerationResult> {
        const startTime = new Date();
        
        try {
            const result = await this.generateWithGemini(clothing, imageUrl);
            
            return {
                prompt: clothing,
                imageUrl,
                success: true,
                timestamp: startTime,
                result: result
            };
        } catch (error: any) {
            return {
                prompt: clothing,
                imageUrl,
                success: false,
                error: error.message,
                timestamp: startTime
            };
        }
    }
}