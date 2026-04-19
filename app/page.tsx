import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Grêmio × sports-skills landing page
// ---------------------------------------------------------------------------
// sports-skills (https://sports-skills.sh) is distributed as a CLI + Python
// library, NOT an HTTP REST API. No fetchable endpoints are documented on the
// public site — the landing page is static marketing. This page therefore
// presents the skill catalog honestly: it shows the real command names that
// power a Grêmio dashboard when the skill is installed and invoked locally
// (or via an agent runtime). Any section that would require guessing an ID
// or a non-existent endpoint has been dropped per brief.
//
// All CLI commands, parameter names and coverage notes below are taken from
// the football-data skill's SKILL.md and references/api-reference.md.

const SKILL_HOME = 'https://sports-skills.sh';
const COMPETITION_ID = 'serie-a-brazil'; // documented league slug
const TEAM_QUERY = 'Grêmio';             // resolve via search_team(query=...)

const GREMIO_BLUE = '#0D80BF';

// ---------------------------------------------------------------------------
// Skill command catalog — exactly as documented for football-data on Serie A Brazil
// ---------------------------------------------------------------------------
// Coverage notes come from the official "Data Coverage by League" table:
//   - Works on all 13 leagues (incl. serie-a-brazil)
//   - Top-5 only (Understat): xG endpoints
//   - PL only (FPL): get_season_leaders, get_missing_players
// Those PL-only/top-5-only commands are deliberately omitted below because
// Grêmio plays in Serie A Brazil, where they return empty per the docs.

type SkillCommand = {
  name: string;
  purpose: string;
  params: string;
  cli: string;
  python: string;
};

const GREMIO_COMMANDS: SkillCommand[] = [
  {
    name: 'search_team',
    purpose: 'Resolve o team_id do Grêmio antes de qualquer outra chamada.',
    params: 'query, competition_id?',
    cli: `sports-skills football search_team --query="${TEAM_QUERY}" --competition_id="${COMPETITION_ID}"`,
    python: `football.search_team(query="${TEAM_QUERY}", competition_id="${COMPETITION_ID}")`,
  },
  {
    name: 'get_current_season',
    purpose: 'Descobre o season_id corrente do Brasileirão — nunca hardcode o ano.',
    params: 'competition_id',
    cli: `sports-skills football get_current_season --competition_id="${COMPETITION_ID}"`,
    python: `football.get_current_season(competition_id="${COMPETITION_ID}")`,
  },
  {
    name: 'get_team_schedule',
    purpose: 'Jogos passados e futuros do Grêmio (precisa do team_id retornado por search_team).',
    params: 'team_id, competition_id?, season_year?, league_slug?',
    cli: `sports-skills football get_team_schedule --team_id="<espn_id>" --competition_id="${COMPETITION_ID}"`,
    python: `football.get_team_schedule(team_id="<espn_id>", competition_id="${COMPETITION_ID}")`,
  },
  {
    name: 'get_season_schedule',
    purpose: 'Calendário completo da temporada Serie A Brazil.',
    params: 'season_id',
    cli: `sports-skills football get_season_schedule --season_id="${COMPETITION_ID}-2025"`,
    python: `football.get_season_schedule(season_id="${COMPETITION_ID}-2025")`,
  },
  {
    name: 'get_season_standings',
    purpose: 'Tabela do Brasileirão (posição, V/E/D, saldo, pontos).',
    params: 'season_id',
    cli: `sports-skills football get_season_standings --season_id="${COMPETITION_ID}-2025"`,
    python: `football.get_season_standings(season_id="${COMPETITION_ID}-2025")`,
  },
  {
    name: 'get_season_teams',
    purpose: 'Lista os clubes participantes da edição atual.',
    params: 'season_id',
    cli: `sports-skills football get_season_teams --season_id="${COMPETITION_ID}-2025"`,
    python: `football.get_season_teams(season_id="${COMPETITION_ID}-2025")`,
  },
  {
    name: 'get_daily_schedule',
    purpose: 'Todos os jogos do dia (todas as ligas). Filtra Grêmio via competition_id/team_id.',
    params: 'date?',
    cli: `sports-skills football get_daily_schedule`,
    python: `football.get_daily_schedule()`,
  },
  {
    name: 'get_team_profile',
    purpose: 'Dados básicos do Grêmio (nome, escudo, estádio). Não retorna elenco.',
    params: 'team_id, league_slug?',
    cli: `sports-skills football get_team_profile --team_id="<espn_id>" --league_slug="${COMPETITION_ID}"`,
    python: `football.get_team_profile(team_id="<espn_id>", league_slug="${COMPETITION_ID}")`,
  },
  {
    name: 'get_event_summary',
    purpose: 'Resumo de partida específica com placar.',
    params: 'event_id',
    cli: `sports-skills football get_event_summary --event_id="<event_id>"`,
    python: `football.get_event_summary(event_id="<event_id>")`,
  },
  {
    name: 'get_event_lineups',
    purpose: 'Escalações e formações da partida.',
    params: 'event_id',
    cli: `sports-skills football get_event_lineups --event_id="<event_id>"`,
    python: `football.get_event_lineups(event_id="<event_id>")`,
  },
  {
    name: 'get_event_statistics',
    purpose: 'Estatísticas coletivas da partida (posse, finalizações, faltas, escanteios).',
    params: 'event_id',
    cli: `sports-skills football get_event_statistics --event_id="<event_id>"`,
    python: `football.get_event_statistics(event_id="<event_id>")`,
  },
  {
    name: 'get_event_timeline',
    purpose: 'Timeline da partida — gols, cartões, substituições, VAR.',
    params: 'event_id',
    cli: `sports-skills football get_event_timeline --event_id="<event_id>"`,
    python: `football.get_event_timeline(event_id="<event_id>")`,
  },
  {
    name: 'get_event_players_statistics',
    purpose: 'Estatísticas individuais dos jogadores na partida (sem xG fora do top-5).',
    params: 'event_id',
    cli: `sports-skills football get_event_players_statistics --event_id="<event_id>"`,
    python: `football.get_event_players_statistics(event_id="<event_id>")`,
  },
  {
    name: 'get_season_transfers',
    purpose: 'Histórico de transferências (Transfermarkt) — requer tm_player_ids.',
    params: 'season_id, tm_player_ids',
    cli: `sports-skills football get_season_transfers --season_id="${COMPETITION_ID}-2025" --tm_player_ids="<id>,<id>"`,
    python: `football.get_season_transfers(season_id="${COMPETITION_ID}-2025", tm_player_ids=["<id>", "<id>"])`,
  },
];

