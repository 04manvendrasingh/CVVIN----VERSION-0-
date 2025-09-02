import ResumeUploader from "@/components/resume-uploader"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Upload Resume",
  description: "Upload and preview your resume (PDF).",
}

export default function ResumePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-balance text-2xl font-semibold">Upload and Preview Your Resume</h1>
        <p className="mt-1 text-pretty text-sm text-muted-foreground">
          Supported format: PDF. Drag & drop or choose a file to see the inline preview.
        </p>
      </header>

      <section className="mb-8">
        <ResumeUploader />
      </section>

      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost">Back</Button>
        </Link>
        <div className="flex gap-2">
          {/* In future, persist to profile or analyze flow */}
          <Button disabled>Save to Profile</Button>
          <Button disabled>Use in Analyze</Button>
        </div>
      </div>
    </main>
  )
}
