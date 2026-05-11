# GraphTracker

币安Alpha链上地址追踪器 - 追踪热门币种的主要持仓钱包和关联地址

## 功能
- 浏览币安Alpha已上线币种
- 查看Token详细信息和合约地址
- 可视化展示主要持仓钱包的关联关系
- AI分析地址行为和风险评估

## 安装
1. git clone <repository-url>
2. cd GraphTracker
3. npm install
4. cp .env.example .env.local
5. 配置API Keys
6. npm run dev

## 环境变量配置
创建 `.env.local` 文件并配置以下变量：

```bash
# 区块链浏览器API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
BSCSCAN_API_KEY=your_bscscan_api_key
BASESCAN_API_KEY=your_basescan_api_key

# AI分析 (可选)
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
```

## 技术栈
- Next.js 16 + TypeScript
- Tailwind CSS
- Cytoscape.js (网络图可视化)
- OpenRouter AI (AI分析)
- SWR (数据获取)

## 项目结构
```
app/
  page.tsx          # 主页面 (侧边栏 + 网络图 + AI分析)
  layout.tsx        # 根布局
  error.tsx         # 全局错误边界
  loading.tsx       # 全局加载状态
  api/analyze/      # AI分析API路由
components/         # 共享组件
hooks/              # 自定义Hooks
lib/                # 工具库和API客户端
  api/              # Binance & Blockchain API
  graph/            # 图数据处理器
  ai/               # AI分析客户端
types/              # TypeScript类型定义
```

## 开发命令
```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run start    # 启动生产服务器
npm run test     # 运行测试
npm run lint     # 运行ESLint
```

## 数据来源
- 币安Alpha币种列表: Binance Alpha API
- 链上数据: Etherscan / BscScan / BaseScan APIs
- AI分析: OpenRouter API (支持Claude, GPT等模型)

## License
MIT
