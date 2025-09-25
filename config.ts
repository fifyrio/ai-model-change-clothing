import { config } from 'dotenv';
import { AIModelConfig } from './types.js';

// 加载环境变量
config();

// 验证API Key
function validateApiKey(key: string | undefined, keyName: string): string {
    if (!key || key === `your-${keyName.toLowerCase()}-api-key-here`) {
        console.error(`请设置 ${keyName} 环境变量`);
        console.error('当前值:', key || '未设置');
        console.error('请在 .env 文件中填入真实的 API Key');
        process.exit(1);
    }
    return key;
}

// OpenRouter 配置
export const openRouterConfig: AIModelConfig = {
    apiKey: validateApiKey(process.env.OPENROUTER_API_KEY, 'OPENROUTER_API_KEY'),
    baseURL: 'https://openrouter.ai/api/v1',
    siteUrl: process.env.SITE_URL || 'https://localhost:3000',
    siteName: process.env.SITE_NAME || 'Fashion Analysis Tool'
};

// 支持的图片格式
export const SUPPORTED_IMAGE_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];

// AI模型配置
export const AI_MODELS = {
    GPT: 'openai/gpt-5-mini',
    GEMINI: 'google/gemini-2.5-flash-image-preview'
} as const;