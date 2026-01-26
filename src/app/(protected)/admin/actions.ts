'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { UserProfile } from '@/lib/db/types';
import { revalidatePath } from 'next/cache';

export async function listUsers() {
  const supabase = createAdminClient();
  const { data: users, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return users as UserProfile[];
}

export async function updateUser(userId: string, updates: Partial<UserProfile>) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin');
}

export async function createUser(data: any) {
  const supabase = createAdminClient();
  
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: data.is_approved,
  });

  if (authError) {
    throw new Error(authError.message);
  }

  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      id: authData.user.id,
      email: data.email,
      business_name: data.business_name,
      phone: data.phone,
      role: data.is_admin ? 'admin' : 'user',
      is_approved: data.is_approved,
      access_column: data.access_column,
      access_beam: data.access_beam,
    });

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error(profileError.message);
  }

  revalidatePath('/admin');
}

export async function deleteUser(userId: string) {
  const supabase = createAdminClient();
  
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/admin');
}

export async function getUsageStats(period: string) {
  return {
    summary: {
      total_users: 120,
      active_today: 15,
      total_accesses: 1500,
    },
    feature_usage: [
      { feature_name: 'Column', total_count: 800 },
      { feature_name: 'Beam', total_count: 700 },
    ],
    daily_usage: [
      { date: '2024-01-01', count: 100 },
      { date: '2024-01-02', count: 120 },
      { date: '2024-01-03', count: 150 },
      { date: '2024-01-04', count: 130 },
      { date: '2024-01-05', count: 160 },
      { date: '2024-01-06', count: 180 },
      { date: '2024-01-07', count: 200 },
    ],
    user_activity: [
      { email: 'user1@example.com', business_name: 'Company A', access_count: 50 },
      { email: 'user2@example.com', business_name: 'Company B', access_count: 40 },
      { email: 'user3@example.com', business_name: 'Company C', access_count: 30 },
    ],
  };
}
