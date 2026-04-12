import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export const generateReportPDF = async (report: any) => {
  const doc = new jsPDF()
  const stats = report.rawData.stats
  const dailyData = report.rawData.dailyData
  const rows = report.rawData.rows
  
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    let d
    if (dateStr.length === 8) {
      d = new Date(`${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`)
    } else {
      d = new Date(dateStr)
    }
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
  const range = `${formatDate(report.periodStart)} — ${formatDate(report.periodEnd)}`
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  doc.text(`Periode: ${range}  |  Digenerate: ${today}`, 105, 28, { align: 'center' })

  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.5)
  doc.line(20, 35, 190, 35)

  // Summary Cards (manual drawing)
  doc.setFontSize(12)
  doc.setTextColor(15, 23, 42)
  doc.text('Ringkasan', 20, 45)

  const cardWidth = 40
  const cardGap = 8
  const startX = 20
  const startY = 50
  const cardHeight = 35

  const cards = [
    { label: 'Total Waktu', value: formatHours(stats.totalMinutes), sub: `${stats.totalMinutes} menit` },
    { label: 'Hari Aktif', value: stats.activeDays.toString(), sub: 'hari tercatat' },
    { label: 'Rata-rata/Hari', value: formatHours(stats.avgPerDay), sub: `${stats.avgPerDay} menit` },
    { label: 'Hari Terpanjang', value: stats.longestDay ? new Date(stats.longestDay.date).toLocaleDateString('id-ID', { weekday: 'short' }) : '—', sub: formatHours(stats.longestDay?.minutes || 0) }
  ]

  cards.forEach((card, i) => {
    const x = startX + (i * (cardWidth + cardGap))
    doc.setDrawColor(226, 232, 240)
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(x, startY, cardWidth, cardHeight, 2, 2, 'FD')
    
    doc.setDrawColor(59, 130, 246)
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

  // Hourly Chart (Simplified horizontal bars)
  doc.setFontSize(12)
  doc.setTextColor(15, 23, 42)
  doc.text('Grafik Durasi per Hari', 20, 100)

  const chartY = 105
  const barHeight = 6
  const barGap = 4
  const maxMins = Math.max(...dailyData.map((d: any) => d.minutes), 1)
  const chartWidth = 120

  dailyData.forEach((day: any, i: number) => {
    const y = chartY + (i * (barHeight + barGap))
    doc.setFontSize(8)
    doc.setTextColor(71, 85, 105)
    doc.text(formatDate(day.date), 20, y + 4)

    // Track
    doc.setFillColor(241, 245, 249)
    doc.rect(45, y, chartWidth, barHeight, 'F')

    // Fill
    const fillWidth = (day.minutes / maxMins) * chartWidth
    if (day.minutes === stats.longestDay?.minutes) {
      doc.setFillColor(185, 28, 28) // Red for longest
    } else {
      doc.setFillColor(29, 78, 216) // Blue
    }
    doc.rect(45, y, fillWidth, barHeight, 'F')

    doc.setFontSize(7)
    doc.setTextColor(71, 85, 105)
    doc.text(formatHours(day.minutes), 45 + chartWidth + 5, y + 4)
  })

  // Table
  const tableY = chartY + (dailyData.length * (barHeight + barGap)) + 15
  doc.setFontSize(12)
  doc.setTextColor(15, 23, 42)
  doc.text('Detail Data Harian', 20, tableY)

  const tableData = rows.map((r: any, i: number) => [
    i + 1,
    formatDate(r.date),
    formatHours(r.minutes),
    r.project || '—'
  ])

  autoTable(doc, {
    startY: tableY + 5,
    head: [['No', 'Tanggal', 'Durasi', 'Proyek']],
    body: tableData,
    headStyles: { fillColor: [15, 23, 42], fontSize: 9 },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 20, right: 20 }
  })

  // Start new page for AI Insight
  doc.addPage()
  doc.setFontSize(12)
  doc.setTextColor(15, 23, 42)
  doc.text('Analisis & Insight', 20, 20)

  const insightContent = report.aiInsight || ''
  const splitText = doc.splitTextToSize(insightContent, 170)
  
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(20, 25, 170, splitText.length * 6 + 10, 2, 2, 'F')
  
  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85)
  doc.text(splitText, 25, 35)

  doc.setFontSize(8)
  doc.setTextColor(148, 163, 184)
  doc.text('Dihasilkan secara otomatis oleh FocusReport • Pomofocus Reporter SaaS', 105, 285, { align: 'center' })

  return Buffer.from(doc.output('arraybuffer'))
}
