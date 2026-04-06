'use client';

import { useState } from 'react';
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <html lang="ko">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
      </head>
      <body>
        <header className="main-header">
          <a href="/" className="main-logo">🦎 파충류 매니저</a>
          
          {/* 모바일용 햄버거 버튼 */}
          <button 
            className="menu-toggle" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>

          {/* 메뉴 (isMenuOpen 상태에 따라 클래스가 바뀜) */}
          <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
            <a href="/" onClick={() => setIsMenuOpen(false)}>홈</a>
            <a href="/signup" onClick={() => setIsMenuOpen(false)}>회원가입</a>
            <a href="/login" onClick={() => setIsMenuOpen(false)}>로그인</a>
          </nav>
        </header>

        <main className="main-container">
          {children}
        </main>
      </body>
    </html>
  );
}
