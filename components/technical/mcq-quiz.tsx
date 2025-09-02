"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export type MCQQuestion = {
  id: string
  question: string
  options: string[]
  answerIndex: number
}

export default function MCQQuiz({
  questions,
  onSubmit,
}: {
  questions: MCQQuestion[]
  onSubmit?: (score: number) => void
}) {
  const [index, setIndex] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<string, number | null>>({})

  const q = questions[index]
  const total = questions.length
  const percent = Math.round(((index + 1) / total) * 100)

  const selected = answers[q?.id ?? ""] ?? null
  const canNext = selected !== null

  const setAnswer = (i: number) =>
    setAnswers((prev) => ({
      ...prev,
      [q.id]: i,
    }))

  function next() {
    if (!canNext) return
    if (index < total - 1) setIndex((i) => i + 1)
  }

  function prev() {
    if (index > 0) setIndex((i) => i - 1)
  }

  function submit() {
    let score = 0
    for (const qu of questions) {
      const a = answers[qu.id]
      if (typeof a === "number" && a === qu.answerIndex) score++
    }
    onSubmit?.(score)
  }

  if (!q) return null

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Progress value={percent} />
        <div className="mt-2 text-xs text-muted-foreground">
          Question {index + 1} of {total}
        </div>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-sm font-medium">{q.question}</p>
        <RadioGroup
          className="mt-3 flex flex-col gap-2"
          value={selected === null ? undefined : String(selected)}
          onValueChange={(v) => setAnswer(Number(v))}
        >
          {q.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <RadioGroupItem id={`opt-${q.id}-${i}`} value={String(i)} />
              <Label htmlFor={`opt-${q.id}-${i}`} className="text-sm">
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={prev} disabled={index === 0}>
          Previous
        </Button>
        {index < total - 1 ? (
          <Button onClick={next} disabled={!canNext}>
            Next
          </Button>
        ) : (
          <Button onClick={submit} disabled={!canNext}>
            Submit
          </Button>
        )}
      </div>
    </div>
  )
}
