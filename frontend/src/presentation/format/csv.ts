// A leading = + - @ makes a spreadsheet treat the cell as a formula; customer names come from the app.
const neutralise = (field: string) => (/^[=+\-@\t\r]/.test(field) ? `'${field}` : field)

function quote(field: string) {
  const safe = neutralise(field)
  return /[;"\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe
}

export const toCsv = (rows: string[][]) => rows.map((row) => row.map(quote).join(';')).join('\r\n')

export function downloadCsv(filename: string, rows: string[][]) {
  const url = URL.createObjectURL(new Blob(['﻿' + toCsv(rows)], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  // Revoking straight after click() cancels the download in Firefox and Safari.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
