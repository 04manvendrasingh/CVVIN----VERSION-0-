"use client"

import React from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MCQQuiz, { type MCQQuestion } from "@/components/technical/mcq-quiz"
import CodeRunner from "@/components/technical/code-runner"

type McqResponse = { questions: MCQQuestion[] }
const fetcher = (url: string) => fetch(url).then((r) => r.json())

function ProctoringBanner() {
  const videoRef = React.useRef<HTMLVideoElement | null>(null)
  const [status, setStatus] = React.useState<"idle" | "active" | "denied">("idle")

  React.useEffect(() => {
    let stream: MediaStream | null = null
    async function enable() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setStatus("active")
      } catch {
        setStatus("denied")
      }
    }
    enable()
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Proctoring</CardTitle>
        <CardDescription className="text-sm">
          We request your camera to verify presence. Video is not uploaded; this is a lightweight preview only.
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

export default function TechnicalPage() {
  const { data, isLoading } = useSWR<McqResponse>("/api/mcqs", fetcher)

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-balance text-2xl font-semibold">Technical Round</h1>
        <p className="mt-1 text-pretty text-sm text-muted-foreground">
          Complete the MCQ section and try the coding challenge. Keep your camera enabled for proctoring.
        </p>
      </header>

      <div className="mb-6">
        <ProctoringBanner />
      </div>

      <Tabs defaultValue="mcq" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mcq">MCQs</TabsTrigger>
          <TabsTrigger value="code">Coding</TabsTrigger>
        </TabsList>

        <TabsContent value="mcq" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Multiple Choice Questions</CardTitle>
              <CardDescription>Answer all questions. Your score is calculated immediately on submit.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading questions...</p>
              ) : data?.questions?.length ? (
                <MCQQuiz
                  questions={data.questions}
                  onSubmit={(score) => {
                    try {
                      localStorage.setItem("mcqScore", String(score))
                      localStorage.setItem("mcqTotal", String(data.questions.length))
                      localStorage.setItem("mcqUpdatedAt", new Date().toISOString())
                    } catch {}
                    alert(`Your MCQ score: ${score}/${data.questions.length}`)
                  }}
                />
              ) : (
                <p className="text-sm text-muted-foreground">No questions available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Coding Challenge</CardTitle>
              <CardDescription>
                Implement the function described below. Click Run to evaluate against sample tests.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeRunner />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex items-center justify-end">
        <Button asChild variant="secondary">
          <a href="/">Finish for now</a>
        </Button>
      </div>
    </main>
  )
}
