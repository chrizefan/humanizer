import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { supabase as clientSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Get the user from the server-side Supabase client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data: { user: serverUser } } = await supabase.auth.getUser();
    
    // Get projects for the server user ID
    const { data: serverProjects, error: serverError, count: serverCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .eq('user_id', serverUser?.id || '')
      .order('created_at', { ascending: false })
      .limit(5);
    
    // Get all projects (limited)
    const { data: allProjects, error: allError, count: allCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(10);
    
    return NextResponse.json({
      serverAuth: {
        userId: serverUser?.id,
        email: serverUser?.email,
      },
      serverProjects: {
        count: serverCount,
        error: serverError?.message,
        data: serverProjects?.map(p => ({ id: p.id, title: p.title, userId: p.user_id }))
      },
      allProjects: {
        count: allCount,
        error: allError?.message,
        data: allProjects?.map(p => ({ id: p.id, title: p.title, userId: p.user_id }))
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
