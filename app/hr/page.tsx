"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function ProctoringBanner() {
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const [status, setStatus] = React.useState<"idle" | "active" | "denied">("idle")

  React.useEffect(() => {
    let stream: MediaStream | null = null
    async function enable() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        if (videoRef.current) videoRef.current.srcObject = stream
        setStatus("active")
      } catch {
        setStatus("denied")
      }
    }
    enable()
    return () => stream?.getTracks().forEach((t) => t.stop())
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Proctoring</CardTitle>
        <CardDescription className="text-sm">
          Camera preview is requested for presence. Video is not uploaded.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <video
          ref={videoRef}
          className="h-24 w-32 rounded-md border bg-black"
          autoPlay
          muted
          playsInline
          aria-label="Camera preview"
        />
        <div className="text-sm">
          Status:{" "}
          <span className={status === "active" ? "text-green-600" : status === "denied" ? "text-red-600" : ""}>
            {status === "active" ? "Camera active" : status === "denied" ? "Permission denied" : "Requesting..."}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

const QUESTIONS = [
  "Tell me about yourself.",
  "Describe a challenging project and how you handled it.",
  "Why do you want to work in this role?",
]

function analyzeText(text: string) {
  const fillers = ["um", "uh", "like", "you know", "actually", "basically"]
  const positive = ["achieved", "improved", "led", "success", "collaborated", "learned", "solved"]
  const negative = ["failed", "problem", "issue", "difficult", "hard"]

  const words = text.trim().split(/\s+/).filter(Boolean)
  const wordCount = words.length
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const avgSentenceLen = wordCount > 0 && sentences.length > 0 ? Math.round(wordCount / sentences.length) : 0

  const lc = text.toLowerCase()
  const fillerCount = fillers.reduce((acc, f) => acc + (lc.match(new RegExp(`\\b${f}\\b`, "g"))?.length || 0), 0)
  const posCount = positive.reduce((acc, p) => acc + (lc.match(new RegExp(`\\b${p}\\b`, "g"))?.length || 0), 0)
  const negCount = negative.reduce((acc, n) => acc + (lc.match(new RegExp(`\\b${n}\\b`, "g"))?.length || 0), 0)
  const positivity = Math.max(0, Math.min(100, Math.round(((posCount - negCount + 1) / (wordCount + 1)) * 1000)))

  return { wordCount, avgSentenceLen, fillerCount, posCount, negCount, positivity }
}

export default function HRPage() {
  const [index, setIndex] = React.useState(0)
  const [answers, setAnswers] = React.useState<string[]>(Array(QUESTIONS.length).fill(""))

  const q = QUESTIONS[index]
  const canNext = answers[index].trim().length > 10

  function next() {
    if (index < QUESTIONS.length - 1) setIndex((i) => i + 1)
  }
  function prev() {
    if (index > 0) setIndex((i) => i - 1)
  }

  function submit() {
    const combined = answers.join("\n\n")
    const metrics = analyzeText(combined)
    try {
      localStorage.setItem("hrMetrics", JSON.stringify(metrics))
      localStorage.setItem("hrUpdatedAt", new Date().toISOString())
    } catch {}
    alert("HR responses recorded. View your summary on the Feedback page.")
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-balance text-2xl font-semibold">HR Round</h1>
        <p className="mt-1 text-pretty text-sm text-muted-foreground">
          Answer the prompts below. Keep your camera enabled for lightweight proctoring.
        </p>
      </header>

      <div className="mb-6">
        <ProctoringBanner />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Question {index + 1} of {QUESTIONS.length}
          </CardTitle>
          <CardDescription>{q}</CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            className="min-h-40 w-full rounded-md border bg-background p-3 text-sm outline-none"
            value={answers[index]}
            onChange={(e) => {
              const copy = answers.slice()
              copy[index] = e.target.value
              setAnswers(copy)
            }}
            placeholder="Type your answer here..."
          />
          <div className="mt-3 flex items-center justify-between">
            <Button variant="ghost" onClick={prev} disabled={index === 0}>
              Previous
            </Button>
            {index < QUESTIONS.length - 1 ? (
              <Button onClick={next} disabled={!canNext}>
                Next
              </Button>
            ) : (
              <Button onClick={submit} disabled={!canNext}>
                Submit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-end gap-2">
        <Link href="/feedback">
          <Button variant="secondary">Go to Feedback</Button>
        </Link>
      </div>
    </main>
  )
}
