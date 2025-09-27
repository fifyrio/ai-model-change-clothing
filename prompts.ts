// AI 模型 Prompt 配置文件

// GPT 图片分析 Prompt
export const GPT_ANALYZE_CLOTHING_PROMPT = `Reverse engineer this image. 返回详细的穿搭的prompts，尤其是衣服(包括女生上半身和下半身的所有衣服和鞋子，如果没有穿丝袜则提示没有丝袜)的细节，忽略人物的发型、长相、姿势、背景，注意光线照在衣服上的细节，女生皮肤白皙不要发黄。

**重要要求：如果图片中看不到鞋子或者人物没有穿鞋，请根据当前穿搭风格推荐一款最适合的鞋子，包括颜色、款式、高度等详细描述。推荐的鞋子应该与整体穿搭风格协调统一。**`;

export const GPT_ANALYZE_GESTURE_PROMPT = `Reverse engineer this image. 返回详细的穿搭的prompts，尤其是衣服(包括女生上半身和下半身的所有衣服和鞋子，分析背景和人物姿势，如果没有穿丝袜则提示没有丝袜)的细节，忽略人物的发型、长相，注意光线照在衣服上的细节，女生皮肤白皙不要发黄。

**重要要求：如果图片中看不到鞋子或者人物没有穿鞋，请根据当前穿搭风格推荐一款最适合的鞋子，包括颜色、款式、高度等详细描述。推荐的鞋子应该与整体穿搭风格协调统一。**`;

// Gemini 图片生成 Prompt
export const IMAGE_GENERATION_PROMPT = '将上传的图片换成下面的效果，保持人物身材的一致性(Voluptuous body, Small waist,wide hips)，图片的人物有合适的影子,背景不要变，女生皮肤雪白白皙:';

