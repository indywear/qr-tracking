import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// PUT - Update customer (mark as purchased, add notes)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params // id is line_user_id
        const body = await request.json()
        const { has_purchased, purchase_note } = body

        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString()
        }
        if (has_purchased !== undefined) updateData.has_purchased = has_purchased
        if (purchase_note !== undefined) updateData.purchase_note = purchase_note

        const { data, error } = await supabase
            .from('customers')
            .update(updateData)
            .eq('line_user_id', id)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ customer: data })
    } catch (error) {
        console.error('Update Customer Error:', error)
        return NextResponse.json(
            { error: 'Failed to update customer' },
            { status: 500 }
        )
    }
}
