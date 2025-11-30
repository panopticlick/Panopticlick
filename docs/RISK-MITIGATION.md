# Panopticlick.org - 风险缓解与问题预案

> 预见问题，提前解决。这份文档列出所有可能遇到的技术风险和解决方案。

---

## 风险矩阵总览

| 风险类别 | 风险项 | 概率 | 影响 | 优先级 | 状态 |
|----------|--------|------|------|--------|------|
| 浏览器兼容性 | HSTS 超级 Cookie 失效 | 高 | 高 | P0 | 需缓解 |
| 浏览器兼容性 | Canvas 指纹被阻止 | 中 | 中 | P1 | 需缓解 |
| 性能 | RTB 动画卡顿 | 中 | 高 | P0 | 需缓解 |
| 性能 | 首页加载过慢 | 低 | 高 | P1 | 需监控 |
| 安全 | API 滥用/DDoS | 中 | 高 | P0 | 需缓解 |
| 安全 | 数据泄露 | 低 | 极高 | P0 | 需预防 |
| 合规 | GDPR 违规 | 低 | 极高 | P0 | 需预防 |
| 用户体验 | AdBlock 误报 | 中 | 中 | P1 | 需缓解 |
| 基础设施 | D1 查询超时 | 低 | 高 | P2 | 需监控 |
| 基础设施 | Worker 冷启动 | 低 | 低 | P3 | 可接受 |

---

## 1. 浏览器兼容性风险

### 1.1 HSTS 超级 Cookie 失效

**风险描述**:
- 浏览器厂商正在逐步封杀 HSTS 持久化追踪
- Chrome/Firefox/Safari 可能在新版本中改变 HSTS 行为
- 隐身模式可能完全隔离 HSTS 状态

**当前浏览器行为** (2024年):

| 浏览器 | 版本 | HSTS 持久化 | 隐身继承 | 风险等级 |
|--------|------|------------|----------|----------|
| Chrome | 120+ | ✓ 正常 | 部分继承 | 中 |
| Firefox | 120+ | ✓ 正常 | 不继承 | 低 |
| Safari | 17+ | ✓ 正常 | 不继承 | 低 |
| Edge | 120+ | ✓ 正常 | 部分继承 | 中 |
| Brave | All | ✗ 随机化 | N/A | 高 |

**缓解策略**:

```typescript
// 1. 检测 HSTS 支持能力
async function detectHSTSSupport(): Promise<boolean> {
  try {
    // 设置一个测试位
    await fetch('https://test-hsts.panopticlick.org/set', { mode: 'no-cors' });

    // 等待缓存
    await delay(500);

    // 检测是否被升级
    const upgraded = await checkHTTPSUpgrade('http://test-hsts.panopticlick.org/check');

    return upgraded;
  } catch {
    return false;
  }
}

// 2. 优雅降级
async function runSupercookieDemo() {
  const supported = await detectHSTSSupport();

  if (!supported) {
    // 显示教育性内容而非实际演示
    showEducationalFallback({
      title: 'Your browser blocks HSTS tracking',
      message: 'Good news! Your browser (likely Brave or hardened Firefox) ' +
               'prevents this tracking technique. Here\'s how it works on vulnerable browsers...',
      showVideo: true, // 显示预录视频演示
    });
    return;
  }

  // 正常执行演示
  await executeHSTSDemo();
}

// 3. 多种超级 Cookie 备选方案
const SUPERCOOKIE_METHODS = [
  { name: 'HSTS', fn: testHSTS, reliability: 0.7 },
  { name: 'Favicon', fn: testFavicon, reliability: 0.5 },
  { name: 'ETag', fn: testETag, reliability: 0.4 },
  { name: 'Cache Timing', fn: testCacheTiming, reliability: 0.3 },
];

async function findWorkingMethod() {
  for (const method of SUPERCOOKIE_METHODS) {
    if (await method.fn()) {
      return method;
    }
  }
  return null; // 所有方法都失败
}
```

**用户界面处理**:

