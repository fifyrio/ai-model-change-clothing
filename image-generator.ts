import OpenAI from 'openai';
import { openRouterConfig, AI_MODELS } from './config.js';
import { MessageContent, ImageGenerationResult, OpenRouterResponse, ImageResult } from './types.js';
import { IMAGE_GENERATION_PROMPT, IMAGE_GENERATION_NEW_BG_GESTURE_PROMPT, IMAGE_GENERATION_BASE64_PROMPT } from './prompts.js';
import { decodeBase64Image, getImageExtension, saveDataUriImage, saveImageMetadata } from './utils.js';

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

        console.log("🔍 Gemini API响应(JSON):", JSON.stringify(completion, null, 2));

        // 使用统一的响应处理方法
        return this.processOpenRouterResponse(completion);
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

        console.log("🔍 Gemini Base64 API请求");

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

        console.log("🔍 Gemini Base64 API响应");

        // 使用统一的响应处理方法
        return this.processOpenRouterResponse(completion);
    }

    // 生成图片接口（普通模式）- 优化版
    async generateImage(
        clothing: string,
        imageUrl: string = "https://pub-9e76573778404f65b02c3ea29d2db5f9.r2.dev/Qiao/1.jpg",
        saveToFile: boolean = false,
        fileName: string = "Generated"
    ): Promise<ImageGenerationResult> {
        const startTime = new Date();

        try {
            const result = await this.generateWithGemini(clothing, imageUrl);

            const generationResult: ImageGenerationResult = {
                prompt: clothing,
                imageUrl,
                success: true,
                timestamp: startTime,
                result: result
            };

            // 如果结果是 data URI 格式且需要保存到文件
            if (saveToFile && result.startsWith('data:image/')) {
                try {
                    // 解析并保存图片
                    const savedPath = saveDataUriImage(result, 'generated', fileName);
                    generationResult.savedPath = savedPath;

                    // 保存元数据
                    const metadataPath = saveImageMetadata(savedPath, {
                        clothingDescription: clothing,
                        generationTimestamp: startTime
                    });
                    generationResult.metadataPath = metadataPath;

                    // 解析 data URI 以获取详细信息
                    const matches = result.match(/^data:([^;]+);base64,(.+)$/);
                    if (matches) {
                        const [, mimeType, base64Data] = matches;
                        const buffer = decodeBase64Image(base64Data);

                        generationResult.decodedImage = {
                            mimeType,
                            buffer,
                            size: buffer.length
                        };
                    }

                    console.log(`✅ 图片已保存: ${savedPath}`);
                    console.log(`📄 元数据已保存: ${metadataPath}`);
                } catch (saveError: any) {
                    console.warn(`⚠️  保存图片失败: ${saveError.message}`);
                    // 不影响主要流程，继续返回结果
                }
            }

            return generationResult;
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

    // 生成图片接口（Base64模式）- 优化版
    async generateImageBase64(
        clothing: string,
        imageUrl: string = "https://pub-9e76573778404f65b02c3ea29d2db5f9.r2.dev/Qiao/1.jpg",
        saveToFile: boolean = false,
        fileName: string = "Generated"
    ): Promise<ImageGenerationResult> {
        const startTime = new Date();

        try {
            const result = await this.generateWithGeminiBase64(clothing, imageUrl);

            const generationResult: ImageGenerationResult = {
                prompt: clothing,
                imageUrl,
                success: true,
                timestamp: startTime,
                result: result
            };

            // 如果结果是 data URI 格式且需要保存到文件
            if (saveToFile && result.startsWith('data:image/')) {
                try {
                    // 解析并保存图片
                    const savedPath = saveDataUriImage(result, 'generated', fileName);
                    generationResult.savedPath = savedPath;

                    // 保存元数据
                    const metadataPath = saveImageMetadata(savedPath, {
                        clothingDescription: clothing,
                        generationTimestamp: startTime
                    });
                    generationResult.metadataPath = metadataPath;

                    // 解析 data URI 以获取详细信息
                    const matches = result.match(/^data:([^;]+);base64,(.+)$/);
                    if (matches) {
                        const [, mimeType, base64Data] = matches;
                        const buffer = decodeBase64Image(base64Data);

                        generationResult.decodedImage = {
                            mimeType,
                            buffer,
                            size: buffer.length
                        };
                    }

                    console.log(`✅ 图片已保存: ${savedPath}`);
                    console.log(`📄 元数据已保存: ${metadataPath}`);
                } catch (saveError: any) {
                    console.warn(`⚠️  保存图片失败: ${saveError.message}`);
                    // 不影响主要流程，继续返回结果
                }
            }

            return generationResult;
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

    /**
     * 处理 OpenRouter API 响应，提取图片数据
     * 参考优化后的响应处理逻辑
     */
    private processOpenRouterResponse(completion: any): string {
        const choice = completion.choices?.[0];
        const message = choice?.message as any;

        console.log("🔍 处理 OpenRouter API 响应");

        // 优先检查是否有生成的图片（images 字段）
        if (message?.images && message.images.length > 0) {
            console.log("🖼️  发现生成的图片");
            const imageResult: ImageResult = message.images[0];

            if (imageResult.type === "image_url" && imageResult.image_url?.url) {
                const dataUri = imageResult.image_url.url;

                // 检查是否为 data URI 格式
                if (dataUri.startsWith('data:image/')) {
                    const matches = dataUri.match(/^data:([^;]+);base64,(.+)$/);
                    if (matches) {
                        const [, mimeType, base64Data] = matches;
                        console.log(`📦 解析 data URI: ${mimeType}, 长度: ${base64Data.length}`);

                        // 验证 base64 数据的完整性
                        if (base64Data.length > 100) {
                            console.log("✅ 完整的 base64 图片数据");
                            return dataUri;
                        } else {
                            console.warn("⚠️  base64 数据被截断");
                        }
                    }
                }

                // 如果不是 data URI，可能是外部 URL
                return dataUri;
            }
        }

        // 如果没有图片字段，检查文本内容
        if (message?.content) {
            const content = message.content.trim();
            console.log(`📝 检查文本响应内容长度: ${content.length}`);

            // 尝试解析 JSON 格式
            if (content.startsWith('{') || content.includes('```json')) {
                try {
                    let jsonContent = content;
                    if (content.includes('```json')) {
                        const match = content.match(/```json\s*(\{[\s\S]*?\})\s*```/);
                        if (match) {
                            jsonContent = match[1];
                        }
                    }

                    const jsonResponse = JSON.parse(jsonContent);
                    if (jsonResponse.image_data) {
                        return jsonResponse.image_data;
                    }
                } catch (error) {
                    console.log("❌ JSON 解析失败");
                }
            }

            // 检查是否为完整的 base64 图片数据
            if (content.startsWith('data:image/')) {
                return content;
            }

            // 返回文本内容
            return content;
        }

        throw new Error('OpenRouter API 响应格式错误或内容为空');
    }
}