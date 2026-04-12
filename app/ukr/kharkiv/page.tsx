import QuizWrapper from '@/components/quiz/QuizWrapper';

export default function KharkivPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-4">Головна → Харків</nav>
      <h1 className="text-2xl font-bold mb-6">Комплексне обстеження організму в Харкові</h1>

      {/* Quiz section */}
      <section id="quiz-section" className="mb-8">
        <QuizWrapper
          clinicSlug="onclinic-kharkiv"
          city="kharkiv"
          locale="ua"
          sourcePage="/ukr/kharkiv"
        />
      </section>
    </main>
  );
}
