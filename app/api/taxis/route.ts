import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - List all taxis
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const activeOnly = searchParams.get('active') === 'true'

        let query = supabase.from('taxis').select('*').order('created_at', { ascending: false })

        if (activeOnly) {
            query = query.eq('is_active', true)
        }

        const { data, error } = await query

        if (error) throw error

        return NextResponse.json({ taxis: data })
    } catch (error) {
        console.error('Get Taxis Error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch taxis' },
            { status: 500 }
        )
    }
}

// POST - Create new taxi
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { taxi_code, plate_number, driver_name, notes } = body

        if (!taxi_code) {
            return NextResponse.json(
                { error: 'Taxi code is required' },
                { status: 400 }
            )
        }

        const { data, error } = await supabase
            .from('taxis')
            .insert({
                taxi_code: taxi_code.toUpperCase(),
                plate_number,
                driver_name,
                notes,
                is_active: true
            })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                return NextResponse.json(
                    { error: 'Taxi code already exists' },
                    { status: 409 }
                )
            }
            throw error
        }

        return NextResponse.json({ taxi: data }, { status: 201 })
    } catch (error) {
        console.error('Create Taxi Error:', error)
        return NextResponse.json(
            { error: 'Failed to create taxi' },
            { status: 500 }
        )
    }
}
