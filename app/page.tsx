import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// sports-skills API client (server-side)
// ---------------------------------------------------------------------------
// sports-skills is primarily a Python/CLI package, but the factory task tells
// us to assume an HTTP surface at sports-skills.machina.gg. We hit plausible
// command paths under /football/<command> and degrade gracefully on failure.
// Every fetch is isolated so a single failing endpoint never takes the page
// down — the UI falls back to static copy and an "API unreachable" notice.

const API_BASE = 'https://sports-skills.machina.gg';
const GREMIO_TEAM_ID = '6273'; // ESPN team id used across sports-skills
const GREMIO_CREST = 'https://a.espncdn.com/i/teamlogos/soccer/500/6273.png';
const COMPETITION_ID = 'serie-a-brazil';

type FetchState<T> = { ok: true; data: T } | { ok: false; error: string };

async function skill<T>(path: string): Promise<FetchState<T>> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: 300 },
      headers: { accept: 'application/json' },
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const json = (await res.json()) as T;
    return { ok: true, data: json };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'network error' };
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type MatchEvent = {
  event_id?: string;
  id?: string;
  date?: string;
  status?: string;
  home_team?: string;
  away_team?: string;
  home_score?: number | null;
  away_score?: number | null;
  competition?: string;
  venue?: string;
};

type StandingRow = {
  position?: number;
  team?: string;
  team_id?: string;
  played?: number;
  won?: number;
  drawn?: number;
  lost?: number;
  goals_for?: number;
  goals_against?: number;
  goal_difference?: number;
  points?: number;
};

type Leader = {
  player?: string;
  team?: string;
  goals?: number;
  assists?: number;
};

// Loose extractor — the skill may wrap results in {data}, {result}, {events} etc.
function pickArray<T>(raw: unknown, keys: string[]): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === 'object') {
    for (const k of keys) {
      const v = (raw as Record<string, unknown>)[k];
      if (Array.isArray(v)) return v as T[];
    }
  }
  return [];
}

// ---------------------------------------------------------------------------
// Data loaders
// ---------------------------------------------------------------------------
async function loadTeamSchedule() {
  const res = await skill<unknown>(
    `/football/get_team_schedule?team_id=${GREMIO_TEAM_ID}&competition_id=${COMPETITION_ID}`
  );
  if (!res.ok) return { ok: false as const, error: res.error };
  const events = pickArray<MatchEvent>(res.data, ['events', 'matches', 'data', 'result']);
  return { ok: true as const, events };
}

async function loadStandings() {
  const res = await skill<unknown>(
    `/football/get_season_standings?season_id=${COMPETITION_ID}-2025`
  );
  if (!res.ok) return { ok: false as const, error: res.error };
  const rows = pickArray<StandingRow>(res.data, ['standings', 'table', 'data', 'result']);
  return { ok: true as const, rows };
}

async function loadLeaders() {
  const res = await skill<unknown>(
    `/football/get_season_leaders?season_id=${COMPETITION_ID}-2025`
  );
  if (!res.ok) return { ok: false as const, error: res.error };
  const leaders = pickArray<Leader>(res.data, ['leaders', 'top_scorers', 'data', 'result']);
  return { ok: true as const, leaders };
}

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------
function splitEvents(events: MatchEvent[]) {
  const now = Date.now();
  const past: MatchEvent[] = [];
  const upcoming: MatchEvent[] = [];
  for (const e of events) {
    const t = e.date ? Date.parse(e.date) : NaN;
    const played = e.home_score != null && e.away_score != null;
    if (played || (!Number.isNaN(t) && t < now)) past.push(e);
    else upcoming.push(e);
  }
  past.sort((a, b) => (Date.parse(b.date ?? '') || 0) - (Date.parse(a.date ?? '') || 0));
  upcoming.sort((a, b) => (Date.parse(a.date ?? '') || 0) - (Date.parse(b.date ?? '') || 0));
  return { past, upcoming };
}

function resultFor(e: MatchEvent): 'W' | 'D' | 'L' | null {
  if (e.home_score == null || e.away_score == null) return null;
  const isHome = /gr[êe]mio/i.test(e.home_team ?? '');
  const gf = isHome ? e.home_score : e.away_score;
  const ga = isHome ? e.away_score : e.home_score;
  if (gf > ga) return 'W';
  if (gf < ga) return 'L';
  return 'D';
}

function fmtDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Presentational pieces
// ---------------------------------------------------------------------------
const GREMIO_BLUE = '#0D80BF';

