import Link from 'next/link';

const CorinthiansFanPage = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-white text-black">
      {/* Top accent bar */}
      <div className="h-2 w-full bg-black" />
      <div className="h-1 w-full bg-red-600" />

      {/* Hero */}
      <section className="flex w-full flex-col items-center justify-center bg-black px-6 py-20 text-white">
        <span className="mb-4 inline-block rounded-full border border-red-600 bg-red-600/10 px-3 py-1 text-xs font-semibold tracking-widest text-red-500 uppercase">
          Fiel Torcida
        </span>
        <h1 className="max-w-4xl text-center text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
          Corinthians <span className="text-red-600">Fan Engagement</span>
        </h1>
        <p className="mt-4 max-w-2xl text-center text-base text-zinc-300 sm:text-lg">
          O ponto de encontro digital do Timão — estatísticas, jogos e conteúdo para a Fiel.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="#next-match"
            className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Próximo jogo
          </Link>
          <a
            href="https://www.corinthians.com.br"
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Site oficial
          </a>
        </div>
      </section>

      {/* Next Match */}
      <section id="next-match" className="w-full max-w-5xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-red-600 uppercase">
              Agenda
            </p>
            <h2 className="mt-1 text-2xl font-bold text-black sm:text-3xl">Próximo jogo</h2>
          </div>
          <span className="hidden text-xs text-zinc-500 sm:block">Neo Química Arena</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 shadow-sm">
          <div className="flex items-center justify-between bg-black px-6 py-3 text-white">
            <span className="text-xs font-semibold tracking-widest uppercase">
              Derby Paulista
            </span>
            <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
              Clássico
            </span>
          </div>

          <div className="grid grid-cols-3 items-center gap-4 bg-white px-6 py-10">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-lg font-black text-white ring-4 ring-red-600 sm:h-20 sm:w-20 sm:text-xl">
                SCCP
              </div>
              <span className="text-sm font-bold text-black sm:text-base">Timão</span>
              <span className="text-[10px] text-zinc-500 uppercase">Mandante</span>
            </div>

            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-2xl font-black text-zinc-400 sm:text-3xl">VS</span>
              <span className="mt-2 text-xs font-semibold text-black">Domingo, 20h30</span>
              <span className="text-[11px] text-zinc-500">Brasileirão · Rodada 12</span>
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-lg font-black text-zinc-800 ring-2 ring-zinc-300 sm:h-20 sm:w-20 sm:text-xl">
                SEP
              </div>
              <span className="text-sm font-bold text-black sm:text-base">Palmeiras</span>
              <span className="text-[10px] text-zinc-500 uppercase">Visitante</span>
            </div>
          </div>

          <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-4 text-center text-sm text-zinc-700">
            <span className="font-semibold text-black">Next match:</span> Timão vs. Palmeiras —{' '}
            <span className="font-semibold text-red-600">Derby Paulista</span>
          </div>
        </div>
      </section>

      {/* Bottom accent */}
      <div className="mt-auto h-1 w-full bg-red-600" />
      <div className="h-2 w-full bg-black" />
    </main>
  );
};

export default CorinthiansFanPage;
