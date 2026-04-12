import { requireUserSession } from '#auth-utils/session'
import prisma from '../../utils/prisma'
import { generateReportPDF } from '../../utils/pdf'
import { uploadReportPDF } from '../../utils/storage'
import { z } from 'zod'

const generateSchema = z.object({
  filename: z.string(),
  data: z.array(
    z.object({
      date: z.string(),
      minutes: z.union([z.string(), z.number()]),
      project: z.string().optional(),
    })
  ),
})

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = session.user.id
  const config = useRuntimeConfig()

  const body = await readBody(event)

  // Validate
  const result = generateSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid data: ' + (result as any).error.issues[0].message,
    })
  }

  const { filename, data } = result.data

  // Check subscription limits
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (subscription && subscription.plan === 'FREE' && subscription.reportsUsed >= 3) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Free plan limit reached (3 reports/month). Upgrade to Pro for unlimited reports.',
    })
  }

  // Calculate statistics
  const rows = data.map((row) => ({
    date: String(row.date),
    minutes: parseInt(String(row.minutes)) || 0,
    project: row.project || '',
  }))

  const totalMinutes = rows.reduce((sum, r) => sum + r.minutes, 0)
  const uniqueDates = [...new Set(rows.map((r) => r.date))]
  const activeDays = uniqueDates.length

  // Group by date
  const dailyMap = new Map()
  for (const row of rows) {
    dailyMap.set(row.date, (dailyMap.get(row.date) || 0) + row.minutes)
  }

  const dailyData = Array.from(dailyMap.entries())
    .map(([date, minutes]) => ({ date, minutes }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const sortedDays = [...dailyData].sort((a, b) => b.minutes - a.minutes)
  const longestDay = sortedDays[0] as { date: string, minutes: number } | undefined
  const shortestDay = sortedDays[sortedDays.length - 1] as { date: string, minutes: number } | undefined

  // Group by project
  const projectMap = new Map()
  for (const row of rows) {
    const project = row.project || 'No Project'
    projectMap.set(project, (projectMap.get(project) || 0) + row.minutes)
  }
  const projectData = Array.from(projectMap.entries())
    .map(([name, minutes]) => ({ name, minutes }))
    .sort((a, b) => b.minutes - a.minutes)

  // Parse dates
  const sortedDates = uniqueDates.sort()
  const periodStartStr = sortedDates[0] as any
  const periodEndStr = sortedDates[sortedDates.length - 1] as any

  function parseDateStr(d: string) {
    if (d.length === 8) {
      return new Date(`${d.substring(0, 4)}-${d.substring(4, 6)}-${d.substring(6, 8)}`)
    }
    return new Date(d)
  }

  const periodStart = parseDateStr(periodStartStr)
  const periodEnd = parseDateStr(periodEndStr)
  const totalDaysInPeriod = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const avgPerDay = activeDays > 0 ? Math.round(totalMinutes / activeDays) : 0

  // Format for AI prompt
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  function formatDateNice(d: string) {
    const date = parseDateStr(d)
    return `${dayNames[date.getDay()]}, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  // Generate AI insight using Groq
  let aiInsight = ''

  if (config.groqApiKey) {
    try {
      const prompt = `Berikut data produktivitas saya periode ${formatDateNice(periodStartStr)} - ${formatDateNice(periodEndStr)}:

- Total waktu: ${totalMinutes} menit (${(totalMinutes / 60).toFixed(1)} jam)
- Hari aktif: ${activeDays} dari ${totalDaysInPeriod} hari (${Math.round((activeDays / totalDaysInPeriod) * 100)}%)
- Rata-rata per hari aktif: ${avgPerDay} menit
- Hari terpanjang: ${longestDay ? formatDateNice(longestDay.date) : '-'} (${longestDay?.minutes || 0} menit)
- Hari tersingkat: ${shortestDay ? formatDateNice(shortestDay.date) : '-'} (${shortestDay?.minutes || 0} menit)
${projectData.length > 1 ? `- Distribusi proyek: ${projectData.map((p) => `${p.name} (${p.minutes} menit)`).join(', ')}` : ''}

Tulis 3 paragraf insight: (1) gambaran umum, (2) pola & temuan menarik, (3) saran actionable.`

      const groqResponse = await $fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: {
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content:
                'Kamu adalah asisten produktivitas yang membantu pengguna memahami data waktu kerja mereka. Tulis dalam Bahasa Indonesia yang natural, motivatif, dan actionable. Gunakan paragraf, bukan bullet.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1024,
        },
        timeout: 15000,
      }) as any

      aiInsight = groqResponse.choices?.[0]?.message?.content || ''
    } catch (err) {
      console.error('Groq API error:', err)
      aiInsight = 'AI insight generation failed. Your data has been processed successfully with statistics and charts.'
    }
  } else {
    aiInsight = `Selama periode ${formatDateNice(periodStartStr)} hingga ${formatDateNice(periodEndStr)}, Anda telah menginvestasikan total ${totalMinutes} menit (${(totalMinutes / 60).toFixed(1)} jam) dalam sesi fokus. Dari ${totalDaysInPeriod} hari dalam periode ini, Anda aktif selama ${activeDays} hari (${Math.round((activeDays / totalDaysInPeriod) * 100)}%), dengan rata-rata ${avgPerDay} menit per hari aktif.

Hari paling produktif Anda adalah ${longestDay ? formatDateNice(longestDay.date) : '-'} dengan ${longestDay?.minutes || 0} menit fokus, sementara hari dengan durasi terendah adalah ${shortestDay ? formatDateNice(shortestDay.date) : '-'} dengan ${shortestDay?.minutes || 0} menit. Konsistensi harian Anda menunjukkan komitmen yang baik terhadap produktivitas.

Untuk meningkatkan produktivitas, cobalah untuk menjaga konsistensi sesi fokus setiap hari, bahkan di hari-hari yang biasanya kurang produktif. Targetkan minimal 60 menit sesi fokus per hari dan secara bertahap tingkatkan sesuai kapasitas Anda.`
  }

  // Save report to database
  const report = await prisma.report.create({
    data: {
      userId,
      filename,
      periodStart,
      periodEnd,
      totalMinutes,
      activeDays,
      aiInsight,
      rawData: {
        rows,
        dailyData,
        projectData,
        stats: {
          totalMinutes,
          activeDays,
          avgPerDay,
          totalDaysInPeriod,
          longestDay,
          shortestDay,
        },
      },
    },
  })

  // NEW: Generate and Upload PDF to Supabase Storage
  let pdfUrl = ''
  try {
    const pdfBuffer = await generateReportPDF(report)
    pdfUrl = await uploadReportPDF(userId, filename, pdfBuffer)
    
    // Update record with PDF URL
    await prisma.report.update({
      where: { id: report.id },
      data: { pdfPath: pdfUrl }
    })
    
    // Update local object for response
    report.pdfPath = pdfUrl
  } catch (err) {
    console.error('PDF Generation/Upload failed:', err)
    // We don't throw here to ensure the user at least sees their report data
  }

  // Update subscription usage
  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        reportsUsed: { increment: 1 },
      },
    })
  }

  return {
    success: true,
    report,
  }
})
