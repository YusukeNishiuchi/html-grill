# html-grill

計画や設計を Claude Code に質問攻めにしてもらい、決定木の枝を1本ずつ決めていく Claude Code スキル。
[grill-me](https://github.com/mattpocock/skills) の進め方を、[html-plan](https://github.com/anthropics/claude-plugins-community) 形式の回答できる HTML ページで回す。

- 1回 = 1ページ = 最大5問。各質問には Claude の推奨の答えが先に選ばれている。
- ページは「いまの理解」を主張の木で示し、質問はその質問が変える主張の上に置かれる。
- ブラウザで答えて「回答する」→「回答をコピー」→ Claude Code に貼り付けると、1段深い次の回のページが出る。
- すべての枝が決まったら、合意のまとめ（`final.html`）を出して終わる。

ページの本文はすべて日本語で書かれる。

## 必要なもの

- [Claude Code](https://claude.com/claude-code)
- Node.js（`runtime/pack.mjs` を動かす）

## インストール

```sh
git clone https://github.com/YusukeNishiuchi/html-grill.git ~/.claude/skills/html-grill
```

`SKILL.md` は `~/.claude/skills/html-grill/` に置かれている前提でパスを書いている。別の場所に置くときは、`~/.claude/skills/html-grill` から symlink を張る。

## 使い方

```
/html-grill 会議録から宿題を拾って Slack でリマインドするボットを作りたい
```

「HTMLでグリルして」「質問をページで出して」と頼んでも起動する。
ページと決定木（`tree.md`）は `~/Documents/html-grill/<YYYY-MM-DD>-<slug>/` に保存される。

出力の例は `examples/round-1.html`・`examples/round-2.html` にある。

## ファイル

| パス | 役割 |
|---|---|
| `SKILL.md` | スキル本体 |
| `runtime/` | ページの CSS・JS と、検査と1ファイル化を行う `pack.mjs`（html-plan からの写しを改変） |
| `references/blocks.md` | 全ブロックの構文（英語。html-plan からの写し） |
| `examples/` | 第1回・第2回のページの例 |
| `tools/` | 保守用。html-plan の更新を取り込む `vendor_runtime.py` と、その確認用の `check_examples.mjs` |

## クレジットとライセンス

- 進め方は Matt Pocock さんの [grill-me](https://github.com/mattpocock/skills)（MIT License）に基づく。
- `runtime/` と `references/blocks.md` は Thariq Shihipar さんの html-plan 1.0.0（MIT License）を改変したもの。詳細と元の著作権表示は [`NOTICE.md`](NOTICE.md) にある。
- このリポジトリは [MIT License](LICENSE) で公開する。
