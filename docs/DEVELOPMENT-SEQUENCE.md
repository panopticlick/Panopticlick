# Panopticlick.org - 开发顺序与执行路径

> **原则**: 先搭骨架，再造灵魂，最后打磨皮肤。

---

## 总体开发策略

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         开发阶段总览                                      │
│                                                                          │
│  Week 1        Week 2        Week 3        Week 4        Week 5         │
│  ─────────────────────────────────────────────────────────────────────  │
│                                                                          │
│  ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐        │
│  │ Phase 0│   │ Phase 1│   │ Phase 2│   │ Phase 3│   │ Phase 4│        │
│  │ 基础设施 │   │ 核心检测 │   │ 首页魔法 │   │ RTB模拟 │   │ 收尾发布 │       │
│  └────────┘   └────────┘   └────────┘   └────────┘   └────────┘        │
│                                                                          │
│  Monorepo      SDK          Homepage      RTB Full      Polish          │
│  CI/CD         Collectors   Redacted UI   Supercookie   SEO             │
│  D1 Schema     Entropy      Valuation     Defense       Performance     │
│  Design System API Routes   Animation     Guides        Launch          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 0: 基础设施搭建 (Foundation)

### 目标
建立可工作的开发环境，确保所有团队成员可以开始编码。

### 执行顺序

```
Step 0.1: 创建 Monorepo 骨架
├── 初始化 pnpm workspace
├── 配置 Turborepo
├── 创建目录结构
└── 配置 TypeScript 路径别名

Step 0.2: 配置 Next.js 应用
├── 创建 apps/web
├── 安装 Tailwind CSS 4
├── 配置 Cloudflare adapter
└── 设置开发脚本

Step 0.3: 配置 Cloudflare Worker
├── 创建 workers/api
├── 初始化 Hono.js
├── 配置 wrangler.toml
└── 绑定 D1 和 KV

Step 0.4: 设计系统基础
├── 配置 Tailwind 主题色
├── 安装 shadcn/ui 核心组件
├── 设置字体 (Merriweather + JetBrains Mono)
└── 创建 CSS 变量

Step 0.5: CI/CD 管道
├── GitHub Actions workflow
├── Cloudflare Pages 部署
├── 预览环境配置
└── 自动化测试框架
```

### 详细命令

```bash
# Step 0.1: Monorepo 初始化
mkdir panopticlick.org && cd panopticlick.org

# 初始化 pnpm
pnpm init

# 创建工作区配置
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
  - 'workers/*'
EOF

# 创建目录结构
mkdir -p apps/web packages/{fingerprint-sdk,valuation-engine,types} workers/api docs migrations scripts

# 安装 Turborepo
pnpm add -D turbo

# 创建 turbo.json
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", ".wrangler/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"]
    }
  }
}
EOF
```

```bash
# Step 0.2: Next.js 应用
cd apps/web

# 创建 Next.js 项目
pnpm create next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git

# 安装 Cloudflare adapter
pnpm add @opennextjs/cloudflare

# 安装核心依赖
pnpm add framer-motion zustand lucide-react recharts
pnpm add -D @types/node

# 配置 next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

module.exports = nextConfig;
EOF
```

```bash
# Step 0.3: Cloudflare Worker
cd ../../workers/api

# 初始化 package.json
cat > package.json << 'EOF'
{
  "name": "@panopticlick/api",
  "private": true,
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "typecheck": "tsc --noEmit"
  }
}
EOF

# 安装依赖
pnpm add hono
pnpm add -D wrangler @cloudflare/workers-types typescript

# 创建 wrangler.toml
cat > wrangler.toml << 'EOF'
name = "panopticlick-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "panopticlick-db"
database_id = "YOUR_D1_ID_HERE"

[[kv_namespaces]]
binding = "KV"
id = "YOUR_KV_ID_HERE"

[vars]
ENVIRONMENT = "development"
EOF

# 创建入口文件
mkdir src
cat > src/index.ts << 'EOF'
import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

app.get('/', (c) => c.json({ status: 'ok', service: 'panopticlick-api' }));

app.get('/health', (c) => c.json({ healthy: true }));

export default app;
EOF
```

