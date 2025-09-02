"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type RunResult = {
  passed: boolean
  results: { name: string; passed: boolean; message: string }[]
}

export default function CodeRunner() {
  const [language, setLanguage] = React.useState<"python" | "javascript">("python")
  const [code, setCode] = React.useState<string>(
    "def sum_array(nums: list[int]) -> int:\n    # TODO: implement\n    return sum(nums)\n",
  )
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<RunResult | null>(null)

  async function onRun() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/code/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code }),
      })
      const data: RunResult = await res.json()
      setResult(data)
      try {
        localStorage.setItem("codeResult", JSON.stringify(data))
        localStorage.setItem("codeUpdatedAt", new Date().toISOString())
      } catch {}
    } catch (e) {
      console.error("[CodeRunner] error", e)
      alert("Run failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-start gap-2">
        <h3 className="text-sm font-medium">Problem</h3>
        <p className="text-sm text-muted-foreground">
          Implement sum_array(nums) that returns the sum of numbers. Your function will be tested against a few sample
          cases.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Language</label>
        <Select
          value={language}
          onValueChange={(v) => setLanguage(v as "python" | "javascript")}
          aria-label="Select language"
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="code" className="text-sm font-medium">
          Your Code
        </label>
        <Textarea id="code" value={code} onChange={(e) => setCode(e.target.value)} className="min-h-52" />
      </div>

      <div className="flex items-center justify-end">
        <Button onClick={onRun} disabled={loading}>
          {loading ? "Running..." : "Run"}
        </Button>
      </div>

      {result && (
        <div className="rounded-lg border p-4">
          <div className="text-sm font-medium">
            Overall:{" "}
            <span className={result.passed ? "text-green-600" : "text-red-600"}>
              {result.passed ? "All tests passed" : "Some tests failed"}
            </span>
          </div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {result.results.map((t) => (
              <li key={t.name} className={t.passed ? "text-green-600" : "text-red-600"}>
                {t.name}: {t.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
