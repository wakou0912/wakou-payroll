---
name: project-wako-payroll
description: wako-payroll給与明細アプリの構成・URL・デプロイ情報
metadata: 
  node_type: memory
  type: project
  originSessionId: f3144089-7e8d-41ab-835e-85a568159c7d
---

給与明細Webアプリ「wako-payroll」をNext.js + Firebase + Netlifyで構築・運用中。

**Why:** 株式会社ワコウの5名の給与明細を複数端末から管理するため、ローカルのlocalStorageからFirebase Firestoreに移行した。

**How to apply:** りょうが「wako-payrollいじりたい」と言ったらこのアプリの作業と判断する。

## アプリURL
- 本番: https://luxury-hotteok-f312b0.netlify.app
- ログイン: wakou0912@gmail.com（Firebaseユーザー）

## リポジトリ
- GitHub: https://github.com/wakou0912/wakou-payroll
- GitLab: https://gitlab.com/wakou0912-group/wako-payroll
- ローカル: ~/wako-payroll

## push方法
```
git push github main  # Netlify自動デプロイ（GitHub連携）
git push origin main  # GitLabにも同期
```

## 技術スタック
- Next.js App Router（全ページ "use client"）
- Firebase Authentication（メール/パスワード）
- Firebase Firestore（users/{userId}/employees, users/{userId}/payrolls）
- Netlify（GitHub連携で自動デプロイ）
- Firebase project ID: kabusikigaisya-wakou

## 主な画面
- / : 給与明細一覧（月切り替え）
- /payroll/[employeeId]/[yearMonth] : 明細編集・PDF出力
- /employees/[id]/edit : 従業員編集
- /setup : 初期5名一括登録
- /import : JSONバックアップからデータ取り込み
- /login : ログイン

## 従業員（5名）
高橋凌・安藤薫・羽田野了・高橋奏・落合和磨
