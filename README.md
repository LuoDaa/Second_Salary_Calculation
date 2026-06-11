# Second Salary Calculation

实时工资计算器，包含：

- `index.html`：公网 Web / Cloudflare Pages 页面
- `pet.html`：桌宠小窗页面
- `assets/`：动漫小牛人素材
- `vendor/`：本地 Three.js / GLTF 依赖
- `server.js`：本地开发服务器
- `start-pet.ps1`：Windows 桌宠启动脚本

## 本地运行

```powershell
node server.js
```

打开：

```text
http://127.0.0.1:8996/
```

桌宠模式：

```powershell
powershell -ExecutionPolicy Bypass -File .\start-pet.ps1
```

## Cloudflare Pages

Cloudflare Pages 使用静态部署即可：

- Build command: 留空
- Build output directory: `/`

