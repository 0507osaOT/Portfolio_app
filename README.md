# ストック管理アプリケーション
React + TypeScript + Viteで構築した家庭用ストック管理アプリです。
バーコードスキャンで商品情報を自動取得し、在庫を簡単に管理できます。

## 主な機能
- ログイン・ユーザー登録
- バーコードスキャンによる商品追加
- 楽天API連携で商品情報自動取得
- ストック管理（編集・削除）
- カレンダーで追加日を可視化

## 使用技術
- React 18.2.0
- TypeScript 4.9.3
- Vite 4.0.0
- FullCalendar 6.1.19
- ZXing Library 0.21.3

## 環境構築

### 必要な環境
- Node.js v18以上
- npm v9以上

### インストール手順
```bash
# 1. リポジトリをクローン
git clone https://github.com/0507osaOT/HIROMICHIplusSHI.git
cd HIROMICHIplusSHI

# 2. パッケージをインストール
npm install

# 3. 開発サーバーを起動
npm run dev

# VS Codeで開く場合
code README.md