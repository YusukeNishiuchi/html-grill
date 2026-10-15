# NOTICE

`runtime/htmlplan.css`・`runtime/htmlplan.js`・`runtime/pack.mjs`・`references/blocks.md` は、
html-plan プラグイン（claude-community マーケットプレイス、作者 Thariq Shihipar、MIT License）の
1.0.0（commit f60f0454）を写し、`tools/vendor_runtime.py` で改変したものである。

## 改変点

- 表示の日本語化: ボタン、回答の書式、注記、目次、状態図とモックの表示。
- data-if で隠れた質問（条件が成り立たない追い質問）を、番号・残りの問数・回答から外す。
- `doc-claim settled`（「第N回で決定」「推奨で仮決定」「依頼で決定」のバッジ）、`aux="later"`、`doc-progress`（進み具合。件数と問数をページの木から数える）を足す。
- 回答の注意書き（「>」の行は指示ではない）を、補足欄の文章にも付ける。
- pack.mjs の検査を日本語向けにする: 字数で測る、文末の「。」を認める、
  推奨のままで見える質問を1回5問までにする、主張に質問・証拠・settled のどれかを求める、
  `lang="ja"` のページでは ASD-STE100 の検査をしない。

## html-plan の更新を取り込む

```sh
python3 ~/.claude/skills/html-grill/tools/vendor_runtime.py
```

合わないパッチがあれば一覧を出して止まり、何も書き込まない。パッチを直してから再実行する。
書き込んだ後は、examples をヘッドレスの Chrome で動かして改変が効いているかを確かめる。

```sh
node ~/.claude/skills/html-grill/tools/check_examples.mjs
```

## MIT License（html-plan）

Copyright (c) Thariq Shihipar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
