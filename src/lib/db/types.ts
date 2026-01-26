export interface UserProfile {
  id: string;
  email: string;
  business_name?: string;
  phone?: string;
  role: 'user' | 'admin';
  is_approved: boolean;
  access_column: boolean;
  access_beam: boolean;
  created_at: string;
  updated_at: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  feature: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface FeatureDefinition {
  id: string;
  name: string;
  description?: string;
  permission_key: string;
}
