import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

interface CsvRow {
  date: string
  minutes: number
  project: string
}

interface DailyEntry {
  date: string
  minutes: number
}

interface ProjectEntry {
  name: string
  minutes: number
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  if (!body.data || !Array.isArray(body.data) || body.data.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Data CSV kosong atau tidak valid.',
    })
  }

  const filename = body.filename || 'report'

  // Parse rows
  const rows: CsvRow[] = body.data.map((row: any) => ({
    date: String(row.date || ''),
    minutes: parseInt(String(row.minutes)) || 0,
    project: row.project || '',
  }))

  // Calculate statistics
  const totalMinutes = rows.reduce((sum, r) => sum + r.minutes, 0)
  const uniqueDates = [...new Set(rows.map((r) => r.date))]
  const activeDays = uniqueDates.length

  // Group by date
  const dailyMap = new Map<string, number>()
  for (const row of rows) {
    dailyMap.set(row.date, (dailyMap.get(row.date) || 0) + row.minutes)
  }
  const dailyData: DailyEntry[] = Array.from(dailyMap.entries())
    .map(([date, minutes]) => ({ date, minutes }))
    .sort((a, b) => a.date.localeCompare(b.date))

  const sortedDays = [...dailyData].sort((a, b) => b.minutes - a.minutes)
  const longestDay = sortedDays[0]
  const shortestDay = sortedDays[sortedDays.length - 1]

  // Group by project
  const projectMap = new Map<string, number>()
  for (const row of rows) {
    const project = row.project || 'Tanpa Proyek'
    projectMap.set(project, (projectMap.get(project) || 0) + row.minutes)
  }
  const projectData: ProjectEntry[] = Array.from(projectMap.entries())
    .map(([name, minutes]) => ({ name, minutes }))
    .sort((a, b) => b.minutes - a.minutes)

  // Parse dates
  const sortedDates = uniqueDates.sort()
  const periodStartStr = sortedDates[0] || ''
  const periodEndStr = sortedDates[sortedDates.length - 1] || ''

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

  // Format helpers
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

  function formatDateNice(d: string) {
    const date = parseDateStr(d)
    return `${dayNames[date.getDay()]}, ${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
  }

  // Generate AI insight (optional, if Groq key is available)
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
      aiInsight = ''
    }
  }

  // If no AI insight, generate a default one
  if (!aiInsight) {
    aiInsight = `Selama periode ${formatDateNice(periodStartStr)} hingga ${formatDateNice(periodEndStr)}, Anda telah menginvestasikan total ${totalMinutes} menit (${(totalMinutes / 60).toFixed(1)} jam) dalam sesi fokus. Dari ${totalDaysInPeriod} hari dalam periode ini, Anda aktif selama ${activeDays} hari (${Math.round((activeDays / totalDaysInPeriod) * 100)}%), dengan rata-rata ${avgPerDay} menit per hari aktif.

Hari paling produktif Anda adalah ${longestDay ? formatDateNice(longestDay.date) : '-'} dengan ${longestDay?.minutes || 0} menit fokus, sementara hari dengan durasi terendah adalah ${shortestDay ? formatDateNice(shortestDay.date) : '-'} dengan ${shortestDay?.minutes || 0} menit. Konsistensi harian Anda menunjukkan komitmen yang baik terhadap produktivitas.

Untuk meningkatkan produktivitas, cobalah untuk menjaga konsistensi sesi fokus setiap hari, bahkan di hari-hari yang biasanya kurang produktif. Targetkan minimal 60 menit sesi fokus per hari dan secara bertahap tingkatkan sesuai kapasitas Anda.`
  }

  // =========================================
  // GENERATE PDF
  // =========================================
  const doc = new jsPDF()

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const d = parseDateStr(dateStr)
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return `${days[d.getDay()]} ${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]}`
  }

  const formatHours = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h > 0) return `${h}j ${m}m`
    return `${m}m`
  }

  // Header
  doc.setFontSize(22)
  doc.setTextColor(15, 23, 42)
  doc.text('Laporan Aktivitas Harian', 105, 20, { align: 'center' })

  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  const range = `${formatDate(periodStartStr)} — ${formatDate(periodEndStr)}`
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  doc.text(`Periode: ${range}  |  Digenerate: ${today}`, 105, 28, { align: 'center' })

  doc.setDrawColor(124, 93, 250)
  doc.setLineWidth(0.5)
  doc.line(20, 35, 190, 35)

  // Summary Cards
  doc.setFontSize(12)
  doc.setTextColor(15, 23, 42)
  doc.text('Ringkasan', 20, 45)

  const cardWidth = 40
  const cardGap = 8
  const startX = 20
  const startY = 50
  const cardHeight = 35

  const cards = [
    { label: 'Total Waktu', value: formatHours(totalMinutes), sub: `${totalMinutes} menit` },
    { label: 'Hari Aktif', value: activeDays.toString(), sub: 'hari tercatat' },
    { label: 'Rata-rata/Hari', value: formatHours(avgPerDay), sub: `${avgPerDay} menit` },
    { label: 'Hari Terpanjang', value: longestDay ? formatDate(longestDay.date) : '—', sub: formatHours(longestDay?.minutes || 0) },
  ]

  cards.forEach((card, i) => {
    const x = startX + i * (cardWidth + cardGap)
    doc.setDrawColor(226, 232, 240)
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(x, startY, cardWidth, cardHeight, 2, 2, 'FD')

    doc.setDrawColor(124, 93, 250)
    doc.setLineWidth(1.5)
    doc.line(x, startY, x + cardWidth, startY)

    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139)
    doc.text(card.label, x + 5, startY + 8)

    doc.setFontSize(14)
    doc.setTextColor(15, 23, 42)
    doc.text(card.value, x + 5, startY + 20)

    doc.setFontSize(7)
    doc.setTextColor(148, 163, 184)
    doc.text(card.sub, x + 5, startY + 30)
  })

  // Horizontal bar chart
  doc.setFontSize(12)
  doc.setTextColor(15, 23, 42)
  doc.text('Grafik Durasi per Hari', 20, 100)

  const chartY = 105
  const barHeight = 6
  const barGap = 4
  const maxMins = Math.max(...dailyData.map((d) => d.minutes), 1)
  const chartWidth = 120

  // Limit bars to prevent overflow - paginate if needed
  const maxBarsPerPage = 15
  const barsToShow = dailyData.slice(0, maxBarsPerPage)

  barsToShow.forEach((day, i) => {
    const y = chartY + i * (barHeight + barGap)
    doc.setFontSize(8)
    doc.setTextColor(71, 85, 105)
    doc.text(formatDate(day.date), 20, y + 4)

    // Track
    doc.setFillColor(241, 245, 249)
    doc.rect(45, y, chartWidth, barHeight, 'F')

    // Fill
    const fillWidth = (day.minutes / maxMins) * chartWidth
    if (longestDay && day.minutes === longestDay.minutes) {
      doc.setFillColor(124, 93, 250) // Purple for longest
    } else {
      doc.setFillColor(99, 102, 241) // Indigo
    }
    doc.rect(45, y, fillWidth, barHeight, 'F')

    doc.setFontSize(7)
    doc.setTextColor(71, 85, 105)
    doc.text(formatHours(day.minutes), 45 + chartWidth + 5, y + 4)
  })

  // Project breakdown if multiple projects
  if (projectData.length > 1) {
    const projY = chartY + barsToShow.length * (barHeight + barGap) + 15
    doc.setFontSize(12)
    doc.setTextColor(15, 23, 42)
    doc.text('Distribusi Proyek', 20, projY)

    const projTableData = projectData.map((p, i) => [
      i + 1,
      p.name,
      formatHours(p.minutes),
      `${Math.round((p.minutes / totalMinutes) * 100)}%`,
    ])

    autoTable(doc, {
      startY: projY + 5,
      head: [['No', 'Proyek', 'Durasi', 'Persentase']],
      body: projTableData,
      headStyles: { fillColor: [124, 93, 250], fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 20, right: 20 },
    })
  }

  // Data table on new page
  doc.addPage()
  doc.setFontSize(12)
  doc.setTextColor(15, 23, 42)
  doc.text('Detail Data Harian', 20, 20)

  const tableData = rows.map((r, i) => [i + 1, formatDate(r.date), formatHours(r.minutes), r.project || '—'])

  autoTable(doc, {
    startY: 25,
    head: [['No', 'Tanggal', 'Durasi', 'Proyek']],
    body: tableData,
    headStyles: { fillColor: [124, 93, 250], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 20, right: 20 },
  })

  // AI Insight page
  doc.addPage()
  doc.setFontSize(12)
  doc.setTextColor(15, 23, 42)
  doc.text('Analisis & Insight', 20, 20)

  const splitText = doc.splitTextToSize(aiInsight, 170)

  doc.setFillColor(248, 250, 252)
  doc.roundedRect(20, 25, 170, splitText.length * 6 + 10, 2, 2, 'F')

  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85)
  doc.text(splitText, 25, 35)

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('Dihasilkan oleh FocusReport • focusreport.app', 105, 285, { align: 'center' })

  // Return as base64
  const pdfOutput = doc.output('arraybuffer')
  const base64 = Buffer.from(pdfOutput).toString('base64')

  return {
    success: true,
    pdf: base64,
    filename: `${filename.replace(/\.csv$/i, '')}_report.pdf`,
    stats: {
      totalMinutes,
      activeDays,
      avgPerDay,
      totalDaysInPeriod,
      longestDay,
      shortestDay,
      projectCount: projectData.length,
    },
  }
})
