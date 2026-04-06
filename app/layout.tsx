'use client';
import { useState } from 'react';
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header className="main-header">
          <a href="/" className="main-logo">🦎 파충류 매니저</a>
          <nav className="main-nav">
            <a href="/">홈</a>
            <a href="/signup">회원가입</a>
            <a href="/login">로그인</a>
          </nav>
        </header>
        <main className="main-container">{children}</main>
      </body>
    </html>
  );
}