/**
 * API Route: /api/assistant/workflows
 *
 * Proxy for Machina API workflow search endpoint
 * POST /workflow/search
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
    const response = await fetch(`${MACHINA_API_URL}/workflow/search`, {
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
          error: 'Failed to fetch workflows from Machina API',
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
 * GET endpoint for retrieving workflow by name or ID
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    const id = searchParams.get('id');

    if (!name && !id) {
      return NextResponse.json({ error: 'Workflow name or ID is required' }, { status: 400 });
    }

    // Build endpoint path
    const pathParam = id ? `id/${id}` : encodeURIComponent(name!);

    // Forward request to Machina API with X-Api-Token header
    const response = await fetch(`${MACHINA_API_URL}/workflow/${pathParam}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Token': MACHINA_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Machina API error:', response.status, errorText);

      return NextResponse.json(
        {
          error: 'Failed to fetch workflow from Machina API',
          details: errorText,
          status: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error proxying workflow get:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
