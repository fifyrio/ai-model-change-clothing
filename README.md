# ai-model-change-clothing

AI-powered fashion tool for generating clothing images with customizable character models.

## 🚀 New: Web UI Interface

We now have a modern web interface! Launch it with:

```bash
npm run web
```

Then open [http://localhost:3000](http://localhost:3000) to:
- Upload images to the `chuandai` directory
- Select character models (lin/Qiao/lin_home_1)
- Generate images with a single click

For more details, see [web-ui/README.md](./web-ui/README.md)

## Command Line Usage

### Batch Processing

npm run batch  "https://pub-9e76573778404f65b02c3ea29d2db5f9.r2.dev/lin/4.png"

npm run batch  "https://pub-9e76573778404f65b02c3ea29d2db5f9.r2.dev/Qiao/1.jpg"

npm run batch "https://pub-9e76573778404f65b02c3ea29d2db5f9.r2.dev/ranrantu/cover.png"

npm run batch "https://pub-9e76573778404f65b02c3ea29d2db5f9.r2.dev/qiao_yoga/frame_1.jpg"

---
npm run batch random lin base64

npm run batch random Qiao

npm run batch random lin

npm run batch random ranrantu

npm run batch random tk

---

npm run figure-change        # 处理 figureChanger 目录
npm run figure-change 其他目录  # 处理指定目录

--

npm run generate "A silver-haired male CEO sits in a leather chair, wearing a dark gray three-piece suit with metallic cufflinks. His slim and curvy female secretary wears a white silk blouse, dark pencil skirt, black stockings, and high heels. As she leans forward to hand over documents, her fingertips lightly touch his hand. The background is a modern office." "https://pub-9e76573778404f65b02c3ea29d2db5f9.r2.dev/lin/frame_1.jpg"

npm run generate "chocolate brown cropped long-sleeve top with scalloped hem, matching high-waisted leggings, seamless bodycon style" "https://pub-9e76573778404f65b02c3ea29d2db5f9.r2.dev/Qiao/frame_6.jpg"


---
生成3视图
将图片发到randomGesture里
npm run multi-views   