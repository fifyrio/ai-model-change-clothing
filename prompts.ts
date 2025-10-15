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

// 小红书爆款标题生成 Prompt
export const XIAOHONGSHU_TITLE_PROMPT = `你是一位专业的小红书内容创作专家，擅长创作吸引眼球的爆款标题。

请根据以下服装描述和生成的图片数量，创作一个符合小红书风格的爆款标题。

【标题公式】
主标题：〔夸张数量词+{图片数量}+形容词+单品〕✖️〔数字符号〕！！〔情绪句/疑问句〕
副标题：#人设标签 #场景标签 #风格标签 #功能标签 #流量标签

【创作要求】
1. 主标题要有冲击力和吸引力，使用夸张但不浮夸的表达
2. 数字符号要选择与服装风格匹配的emoji（如：❤️、⚡、🔥、✨、💫等）
3. 情绪句/疑问句要能引起共鸣（如：谁懂啊！真的绝了！你还不知道吗？姐妹们冲！）
4. 话题标签要精准且有流量（5个标签，每个都要加#）
   - 人设标签：目标用户群体（打工人/学生党/宝妈/小个子等）
   - 场景标签：穿搭场合（日常穿搭/约会装/通勤装/度假风等）
   - 风格标签：服装风格（韩系/法式/ins风/复古/简约等）
   - 功能标签：服装特点（显瘦/遮肉/显高/百搭等）
   - 流量标签：热门话题（OOTD/穿搭分享/好物推荐/种草等）

【输出格式】
只输出标题内容，不要任何解释说明。格式如下：

【主标题内容】

#标签1 #标签2 #标签3 #标签4 #标签5

【示例】
【疯抢3件显瘦连衣裙】✖️❤️🔥！！这谁顶得住啊！

#打工人 #日常穿搭 #法式复古 #显瘦遮肉 #OOTD

---

现在请根据以下信息生成标题：
服装描述：{clothingDescription}
图片数量：{imageCount}张`;