```bash
# Step 0.4: 设计系统
cd ../../apps/web

# 安装 shadcn/ui
npx shadcn-ui@latest init

# 安装核心组件
npx shadcn-ui@latest add button card progress tabs tooltip badge

# 更新 tailwind.config.ts
cat > tailwind.config.ts << 'EOF'
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // The Bureau Palette
        paper: '#f4f4f5',
        'paper-dark': '#e4e4e7',
        ink: '#18181b',
        'ink-light': '#3f3f46',
        redaction: '#000000',
        highlight: '#fde047',
        evidence: '#3b82f6',
        safe: '#22c55e',
        warn: '#f59e0b',
        danger: '#ef4444',
        terminal: '#10b981',
        muted: '#71717a',
      },
      fontFamily: {
        serif: ['Merriweather', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'redact-reveal': 'redact-reveal 0.3s ease-out forwards',
        'bid-enter': 'bid-enter 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'data-flow': 'data-flow 1.5s linear forwards',
      },
      keyframes: {
        'redact-reveal': {
          '0%': { backgroundColor: '#000', color: '#000' },
          '100%': { backgroundColor: 'transparent', color: '#18181b' },
        },
        'bid-enter': {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'data-flow': {
          '0%': { transform: 'translateX(0)', opacity: '0' },
          '20%': { opacity: '1' },
          '80%': { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
EOF
```

### Phase 0 检查清单

- [ ] `pnpm install` 在根目录成功运行
- [ ] `pnpm dev` 启动 Next.js 在 localhost:3000
- [ ] `cd workers/api && pnpm dev` 启动 Worker 在 localhost:8787
- [ ] Tailwind 自定义颜色可用 (`bg-paper`, `text-ink`, etc.)
- [ ] shadcn/ui Button 组件正常渲染
- [ ] GitHub Actions workflow 文件存在

---

## Phase 1: 核心检测能力 (Core Detection)

### 目标
实现浏览器指纹收集 SDK，并部署基本 API。

### 执行顺序

```
Step 1.1: Types Package
├── 定义 FingerprintPayload 类型
├── 定义 ValuationReport 类型
├── 定义 API 请求/响应类型
└── 导出所有类型

Step 1.2: Fingerprint SDK - 收集器
├── Canvas 收集器
├── WebGL 收集器
├── Audio 收集器
├── Screen 收集器
├── Timezone 收集器
├── Navigator 收集器
├── Fonts 收集器 (可选，较慢)
└── 主收集编排器

Step 1.3: Fingerprint SDK - 哈希
├── SHA-256 哈希函数
├── 硬件哈希组合
├── 软件哈希组合
└── 完整哈希组合

Step 1.4: Valuation Engine - 熵计算
├── 基础熵值表
├── 动态熵计算
├── 熵值分解
└── 唯一性估算

Step 1.5: Valuation Engine - RTB 模拟
├── DSP 配置数据
├── Persona 推断规则
├── 出价生成算法
└── 拍卖模拟器

Step 1.6: Worker API Routes
├── POST /api/scan/start
├── POST /api/scan/collect
├── POST /api/rtb/simulate
└── GET /api/stats/global
```

### 关键代码片段

```typescript
// packages/types/src/fingerprint.ts
export interface FingerprintPayload {
  meta: {
    sessionId: string;
    timestamp: number;
    collectDuration: number;
    sdkVersion: string;
  };

  hardware: {
    canvas: { hash: string; blocked: boolean } | null;
    webgl: {
      hash: string;
      vendor: string;
      renderer: string;
      blocked: boolean;
    } | null;
    audio: { hash: string; sampleRate: number; blocked: boolean } | null;
    screen: {
      width: number;
      height: number;
      colorDepth: number;
      pixelRatio: number;
    };
    cpu: number;
    memory: number | null;
  };

  software: {
    userAgent: string;
    platform: string;
    language: string;
    languages: string[];
    timezone: string;
    timezoneOffset: number;
    fonts: { hash: string; count: number } | null;
    cookiesEnabled: boolean;
    doNotTrack: string | null;
    darkMode: boolean;
  };

  capabilities: {
    localStorage: boolean;
    sessionStorage: boolean;
    indexedDB: boolean;
    webGL: boolean;
    webGL2: boolean;
    webRTC: boolean;
  };
}
```

