import './globals.css';

export const metadata = {
  title: '时光盲盒 | 制作属于 Ta 的生日祝福',
  description: '为你的 Ta 制作一份独一无二的时光盲盒生日祝福',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
