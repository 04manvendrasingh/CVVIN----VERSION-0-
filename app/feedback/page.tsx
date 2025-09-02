"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

type CodeResult = { passed: boolean; results: { name: string; passed: boolean; message: string }[] }
type HRMetrics = {
  wordCount: number
  avgSentenceLen: number
  fillerCount: number
  posCount: number
  negCount: number
  positivity: number
}

export default function FeedbackPage() {
  const [mcqScore, setMcqScore] = React.useState<number | null>(null)
  const [mcqTotal, setMcqTotal] = React.useState<number | null>(null)
  const [code, setCode] = React.useState<CodeResult | null>(null)
  const [hr, setHr] = React.useState<HRMetrics | null>(null)

  React.useEffect(() => {
    try {
      const s = localStorage.getItem("mcqScore")
      const t = localStorage.getItem("mcqTotal")
      const c = localStorage.getItem("codeResult")
      const h = localStorage.getItem("hrMetrics")
      setMcqScore(s ? Number(s) : null)
      setMcqTotal(t ? Number(t) : null)
      setCode(c ? (JSON.parse(c) as CodeResult) : null)
      setHr(h ? (JSON.parse(h) as HRMetrics) : null)
    } catch {}
  }, [])

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-balance text-2xl font-semibold">Feedback Summary</h1>
        <p className="mt-1 text-pretty text-sm text-muted-foreground">
          A consolidated view of your MCQ, coding, and HR round results captured locally.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">MCQ</CardTitle>
            <CardDescription>Multiple Choice Results</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            {mcqScore !== null && mcqTotal !== null ? (
              <div>
                Score: <span className="font-medium">{mcqScore}</span> / {mcqTotal}
                <div className="mt-1 text-muted-foreground">
                  {Math.round((mcqScore / Math.max(1, mcqTotal)) * 100)}%
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No MCQ results yet.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Coding</CardTitle>
            <CardDescription>Test Outcomes</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            {code ? (
              <div>
                Overall:{" "}
                <span className={code.passed ? "text-green-600" : "text-red-600"}>
                  {code.passed ? "All tests passed" : "Some tests failed"}
                </span>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {code.results.map((r) => (
                    <li key={r.name} className={r.passed ? "text-green-600" : "text-red-600"}>
                      {r.name}: {r.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-muted-foreground">No coding results yet.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">HR Metrics</CardTitle>
            <CardDescription>Heuristic analysis</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            {hr ? (
              <ul className="space-y-1">
                <li>Words: {hr.wordCount}</li>
                <li>Avg sentence length: {hr.avgSentenceLen}</li>
                <li>Filler words: {hr.fillerCount}</li>
                <li>Positivity: {hr.positivity}%</li>
              </ul>
            ) : (
              <div className="text-muted-foreground">No HR responses yet.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-end gap-2">
        <Link href="/technical">
          <Button variant="secondary">Go to Technical</Button>
        </Link>
        <Link href="/hr">
          <Button variant="secondary">Start HR Round</Button>
        </Link>
        <Link href="/">
          <Button>Home</Button>
        </Link>
      </div>
    </main>
  )
}
