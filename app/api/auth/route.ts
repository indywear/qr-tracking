import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const SESSION_COOKIE = 'qr_admin_session'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { password } = body

        if (password !== ADMIN_PASSWORD) {
            return NextResponse.json(
                { error: 'Invalid password' },
                { status: 401 }
            )
        }

        // Create simple session token
        const sessionToken = Buffer.from(`admin:${Date.now()}`).toString('base64')

        const response = NextResponse.json({ success: true })

        // Set cookie
        const cookieStore = await cookies()
        cookieStore.set(SESSION_COOKIE, sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        })

        return response
    } catch (error) {
        console.error('Login Error:', error)
        return NextResponse.json(
            { error: 'Login failed' },
            { status: 500 }
        )
    }
}

// Check session
export async function GET() {
    try {
        const cookieStore = await cookies()
        const session = cookieStore.get(SESSION_COOKIE)

        if (!session?.value) {
            return NextResponse.json({ authenticated: false }, { status: 401 })
        }

        return NextResponse.json({ authenticated: true })
    } catch {
        return NextResponse.json({ authenticated: false }, { status: 401 })
    }
}

// Logout
export async function DELETE() {
    try {
        const cookieStore = await cookies()
        cookieStore.delete(SESSION_COOKIE)
        return NextResponse.json({ success: true })
    } catch {
        return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
    }
}
