/**
 * API Route: /api/assistant/agent/execute/[id]
 *
 * Proxy for Machina API agent execution endpoint
 * POST /agent/execute/{id}
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MACHINA_API_URL = process.env.MACHINA_API_URL || 'https://api-staging.machina.gg';
const MACHINA_API_KEY = process.env.MACHINA_API_KEY || '';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Forward request to Machina API with X-Api-Token header
    const response = await fetch(`${MACHINA_API_URL}/agent/execute/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Token': MACHINA_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Machina API error (agent):', response.status, errorText);

      return NextResponse.json(
        {
          status: false,
          error: 'Failed to execute agent',
          details: errorText,
          status_code: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        status: false,
        error: 'Internal server error',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
