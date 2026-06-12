# Work Cow Production Status

## Current Runtime

- Default entry is `web/index.html`, served from `/` and `/web/`.
- Rendering path is PixiJS through `web/src/cow-spine.js`.
- `WorkCow` first tries production Spine files:
  - `assets/spine/work-cow/work-cow.json`
  - `assets/spine/work-cow/work-cow.atlas`
  - `assets/spine/work-cow/work-cow.png`
- If `work-cow.json` is still marked `placeholder-for-designer`, runtime uses:
  - `assets/spine/work-cow/work-cow-fallback-v2.png`

## Important Truth

The current `work-cow.json` is a placeholder skeleton, not a real production Spine export.

The repository is now wired for Spine + PixiJS, but the final quality depends on receiving the designer/animator deliverables described in:

- `assets/reference/designer-handoff/01_打工牛角色设计需求.md`
- `assets/reference/designer-handoff/02_PSD_AI分层拆件规范.md`
- `assets/reference/designer-handoff/03_Spine绑定动画导出规范.md`

## Implemented Now

- Node + Express + WebSocket server on port `8996`.
- Server-side salary engine.
- Server-side mascot state engine.
- PixiJS front-end theater.
- Spine loader interface.
- PNG fallback with state-driven idle, typing, coin, rest, slack, happy, overtime, and blink motion.
- Generated concept reference:
  - `assets/reference/work-cow-character-concept-v2.png`
- Transparent fallback asset:
  - `assets/spine/work-cow/work-cow-fallback-v2.png`

## Required Final Assets

Replace placeholder files with real Spine export:

```text
assets/spine/work-cow/
├── work-cow.json
├── work-cow.atlas
└── work-cow.png
```

Required animation names:

```text
idle
typing
coin_pop
blink
rest_eye
slack
happy
overtime
```

When those files are valid production Spine assets, `WorkCow` will automatically load Spine instead of PNG fallback.
