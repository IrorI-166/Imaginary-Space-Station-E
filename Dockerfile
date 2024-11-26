# ベースイメージとして Node.js を使用
FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# 必要なファイルをコピー
COPY package.json package-lock.json ./

# 依存関係をインストール
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# Next.js アプリをビルド
RUN npm run build

# ポートを公開
EXPOSE 3000

# アプリケーションを起動
CMD ["npm", "start"]