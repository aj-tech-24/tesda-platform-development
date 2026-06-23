import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminRole } from '@/lib/admin-role'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.user_metadata?.is_admin !== true) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = getAdminRole(user)
    if (!role) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let query = supabase.from('inquiries').select('*')

    if (role === 'training_center') {
      query = query.in('category', ['training_center', 'general'])
    } else if (role === 'assessment_center') {
      query = query.in('category', ['assessment_center', 'general'])
    }
    // 'admin' role gets all categories, so we don't apply a category filter

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch inquiries' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.user_metadata?.is_admin !== true) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = getAdminRole(user)
    if (!role) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id, status } = await request.json()
    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 })
    }

    if (!['pending', 'in_progress', 'resolved'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    // Verify ownership of the inquiry category before updating if not super admin
    if (role !== 'admin') {
      const { data: inquiry, error: fetchError } = await supabase
        .from('inquiries')
        .select('category')
        .eq('id', id)
        .single()

      if (fetchError || !inquiry) {
        return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
      }

      if (inquiry.category !== role && inquiry.category !== 'general') {
        return NextResponse.json({ error: 'Unauthorized to update this inquiry' }, { status: 403 })
      }
    }

    const { data, error } = await supabase
      .from('inquiries')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data[0] })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to update inquiry' },
      { status: 500 }
    )
  }
}
