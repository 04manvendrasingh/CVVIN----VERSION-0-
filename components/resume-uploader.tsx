"use client"

import React from "react"
import { Button } from "@/components/ui/button"

type Props = {
  onChange?: (file: File | null) => void
}

export default function ResumeUploader({ onChange }: Props) {
  const [file, setFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const handleSelect = (f: File | null) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setFile(f)
    onChange?.(f)
    if (f && f.type === "application/pdf") {
      const url = URL.createObjectURL(f)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    handleSelect(f)
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0] ?? null
    handleSelect(f)
  }

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const removeFile = () => {
    handleSelect(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        role="button"
        aria-label="Upload resume"
        tabIndex={0}
        className="rounded-lg border border-border bg-card p-6 text-center hover:bg-accent/30 focus:outline-none focus:ring-2 focus:ring-ring"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            inputRef.current?.click()
          }
        }}
      >
        <p className="mb-2 text-sm text-muted-foreground">Drag and drop your resume (PDF), or</p>
        <Button variant="default" type="button" onClick={() => inputRef.current?.click()}>
          Choose File
        </Button>
        <input ref={inputRef} type="file" accept="application/pdf" className="sr-only" onChange={onFileInputChange} />
        {file ? (
          <p className="mt-3 text-sm">
            Selected: <span className="font-medium">{file.name}</span>{" "}
            <Button variant="ghost" size="sm" className="ml-2" onClick={removeFile}>
              Remove
            </Button>
          </p>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">PDF only. Max ~10MB recommended.</p>
        )}
      </div>

      {previewUrl ? (
        <div className="grid gap-2">
          <h3 className="text-sm font-medium">Preview</h3>
          <object
            data={previewUrl}
            type="application/pdf"
            aria-label="Resume preview"
            className="h-[70vh] w-full rounded-lg border"
          >
            <p className="p-4 text-sm text-muted-foreground">
              Unable to preview the PDF.{" "}
              <a className="underline" href={previewUrl} target="_blank" rel="noreferrer">
                Open in a new tab
              </a>
              .
            </p>
          </object>
        </div>
      ) : file ? (
        <div className="rounded-md border p-4">
          <p className="text-sm">
            Preview is only available for PDF. You selected: <span className="font-medium">{file.name}</span>
          </p>
        </div>
      ) : null}
    </div>
  )
}
