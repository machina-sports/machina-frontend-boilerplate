'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { assistantService } from '@/providers/assistant/service';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function MemeGeneratorPage() {
  const [sportsContext, setSportsContext] = useState('');
  const [target, setTarget] = useState('General');
  const [isLoading, setIsLoading] = useState(false);
  const [memeUrl, setMemeUrl] = useState<string | null>(null);
  const [memePrompt, setMemePrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sportsContext.trim()) return;

    setIsLoading(true);
    setError(null);
    setMemeUrl(null);
    setMemePrompt(null);

    try {
      // Execute the meme-agent directly
      const result = await assistantService.executeAgent({
        agentName: 'meme-agent',
        contextAgent: {
          sports_context: sportsContext,
          target: target,
        },
      });

      // The meme-agent should return the outputs somewhere
      // We look for objects or we check the final done message
      
      // Look at the returned objects from the agent execution
      const outputsObj = result.objects?.find(obj => obj.meme_url || obj.meme_prompt);
      
      if (outputsObj?.meme_url) {
        setMemeUrl(outputsObj.meme_url);
        setMemePrompt(outputsObj.meme_prompt || null);
      } else {
        // sometimes outputs might be in content or another object format
        // let's try to parse content if it's JSON
        try {
          const parsedContent = JSON.parse(result.content);
          if (parsedContent.meme_url) {
            setMemeUrl(parsedContent.meme_url);
            setMemePrompt(parsedContent.meme_prompt || null);
          } else {
            setError('Could not extract meme URL from response');
          }
        } catch {
          // If content is not JSON and objects didn't have it
          setError('Could not extract meme URL from response');
          console.log('Result:', result);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while generating the meme');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl dark:text-white">
            Meme Generator
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Generate viral sports memes instantly using AI.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Form Section */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 h-fit">
            <form onSubmit={handleGenerate}>
              <div className="p-6 space-y-1.5">
                <h3 className="text-2xl font-semibold leading-none tracking-tight">Create a Meme</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Enter context to generate a meme</p>
              </div>
              <div className="p-6 pt-0 space-y-4">
                <div className="space-y-2">
                  <label htmlFor="sportsContext" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Sports Context</label>
                  <textarea
                    id="sportsContext"
                    placeholder="e.g. LeBron James missing a clutch free throw..."
                    value={sportsContext}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSportsContext(e.target.value)}
                    required
                    className="flex min-h-[100px] w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="target" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Target Audience / Style</label>
                  <input
                    id="target"
                    type="text"
                    placeholder="e.g. Gen Z, Twitter trolls"
                    value={target}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTarget(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                  />
                </div>
                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                  </div>
                )}
              </div>
              <div className="flex items-center p-6 pt-0">
                <Button type="submit" disabled={isLoading || !sportsContext.trim()} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Meme'
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Result Section */}
          <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 flex min-h-[400px] flex-col overflow-hidden">
            <div className="p-6 space-y-1.5 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-2xl font-semibold leading-none tracking-tight">Result</h3>
            </div>
            <div className="p-6 flex flex-1 items-center justify-center bg-zinc-100/50 dark:bg-zinc-900/50">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4 text-zinc-500">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p>Summoning the memelords...</p>
                </div>
              ) : memeUrl ? (
                <div className="flex flex-col gap-4 w-full h-full">
                  <div className="relative flex-1 w-full min-h-[300px]">
                    <Image
                      src={memeUrl}
                      alt="Generated meme"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  {memePrompt && (
                    <div className="rounded bg-white p-3 text-xs text-zinc-600 shadow-sm dark:bg-zinc-800 dark:text-zinc-300">
                      <strong>Prompt used:</strong> {memePrompt}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Your generated meme will appear here
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
