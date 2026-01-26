import { createClient } from '../supabase/server';
import type { UsageLog } from './types';

export async function logUsage(
  userId: string,
  feature: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('usage_logs')
    .insert({
      user_id: userId,
      feature,
      metadata,
      created_at: new Date().toISOString(),
    });
  
  if (error) {
    console.error('Error logging usage:', error);
  }
}

export async function getUserUsage(
  userId: string,
  limit: number = 100
): Promise<UsageLog[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('usage_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching user usage:', error);
    return [];
  }
  
  return data || [];
}
