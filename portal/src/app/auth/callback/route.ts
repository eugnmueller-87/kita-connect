// Kept for backwards compatibility — email template now points to /auth/confirm directly
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  if (token_hash && type) {
    return NextResponse.redirect(`${origin}/auth/confirm?token_hash=${token_hash}&type=${type}`)
  }
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
