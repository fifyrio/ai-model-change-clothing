# 错误处理改进说明

## 更新日期
2025-10-15

## 问题描述
当点击 generate 按钮后，如果其中一个图片生成失败（返回 `POST /api/generate 500`），整个批处理流程会中断，后续图片无法继续处理。

## 解决方案

### 修改的文件
`batch-process.ts` 中的 `processSingleImage` 函数

### 主要改进

#### 1. 函数返回类型修改
```typescript
// 修改前
async function processSingleImage(...): Promise<void>

// 修改后
async function processSingleImage(...): Promise<{ success: boolean; error?: string }>
```

现在函数返回处理结果，而不是简单地返回 void。

#### 2. 分析失败时的处理
```typescript
if (!analysisResult.success) {
    const errorMsg = `分析失败: ${analysisResult.error}`;
    console.error('❌', errorMsg);
    console.log('⏩ 跳过此图片，继续处理下一张...');
    return { success: false, error: errorMsg };
}
```

- 记录错误信息
- 提示跳过并继续
- 返回失败状态而不是直接 return

#### 3. 图片生成失败时的处理
```typescript
if (!generationResult.success) {
    const errorMsg = `生成图片失败: ${generationResult.error}`;
    console.error('❌', errorMsg);
    console.log('⏩ 跳过此图片，继续处理下一张...');

    // 即使图片生成失败，仍然尝试生成小红书标题
    try {
        console.log('📝 尝试生成小红书标题（基于分析结果）...');
        const aiService = new AIService();
        const xiaohongshuTitle = await aiService.generateXiaohongshuTitle(clothingDetails, 1);
        console.log('✅ 小红书标题已生成:');
        console.log(xiaohongshuTitle);
    } catch (titleError: any) {
        console.warn('⚠️  小红书标题生成失败:', titleError.message);
    }

    return { success: false, error: errorMsg };
}
```

关键改进：
- **即使图片生成失败，仍然尝试生成小红书标题**
- 基于已成功完成的分析结果生成标题
- 标题生成失败也只是警告，不会中断流程

#### 4. 异常捕获处理
```typescript
catch (error: any) {
    const errorMsg = `处理图片时出错: ${error.message}`;
    console.error('❌', errorMsg);
    console.log('⏩ 跳过此图片，继续处理下一张...');
    return { success: false, error: errorMsg };
}
```

- 捕获所有未预期的错误
- 记录错误但继续执行
- 返回失败状态

#### 5. 批处理结果统计
```typescript
// 记录处理结果
const results: Array<{ fileName: string; success: boolean; error?: string }> = [];

// 逐一处理每张图片
for (let i = 0; i < imageFiles.length; i++) {
    const result = await processSingleImage(imageFiles[i], modelImageUrl, i + 1, imageFiles.length, useBase64Mode);
    results.push({
        fileName: path.basename(imageFiles[i]),
        success: result.success,
        error: result.error
    });
}

// 统计结果
const successCount = results.filter(r => r.success).length;
const failedCount = results.filter(r => !r.success).length;

console.log('\n🎉 === 所有图片处理完成！===');
console.log(`📊 总计处理: ${imageFiles.length} 张图片`);
console.log(`✅ 成功: ${successCount} 张`);
console.log(`❌ 失败: ${failedCount} 张`);

// 如果有失败的，列出详情
if (failedCount > 0) {
    console.log('\n❌ 失败的图片:');
    results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.fileName}: ${r.error}`);
    });
}
```

新增功能：
- 收集所有图片的处理结果
- 统计成功和失败的数量
- 在最后展示详细的失败列表

## 行为变化

### 修改前
1. 遇到图片生成失败时，直接 return，中断后续处理
2. 无法生成小红书标题
3. 无统计信息

### 修改后
1. 遇到任何失败时，记录错误并继续处理下一张图片
2. 即使图片生成失败，也尝试生成小红书标题
3. 所有图片处理完毕后，显示成功/失败统计
4. 列出所有失败图片的详细错误信息

## 使用示例

### 命令行输出示例
```
📷 [1/3] 处理图片: image1.jpg
==================================================
🔍 分析图片，提取穿搭细节...
✅ 穿搭细节提取完成
🎨 生成新图片...
✅ 图片生成完成
📝 正在生成小红书标题...
✅ 小红书标题已生成

📷 [2/3] 处理图片: image2.jpg
==================================================
🔍 分析图片，提取穿搭细节...
✅ 穿搭细节提取完成
🎨 生成新图片...
❌ 生成图片失败: API timeout
⏩ 跳过此图片，继续处理下一张...
📝 尝试生成小红书标题（基于分析结果）...
✅ 小红书标题已生成:
✨超美穿搭分享！这套look绝了✨

📷 [3/3] 处理图片: image3.jpg
==================================================
🔍 分析图片，提取穿搭细节...
✅ 穿搭细节提取完成
🎨 生成新图片...
✅ 图片生成完成
📝 正在生成小红书标题...
✅ 小红书标题已生成

🎉 === 所有图片处理完成！===
📊 总计处理: 3 张图片
✅ 成功: 2 张
❌ 失败: 1 张

❌ 失败的图片:
  - image2.jpg: 生成图片失败: API timeout
```

## 测试建议

1. **正常场景**: 所有图片都成功处理
2. **部分失败**: 某些图片生成失败，验证：
   - 是否继续处理后续图片
   - 是否仍生成小红书标题
   - 最后是否显示正确的统计信息
3. **完全失败**: 所有图片都失败，验证统计信息是否正确

## 注意事项

1. 失败的图片不会有生成的图片文件，但可能会有小红书标题输出
2. 错误信息会在处理过程中实时显示
3. 最后会有完整的失败列表供查看
4. 每张图片处理仍然有 3 秒延迟，避免 API 限制

## 相关文件
- `batch-process.ts`: 批处理主逻辑（已修改）
- `analyze-fashion.ts`: 图片分析逻辑（未修改）
- `image-generator.ts`: 图片生成逻辑（未修改）
- `ai-service.ts`: AI 服务，包含小红书标题生成（未修改）
