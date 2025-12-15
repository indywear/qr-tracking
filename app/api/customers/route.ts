import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - List all customers
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const purchasedOnly = searchParams.get('purchased') === 'true'

        let query = supabase
            .from('customers')
            .select('*, first_taxi:taxis(taxi_code, plate_number)')
            .order('created_at', { ascending: false })

        if (purchasedOnly) {
            query = query.eq('has_purchased', true)
        }

        const { data, error } = await query

        if (error) throw error

        return NextResponse.json({ customers: data })
    } catch (error) {
        console.error('Get Customers Error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch customers' },
            { status: 500 }
        )
    }
}
