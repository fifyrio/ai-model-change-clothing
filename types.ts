// 共用类型定义
export type MessageContent = {
    type: 'text';
    text: string;
} | {
    type: 'image_url';
    image_url: {
        url: string;
    };
};

export interface AIModelConfig {
    apiKey: string;
    baseURL: string;
    siteUrl?: string;
    siteName?: string;
}

export interface ImageAnalysisResult {
    filename: string;
    modelName: string;
    analysis: string;
    timestamp: Date;
    success: boolean;
    error?: string;
}

export interface ImageGenerationResult {
    prompt: string;
    imageUrl?: string;
    result?: string;
    success: boolean;
    error?: string;
    timestamp: Date;
}

// 移除不再需要的 SupportedModel 类型，只使用 GPT