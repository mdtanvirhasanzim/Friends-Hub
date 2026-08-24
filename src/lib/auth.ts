import { supabase } from './supabase'

export async function signInWithSupabase(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUpWithSupabase(email: string, password: string, username?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username: username || email.split('@')[0] } },
  })
  if (error) throw error
  return data
}

export async function signOutFromSupabase() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentSupabaseUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}