```typescript
// packages/fingerprint-sdk/src/collectors/canvas.ts
export async function collectCanvas(): Promise<CanvasFingerprint | null> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 绘制确定性图案
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);

    ctx.fillStyle = '#069';
    ctx.font = '11pt "Times New Roman"';
    ctx.fillText('Cwm fjordbank glyphs vext quiz, 😃', 2, 15);

    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.font = '18pt Arial';
    ctx.fillText('Cwm fjordbank glyphs vext quiz, 😃', 4, 45);

    // 渐变
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.5, 'green');
    gradient.addColorStop(1, 'blue');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 50, canvas.width, 10);

    const dataUrl = canvas.toDataURL();

    // 检测是否被阻止
    const blocked = dataUrl.length < 1000; // 太短说明被阻止

    const hash = await sha256(dataUrl);

    return { hash, blocked };
  } catch (e) {
    return null;
  }
}
```

```typescript
// packages/fingerprint-sdk/src/collector.ts
import { collectCanvas } from './collectors/canvas';
import { collectWebGL } from './collectors/webgl';
import { collectAudio } from './collectors/audio';
import { collectScreen } from './collectors/screen';
import { collectTimezone } from './collectors/timezone';
import { collectNavigator } from './collectors/navigator';
import { sha256 } from './hash';
import type { FingerprintPayload } from '@panopticlick/types';

export interface CollectorOptions {
  sessionId: string;
  timeout?: number;
  onProgress?: (collected: number, total: number) => void;
}

export async function collectFingerprint(
  options: CollectorOptions
): Promise<FingerprintPayload> {
  const startTime = Date.now();

  const { sessionId, timeout = 5000, onProgress } = options;

  // 并行收集所有信号
  const collectors = [
    { name: 'canvas', fn: collectCanvas },
    { name: 'webgl', fn: collectWebGL },
    { name: 'audio', fn: collectAudio },
    { name: 'screen', fn: collectScreen },
    { name: 'timezone', fn: collectTimezone },
    { name: 'navigator', fn: collectNavigator },
  ];

  let completed = 0;

  const results = await Promise.allSettled(
    collectors.map(async ({ name, fn }) => {
      const result = await Promise.race([
        fn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), timeout)
        ),
      ]);
      completed++;
      onProgress?.(completed, collectors.length);
      return { name, result };
    })
  );

  // 组装结果
  const data: Record<string, any> = {};
  for (const r of results) {
    if (r.status === 'fulfilled') {
      data[r.value.name] = r.value.result;
    }
  }

  const collectDuration = Date.now() - startTime;

  return {
    meta: {
      sessionId,
      timestamp: Date.now(),
      collectDuration,
      sdkVersion: '1.0.0',
    },
    hardware: {
      canvas: data.canvas || null,
      webgl: data.webgl || null,
      audio: data.audio || null,
      screen: data.screen || { width: 0, height: 0, colorDepth: 0, pixelRatio: 1 },
      cpu: navigator.hardwareConcurrency || 0,
      memory: (navigator as any).deviceMemory || null,
    },
    software: {
      ...data.navigator,
      ...data.timezone,
      fonts: null, // 可选，稍后实现
    },
    capabilities: {
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
      indexedDB: !!window.indexedDB,
      webGL: !!data.webgl,
      webGL2: !!document.createElement('canvas').getContext('webgl2'),
      webRTC: !!window.RTCPeerConnection,
    },
  };
}
```

### Phase 1 检查清单

- [ ] `packages/types` 导出所有类型定义
- [ ] `packages/fingerprint-sdk` 可以在浏览器中收集指纹
- [ ] Canvas/WebGL/Audio 收集器正常工作
- [ ] SHA-256 哈希一致性验证
- [ ] `packages/valuation-engine` 熵计算输出合理值
- [ ] RTB 模拟器生成有意义的出价
- [ ] Worker `/api/scan/start` 返回 sessionId
- [ ] Worker `/api/scan/collect` 处理指纹数据

---

## Phase 2: 首页魔法 (The Mirror)