```tsx
// 当 HSTS 不可用时的 UI
function SupercookieDemoFallback() {
  return (
    <div className="border-2 border-safe bg-safe/10 p-6">
      <div className="flex items-center gap-2 text-safe mb-4">
        <ShieldCheck className="h-6 w-6" />
        <h3 className="font-bold">Your Browser Is Protected!</h3>
      </div>

      <p className="mb-4">
        Your browser (likely Brave, Tor, or hardened Firefox) blocks HSTS
        supercookie tracking. This is excellent for your privacy.
      </p>

      <p className="mb-4">
        However, most browsers are still vulnerable. Here's what the attack
        looks like on a vulnerable browser:
      </p>

      {/* 预录演示视频 */}
      <video
        src="/demos/hsts-supercookie-demo.mp4"
        controls
        className="w-full rounded"
      />

      <div className="mt-4 p-4 bg-paper-dark">
        <h4 className="font-bold mb-2">Why does this work?</h4>
        <p className="text-sm text-muted">
          HSTS (HTTP Strict Transport Security) tells browsers to always use
          HTTPS for a domain. Trackers abuse this by setting HSTS on many
          subdomains, each representing one bit of a unique ID...
        </p>
      </div>
    </div>
  );
}
```

---

### 1.2 Canvas 指纹被阻止

**风险描述**:
- Privacy Badger、CanvasBlocker 等扩展会随机化 Canvas
- Firefox 的增强追踪保护可能阻止 Canvas 指纹
- Tor Browser 返回空白 Canvas

**检测与处理**:

```typescript
// 检测 Canvas 是否被阻止或伪造
interface CanvasAnalysis {
  hash: string;
  blocked: boolean;
  spoofed: boolean;
  confidence: number;
}

async function analyzeCanvas(): Promise<CanvasAnalysis> {
  const canvas = document.createElement('canvas');
  canvas.width = 280;
  canvas.height = 60;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return { hash: '', blocked: true, spoofed: false, confidence: 0 };
  }

  // 绘制测试图案
  drawTestPattern(ctx);

  const dataUrl = canvas.toDataURL();
  const hash = await sha256(dataUrl);

  // 检测阻止
  const blocked = dataUrl.length < 1000 || dataUrl === 'data:,';

  // 检测伪造
  const spoofed = await detectSpoofing(hash);

  // 计算置信度
  const confidence = calculateConfidence(blocked, spoofed, hash);

  return { hash, blocked, spoofed, confidence };
}

async function detectSpoofing(hash: string): Promise<boolean> {
  // 1. 检查已知的伪造模式
  const KNOWN_SPOOF_PATTERNS = [
    /^0{32,}$/,           // 全零
    /^f{32,}$/,           // 全F
    /canvasblocker/i,     // CanvasBlocker 签名
  ];

  if (KNOWN_SPOOF_PATTERNS.some(p => p.test(hash))) {
    return true;
  }

  // 2. 多次渲染比对 (真实应该一致，伪造可能每次不同)
  const hashes = await Promise.all([
    generateCanvasHash(),
    generateCanvasHash(),
    generateCanvasHash(),
  ]);

  const allSame = hashes.every(h => h === hashes[0]);
  if (!allSame) {
    return true; // 每次不同 = 被随机化
  }

  return false;
}

function calculateConfidence(blocked: boolean, spoofed: boolean, hash: string): number {
  if (blocked) return 0;
  if (spoofed) return 0.2; // 伪造的也算一种指纹
  if (hash.length < 32) return 0.5;
  return 1.0;
}
```

**UI 处理**:

```tsx
// 在指纹详情页显示阻止状态
function CanvasFingerprintCard({ analysis }: { analysis: CanvasAnalysis }) {
  if (analysis.blocked) {
    return (
      <div className="border-l-4 border-safe bg-safe/10 p-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="h-5 w-5 text-safe" />
          <span className="font-bold text-safe">Canvas Blocked</span>
        </div>
        <p className="text-sm">
          Your browser or extension is blocking canvas fingerprinting. This
          significantly improves your privacy.
        </p>
      </div>
    );
  }

  if (analysis.spoofed) {
    return (
      <div className="border-l-4 border-warn bg-warn/10 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-warn" />
          <span className="font-bold text-warn">Canvas Randomized</span>
        </div>
        <p className="text-sm">
          Your canvas fingerprint appears to be randomized, likely by an
          extension like CanvasBlocker. While this helps, trackers may detect
          the randomization itself.
        </p>
      </div>
    );
  }

  return (
    <div className="border-l-4 border-danger bg-danger/10 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Fingerprint className="h-5 w-5 text-danger" />
        <span className="font-bold text-danger">Canvas Exposed</span>
      </div>
      <p className="text-sm mb-2">
        Your canvas fingerprint is unique and exposed to trackers.
      </p>
      <code className="text-xs bg-paper-dark p-2 block rounded">
        {analysis.hash.slice(0, 32)}...
      </code>
    </div>
  );
}
```

