import { createClient, type SupabaseClient, type User as SupabaseUser } from '@supabase/supabase-js'
import type { User } from '../types'

// Environment variable validation with proper typing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  )
}

// Create typed Supabase client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to check if user is authenticated
export const getCurrentUser = async (): Promise<SupabaseUser | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error getting current user:', error.message)
      return null
    }
    return user
  } catch (error) {
    console.error('Unexpected error getting current user:', error)
    return null
  }
}

// Helper function to get user profile with app-specific data
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error getting user profile:', error.message)
      return null
    }
    
    return data as User
  } catch (error) {
    console.error('Unexpected error getting user profile:', error)
    return null
  }
}

// Helper function to sign out with proper error handling
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(`Sign out failed: ${error.message}`)
    }
  } catch (error) {
    console.error('Error during sign out:', error)
    throw error
  }
}

// Helper function to check connection status
export const checkConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    return !error
  } catch (error) {
    console.error('Supabase connection check failed:', error)
    return false
  }
}

// Type-safe auth state change listener
export const onAuthStateChange = (
  callback: (user: SupabaseUser | null) => void
) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null)
  })
}
