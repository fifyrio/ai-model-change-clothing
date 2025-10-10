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
    // 新增字段：解码后的图片数据
    decodedImage?: {
        mimeType: string;
        buffer: Buffer;
        size: number;
    };
    // 本地保存路径
    savedPath?: string;
    // 元数据路径
    metadataPath?: string;
}

// OpenRouter 图片结果类型
export interface ImageResult {
    type: "image_url";
    image_url: {
        url: string;  // data:image/png;base64,... 格式的 Data URI
    };
    index?: number;
}

// OpenRouter API 响应的 choice 结构
export interface OpenRouterChoice {
    message: {
        content?: string;
        images?: ImageResult[];
    };
}

// OpenRouter API 完整响应
export interface OpenRouterResponse {
    choices: OpenRouterChoice[];
    [key: string]: any;
}

// 移除不再需要的 SupportedModel 类型，只使用 GPT