/**
 * API Route: /api/assistant/agents
 *
 * Proxy for Machina API agent search endpoint
 * POST /agent/search
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const MACHINA_API_URL = process.env.MACHINA_API_URL || 'https://api-staging.machina.gg';
const MACHINA_API_KEY = process.env.MACHINA_API_KEY || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Forward request to Machina API with X-Api-Token header
    const response = await fetch(`${MACHINA_API_URL}/agent/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Token': MACHINA_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();

      return NextResponse.json(
        {
          error: 'Failed to fetch agents from Machina API',
          details: errorText,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for retrieving agent by name
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json({ error: 'Agent name is required' }, { status: 400 });
    }

    // Forward request to Machina API with X-Api-Token header
    const response = await fetch(`${MACHINA_API_URL}/agent/${encodeURIComponent(name)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Token': MACHINA_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      return NextResponse.json(
        {
          error: 'Failed to fetch agent from Machina API',
          details: errorText,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
