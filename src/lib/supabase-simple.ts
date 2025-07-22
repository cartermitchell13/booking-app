// Simple Supabase client using direct fetch calls to bypass hanging issues
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function simpleFetch(table: string, options: {
  select?: string;
  eq?: { column: string; value: string };
  limit?: number;
} = {}) {
  const { select = '*', eq, limit } = options;
  
  let url = `${supabaseUrl}/rest/v1/${table}?select=${select}`;
  
  if (eq) {
    url += `&${eq.column}=eq.${eq.value}`;
  }
  
  if (limit) {
    url += `&limit=${limit}`;
  }
  
  console.log('🔍 Simple fetch URL:', url);
  
  try {
    const response = await fetch(url, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