function Section({
  id,
  title,
  children,
  alt = false,
}: {
  id: string;
  title: string;
  children: ReactNode;
  alt?: boolean;
}) {
  return (
    <section
      id={id}
      className={`py-16 ${alt ? 'bg-[#0A1628]/40' : ''}`}
      style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
          <span
            className="inline-block w-1 h-6 rounded-sm"
            style={{ background: GREMIO_BLUE }}
          />
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

function Card({ children, glow = false }: { children: ReactNode; glow?: boolean }) {
  return (
    <div
      className="rounded-xl p-5 border"
      style={{
        background: 'rgba(10,22,40,0.8)',
        borderColor: 'rgba(13,128,191,0.15)',
        boxShadow: glow
          ? '0 0 40px rgba(13,128,191,0.15), 0 0 80px rgba(13,128,191,0.05)'
          : undefined,
      }}
    >
      {children}
    </div>
  );
}

function ApiUnreachableCard({ endpoints }: { endpoints: string[] }) {
  return (
    <Card>
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}
        >
          <span className="text-lg">!</span>
        </div>
        <div>
          <p className="font-semibold text-white">API unreachable</p>
          <p className="text-sm text-gray-400 mt-1">
            Couldn&apos;t reach <code className="text-xs">{API_BASE}</code>. The page is
            rendering with fallback copy; live data will return once the{' '}
            <span style={{ color: GREMIO_BLUE }}>sports-skills</span> service is online.
          </p>
          {endpoints.length > 0 && (
            <ul className="mt-3 text-xs text-gray-500 space-y-0.5">
              {endpoints.map((e) => (
                <li key={e}>
                  <code>{e}</code>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}

function NextMatchCard({ match }: { match: MatchEvent }) {
  const isHome = /gr[êe]mio/i.test(match.home_team ?? '');
  const opponent = isHome ? match.away_team : match.home_team;
  return (
    <Card glow>
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">
        Próximo Jogo • {match.competition ?? 'Serie A Brazil'}
      </p>
      <div className="flex items-center justify-center gap-8 mb-6">
        <div className="text-center">
          <img src={GREMIO_CREST} alt="Grêmio" className="w-16 h-16 mx-auto mb-2" />
          <p className="font-bold text-sm">Grêmio</p>
          <p className="text-[10px] text-gray-500">{isHome ? 'MANDANTE' : 'VISITANTE'}</p>
        </div>
        <div className="text-center">
          <span className="text-3xl text-gray-600 font-light">×</span>
          <p className="text-xs text-gray-400 mt-3">{fmtDate(match.date)}</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center bg-white/5 text-2xl font-black text-gray-400">
            {opponent?.[0] ?? '?'}
          </div>
          <p className="font-bold text-sm">{opponent ?? 'Adversário'}</p>
          <p className="text-[10px] text-gray-500">{isHome ? 'VISITANTE' : 'MANDANTE'}</p>
        </div>
      </div>
      {match.venue && (
        <p className="text-center text-xs text-gray-500">{match.venue}</p>
      )}
    </Card>
  );
}

function ResultCard({ event }: { event: MatchEvent }) {
  const r = resultFor(event);
  const bg =
    r === 'W'
      ? 'rgba(16,185,129,0.15)'
      : r === 'L'
        ? 'rgba(239,68,68,0.15)'
        : r === 'D'
          ? 'rgba(245,158,11,0.15)'
          : 'rgba(255,255,255,0.03)';
  const label = r === 'W' ? 'VITÓRIA' : r === 'L' ? 'DERROTA' : r === 'D' ? 'EMPATE' : '—';
  const labelColor =
    r === 'W' ? '#10B981' : r === 'L' ? '#EF4444' : r === 'D' ? '#F59E0B' : '#9CA3AF';

  return (
    <div
      className="rounded-xl p-4 border"
      style={{
        background: bg,
        borderColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-[10px] uppercase tracking-wider text-gray-400">
          {fmtDate(event.date)}
        </span>
        <span className="text-[10px] font-bold" style={{ color: labelColor }}>
          {label}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium truncate">{event.home_team ?? '—'}</span>
        <span className="text-lg font-black tabular-nums">
          {event.home_score ?? '-'}
          <span className="text-gray-600 mx-1">×</span>
          {event.away_score ?? '-'}
        </span>
        <span className="text-sm font-medium truncate text-right">{event.away_team ?? '—'}</span>
      </div>
      {event.competition && (
        <p className="text-[10px] text-gray-500 mt-2">{event.competition}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export const revalidate = 300;

export default async function GremioHomePage() {
  const [schedule, standings, leaders] = await Promise.all([
    loadTeamSchedule(),
    loadStandings(),
    loadLeaders(),
  ]);

  const allFailed = !schedule.ok && !standings.ok && !leaders.ok;

  const events = schedule.ok ? schedule.events : [];
  const { past, upcoming } = splitEvents(events);
  const nextMatch = upcoming[0];
  const recent = past.slice(0, 6);
  const form = past.slice(0, 5).map(resultFor);

  const topScorers = leaders.ok ? leaders.leaders.slice(0, 5) : [];
  const standingsRows = standings.ok ? standings.rows.slice(0, 10) : [];

  return (
    <main
      className="min-h-screen text-white"
      style={{
        background:
          'linear-gradient(180deg, #050A14 0%, #050A14 40%, #0A1628 100%)',
      }}
    >
      {/* Top bar */}
      <nav
        className="sticky top-0 z-40 backdrop-blur-xl border-b"
        style={{
          background: 'rgba(10,22,40,0.85)',
          borderColor: 'rgba(13,128,191,0.15)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded flex items-center justify-center font-black text-sm"
              style={{ background: GREMIO_BLUE }}
            >
              M
            </div>
            <span className="text-sm font-semibold tracking-wide">
              Machina <span style={{ color: GREMIO_BLUE }}>for</span> GRÊMIO
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <a href="#overview" className="hover:text-white transition-colors">Overview</a>
            <a href="#next" className="hover:text-white transition-colors">Próximo</a>
            <a href="#results" className="hover:text-white transition-colors">Resultados</a>
            <a href="#standings" className="hover:text-white transition-colors">Classificação</a>
            <a href="#leaders" className="hover:text-white transition-colors">Artilharia</a>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="hidden sm:inline">powered by</span>
            <span className="font-medium" style={{ color: GREMIO_BLUE }}>
              sports-skills
            </span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        id="overview"
        className="pt-16 pb-20 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(135deg, #050A14 0%, #0A1628 30%, rgba(13,128,191,0.08) 60%, #050A14 100%)',
        }}
      >
        <div className="absolute top-10 right-10 w-96 h-96 rounded-full border border-[#0D80BF]/10 pointer-events-none" />
        <div className="absolute top-32 right-32 w-64 h-64 rounded-full border border-[#0D80BF]/5 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center gap-4 justify-center lg:justify-start mb-6">
                <img
                  src={GREMIO_CREST}
                  alt="Grêmio"
                  className="w-24 h-24 drop-shadow-2xl"
                />
                <div>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight">GRÊMIO</h1>
                  <p className="font-medium mt-1" style={{ color: GREMIO_BLUE }}>
                    Foot-Ball Porto Alegrense
                  </p>
                </div>
              </div>
              <p className="text-gray-400 text-lg max-w-xl">
                Dashboard de inteligência esportiva em tempo real. Dados consumidos via a skill{' '}
                <span style={{ color: GREMIO_BLUE }} className="font-semibold">
                  football-data
                </span>{' '}
                do pacote{' '}
                <span className="text-white font-semibold">sports-skills</span>.
              </p>
              <div className="flex flex-wrap gap-3 mt-6 justify-center lg:justify-start">
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium border"
                  style={{
                    background: 'rgba(13,128,191,0.1)',
                    borderColor: 'rgba(13,128,191,0.3)',
                    color: GREMIO_BLUE,
                  }}
                >
                  Serie A Brazil
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium border border-white/10 text-gray-400 bg-white/5">
                  Arena do Grêmio
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium border border-white/10 text-gray-400 bg-white/5">
                  Porto Alegre
                </span>
              </div>
            </div>

            {/* Form chips */}
            <div className="grid grid-cols-5 gap-2 min-w-[260px]">
              <p className="col-span-5 text-xs uppercase tracking-widest text-gray-500 mb-1">
                Últimos 5
              </p>
              {[0, 1, 2, 3, 4].map((i) => {
                const r = form[i];
                const bg =
                  r === 'W'
                    ? '#10B981'
                    : r === 'L'
                      ? '#EF4444'
                      : r === 'D'
                        ? '#F59E0B'
                        : 'rgba(255,255,255,0.08)';
                return (
                  <div
                    key={i}
                    className="h-12 rounded-lg flex items-center justify-center text-sm font-black"
                    style={{ background: bg }}
                  >
                    {r ?? '—'}
                  </div>
                );
              })}
            </div>
          </div>

          {allFailed && (
            <div className="mt-10">
              <ApiUnreachableCard
                endpoints={[
                  `GET ${API_BASE}/football/get_team_schedule`,
                  `GET ${API_BASE}/football/get_season_standings`,
                  `GET ${API_BASE}/football/get_season_leaders`,
                ]}
              />
            </div>
          )}
        </div>
      </section>

      {/* Next match */}
      <Section id="next" title="Próximo Jogo">
        {schedule.ok && nextMatch ? (
          <NextMatchCard match={nextMatch} />
        ) : schedule.ok ? (
          <Card>
            <p className="text-sm text-gray-400">
              Nenhum jogo futuro encontrado na agenda da Serie A Brazil.
            </p>
          </Card>
        ) : (
          <ApiUnreachableCard endpoints={[`GET ${API_BASE}/football/get_team_schedule`]} />
        )}
      </Section>

      {/* Recent results */}
      <Section id="results" title="Resultados Recentes" alt>
        {schedule.ok && recent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((e, i) => (
              <ResultCard key={e.event_id ?? e.id ?? i} event={e} />
            ))}
          </div>
        ) : schedule.ok ? (
          <Card>
            <p className="text-sm text-gray-400">Sem resultados recentes disponíveis.</p>
          </Card>
        ) : (
          <ApiUnreachableCard endpoints={[`GET ${API_BASE}/football/get_team_schedule`]} />
        )}
      </Section>

      {/* Standings */}
      <Section id="standings" title="Classificação — Brasileirão">
        {standings.ok && standingsRows.length > 0 ? (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="text-left py-3 px-3 w-10">#</th>
                    <th className="text-left py-3 px-2">Time</th>
                    <th className="text-center py-3 px-2">J</th>
                    <th className="text-center py-3 px-2">V</th>
                    <th className="text-center py-3 px-2">E</th>
                    <th className="text-center py-3 px-2">D</th>
                    <th className="text-center py-3 px-2">SG</th>
                    <th className="text-center py-3 px-2 font-bold text-white">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {standingsRows.map((row, i) => {
                    const isGremio = /gr[êe]mio/i.test(row.team ?? '');
                    return (
                      <tr
                        key={row.team_id ?? row.team ?? i}
                        className="border-b border-white/[0.03] hover:bg-white/[0.02]"
                        style={
                          isGremio
                            ? {
                                background: 'rgba(13,128,191,0.08)',
                                borderLeft: `3px solid ${GREMIO_BLUE}`,
                              }
                            : undefined
                        }
                      >
                        <td className="py-3 px-3 text-gray-400 font-mono">
                          {row.position ?? i + 1}
                        </td>
                        <td className="py-3 px-2 font-medium">{row.team ?? '—'}</td>
                        <td className="py-3 px-2 text-center text-gray-400">{row.played ?? '-'}</td>
                        <td className="py-3 px-2 text-center text-gray-400">{row.won ?? '-'}</td>
                        <td className="py-3 px-2 text-center text-gray-400">{row.drawn ?? '-'}</td>
                        <td className="py-3 px-2 text-center text-gray-400">{row.lost ?? '-'}</td>
                        <td className="py-3 px-2 text-center text-gray-400">
                          {row.goal_difference ?? '-'}
                        </td>
                        <td className="py-3 px-2 text-center font-bold">{row.points ?? '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ) : standings.ok ? (
          <Card>
            <p className="text-sm text-gray-400">Classificação indisponível no momento.</p>
          </Card>
        ) : (
          <ApiUnreachableCard endpoints={[`GET ${API_BASE}/football/get_season_standings`]} />
        )}
      </Section>

      {/* Leaders */}
      <Section id="leaders" title="Artilharia" alt>
        {leaders.ok && topScorers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topScorers.map((l, i) => (
              <Card key={(l.player ?? '') + i}>
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-black"
                    style={{ background: GREMIO_BLUE, color: '#050A14' }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{l.player ?? '—'}</p>
                    <p className="text-xs text-gray-500 truncate">{l.team ?? ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black tabular-nums">{l.goals ?? 0}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">gols</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : leaders.ok ? (
          <Card>
            <p className="text-sm text-gray-400">
              Artilharia por temporada não está disponível para a Serie A Brazil nesta skill.
              Consulte <code className="text-xs">get_event_players_statistics</code> por partida.
            </p>
          </Card>
        ) : (
          <ApiUnreachableCard endpoints={[`GET ${API_BASE}/football/get_season_leaders`]} />
        )}
      </Section>

      <footer className="py-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>
            Grêmio Live • dados via{' '}
            <a
              href="https://sports-skills.sh"
              className="hover:text-white transition-colors"
              style={{ color: GREMIO_BLUE }}
            >
              sports-skills
            </a>
          </span>
          <span>Atualizado a cada 5 minutos</span>
        </div>
      </footer>
    </main>
  );
}
