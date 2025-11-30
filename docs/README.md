# Panopticlick.org 文档中心

> **"Deconstruct Your Digital Shadow"** - 数字自卫系统

---

## 📚 文档导航

### 🏗️ 架构与设计

| 文档 | 描述 | 适合谁读 |
|------|------|----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 系统架构、技术栈、数据流 | 所有开发者 |
| [DATA-SCHEMA.md](./DATA-SCHEMA.md) | D1 数据库、TypeScript 类型、API 契约 | 后端开发者 |
| [UI-DESIGN.md](./UI-DESIGN.md) | 设计系统、组件规范、动画指南 | 前端开发者 |

### 🚀 实施与执行

| 文档 | 描述 | 适合谁读 |
|------|------|----------|
| [IMPLEMENTATION.md](./IMPLEMENTATION.md) | 分阶段实施计划、代码示例 | 开发负责人 |
| [EXECUTION-BLUEPRINT.md](./EXECUTION-BLUEPRINT.md) | 终极执行蓝图、组件清单、数据流 | 所有开发者 |
| [DEVELOPMENT-SEQUENCE.md](./DEVELOPMENT-SEQUENCE.md) | 最优开发顺序、依赖关系、并行建议 | 开发负责人 |

### ⚠️ 风险与运维

| 文档 | 描述 | 适合谁读 |
|------|------|----------|
| [RISK-MITIGATION.md](./RISK-MITIGATION.md) | 风险预案、浏览器兼容性、安全措施 | 所有开发者 |
| [FEATURES.md](./FEATURES.md) | 杀手级功能详细规范 | 产品/开发 |

---

## 🎯 快速开始

### 1. 了解项目定位

```
Panopticlick ≠ 又一个指纹检测工具

Panopticlick = 数字隐私的"真相调查局"

我们的目标: 让用户感到"后背发凉"，然后教他们保护自己
```

### 2. 核心差异化

| 我们做什么 | 别人做什么 |
|-----------|-----------|
| 展示数据值多少钱 💰 | 只展示"你是唯一的" |
| RTB 拍卖可视化 | 静态数据表格 |
| "机密文件"解密 UI | 普通数据展示 |
| 超级 Cookie 实际演示 | 仅文字说明 |

### 3. 阅读顺序建议

```
新手:
1. README.md (本文件)
2. ARCHITECTURE.md (了解全貌)
3. UI-DESIGN.md (视觉风格)
4. IMPLEMENTATION.md (开始编码)

资深:
1. EXECUTION-BLUEPRINT.md (直接看蓝图)
2. DEVELOPMENT-SEQUENCE.md (确定任务)
3. RISK-MITIGATION.md (预防问题)
```

---

## 🛠️ 技术栈速览

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│  Next.js 14+ │ TypeScript │ Tailwind │ shadcn/ui   │
│  Framer Motion │ Zustand │ Recharts                 │
├─────────────────────────────────────────────────────┤
│                    BACKEND                           │
│  Cloudflare Workers │ Hono.js │ D1 (SQLite) │ KV   │
├─────────────────────────────────────────────────────┤
│                    DESIGN                            │
│  Merriweather (Serif) │ JetBrains Mono │ Zinc 调色盘│
│  "调查报道" 风格 │ Redacted 交互                     │
└─────────────────────────────────────────────────────┘
```

---

## 📊 项目进度追踪

### Phase 0: 基础设施 ⬜
- [ ] Monorepo 配置
- [ ] CI/CD 管道
- [ ] 设计系统基础

### Phase 1: 核心检测 ⬜
- [ ] Fingerprint SDK
- [ ] Valuation Engine
- [ ] Worker API

### Phase 2: 首页魔法 ⬜
- [ ] Redacted UI
- [ ] Valuation Card
- [ ] 扫描流程

### Phase 3: 杀手功能 ⬜
- [ ] RTB 模拟器
- [ ] HSTS 超级 Cookie
- [ ] 防御测试

### Phase 4: 发布 ⬜
- [ ] 性能优化
- [ ] SEO
- [ ] 上线

---

## 🔗 相关资源

### 参考项目 (位于 `/Volumes/SSD/dev/new/ip-dataset/`)

| 项目 | 借鉴点 |
|------|--------|
| `amiunique.io` | 哈希稳定性、80+ 维度 |
| `BrowserScan.org` | PDF 导出、评分系统 |
| `Pixelscan.dev` | 调试器风格 UI |
| `browserleaks` | 实验室组织方式 |
| `creepjs` | 40+ 高级收集器 |

### 外部 API

| API | 用途 |
|-----|------|
| ipinfo.io | IP 情报 (批量) |
| Cloudflare Headers | 地理位置、ASN |
| Turnstile | 机器人检测 |

---

## ❓ 常见问题

### Q: 为什么选择 Cloudflare 而不是 Vercel?

A: HSTS 超级 Cookie 需要精细的 DNS 子域名控制，Cloudflare 提供更好的支持。D1 与 Workers 的边缘部署也更高效。

### Q: RTB 模拟是真实的吗?

A: 不是。我们模拟 OpenRTB 协议的行为，但不连接真实的广告交易所。出价金额基于行业研究数据估算。

### Q: 如何处理隐私担忧?

A: 我们只存储哈希值和熵值，从不存储原始指纹。IP 地址在存储前哈希。所有数据 30 天后自动删除。

### Q: 支持哪些浏览器?

A:
- ✅ Chrome 90+
- ✅ Firefox 90+
- ✅ Safari 15+
- ✅ Edge 90+
- ⚠️ Brave (部分功能受限)
- ⚠️ Tor (部分功能受限)

---

## 📝 贡献指南

1. **阅读文档** - 先读完 ARCHITECTURE.md 和 UI-DESIGN.md
2. **遵循风格** - 严格遵循设计系统 (颜色、字体、动画)
3. **隐私优先** - 永远不存储可识别信息
4. **测试覆盖** - 新功能需要单元测试和 E2E 测试

---

## 📞 联系

- **项目负责人**: [待定]
- **技术问题**: 查看 RISK-MITIGATION.md 或提 Issue
- **设计问题**: 查看 UI-DESIGN.md

---

<p align="center">
  <strong>让监控可见，让隐私可守</strong><br>
  <em>Built with privacy in mind.</em>
</p>
