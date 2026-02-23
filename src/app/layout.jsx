import './globals.css';

export const metadata = {
  title: 'Svoy Dom — премиальная недвижимость',
  description: 'Подбор и сопровождение недвижимости в премиальном сегменте.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
