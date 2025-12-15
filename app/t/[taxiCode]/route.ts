import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ taxiCode: string }> }
) {
    try {
        const { taxiCode } = await params

        // Find taxi by code
        const { data: taxi, error } = await supabase
            .from('taxis')
            .select('id, taxi_code, is_active')
            .eq('taxi_code', taxiCode.toUpperCase())
            .single()

        if (error || !taxi) {
            return NextResponse.json(
                { error: 'Taxi not found' },
                { status: 404 }
            )
        }

        if (!taxi.is_active) {
            return NextResponse.json(
                { error: 'This QR code is inactive' },
                { status: 410 }
            )
        }

        // Log the scan
        const userAgent = request.headers.get('user-agent') || ''
        const forwarded = request.headers.get('x-forwarded-for')
        const ip = forwarded ? forwarded.split(',')[0] : 'unknown'

        await supabase.from('scans').insert({
            taxi_id: taxi.id,
            user_agent: userAgent,
            ip_address: ip
        })

        // Get LIFF ID
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID

        if (liffId) {
            // Redirect to LIFF URL directly - this opens in LINE app!
            const liffUrl = `https://liff.line.me/${liffId}?taxi=${taxiCode}`
            return NextResponse.redirect(liffUrl)
        } else {
            // Fallback to regular LIFF page
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
            const liffUrl = `${baseUrl}/liff?taxi=${taxiCode}`
            return NextResponse.redirect(liffUrl)
        }
    } catch (error) {
        console.error('QR Redirect Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