---

## 2. 性能风险

### 2.1 RTB 动画卡顿

**风险描述**:
- 复杂动画在低端设备上可能卡顿
- Framer Motion 的 GPU 合成可能导致内存问题
- 大量 DOM 元素更新影响帧率

**缓解策略**:

```typescript
// 1. 性能检测
function detectDeviceCapability(): 'low' | 'medium' | 'high' {
  // 检测 CPU 核心数
  const cores = navigator.hardwareConcurrency || 2;

  // 检测设备内存
  const memory = (navigator as any).deviceMemory || 4;

  // 检测是否有 GPU
  const hasGPU = (() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    return gl !== null;
  })();

  // 综合判断
  if (cores >= 8 && memory >= 8 && hasGPU) return 'high';
  if (cores >= 4 && memory >= 4) return 'medium';
  return 'low';
}

// 2. 根据性能等级调整动画
const ANIMATION_CONFIGS = {
  high: {
    bidDelay: 300,
    particleCount: 20,
    enableBlur: true,
    enableGlow: true,
    transitionDuration: 0.3,
  },
  medium: {
    bidDelay: 400,
    particleCount: 10,
    enableBlur: false,
    enableGlow: true,
    transitionDuration: 0.2,
  },
  low: {
    bidDelay: 500,
    particleCount: 0,
    enableBlur: false,
    enableGlow: false,
    transitionDuration: 0.1,
  },
};

// 3. 减少动画选项
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

// 4. 使用 CSS 动画替代 JS 动画
const OPTIMIZED_KEYFRAMES = `
@keyframes bid-enter {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.bid-card {
  animation: bid-enter 0.3s ease-out;
  will-change: transform, opacity;
}
`;

// 5. 虚拟化长列表
import { useVirtualizer } from '@tanstack/react-virtual';

function BidList({ bids }: { bids: RTBBid[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: bids.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // 估计每个 bid 高度
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-64 overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <BidCard bid={bids[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2.2 首页加载过慢

**目标**: LCP < 2.5s, FID < 100ms, CLS < 0.1

**优化清单**:

```typescript
// next.config.js 优化配置
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },

  // 代码分割优化
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'recharts',
    ],
  },

  // Webpack 优化
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 分离大型库
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          framer: {
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            name: 'framer',
            chunks: 'all',
          },
          recharts: {
            test: /[\\/]node_modules[\\/]recharts[\\/]/,
            name: 'recharts',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
};
```

```tsx
// 懒加载非关键组件
import dynamic from 'next/dynamic';

// RTB 模拟器懒加载
const RTBSimulator = dynamic(
  () => import('@/components/rtb/rtb-simulator'),
  {
    loading: () => <RTBSimulatorSkeleton />,
    ssr: false, // 禁用 SSR，因为需要浏览器 API
  }
);

