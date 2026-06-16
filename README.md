# 🎁 时光盲盒 · Happy Birthday

> **🌐 在线制作地址：[https://happybirthday.xiazicheng520.workers.dev/](https://happybirthday.xiazicheng520.workers.dev/)**
>
> 填写祝福、上传回忆，生成一份专属链接 —— 让 Ta 在生日那天，一层层拆开你的心意。

---

一个为生日准备的「交互式祝福盲盒」。制作者填好祝福语、照片和背景，生成一个独一无二的链接；收礼物的人打开链接后，会经历一场层层递进的拆礼物动画：开信封 → 爱心词条 → 打字机祝福 → 长按许愿 → 3D 粒子终幕。

## ✨ 特性

- **无需注册，完全免费** —— 1 分钟填完即可生成分享链接
- **五幕沉浸式体验** —— 每一幕都有独立的动画与音效
- **自定义内容** —— 祝福语、照片回忆、背景图片均可自定义
- **照片自动清理** —— 上传的照片 7 天后自动从云端删除
- **可二次编辑** —— 通过编辑链接随时修改已生成的盲盒

## 🎬 收礼五幕流程

| 阶段 | 组件 | 说明 |
| --- | --- | --- |
| 1. 信封开启 | `Envelope.jsx` | 信封拆开动画，揭开序幕 |
| 2. 爱心词条 | `WordHeart.jsx` | 260 个祝福词条飞入、漂浮、汇聚成跳动的爱心 |
| 3. 打字机祝福 | `TypewriterText.jsx` | 逐字浮现的祝福语，配打字机音效 |
| 4. 长按许愿 | `ConfettiSurprise.jsx` | 长按蓄力，触发彩带许愿仪式 |
| 5. 粒子终幕 | `ParticleScene.jsx` + `scene.html` | 6 万粒子组成的生日蛋糕、爱心与代码雨，支持手势互动 |

## 🛠 技术栈

- **框架**：Next.js 14 · React 18
- **样式**：Tailwind CSS 3
- **动画**：Framer Motion 11 · GSAP 3 · Three.js (r184)
- **特效**：canvas-confetti
- **图标**：Lucide React
- **后端 / 存储**：Supabase（数据库 + 文件存储）
- **部署**：Cloudflare Workers

## 📁 项目结构

```
app/
  page.js              # 落地页（免费制作入口）
  create/page.js       # 盲盒制作页
  edit/[id]/page.js    # 盲盒编辑页
  gift/[id]/page.js    # 收礼物页（五幕流程）
components/
  Envelope.jsx         # 第一幕：信封
  WordHeart.jsx        # 第二幕：爱心词条
  TypewriterText.jsx   # 第三幕：打字机祝福
  ConfettiSurprise.jsx # 第四幕：长按许愿
  ParticleScene.jsx    # 第五幕：粒子终幕
  CreateForm.jsx       # 制作表单（双栏布局）
  ShareModal.jsx       # 分享弹窗
  AudioController.jsx  # 背景音乐控制
lib/
  supabase.js          # Supabase 客户端与数据 / 存储方法
public/
  scene.html           # 粒子终幕动画
  music/               # 背景音乐与音效
  photos/              # 默认照片素材
```

## 🚀 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=你的-supabase-项目地址
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的-supabase-anon-key
```

### 3. 初始化 Supabase

需要在 Supabase 中准备以下资源：

- **数据表 `gifts`**：字段含 `id`、`senderName`、`receiverName`、`message`、`galleryUrls`、`bgImage`
- **数据表 `photo_expiry`**：字段含 `url`、`storage_path`、`uploaded_at`（用于照片 7 天自动清理）
- **存储桶 `HappyBirthday`**：用于存放用户上传的照片（路径前缀 `photos/`）

### 4. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可预览。

## 📜 可用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 运行构建后的生产版本 |

## 💝 使用方式

1. 打开 [在线制作地址](https://happybirthday.xiazicheng520.workers.dev/)，点击「免费制作」
2. 填写你的名字、Ta 的名字、祝福语，上传照片与背景
3. 生成专属链接，分享给寿星
4. Ta 打开链接，逐幕拆开属于自己的生日惊喜 🎂

---

愿每一份祝福，都是一颗值得珍藏的时光胶囊。
