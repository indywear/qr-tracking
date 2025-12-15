import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
    try {
        // Get total counts
        const [taxisResult, customersResult, scansResult] = await Promise.all([
            supabase.from('taxis').select('id', { count: 'exact' }),
            supabase.from('customers').select('line_user_id', { count: 'exact' }),
            supabase.from('scans').select('id', { count: 'exact' })
        ])

        // Get purchased customers count
        const { count: purchasedCount } = await supabase
            .from('customers')
            .select('line_user_id', { count: 'exact' })
            .eq('has_purchased', true)

        // Get today's scans
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const { count: todayScans } = await supabase
            .from('scans')
            .select('id', { count: 'exact' })
            .gte('scanned_at', today.toISOString())

        // Get scans per day for last 7 days
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { data: recentScans } = await supabase
            .from('scans')
            .select('scanned_at')
            .gte('scanned_at', sevenDaysAgo.toISOString())
            .order('scanned_at', { ascending: true })

        // Group by date
        const scansByDay: Record<string, number> = {}
        recentScans?.forEach(scan => {
            const date = new Date(scan.scanned_at).toISOString().split('T')[0]
            scansByDay[date] = (scansByDay[date] || 0) + 1
        })

        // Get top taxis by scan count
        const { data: topTaxis } = await supabase
            .from('scans')
            .select('taxi_id, taxis(taxi_code, plate_number)')
            .not('taxi_id', 'is', null)

        const taxiScanCounts: Record<string, { code: string, plate: string, count: number }> = {}
        topTaxis?.forEach(scan => {
            const taxiId = scan.taxi_id
            if (taxiId && scan.taxis) {
                const taxi = scan.taxis as unknown as { taxi_code: string, plate_number: string }
                if (!taxiScanCounts[taxiId]) {
                    taxiScanCounts[taxiId] = {
                        code: taxi.taxi_code,
                        plate: taxi.plate_number || '-',
                        count: 0
                    }
                }
                taxiScanCounts[taxiId].count++
            }
        })

        const topTaxisList = Object.values(taxiScanCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)

        return NextResponse.json({
            stats: {
                totalTaxis: taxisResult.count || 0,
                totalCustomers: customersResult.count || 0,
                totalScans: scansResult.count || 0,
                purchasedCustomers: purchasedCount || 0,
                todayScans: todayScans || 0,
                conversionRate: (customersResult.count || 0) > 0
                    ? (((purchasedCount || 0) / (customersResult.count || 1)) * 100).toFixed(1)
                    : '0.0'
            },
            scansByDay,
            topTaxis: topTaxisList
        })
    } catch (error) {
        console.error('Stats Error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        )
    }
}