### 目标
实现首页的核心体验：Redacted 效果、估值卡片、迷你 RTB 预览。

### 执行顺序

```
Step 2.1: 布局组件
├── Header 导航
├── Footer
├── PageLayout 容器
└── 响应式网格

Step 2.2: Redacted 组件 (情感核心)
├── RedactedText 基础组件
├── 悬停解密动画
├── 敏感度级别样式
└── 无障碍支持

Step 2.3: 估值展示组件
├── ValuationCard
├── EntropyGauge
├── PersonaTags
└── DefenseRing

Step 2.4: RTB 迷你预览
├── BidCard 组件
├── 简化版拍卖动画
└── 实时更新效果

Step 2.5: 首页整合
├── Hero Section (Redacted 展示)
├── Live Auction Section
├── Market Value Section
├── Defense Summary Section
└── CTA to Deep Scan

Step 2.6: 扫描流程
├── ConsentGate 组件
├── ScanProgress 进度条
├── 结果显示面板
└── 错误处理
```

### 关键组件实现

```tsx
// components/redacted/redacted-text.tsx
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RedactedTextProps {
  children: React.ReactNode;
  sensitivity?: 'low' | 'medium' | 'high';
  className?: string;
  onReveal?: () => void;
}

export function RedactedText({
  children,
  sensitivity = 'medium',
  className,
  onReveal,
}: RedactedTextProps) {
  const [revealed, setRevealed] = useState(false);

  const handleReveal = useCallback(() => {
    if (!revealed) {
      setRevealed(true);
      onReveal?.();
    }
  }, [revealed, onReveal]);

  const sensitivityColors = {
    low: 'bg-zinc-700',
    medium: 'bg-black',
    high: 'bg-red-900',
  };

  return (
    <span
      className={cn(
        'relative inline-block font-mono rounded-sm cursor-pointer',
        'transition-all duration-300 ease-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-highlight',
        !revealed && [
          sensitivityColors[sensitivity],
          'text-transparent select-none px-1 py-0.5',
        ],
        revealed && 'bg-highlight/20 text-ink px-1 py-0.5',
        className
      )}
      onMouseEnter={handleReveal}
      onClick={handleReveal}
      onKeyDown={(e) => e.key === 'Enter' && handleReveal()}
      role="button"
      tabIndex={0}
      aria-label={revealed ? undefined : 'Classified. Hover or click to reveal.'}
    >
      {children}

      {/* 解密动画遮罩 */}
      <AnimatePresence>
        {!revealed && (
          <motion.span
            initial={{ opacity: 1 }}
            exit={{
              scaleX: 0,
              transition: { duration: 0.3, ease: 'easeOut' },
            }}
            className={cn(
              'absolute inset-0 rounded-sm origin-left',
              sensitivityColors[sensitivity]
            )}
          />
        )}
      </AnimatePresence>

      {/* 悬停提示 */}
      {!revealed && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-highlight/80 opacity-0 hover:opacity-100 transition-opacity font-sans">
            [CLASSIFIED]
          </span>
        </span>
      )}
    </span>
  );
}
```

