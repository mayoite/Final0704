import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  
  const supabase = await createClient()
  
  let query = supabase
    .from('furniture_items')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  
  if (search) {
    query = query.ilike('name', `%${search}%`)
  }
  
  const { data, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data)
}
