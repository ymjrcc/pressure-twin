# AGENTS.md

## Codex 工作规则

- 修改代码后，不要自动启动本地开发服务器。
- 禁止运行以下命令：`npm run dev`、`pnpm dev`、`yarn dev`、`vite --host`、`next dev`、`npm start`。
- 不要为了预览效果而启动长期运行的本地服务。
- 如果需要验证改动，优先运行静态检查或构建命令，例如：
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`
- 如果确实认为必须启动本地服务器，先在回复里说明原因，等待我手动确认，不要自行执行。
- 完成改动后，只总结修改内容、可能影响、建议我手动运行的命令。