```tsx
// components/valuation/valuation-card.tsx
'use client';

import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValuationCardProps {
  cpm: number;
  persona: string;
  trackabilityScore: number;
  loading?: boolean;
}

export function ValuationCard({
  cpm,
  persona,
  trackabilityScore,
  loading,
}: ValuationCardProps) {
  const getTier = (score: number) => {
    if (score >= 80) return { label: 'EXPOSED', color: 'danger', bg: 'bg-danger' };
    if (score >= 50) return { label: 'PARTIAL', color: 'warn', bg: 'bg-warn' };
    return { label: 'PROTECTED', color: 'safe', bg: 'bg-safe' };
  };

  const tier = getTier(trackabilityScore);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-2 border-ink bg-paper p-6 space-y-6"
    >
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl font-bold flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Your Market Value
        </h3>
        <span
          className={cn(
            'px-2 py-1 text-xs font-bold uppercase tracking-wider',
            tier.color === 'danger' && 'bg-danger text-white',
            tier.color === 'warn' && 'bg-warn text-ink',
            tier.color === 'safe' && 'bg-safe text-white'
          )}
        >
          {tier.label}
        </span>
      </div>

      {/* CPM 值 */}
      <div className="space-y-1">
        <span className="text-xs uppercase tracking-wider text-muted font-medium">
          Estimated CPM
        </span>
        <div className="flex items-baseline gap-2">
          {loading ? (
            <span className="text-4xl font-mono font-bold animate-pulse">
              $—.——
            </span>
          ) : (
            <motion.span
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="text-4xl font-mono font-bold"
            >
              ${cpm.toFixed(2)}
            </motion.span>
          )}
          <span className="text-sm text-muted">per 1,000 impressions</span>
        </div>
      </div>

      {/* Persona 标签 */}
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-wider text-muted font-medium flex items-center gap-1">
          <Users className="h-3 w-3" />
          Inferred Persona
        </span>
        <div className="flex flex-wrap gap-2">
          {persona.split(' / ').map((tag) => (
            <span
              key={tag}
              className="bg-highlight px-2 py-1 text-sm font-medium text-ink"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 可追踪性分数 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs uppercase tracking-wider text-muted font-medium flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Trackability Index
          </span>
          <span
            className={cn(
              'font-mono font-bold text-xl',
              tier.color === 'danger' && 'text-danger',
              tier.color === 'warn' && 'text-warn',
              tier.color === 'safe' && 'text-safe'
            )}
          >
            {trackabilityScore}%
          </span>
        </div>

        {/* 进度条 */}
        <div className="h-3 bg-paper-dark rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${trackabilityScore}%` }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
            className={cn('h-full rounded-full', tier.bg)}
          />
        </div>
      </div>

      {/* 说明 */}
      <p className="text-sm text-muted border-t border-paper-dark pt-4">
        This estimate is based on RTB market data and your fingerprint entropy.
        Higher trackability = more valuable to advertisers.
      </p>
    </motion.div>
  );
}
```

### Phase 2 检查清单

- [ ] Header/Footer 布局正常
- [ ] RedactedText 悬停动画流畅
- [ ] ValuationCard 数据绑定正确
- [ ] EntropyGauge 可视化清晰
- [ ] 首页 Hero Section 吸引眼球
- [ ] RTB 迷你预览动画工作
- [ ] 扫描按钮触发正确流程
- [ ] 移动端响应式正常

---

## Phase 3: RTB 模拟器 & 超级 Cookie (Killer Features)

### 目标
实现两大杀手级功能：完整 RTB 拍卖模拟 + HSTS 超级 Cookie 演示。

### 执行顺序

```
Step 3.1: RTB 模拟器完整版
├── 数据收集阶段 UI
├── 广播阶段动画
├── 出价流入动画
├── 获胜者公告
└── 最终估值展示

Step 3.2: RTB 数据可视化
├── DataPacket 流动组件
├── BidStream 组件
├── AuctionTimeline 组件
└── WinnerCard 组件

Step 3.3: HSTS 超级 Cookie
├── Worker HSTS 路由
├── DNS 配置 (子域名)
├── 客户端设置函数
├── 客户端读取函数
└── 三步演示流程 UI

Step 3.4: 超级 Cookie Demo 页面
├── StepWizard 组件
├── Step 1: 植入 ID
├── Step 2: 清除提示
├── Step 3: 揭示结果
└── 技术解释面板

Step 3.5: 防御测试
├── AdBlock 诱饵脚本
├── 测试结果矩阵
├── 分数计算
└── 建议生成
```

### RTB 模拟器完整实现

```tsx
// components/rtb/rtb-simulator.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BidCard } from './bid-card';
import { DataPacket } from './data-packet';
import { cn } from '@/lib/utils';
import type { FingerprintPayload, RTBBid } from '@panopticlick/types';

type Phase = 'idle' | 'collecting' | 'broadcasting' | 'bidding' | 'complete';

interface RTBSimulatorProps {
  fingerprint: FingerprintPayload | null;
  onComplete?: (result: RTBSimulationResult) => void;
}

interface RTBSimulationResult {
  bids: RTBBid[];
  winningBid: RTBBid;
  estimatedCPM: number;
  persona: string;
}

