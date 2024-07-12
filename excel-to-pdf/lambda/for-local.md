See. https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/nodejs-image.html#nodejs-image-instructions

```sh
# イメージのビルド
$ docker build -f Dockerfile.local --platform linux/amd64 -t daido1976-excel-to-pdf-for-local .

# コンテナ起動
$ docker run --rm --name daido1976-excel-to-pdf-for-local --platform linux/amd64 -p 9000:8080 daido1976-excel-to-pdf-for-local

# コンテナの中に入る
docker exec -it daido1976-excel-to-pdf-for-local /bin/bash

# curl でテスト実行（fileName は日本語だと aws-lambda-libreoffice の convertTo 内でエラーになる）
$ curl "http://localhost:9000/2015-03-31/functions/function/invocations" \
-H "Content-Type: application/json" \
-d '{
  "file": "'$(base64 -i /path/to/file.xlsx)'",
  "fileName": "file.xlsx"
}'
```