// Commands explicitly NOT available for Serie A Brazil (per the coverage docs).
const UNSUPPORTED_FOR_GREMIO: { name: string; reason: string }[] = [
  {
    name: 'get_season_leaders',
    reason: 'Apenas Premier League (fonte: FPL). Retorna vazio para Serie A Brazil.',
  },
  {
    name: 'get_missing_players',
    reason: 'Apenas Premier League (fonte: FPL). Lesões/suspensões não expostas para o Brasileirão.',
  },
  {
    name: 'get_event_xg',
    reason: 'Apenas top-5 (EPL, La Liga, Bundesliga, Serie A, Ligue 1) via Understat.',
  },
  {
    name: 'get_head_to_head',
    reason: 'Marcado como UNAVAILABLE na skill — requer dados licenciados.',
  },
];

// ---------------------------------------------------------------------------
// Layout primitives
// ---------------------------------------------------------------------------
function Section({
  id,
  title,
  subtitle,
  children,
  alt = false,
}: {
  id: string;
  title: string;
  subtitle?: string;
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span
              className="inline-block w-1 h-6 rounded-sm"
              style={{ background: GREMIO_BLUE }}
            />
            {title}
          </h2>
          {subtitle && <p className="text-sm text-gray-400 mt-2 ml-4">{subtitle}</p>}
        </div>
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

function InfoCard({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'warn';
  title: string;
  children: ReactNode;
}) {
  const accent = tone === 'warn' ? '#F59E0B' : GREMIO_BLUE;
  const bg = tone === 'warn' ? 'rgba(245,158,11,0.15)' : 'rgba(13,128,191,0.15)';
  return (
    <Card>
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: bg, color: accent }}
        >
          <span className="text-lg font-bold">{tone === 'warn' ? '!' : 'i'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white">{title}</p>
          <div className="text-sm text-gray-400 mt-1 space-y-2">{children}</div>
        </div>
      </div>
    </Card>
  );
}

function CommandCard({ cmd }: { cmd: SkillCommand }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="font-mono text-sm font-semibold" style={{ color: GREMIO_BLUE }}>
            {cmd.name}
          </p>
          <p className="text-xs text-gray-500 mt-1 font-mono">params: {cmd.params}</p>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-1 rounded border"
          style={{
            color: GREMIO_BLUE,
            borderColor: 'rgba(13,128,191,0.3)',
            background: 'rgba(13,128,191,0.08)',
          }}
        >
          FOOTBALL-DATA
        </span>
      </div>
      <p className="text-sm text-gray-300 mb-4">{cmd.purpose}</p>
      <div className="space-y-2">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">CLI</p>
          <pre className="text-xs bg-black/40 border border-white/5 rounded-md p-3 overflow-x-auto font-mono text-gray-200">
            <code>{cmd.cli}</code>
          </pre>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Python</p>
          <pre className="text-xs bg-black/40 border border-white/5 rounded-md p-3 overflow-x-auto font-mono text-gray-200">
            <code>{cmd.python}</code>
          </pre>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export const revalidate = 300;

export default function GremioHomePage() {
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
            <a href="#install" className="hover:text-white transition-colors">Instalação</a>
            <a href="#commands" className="hover:text-white transition-colors">Comandos</a>
            <a href="#coverage" className="hover:text-white transition-colors">Cobertura</a>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="hidden sm:inline">powered by</span>
            <a
              href={SKILL_HOME}
              className="font-medium hover:underline"
              style={{ color: GREMIO_BLUE }}
            >
              sports-skills
            </a>
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
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl font-black drop-shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${GREMIO_BLUE} 0%, #0A1628 100%)`,
                    color: '#fff',
                    border: `2px solid ${GREMIO_BLUE}`,
                  }}
                >
                  G
                </div>
                <div>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight">GRÊMIO</h1>
                  <p className="font-medium mt-1" style={{ color: GREMIO_BLUE }}>
                    Foot-Ball Porto Alegrense
                  </p>
                </div>
              </div>
              <p className="text-gray-400 text-lg max-w-2xl">
                Dashboard de inteligência para o Tricolor Gaúcho. Este painel documenta os{' '}
                comandos da skill{' '}
                <span style={{ color: GREMIO_BLUE }} className="font-semibold">
                  football-data
                </span>{' '}
                do pacote{' '}
                <a
                  href={SKILL_HOME}
                  className="text-white font-semibold hover:underline"
                >
                  sports-skills
                </a>
                {' '}disponíveis para o Brasileirão Serie A.
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
                  competition_id: {COMPETITION_ID}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium border border-white/10 text-gray-400 bg-white/5">
                  Arena do Grêmio
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium border border-white/10 text-gray-400 bg-white/5">
                  Porto Alegre
                </span>
              </div>
            </div>

            <div className="min-w-[280px] max-w-md w-full">
              <InfoCard title="Como esta skill é consumida">
                <p>
                  <span className="font-semibold text-white">sports-skills</span> é distribuída como{' '}
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-white/5">
                    CLI
                  </span>{' '}
                  e pacote{' '}
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-white/5">
                    Python
                  </span>
                  , não como REST API pública.
                </p>
                <p>
                  O site <code className="text-xs">{SKILL_HOME}</code> serve apenas a
                  documentação; as consultas abaixo rodam localmente ou dentro de um
                  runtime de agente.
                </p>
              </InfoCard>
            </div>
          </div>
        </div>
      </section>

      {/* Install */}
      <Section
        id="install"
        title="Instalação"
        subtitle="Dois caminhos oficiais, ambos documentados na homepage sports-skills.sh."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">
              via skills registry (agent-ready)
            </p>
            <pre className="text-xs bg-black/40 border border-white/5 rounded-md p-3 overflow-x-auto font-mono text-gray-200">
              <code>npx skills add machina-sports/sports-skills@football-data</code>
            </pre>
            <p className="text-xs text-gray-500 mt-3">
              Instala apenas a skill <code>football-data</code> para Claude Code, Cursor,
              Copilot, Gemini CLI e agentes compatíveis com Agent Skills.
            </p>
          </Card>
          <Card>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">
              via Python
            </p>
            <pre className="text-xs bg-black/40 border border-white/5 rounded-md p-3 overflow-x-auto font-mono text-gray-200">
              <code>pip install sports-skills</code>
            </pre>
            <p className="text-xs text-gray-500 mt-3">
              Requer Python 3.10+. Expõe o módulo <code>sports_skills.football</code> e o
              binário <code>sports-skills</code>. Nenhuma chave de API é necessária.
            </p>
          </Card>
        </div>
      </Section>

      {/* Commands */}
      <Section
        id="commands"
        title="Comandos disponíveis para o Grêmio"
        subtitle="Fluxo recomendado: search_team → get_current_season → get_team_schedule / get_season_standings."
        alt
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {GREMIO_COMMANDS.map((cmd) => (
            <CommandCard key={cmd.name} cmd={cmd} />
          ))}
        </div>
      </Section>

      {/* Coverage caveats */}
      <Section
        id="coverage"
        title="O que não está disponível para Serie A Brazil"
        subtitle="A skill documenta explicitamente estas restrições de cobertura — omitimos da UI ao invés de fingir."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {UNSUPPORTED_FOR_GREMIO.map((item) => (
            <InfoCard key={item.name} tone="warn" title={item.name}>
              <p>{item.reason}</p>
            </InfoCard>
          ))}
        </div>
      </Section>

      {/* Workflow example */}
      <Section
        id="example"
        title="Exemplo: deep-dive da última rodada"
        subtitle="Sequência espelhada do Example 5 do SKILL.md (adaptada para o Grêmio)."
        alt
      >
        <Card glow>
          <ol className="space-y-4 text-sm">
            <li>
              <span className="font-mono text-xs text-gray-500">1.</span>{' '}
              <code className="font-mono" style={{ color: GREMIO_BLUE }}>
                search_team(query=&quot;{TEAM_QUERY}&quot;)
              </code>{' '}
              <span className="text-gray-400">
                → retorna team_id ESPN + competition_id=<code>{COMPETITION_ID}</code>.
              </span>
            </li>
            <li>
              <span className="font-mono text-xs text-gray-500">2.</span>{' '}
              <code className="font-mono" style={{ color: GREMIO_BLUE }}>
                get_team_schedule(team_id=&quot;&lt;id&gt;&quot;, competition_id=&quot;{COMPETITION_ID}&quot;)
              </code>{' '}
              <span className="text-gray-400">→ escolhe a partida mais recente fechada.</span>
            </li>
            <li>
              <span className="font-mono text-xs text-gray-500">3.</span>{' '}
              <code className="font-mono" style={{ color: GREMIO_BLUE }}>
                get_event_summary(event_id)
              </code>
              <span className="text-gray-400"> + </span>
              <code className="font-mono" style={{ color: GREMIO_BLUE }}>
                get_event_statistics(event_id)
              </code>
              <span className="text-gray-400"> + </span>
              <code className="font-mono" style={{ color: GREMIO_BLUE }}>
                get_event_timeline(event_id)
              </code>
              <span className="text-gray-400">
                {' '}→ placar, posse/finalizações, gols e cartões.
              </span>
            </li>
            <li>
              <span className="font-mono text-xs text-gray-500">4.</span>{' '}
              <code className="font-mono" style={{ color: GREMIO_BLUE }}>
                get_event_players_statistics(event_id)
              </code>{' '}
              <span className="text-gray-400">
                → destaques individuais (xG indisponível fora do top-5).
              </span>
            </li>
          </ol>
        </Card>
      </Section>

      <footer className="py-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>
            Grêmio Live • dados via{' '}
            <a
              href={SKILL_HOME}
              className="hover:text-white transition-colors"
              style={{ color: GREMIO_BLUE }}
            >
              {SKILL_HOME}
            </a>
          </span>
          <span>sports-skills football-data • CLI / Python</span>
        </div>
      </footer>
    </main>
  );
}
