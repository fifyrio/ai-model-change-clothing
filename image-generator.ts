import OpenAI from 'openai';
import { openRouterConfig, AI_MODELS } from './config.js';
import { MessageContent, ImageGenerationResult } from './types.js';
import { IMAGE_GENERATION_PROMPT, IMAGE_GENERATION_NEW_BG_GESTURE_PROMPT, IMAGE_GENERATION_BASE64_PROMPT } from './prompts.js';

// 图片生成服务类
export class ImageGenerator {
    private client: OpenAI;

    constructor() {
        this.client = new OpenAI({
            baseURL: openRouterConfig.baseURL,
            apiKey: openRouterConfig.apiKey,
        });
    }

    // 调用Gemini模型生成图片描述（普通模式）
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
        console.log("🔍 Gemini API请求:", content);
        const completion = await this.client.chat.completions.create({
            model: AI_MODELS.GEMINI,
            messages: [{ role: "user", content }],
            max_tokens: 3000,
            temperature: 0.7
        }, {
            headers: {
                "HTTP-Referer": openRouterConfig.siteUrl,
                "X-Title": openRouterConfig.siteName
            }
        });

        const choice = completion.choices?.[0];
        const message = choice?.message as any;
        console.log("🔍 Gemini API响应:", completion);
        
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

    // 调用Gemini模型生成图片（Base64模式）
    async generateWithGeminiBase64(clothing: string, imageUrl: string): Promise<string> {
        const content: MessageContent[] = [
            {
                type: "text",
                text: `${IMAGE_GENERATION_BASE64_PROMPT}${clothing}`
            },
            {
                type: "image_url",
                image_url: { url: imageUrl }
            }
        ];

        const completion = await this.client.chat.completions.create({
            model: AI_MODELS.GEMINI,
            messages: [{ role: "user", content }],
            max_tokens: 4000,
            temperature: 0.7
        }, {
            headers: {
                "HTTP-Referer": openRouterConfig.siteUrl,
                "X-Title": openRouterConfig.siteName
            }
        });

        const choice = completion.choices?.[0];
        const message = choice?.message as any;
        
        // 优先检查是否有生成的图片（Gemini真正的图片生成）
        if (message?.images && message.images.length > 0) {
            console.log("🖼️  发现Gemini生成的图片");
            const imageUrl = message.images[0]?.image_url?.url;
            if (imageUrl) {
                console.log("📎 图片URL:", imageUrl);
                return imageUrl;
            }
        }
        
        // 检查文本内容
        if (message?.content) {
            const content = message.content.trim();
            console.log("📝 检查文本响应内容长度:", content.length);
            
            // 优先尝试解析JSON格式（包括markdown包装的）
            let jsonContent = content;
            if (content.includes('```json')) {
                const match = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
                if (match) {
                    jsonContent = match[1];
                    console.log("🔍 从markdown提取JSON内容");
                }
            }
            
            if (jsonContent.startsWith('{')) {
                try {
                    const jsonResponse = JSON.parse(jsonContent);
                    console.log("✅ JSON解析成功:", Object.keys(jsonResponse));
                    
                    // 检查是否有完整的base64数据
                    if (jsonResponse.image_data && jsonResponse.image_data.length > 100) {
                        console.log("📄 找到完整base64数据，长度:", jsonResponse.image_data.length);
                        return jsonResponse.image_data;
                    } else if (jsonResponse.image_data) {
                        console.log("⚠️  base64数据被截断，长度:", jsonResponse.image_data.length);
                    }
                    
                    // 返回JSON信息，让调用方知道状态
                    return JSON.stringify({
                        ...jsonResponse,
                        _meta: {
                            response_type: "json_info",
                            has_truncated_base64: !!(jsonResponse.image_data && jsonResponse.image_data.length < 100),
                            check_images_field: true
                        }
                    });
                } catch (error) {
                    console.log("❌ JSON解析失败:", error);
                }
            }
            
            // 检查是否为完整的base64图片数据
            if (content.startsWith('data:image/')) {
                console.log("📷 找到data:image格式，长度:", content.length);
                return content;
            } else if (content.startsWith('iVBORw0KGgo') && content.length > 1000) {
                console.log("📷 找到纯base64格式，长度:", content.length);
                return `data:image/png;base64,${content}`;
            }
            
            return content;
        }
        
        throw new Error('Gemini API响应格式错误或内容为空');
    }

    // 生成图片接口（普通模式）
    async generateImage(clothing: string, imageUrl: string = "https://pub-9e76573778404f65b02c3ea29d2db5f9.r2.dev/Qiao/1.jpg"): Promise<ImageGenerationResult> {
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

    // 生成图片接口（Base64模式）
    async generateImageBase64(clothing: string, imageUrl: string = "https://pub-9e76573778404f65b02c3ea29d2db5f9.r2.dev/Qiao/1.jpg"): Promise<ImageGenerationResult> {
        const startTime = new Date();
        
        try {
            const result = await this.generateWithGeminiBase64(clothing, imageUrl);
            
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