export function RTBSimulator({ fingerprint, onComplete }: RTBSimulatorProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [bids, setBids] = useState<RTBBid[]>([]);
  const [collectProgress, setCollectProgress] = useState(0);
  const [broadcastProgress, setBroadcastProgress] = useState(0);

  const startSimulation = useCallback(async () => {
    if (!fingerprint) return;

    // Phase 1: Collecting
    setPhase('collecting');
    for (let i = 0; i <= 100; i += 10) {
      setCollectProgress(i);
      await delay(150);
    }

    // Phase 2: Broadcasting
    setPhase('broadcasting');
    for (let i = 0; i <= 100; i += 5) {
      setBroadcastProgress(i);
      await delay(75);
    }

    // Phase 3: Bidding
    setPhase('bidding');

    // 模拟出价 (实际应调用 API)
    const mockBids: RTBBid[] = [
      { bidder: 'The Trade Desk', amount: 0.0084, interest: 'Luxury', timestamp: Date.now() },
      { bidder: 'Meta Audience', amount: 0.0072, interest: 'Tech', timestamp: Date.now() + 100 },
      { bidder: 'Google Ads', amount: 0.0068, interest: 'Software', timestamp: Date.now() + 200 },
      { bidder: 'Amazon DSP', amount: 0.0061, interest: 'Shopping', timestamp: Date.now() + 300 },
      { bidder: 'Criteo', amount: 0.0054, interest: 'Retargeting', timestamp: Date.now() + 400 },
    ];

    // 逐个添加出价
    for (const bid of mockBids) {
      await delay(400 + Math.random() * 300);
      setBids((prev) => [...prev, bid]);
    }

    // Phase 4: Complete
    await delay(500);
    setPhase('complete');

    const sorted = [...mockBids].sort((a, b) => b.amount - a.amount);
    onComplete?.({
      bids: sorted,
      winningBid: sorted[0],
      estimatedCPM: sorted[0].amount * 1000,
      persona: 'Tech / Developer / Premium',
    });
  }, [fingerprint, onComplete]);

  useEffect(() => {
    if (fingerprint && phase === 'idle') {
      startSimulation();
    }
  }, [fingerprint, phase, startSimulation]);

  return (
    <div className="relative min-h-[500px] border-2 border-ink bg-zinc-900 text-paper p-6 font-mono overflow-hidden">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-highlight text-lg font-bold">
          REAL-TIME BIDDING SIMULATION
        </h3>
        <div className="flex items-center gap-2">
          {phase !== 'idle' && phase !== 'complete' && (
            <>
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-zinc-400">LIVE</span>
            </>
          )}
          {phase === 'complete' && (
            <span className="text-xs text-green-400">COMPLETE</span>
          )}
        </div>
      </div>

      {/* Phase 1: Collecting */}
      <AnimatePresence mode="wait">
        {phase === 'collecting' && (
          <motion.div
            key="collecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <p className="text-zinc-300">Collecting your fingerprint signals...</p>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-highlight"
                style={{ width: `${collectProgress}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {['Canvas', 'WebGL', 'Audio', 'Fonts', 'Screen', 'Timezone'].map(
                (signal, i) => (
                  <span
                    key={signal}
                    className={cn(
                      'px-2 py-1 rounded',
                      collectProgress > i * 15
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-zinc-800 text-zinc-500'
                    )}
                  >
                    {collectProgress > i * 15 ? '✓' : '○'} {signal}
                  </span>
                )
              )}
            </div>
          </motion.div>
        )}

        {/* Phase 2: Broadcasting */}
        {phase === 'broadcasting' && (
          <motion.div
            key="broadcasting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <p className="text-zinc-300">
              Broadcasting your data to ad exchanges...
            </p>

            {/* 数据流动画 */}
            <div className="relative h-24 flex items-center justify-between px-4">
              <div className="bg-evidence p-3 rounded text-xs z-10">YOU</div>
              <div className="bg-zinc-700 p-3 rounded text-xs z-10">SSP</div>
              <div className="bg-zinc-700 p-3 rounded text-xs z-10">EXCHANGE</div>
              <div className="bg-zinc-700 p-3 rounded text-xs z-10">DSPs</div>

              {/* 流动的数据包 */}
              <DataPacket progress={broadcastProgress} />
            </div>

            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-evidence"
                style={{ width: `${broadcastProgress}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* Phase 3 & 4: Bidding & Complete */}
        {(phase === 'bidding' || phase === 'complete') && (
          <motion.div
            key="bidding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <p className="text-zinc-300">Incoming bids</p>
              <span className="text-xs text-zinc-400">
                {bids.length} bidder{bids.length !== 1 && 's'}
              </span>
            </div>

            {/* 出价流 */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <AnimatePresence>
                {bids.map((bid, index) => (
                  <BidCard
                    key={bid.bidder}
                    bid={bid}
                    isWinner={
                      phase === 'complete' &&
                      index === 0 // 第一个是最高出价
                    }
                    delay={index * 0.1}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* 获胜者公告 */}
            {phase === 'complete' && bids.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 bg-highlight text-ink"
              >
                <div className="text-sm font-bold mb-1">AUCTION COMPLETE</div>
                <div className="text-2xl font-bold">
                  Winning Bid: ${bids[0].amount.toFixed(4)}
                </div>
                <div className="text-sm">
                  by {bids[0].bidder} • Interest: {bids[0].interest}
                </div>
                <div className="mt-2 text-sm opacity-80">
                  Your estimated CPM value: ${(bids[0].amount * 1000).toFixed(2)}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

### Phase 3 检查清单

- [ ] RTB 模拟器四阶段动画完整流畅
- [ ] 出价卡片逐个飞入
- [ ] 获胜者高亮显示
- [ ] HSTS Worker 路由配置正确
- [ ] 超级 Cookie 设置/读取函数工作
- [ ] 三步演示流程完整
- [ ] AdBlock 诱饵脚本正确放置
- [ ] 防御测试结果显示正确

---

## Phase 4: 收尾与发布 (Polish & Launch)

### 目标
性能优化、SEO、无障碍、最终测试、上线。

### 执行顺序

```
Step 4.1: 性能优化
├── 图片优化
├── 字体子集化
├── 代码分割
├── 关键 CSS 内联
└── Lighthouse 审计

Step 4.2: SEO
├── Meta 标签配置
├── OpenGraph 图片
├── Sitemap 生成
├── robots.txt
└── 结构化数据

Step 4.3: 无障碍
├── 键盘导航
├── 屏幕阅读器测试
├── 颜色对比度
├── Focus 状态
└── ARIA 标签

Step 4.4: 最终测试
├── 跨浏览器测试
├── 移动设备测试
├── API 压力测试
├── 安全审计
└── GDPR 合规检查

Step 4.5: 发布
├── DNS 配置
├── SSL 证书
├── Cloudflare 设置
├── 监控配置
└── 正式上线
```

### SEO 配置

```tsx
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://panopticlick.org'),
  title: {
    default: 'Panopticlick | Deconstruct Your Digital Shadow',
    template: '%s | Panopticlick',
  },
  description:
    'Is your browser safe against tracking? Run the EFF-inspired privacy analysis. See exactly what advertisers know about you and how much your data is worth.',
  keywords: [
    'browser fingerprint',
    'privacy test',
    'tracking',
    'digital privacy',
    'EFF',
    'ad tracking',
    'RTB',
    'supercookie',
  ],
  authors: [{ name: 'Panopticlick Project' }],
  creator: 'Panopticlick',
  publisher: 'Panopticlick',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://panopticlick.org',
    title: 'Panopticlick | Deconstruct Your Digital Shadow',
    description:
      'Discover what advertisers know about you and how much your data is worth on the open market.',
    siteName: 'Panopticlick',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Panopticlick - Browser Privacy Analysis',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Panopticlick | Deconstruct Your Digital Shadow',
    description: 'Is your browser safe against tracking?',
    images: ['/og-image.png'],
    creator: '@panopticlick',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  },
};
```

### Phase 4 检查清单

- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 90
- [ ] Lighthouse SEO > 90
- [ ] Core Web Vitals 全绿
- [ ] 所有页面有正确的 Meta 标签
- [ ] OpenGraph 预览正确
- [ ] 键盘可完全导航
- [ ] 移动端体验流畅
- [ ] DNS 解析正确
- [ ] SSL 证书有效
- [ ] 监控告警配置完成

---

## 开发依赖顺序图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           依赖关系图                                      │
│                                                                          │
│                        ┌─────────────┐                                  │
│                        │   Phase 0   │                                  │
│                        │  Foundation │                                  │
│                        └──────┬──────┘                                  │
│                               │                                          │
│              ┌────────────────┼────────────────┐                        │
│              │                │                │                        │
│              ▼                ▼                ▼                        │
│     ┌────────────────┐ ┌────────────┐ ┌────────────────┐               │
│     │ packages/types │ │ D1 Schema  │ │ Design System  │               │
│     └───────┬────────┘ └─────┬──────┘ └───────┬────────┘               │
│             │                │                │                        │
│             └────────────────┼────────────────┘                        │
│                              │                                          │
│                              ▼                                          │
│                        ┌─────────────┐                                  │
│                        │   Phase 1   │                                  │
│                        │    Core     │                                  │
│                        └──────┬──────┘                                  │
│                               │                                          │
│              ┌────────────────┼────────────────┐                        │
│              │                │                │                        │
│              ▼                ▼                ▼                        │
│     ┌────────────────┐ ┌────────────┐ ┌────────────────┐               │
│     │ Fingerprint SDK│ │ Valuation  │ │ Worker Routes  │               │
│     └───────┬────────┘ └─────┬──────┘ └───────┬────────┘               │
│             │                │                │                        │
│             └────────────────┼────────────────┘                        │
│                              │                                          │
│                              ▼                                          │
│                        ┌─────────────┐                                  │
│                        │   Phase 2   │                                  │
│                        │   Mirror    │                                  │
│                        └──────┬──────┘                                  │
│                               │                                          │
│              ┌────────────────┼────────────────┐                        │
│              │                │                │                        │
│              ▼                ▼                ▼                        │
│     ┌────────────────┐ ┌────────────┐ ┌────────────────┐               │
│     │ Redacted UI    │ │ Valuation  │ │  Scan Flow     │               │
│     │ Components     │ │ Components │ │  Integration   │               │
│     └───────┬────────┘ └─────┬──────┘ └───────┬────────┘               │
│             │                │                │                        │
│             └────────────────┼────────────────┘                        │
│                              │                                          │
│                              ▼                                          │
│                        ┌─────────────┐                                  │
│                        │   Phase 3   │                                  │
│                        │   Killers   │                                  │
│                        └──────┬──────┘                                  │
│                               │                                          │
│         ┌─────────────────────┼─────────────────────┐                   │
│         │                     │                     │                   │
│         ▼                     ▼                     ▼                   │
│  ┌─────────────┐     ┌────────────────┐     ┌─────────────┐            │
│  │ RTB Full    │     │ HSTS Supercookie│     │ Defense     │            │
│  │ Simulator   │     │ Demo           │     │ Testing     │            │
│  └──────┬──────┘     └───────┬────────┘     └──────┬──────┘            │
│         │                    │                     │                   │
│         └────────────────────┼─────────────────────┘                   │
│                              │                                          │
│                              ▼                                          │
│                        ┌─────────────┐                                  │
│                        │   Phase 4   │                                  │
│                        │   Launch    │                                  │
│                        └─────────────┘                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 并行开发建议

### 可并行的任务组

```
Group A (Frontend Core):
├── Layout components
├── Redacted components
├── Valuation components
└── Defense components

Group B (SDK & Engine):
├── Fingerprint collectors
├── Hash utilities
├── Entropy calculation
└── RTB simulation

Group C (Backend):
├── Worker routes
├── D1 schema & migrations
├── KV configuration
└── HSTS subdomain setup

推荐团队分工:
- 1人: Group A (Frontend)
- 1人: Group B (SDK)
- 1人: Group C (Backend)
```

### 关键路径 (Critical Path)

```
Types → Fingerprint SDK → Worker /scan/collect → Homepage Integration
                                    ↓
                              RTB Simulator
                                    ↓
                              HSTS Demo
```

**这条路径上的任何延迟都会影响整体进度。**
