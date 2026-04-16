'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { DigestResult } from '../components/DigestResult';

export default function Page() {
  const [query, setQuery] = useState('');
  const [digest, setDigest] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setDigest(null);

    try {
      const response = await fetch('/api/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate digest');
      }

      const data = await response.json();
      
      // Handle standard Machina response format which usually has { data: { result: "..." } } 
      // or directly the response. We will try to extract the text intelligently.
      let resultText = '';
      if (typeof data.response === 'string') {
        resultText = data.response;
      } else if (data.data?.response) {
        resultText = data.data.response;
      } else if (typeof data.data === 'string') {
        resultText = data.data;
      } else {
        resultText = JSON.stringify(data, null, 2);
      }
      
      setDigest(resultText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 text-center my-8">
        <h2 className="text-3xl font-bold tracking-tight">Generate Podcast Digest</h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
          Enter a topic, guest, or podcast name to generate a comprehensive AI summary.
        </p>
      </div>

      <form onSubmit={handleGenerate} className="w-full max-w-2xl mx-auto flex flex-col gap-4">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., AI in sports, Andrew Huberman, Formula 1..."
            className="w-full h-14 pl-12 pr-32 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#fe591f] focus:border-transparent transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2 h-10 px-4 bg-[#fe591f] hover:bg-[#e04a16] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Generate'
            )}
          </button>
        </div>
        {error && (
          <div className="text-red-500 text-sm font-medium px-2 bg-red-500/10 py-2 rounded-lg border border-red-500/20 text-center">
            {error}
          </div>
        )}
      </form>

      {digest && <DigestResult digest={digest} />}
    </div>
  );
}
