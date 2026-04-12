import { createClient } from '@supabase/supabase-js'

const getSupabase = () => {
  const config = useRuntimeConfig()
  const url = config.supabaseUrl || process.env.SUPABASE_URL
  const key = config.supabaseServiceKey || process.env.SUPABASE_SERVICE_KEY

  if (!url || !key) {
    throw new Error('Supabase URL or Service Key missing. Please check your .env file.')
  }

  return createClient(url, key)
}

export const uploadReportPDF = async (userId: string, filename: string, body: Buffer | Blob) => {
  const supabase = getSupabase()
  const path = `${userId}/${Date.now()}_${filename.replace(/\s+/g, '_')}.pdf`

  const { data, error } = await supabase.storage
    .from('files')
    .upload(path, body, {
      contentType: 'application/pdf',
      upsert: true
    })

  if (error) {
    console.error('Supabase Storage Upload Error:', error)
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('files')
    .getPublicUrl(path)

  return publicUrl
}

export const deleteReportPDF = async (url: string) => {
  if (!url) return
  const supabase = getSupabase()
  
  // Extract path from public URL
  // Format: https://xxx.supabase.co/storage/v1/object/public/files/path/to/file.pdf
  try {
    const parts = url.split('/storage/v1/object/public/files/')
    if (parts.length < 2) return
    const path = parts[1]

    const { error } = await supabase.storage
      .from('files')
      .remove([path])

    if (error) {
      console.error('Supabase Storage Deletion Error:', error)
    }
  } catch (err) {
    console.error('Storage path extraction error:', err)
  }
}
