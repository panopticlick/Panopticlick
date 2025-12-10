# ⚡ Quick Deploy to Cloudflare

快速部署指南 - 5分钟内上线！

## 📝 准备工作

你需要准备以下凭证：

- [ ] Cloudflare Account ID (在 Cloudflare Dashboard 查看)
- [ ] Cloudflare API Token (创建一个有 Pages 和 Workers 权限的 token)
- [ ] OpenRouter API Key (免费获取: https://openrouter.ai/keys)

## 🚀 三步部署

### 1️⃣ 配置 GitHub Secrets

访问你的 GitHub 仓库设置:
```
https://github.com/YOUR_USERNAME/panopticlick.org/settings/secrets/actions
```

点击 "New repository secret" 添加以下 3 个密钥：

| Name | Value |
|------|-------|
| `CLOUDFLARE_API_TOKEN` | 你的 Cloudflare API Token |
| `CLOUDFLARE_ACCOUNT_ID` | 你的 Cloudflare Account ID |
| `OPENROUTER_API_KEY` | 你的 OpenRouter 密钥 (sk-or-v1-...) |

**或者使用自动化脚本** (需要安装 GitHub CLI):
```bash
./scripts/setup-github-secrets.sh
```

### 2️⃣ 推送代码触发部署

```bash
git add .
git commit -m "🚀 Initial deployment"
git push origin main
```

GitHub Actions 会自动:
- ✅ 构建 Next.js 应用
- ✅ 部署到 Cloudflare Pages
- ✅ 部署 API Worker
- ✅ 配置 OpenRouter 密钥

监控部署进度:
```
https://github.com/YOUR_USERNAME/panopticlick.org/actions
```

### 3️⃣ 配置自定义域名 (可选)

#### 主站 (panopticlick.org)

1. Cloudflare Dashboard → Workers & Pages → `panopticlick`
2. Custom domains → Add domain
3. 输入: `panopticlick.org`
4. 按提示配置 DNS

#### API (api.panopticlick.org)

1. Cloudflare Dashboard → DNS
2. 添加 CNAME 记录:
   - Name: `api`
   - Target: `panopticlick-api.YOUR-ACCOUNT.workers.dev`
   - Proxy: ✅ Proxied

## ✅ 验证部署

### 检查 API

```bash
curl https://api.panopticlick.org/health
```

期望输出:
```json
{"status":"ok","timestamp":1702310400000}
```

### 检查 AI Chat

```bash
curl -X POST https://api.panopticlick.org/v1/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is browser fingerprinting?"}'
```

### 访问网站

打开浏览器访问:
- 主站: https://panopticlick.pages.dev (临时域名)
- 或: https://panopticlick.org (配置自定义域名后)

检查:
- ✅ 页面加载正常
- ✅ 右下角出现眼睛图标 (AI Chat 按钮)
- ✅ 15秒后出现提示气泡
- ✅ 点击可以聊天

## 🔧 故障排除

### GitHub Actions 失败

查看日志:
```
Repository → Actions → 失败的工作流 → View logs
```

常见问题:
- ❌ 缺少 Secret → 在 Settings → Secrets 中添加
- ❌ Token 无效 → 检查 Cloudflare API Token 权限
- ❌ 构建错误 → 查看构建日志详情

### API 不工作

1. **检查 Worker 是否部署**:
   ```bash
   cd workers/api
   npx wrangler deployments list
   ```

2. **查看 Worker 日志**:
   ```bash
   npx wrangler tail
   ```

3. **验证密钥**:
   ```bash
   npx wrangler secret list
   ```
   应该显示: `OPENROUTER_API_KEY`

### AI Chat 不响应

1. **确认 OpenRouter 密钥已设置**:
   ```bash
   cd workers/api
   npx wrangler secret list
   ```

2. **测试 OpenRouter 密钥**:
   ```bash
   curl https://openrouter.ai/api/v1/models \
     -H "Authorization: Bearer YOUR_KEY"
   ```

3. **查看使用情况**:
   访问: https://openrouter.ai/activity

## 📚 下一步

- 📖 完整文档: `docs/DEPLOYMENT.md`
- 🤖 AI Chat 功能: `docs/AI-CHAT.md`
- 🏗️ 架构说明: `docs/ARCHITECTURE.md`

## 🆘 需要帮助？

1. 检查文档
2. 查看 GitHub Actions 日志
3. 查看 Cloudflare Worker 日志
4. 提交 Issue (记得删除敏感信息!)

---

**提示**: 这个仓库是公开的，永远不要提交密钥到 git！所有密钥都通过 GitHub Secrets 和 Cloudflare Worker Secrets 管理。
