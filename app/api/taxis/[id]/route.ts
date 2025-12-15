import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Get single taxi
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const { data, error } = await supabase
            .from('taxis')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !data) {
            return NextResponse.json(
                { error: 'Taxi not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ taxi: data })
    } catch (error) {
        console.error('Get Taxi Error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch taxi' },
            { status: 500 }
        )
    }
}

// PUT - Update taxi
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { taxi_code, plate_number, driver_name, notes, is_active } = body

        const updateData: Record<string, unknown> = {}
        if (taxi_code !== undefined) updateData.taxi_code = taxi_code.toUpperCase()
        if (plate_number !== undefined) updateData.plate_number = plate_number
        if (driver_name !== undefined) updateData.driver_name = driver_name
        if (notes !== undefined) updateData.notes = notes
        if (is_active !== undefined) updateData.is_active = is_active

        const { data, error } = await supabase
            .from('taxis')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ taxi: data })
    } catch (error) {
        console.error('Update Taxi Error:', error)
        return NextResponse.json(
            { error: 'Failed to update taxi' },
            { status: 500 }
        )
    }
}

// DELETE - Delete taxi
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const { error } = await supabase
            .from('taxis')
            .delete()
            .eq('id', id)

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete Taxi Error:', error)
        return NextResponse.json(
            { error: 'Failed to delete taxi' },
            { status: 500 }
        )
    }
}
