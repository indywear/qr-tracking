import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Taxi {
  id: string
  taxi_code: string
  plate_number: string | null
  driver_name: string | null
  notes: string | null
  is_active: boolean
  created_at: string
}

export interface Scan {
  id: string
  taxi_id: string
  line_user_id: string | null
  user_agent: string | null
  ip_address: string | null
  scanned_at: string
  taxi?: Taxi
}

export interface Customer {
  line_user_id: string
  display_name: string | null
  picture_url: string | null
  first_taxi_id: string | null
  total_scans: number
  has_purchased: boolean
  purchase_note: string | null
  created_at: string
  updated_at: string
  first_taxi?: Taxi
}
