# ベースイメージとして Bun.JS を使用
FROM oven/bun:1 AS base

# 作業ディレクトリを設定
WORKDIR /app

# 必要なファイルをコピー
COPY package.json bun.lock ./

# 依存関係をインストール
RUN bun install

# アプリケーションのソースコードをコピー
COPY . .

# Next.js アプリをビルド
RUN bun run build

# ポートを公開
EXPOSE 3000

# アプリケーションを起動
CMD ["bun", "start"]