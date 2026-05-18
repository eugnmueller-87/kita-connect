import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// DEV BYPASS: auth disabled — all routes pass through
export async function updateSession(request: NextRequest) {
  return NextResponse.next({ request })
}
