import { vi } from 'vitest'

type Download = { name: string; text: Promise<string> }

const readBlob = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(blob)
  })

// jsdom cannot download files, so record what the page tries to save.
export function captureDownloads() {
  const downloads: Download[] = []
  const blobs = new Map<string, Blob>()
  const original = { create: URL.createObjectURL, revoke: URL.revokeObjectURL }

  URL.createObjectURL = (blob: Blob | MediaSource) => {
    const url = `blob:test-${blobs.size}`
    blobs.set(url, blob as Blob)
    return url
  }
  URL.revokeObjectURL = () => {}
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    downloads.push({ name: this.download, text: readBlob(blobs.get(this.href)!) })
  })

  return {
    downloads,
    restore() {
      click.mockRestore()
      URL.createObjectURL = original.create
      URL.revokeObjectURL = original.revoke
    },
  }
}
