import './globals.css';

export const metadata = {
  title: 'Покупка недвижимости в Луганске под ключ — под ваш бюджет',
  description: 'Полное сопровождение покупки недвижимости в Луганске: подберём вариант под ваш бюджет и проведём за руку от первого шага до сделки. Всю суету берём на себя.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
