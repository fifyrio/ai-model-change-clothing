// AI 模型 Prompt 配置文件

// GPT 图片分析 Prompt
export const GPT_ANALYZE_PROMPT = `Reverse engineer this image. 返回详细的穿搭的prompts，尤其是衣服(包括女生上半身和下半身的所有衣服和鞋子，如果没有穿丝袜则提示没有丝袜)的细节，忽略人物的发型、长相、姿势、背景，注意光线照在衣服上的细节，女生皮肤白皙不要发黄`;

// Gemini 图片生成 Prompt
export const IMAGE_GENERATION_PROMPT = '将上传的图片换成下面的效果，保持人物身材的一致性(Voluptuous body, Small waist,wide hips)，图片的人物有合适的影子,背景不要变，女生皮肤雪白白皙:';

