// AI 模型 Prompt 配置文件

// GPT 图片分析 Prompt
export const GPT_ANALYZE_CLOTHING_PROMPT = `Reverse engineer this image. 返回详细的穿搭的prompts，尤其是衣服(包括女生上半身和下半身的所有衣服和鞋子，如果没有穿丝袜则提示没有丝袜)的细节，忽略人物的发型、长相、姿势、背景，注意光线照在衣服上的细节，女生皮肤白皙不要发黄。

**重要要求：如果图片中看不到鞋子或者人物没有穿鞋，请根据当前穿搭风格推荐一款最适合的鞋子，包括颜色、款式、高度等详细描述。推荐的鞋子应该与整体穿搭风格协调统一。**`;

export const GPT_ANALYZE_BG_GESTURE_PROMPT = `Reverse engineer this image. 返回详细的穿搭的prompts，尤其是衣服(包括女生上半身和下半身的所有衣服和鞋子，分析背景和人物姿势，如果没有穿丝袜则提示没有丝袜)的细节，忽略人物的发型、长相，注意光线照在衣服上的细节，女生皮肤白皙不要发黄。

**重要要求：如果图片中看不到鞋子或者人物没有穿鞋，请根据当前穿搭风格推荐一款最适合的鞋子，包括颜色、款式、高度等详细描述。推荐的鞋子应该与整体穿搭风格协调统一。**`;

// Gemini 图片生成 Prompt
export const IMAGE_GENERATION_PROMPT = '将上传的图片换成下面的效果，保持人物身材的一致性(Voluptuous body, Small waist,wide hips)，图片的人物有合适的影子,背景不要变，女生皮肤雪白白皙, 女生里面穿的白色内衣:';
export const IMAGE_GENERATION_NEW_BG_GESTURE_PROMPT = '将上传的图片换成下面的效果，保持人物身材的一致性(Voluptuous body, Small waist,wide hips)，图片的人物有合适的影子，女生皮肤雪白白皙:';

// 返回Base64格式的图片生成 Prompt  
export const IMAGE_GENERATION_BASE64_PROMPT = `将上传的图片换成下面的效果，保持人物身材的一致性(Voluptuous body, Small waist,wide hips)，图片的人物有合适的影子,背景不要变，女生皮肤雪白白皙, 女生里面穿的白色内衣。

请生成图片并以以下JSON格式返回结果信息：
{
  "success": true,
  "status": "generated",
  "description": "Generated image based on the provided clothing description",
  "note": "请查看API响应中的images字段获取生成的图片"
}

如果你能直接在响应中包含生成的图片，那就更好了。

穿搭描述:`;