// 图表懒加载
const EntropyChart = dynamic(
  () => import('@/components/entropy/entropy-chart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

// 字体优化
// 在 app/layout.tsx 中
import { Merriweather, JetBrains_Mono } from 'next/font/google';

const merriweather = Merriweather({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  display: 'swap', // 使用 swap 防止 FOIT
  variable: '--font-serif',
});

const jetbrainsMono = JetBrains_Mono({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});
```

---

## 3. 安全风险

### 3.1 API 滥用/DDoS

**缓解策略**:

```typescript
// workers/api/src/middleware/ratelimit.ts
import { Hono } from 'hono';

interface RateLimitConfig {
  window: number;      // 时间窗口 (秒)
  max: number;         // 最大请求数
  keyGenerator: (c: Context) => string;
}

export function rateLimit(config: RateLimitConfig) {
  return async (c: Context, next: () => Promise<void>) => {
    const key = `ratelimit:${config.keyGenerator(c)}`;
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - config.window;

    // 从 KV 获取请求记录
    const record = await c.env.KV.get<{ count: number; resetAt: number }>(
      key,
      { type: 'json' }
    );

    if (record && record.resetAt > now) {
      if (record.count >= config.max) {
        return c.json(
          {
            error: 'RATE_LIMITED',
            message: 'Too many requests',
            retryAfter: record.resetAt - now,
          },
          429,
          {
            'Retry-After': String(record.resetAt - now),
          }
        );
      }

      // 增加计数
      await c.env.KV.put(
        key,
        JSON.stringify({ count: record.count + 1, resetAt: record.resetAt }),
        { expirationTtl: config.window }
      );
    } else {
      // 新窗口
      await c.env.KV.put(
        key,
        JSON.stringify({ count: 1, resetAt: now + config.window }),
        { expirationTtl: config.window }
      );
    }

    await next();
  };
}

// 应用到路由
app.use(
  '/api/scan/*',
  rateLimit({
    window: 60,    // 1 分钟
    max: 10,       // 最多 10 次扫描
    keyGenerator: (c) => {
      const ip = c.req.header('cf-connecting-ip') || 'unknown';
      return `scan:${ip}`;
    },
  })
);

// Cloudflare Turnstile 验证
app.post('/api/scan/start', async (c) => {
  const { turnstileToken, consent } = await c.req.json();

  // 验证 Turnstile token
  const formData = new FormData();
  formData.append('secret', c.env.TURNSTILE_SECRET);
  formData.append('response', turnstileToken);
  formData.append('remoteip', c.req.header('cf-connecting-ip') || '');

  const result = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', body: formData }
  );

  const outcome = await result.json();

  if (!outcome.success) {
    return c.json({ error: 'INVALID_TURNSTILE', message: 'Bot detected' }, 403);
  }

  // 继续正常流程...
});
```

### 3.2 数据泄露预防

```typescript
// 数据处理安全规则

// 规则 1: 永不存储原始 IP
function hashIP(ip: string): string {
  // 添加盐值防止彩虹表攻击
  const salt = 'panopticlick_v1_' + new Date().toISOString().slice(0, 7);
  return sha256(salt + ip);
}

// 规则 2: 永不存储原始指纹
function storeFingerprint(fp: FingerprintPayload) {
  // 只存储哈希和熵值
  return {
    hardwareHash: sha256(JSON.stringify(fp.hardware)),
    softwareHash: sha256(JSON.stringify(fp.software)),
    entropyTotal: calculateEntropy(fp),
    // 永不存储 fp 本身
  };
}

// 规则 3: 响应中不暴露内部数据
function sanitizeResponse(data: any): any {
  const SENSITIVE_FIELDS = ['ipHash', 'sessionSecret', 'dbId'];

  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !SENSITIVE_FIELDS.includes(key))
  );
}

// 规则 4: 日志脱敏
function logRequest(c: Context, message: string) {
  const ip = c.req.header('cf-connecting-ip') || 'unknown';
  const maskedIp = ip.replace(/\d+\.\d+$/, 'x.x'); // 192.168.x.x

  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    message,
    ip: maskedIp,
    path: c.req.path,
    // 不记录请求体
  }));
}
```

---

## 4. 合规风险

### 4.1 GDPR 合规

**必须实现**:

```typescript
// 1. 同意管理
interface ConsentRecord {
  sessionId: string;
  timestamp: number;
  version: string;       // 隐私政策版本
  ipHash: string;
  granted: boolean;
}

