import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthGuard from "@/components/AuthGuard";
import LogoutButton from "@/components/LogoutButton";

export const metadata: Metadata = {
  title: "株式会社ワコウ｜給与明細",
  description: "給与明細作成アプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">
        <AuthProvider>
          <AuthGuard>
            <header className="bg-gray-800 text-white px-4 py-3 shadow flex items-center justify-between">
              <a href="/" className="text-lg font-bold tracking-wide hover:text-gray-200">
                株式会社ワコウ｜給与明細
              </a>
              <LogoutButton />
            </header>
            <main className="max-w-3xl mx-auto px-4 py-6">{children}</main>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
