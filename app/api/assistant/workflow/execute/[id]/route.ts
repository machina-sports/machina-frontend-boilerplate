/**
 * API Route: /api/assistant/workflow/execute/[id]
 *
 * Proxy for Machina API workflow execution endpoint
 * POST /workflow/execute/{id}
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

    console.log(`[Workflow Execution Proxy] Executing workflow: ${id}`);

    // Forward request to Machina API with X-Api-Token header
    const response = await fetch(`${MACHINA_API_URL}/workflow/execute/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Token': MACHINA_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Machina API error (workflow):', response.status, errorText);

      return NextResponse.json(
        {
          status: false,
          error: 'Failed to execute workflow',
          details: errorText,
          status_code: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error proxying workflow execution:', error);

    return NextResponse.json(
      {
        status: false,
        error: 'Internal server error',
        message: error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