async function recordConsent(c: Context, granted: boolean) {
  const record: ConsentRecord = {
    sessionId: c.req.header('x-session-id') || '',
    timestamp: Date.now(),
    version: '2024-01-01',
    ipHash: hashIP(c.req.header('cf-connecting-ip') || ''),
    granted,
  };

  await c.env.DB.prepare(`
    INSERT INTO consent_records (session_id, timestamp, version, ip_hash, granted)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    record.sessionId,
    record.timestamp,
    record.version,
    record.ipHash,
    record.granted ? 1 : 0
  ).run();
}

// 2. 数据删除端点 (Right to Erasure)
app.post('/api/opt-out', async (c) => {
  const { confirm } = await c.req.json();

  if (!confirm) {
    return c.json({ error: 'Confirmation required' }, 400);
  }

  const ipHash = hashIP(c.req.header('cf-connecting-ip') || '');

  // 删除所有相关数据
  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM sessions WHERE ip_hash = ?').bind(ipHash),
    c.env.DB.prepare('DELETE FROM fingerprint_analyses WHERE session_id IN (SELECT id FROM sessions WHERE ip_hash = ?)').bind(ipHash),
    c.env.DB.prepare('INSERT INTO opt_outs (ip_hash, opted_out_at) VALUES (?, ?)').bind(ipHash, Date.now()),
  ]);

  // 设置 KV 标记阻止未来收集
  await c.env.KV.put(`optout:${ipHash}`, '1', {
    expirationTtl: 365 * 24 * 60 * 60, // 1 年
  });

  return c.json({
    success: true,
    message: 'All your data has been deleted. Future collection is disabled.',
  });
});

// 3. 数据导出端点 (Right to Access)
app.get('/api/my-data', async (c) => {
  const ipHash = hashIP(c.req.header('cf-connecting-ip') || '');

  const sessions = await c.env.DB.prepare(`
    SELECT * FROM sessions WHERE ip_hash = ?
  `).bind(ipHash).all();

  const analyses = await c.env.DB.prepare(`
    SELECT * FROM fingerprint_analyses
    WHERE session_id IN (SELECT id FROM sessions WHERE ip_hash = ?)
  `).bind(ipHash).all();

  return c.json({
    sessions: sessions.results,
    analyses: analyses.results,
    exportedAt: new Date().toISOString(),
    note: 'Raw fingerprint data is never stored. Only hashes and entropy values.',
  });
});

// 4. 自动数据过期
// 在 Cloudflare Worker 的 Cron Trigger 中
export default {
  async scheduled(event: ScheduledEvent, env: Env) {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    await env.DB.prepare(`
      DELETE FROM sessions WHERE created_at < ?
    `).bind(thirtyDaysAgo).run();

    await env.DB.prepare(`
      DELETE FROM fingerprint_analyses WHERE created_at < ?
    `).bind(thirtyDaysAgo).run();

    console.log('Data cleanup completed');
  },
};
```

**隐私政策要点**:

```markdown
## 我们收集什么

1. **浏览器指纹哈希** - 我们不存储您的原始指纹数据，只存储单向哈希值
2. **熵值** - 您的指纹有多独特的数字指标
3. **国家/城市** - 来自 Cloudflare 的大致位置，非精确坐标
4. **IP 哈希** - 我们不存储您的 IP 地址，只存储不可逆的哈希值

## 我们不收集什么

- 原始 IP 地址
- 原始指纹数据
- 精确地理位置
- 任何个人身份信息

## 数据保留

所有数据在 **30 天后自动删除**。

## 您的权利

- **删除数据**: 访问 /opt-out 删除所有数据
- **导出数据**: 访问 /my-data 下载您的数据
- **选择退出**: 退出后不再收集您的数据
```

---

## 5. 用户体验风险

### 5.1 AdBlock 误报

**问题**: 诱饵脚本可能被误报为真正的恶意脚本

**缓解策略**:

```typescript
// 多重验证防止误报
async function testTracker(bait: BaitScript): Promise<TrackerTestResult> {
  const results = {
    scriptBlocked: false,
    networkBlocked: false,
    domBlocked: false,
  };

  // 方法 1: 脚本加载测试
  results.scriptBlocked = await testScriptLoad(bait.url);

  // 方法 2: 网络请求测试
  results.networkBlocked = await testNetworkRequest(bait.url);

  // 方法 3: DOM 元素测试
  results.domBlocked = await testDOMElement(bait.testElementId);

  // 综合判断
  const blockedCount = Object.values(results).filter(Boolean).length;

  return {
    name: bait.name,
    blocked: blockedCount >= 2, // 至少 2 种方法检测到阻止
    confidence: blockedCount / 3,
    methods: results,
  };
}

// 用户可手动确认
function TrackerResultWithOverride({ result }: { result: TrackerTestResult }) {
  const [userOverride, setUserOverride] = useState<boolean | null>(null);

  const finalBlocked = userOverride ?? result.blocked;

  return (
    <div className="flex items-center justify-between p-3">
      <div className="flex items-center gap-2">
        {finalBlocked ? (
          <CheckCircle className="text-safe h-4 w-4" />
        ) : (
          <XCircle className="text-danger h-4 w-4" />
        )}
        <span>{result.name}</span>
      </div>

      {result.confidence < 0.8 && (
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>Unsure?</span>
          <button
            onClick={() => setUserOverride(true)}
            className="underline hover:text-ink"
          >
            Mark blocked
          </button>
          <button
            onClick={() => setUserOverride(false)}
            className="underline hover:text-ink"
          >
            Mark loaded
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## 6. 监控与告警

### 6.1 关键指标监控

```typescript
// 使用 Cloudflare Analytics Engine

// 记录关键事件
async function trackEvent(env: Env, event: string, data: Record<string, any>) {
  env.ANALYTICS.writeDataPoint({
    blobs: [event],
    doubles: [data.value || 0],
    indexes: [data.sessionId || ''],
  });
}

// 需要监控的指标
const METRICS_TO_TRACK = [
  // 业务指标
  'scan_started',
  'scan_completed',
  'scan_failed',
  'rtb_simulation_run',
  'supercookie_tested',
  'defense_tested',

  // 性能指标
  'api_latency_p50',
  'api_latency_p99',
  'd1_query_time',
  'fingerprint_collection_time',

  // 错误指标
  'api_error_rate',
  'consent_declined_rate',
  'canvas_blocked_rate',
];
```

### 6.2 告警阈值

| 指标 | 警告阈值 | 严重阈值 | 处理方式 |
|------|----------|----------|----------|
| API 错误率 | > 1% | > 5% | 通知 + 自动回滚 |
| API P99 延迟 | > 500ms | > 2000ms | 通知 + 扩容 |
| D1 查询超时 | > 1% | > 5% | 通知 + 查询优化 |
| 扫描完成率 | < 90% | < 70% | 调查 + 修复 |

---

## 7. 回滚计划

### 7.1 部署回滚

```bash
# Cloudflare Pages 回滚
# 在 Cloudflare Dashboard 中选择之前的成功部署

# Worker 回滚
wrangler rollback --name panopticlick-api

# D1 迁移回滚 (需要手动)
# 1. 备份当前数据
wrangler d1 execute panopticlick-db --file=./backups/pre-migration.sql

# 2. 执行回滚 SQL
wrangler d1 execute panopticlick-db --file=./migrations/rollback-xxx.sql
```

### 7.2 功能开关

```typescript
// 使用 KV 存储功能开关
interface FeatureFlags {
  rtb_simulator: boolean;
  hsts_supercookie: boolean;
  behavior_tracking: boolean;
  defense_testing: boolean;
}

async function getFeatureFlags(env: Env): Promise<FeatureFlags> {
  const flags = await env.KV.get<FeatureFlags>('feature_flags', { type: 'json' });

  return flags || {
    rtb_simulator: true,
    hsts_supercookie: true,
    behavior_tracking: false, // 默认关闭
    defense_testing: true,
  };
}

// 在组件中使用
function RTBSection() {
  const flags = useFeatureFlags();

  if (!flags.rtb_simulator) {
    return <RTBMaintenanceNotice />;
  }

  return <RTBSimulator />;
}
```

---

## 总结检查清单

### 发布前必须完成

- [ ] HSTS 降级方案测试通过
- [ ] Canvas 阻止检测工作正常
- [ ] 移动端动画帧率 > 30fps
- [ ] Lighthouse 性能分数 > 90
- [ ] 速率限制测试通过
- [ ] Turnstile 集成测试通过
- [ ] GDPR 合规检查通过
- [ ] 隐私政策审核通过
- [ ] 数据删除端点测试通过
- [ ] 监控告警配置完成
- [ ] 回滚计划文档完成
- [ ] 功能开关配置完成
