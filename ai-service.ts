import OpenAI from 'openai';
import { openRouterConfig, AI_MODELS } from './config.js';
import { MessageContent, ImageAnalysisResult } from './types.js';
import { GPT_ANALYZE_CLOTHING_PROMPT,GPT_ANALYZE_BG_GESTURE_PROMPT } from './prompts.js';

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
        console.log('🖼️ 图片数据长度:', base64Image.length);

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

            console.log('📥 API响应状态:', completion ? '成功' : '失败');
            console.log('📊 响应选择数量:', completion.choices?.length || 0);
            
            if (completion.choices?.[0]?.message?.content) {
                const responseContent = completion.choices[0].message.content;
                console.log('✅ 响应内容长度:', responseContent.length);
                console.log('📄 响应内容预览:', responseContent);
                return responseContent;
            }
            
            console.log('❌ API响应详情:', JSON.stringify(completion, null, 2));
            throw new Error('GPT API响应格式错误或内容为空');
        } catch (error: any) {
            console.error('🚨 GPT API调用失败:', error.message);
            if (error.response) {
                console.error('🔴 API错误响应:', error.response.status, error.response.statusText);
                console.error('📋 错误详情:', JSON.stringify(error.response.data, null, 2));
            }
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
}