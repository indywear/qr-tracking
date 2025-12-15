import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { lineUserId, displayName, pictureUrl, taxiCode } = body

        if (!lineUserId) {
            return NextResponse.json(
                { error: 'LINE User ID is required' },
                { status: 400 }
            )
        }

        // Find taxi if taxiCode provided
        let taxiId = null
        if (taxiCode) {
            const { data: taxi } = await supabase
                .from('taxis')
                .select('id')
                .eq('taxi_code', taxiCode.toUpperCase())
                .single()
            taxiId = taxi?.id
        }

        // Check if customer exists
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('line_user_id, total_scans')
            .eq('line_user_id', lineUserId)
            .single()

        if (existingCustomer) {
            // Update existing customer - increment scan count
            await supabase
                .from('customers')
                .update({
                    display_name: displayName,
                    picture_url: pictureUrl,
                    total_scans: existingCustomer.total_scans + 1,
                    updated_at: new Date().toISOString()
                })
                .eq('line_user_id', lineUserId)

            // Log this scan with LINE user ID
            if (taxiId) {
                await supabase.from('scans').insert({
                    taxi_id: taxiId,
                    line_user_id: lineUserId
                })
            }

            return NextResponse.json({
                success: true,
                isNewCustomer: false,
                message: 'Customer updated'
            })
        } else {
            // Create new customer
            await supabase.from('customers').insert({
                line_user_id: lineUserId,
                display_name: displayName,
                picture_url: pictureUrl,
                first_taxi_id: taxiId,
                total_scans: 1
            })

            // Update earlier scan with LINE user ID
            if (taxiId) {
                // Find most recent scan from this taxi without LINE ID and update it
                const { data: recentScan } = await supabase
                    .from('scans')
                    .select('id')
                    .eq('taxi_id', taxiId)
                    .is('line_user_id', null)
                    .order('scanned_at', { ascending: false })
                    .limit(1)
                    .single()

                if (recentScan) {
                    await supabase
                        .from('scans')
                        .update({ line_user_id: lineUserId })
                        .eq('id', recentScan.id)
                }
            }

            return NextResponse.json({
                success: true,
                isNewCustomer: true,
                message: 'Customer registered'
            })
        }
    } catch (error) {
        console.error('LIFF Register Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
