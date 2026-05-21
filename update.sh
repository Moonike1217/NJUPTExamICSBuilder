#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "=== 下载并合并考试数据 ==="
node download_and_merge.js

echo ""
echo "=== 更新横幅日期 ==="
YESTERDAY=$(TZ=Asia/Shanghai date -v-1d '+%Y年%m月%d日')
sed -i '' "s/考试数据更新至[0-9]\{4\}年[0-9]\{2\}月[0-9]\{2\}日/考试数据更新至${YESTERDAY}/g" public/index.html

echo ""
echo "=== 检查变更并推送 ==="
if git diff --quiet && git diff --cached --quiet && [[ -z "$(git status --porcelain)" ]]; then
  echo "无变更，跳过提交。"
else
  git add public/excel/考试安排表.xlsx public/index.html
  git commit -m "chore: 自动更新考试安排表 $(TZ=Asia/Shanghai date '+%Y-%m-%d')"
  git push
  echo "已提交并推送。"
fi
