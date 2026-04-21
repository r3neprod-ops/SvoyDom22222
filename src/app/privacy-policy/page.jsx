import Container from '@/components/ui/Container';

export const metadata = {
  title: 'Политика обработки персональных данных',
  description: 'Политика обработки персональных данных сайта svoydom-lugansk.ru',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="py-12 md:py-16">
      <Container className="max-w-4xl">
        <h1 className="text-3xl tracking-tight md:text-4xl">Политика обработки персональных данных</h1>
        <div className="mt-6 space-y-6 text-sm leading-relaxed text-[color:var(--muted)] md:text-base">
          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-[#111827]">1. Общие положения</h2>
            <p>
              Настоящая Политика определяет порядок обработки и защиты персональных данных пользователей сайта
              https://www.svoydom-lugansk.ru/ (далее — Сайт).
            </p>
            <p>
              Оператор персональных данных: <strong>ИП Шевченко Владислав Андреевич</strong>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-[#111827]">2. Какие данные обрабатываются</h2>
            <p>Сайт может обрабатывать следующие персональные данные, добровольно оставленные пользователем в форме:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>имя;</li>
              <li>номер телефона;</li>
              <li>ник в Telegram (если указан пользователем);</li>
              <li>иные данные, которые пользователь указывает в форме заявки.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-[#111827]">3. Цели обработки персональных данных</h2>
            <p>Персональные данные обрабатываются в следующих целях:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>связь с пользователем по заявке;</li>
              <li>предоставление консультации;</li>
              <li>подбор недвижимости по запросу пользователя;</li>
              <li>консультация по ипотеке.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-[#111827]">4. Правовые основания обработки</h2>
            <p>
              Правовым основанием обработки персональных данных является согласие пользователя, выраженное путём
              проставления отметки в соответствующем поле формы на Сайте.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-[#111827]">5. Порядок и условия обработки</h2>
            <p>
              Обработка персональных данных осуществляется с использованием средств автоматизации и/или без их
              использования, с соблюдением мер, направленных на защиту персональных данных от неправомерного доступа,
              изменения, раскрытия или уничтожения.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-[#111827]">6. Права пользователя и отзыв согласия</h2>
            <p>Пользователь имеет право:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>получать информацию об обработке его персональных данных;</li>
              <li>требовать уточнения, блокирования или удаления своих персональных данных;</li>
              <li>в любой момент отозвать согласие на обработку персональных данных.</li>
            </ul>
            <p>
              Для отзыва согласия пользователь может направить обращение оператору любым доступным способом связи,
              указанным на Сайте. После получения отзыва оператор прекращает обработку персональных данных, за
              исключением случаев, когда обработка требуется в силу закона.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-[#111827]">7. Заключительные положения</h2>
            <p>
              Оператор вправе вносить изменения в настоящую Политику. Актуальная версия Политики всегда доступна по
              адресу: https://www.svoydom-lugansk.ru/privacy-policy.
            </p>
          </section>
        </div>
      </Container>
    </main>
  );
}
