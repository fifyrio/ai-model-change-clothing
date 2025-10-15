// 消息内容类型
export type MessageContent = {
    type: "text" | "image_url";
    text?: string;
    image_url?: { url: string };
};

// 图片分析结果
export interface ImageAnalysisResult {
    filename: string;
    modelName: string;
    analysis: string;
    timestamp: Date;
    success: boolean;
    error?: string;
}

// 图片生成结果
export interface ImageGenerationResult {
    prompt: string;
    imageUrl: string;
    success: boolean;
    timestamp: Date;
    result?: string;
    error?: string;
    savedPath?: string;
    metadataPath?: string;
    decodedImage?: {
        mimeType: string;
        buffer: Buffer;
        size: number;
    };
}

// OpenRouter API响应
export interface OpenRouterResponse {
    choices: Array<{
        message: {
            content: string;
            images?: ImageResult[];
        };
    }>;
}

// 图片结果
export interface ImageResult {
    type: "image_url";
    image_url?: {
        url: string;
    };
}
