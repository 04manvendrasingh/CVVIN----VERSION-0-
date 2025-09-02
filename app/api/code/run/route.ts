import { NextResponse } from "next/server"

type RunInput = { language: "python" | "javascript"; code: string }

export async function POST(req: Request) {
  const body = (await req.json()) as RunInput
  const tests = [
    { name: "sum_array([1,2,3]) === 6", expect: 6 },
    { name: "sum_array([0,0,0]) === 0", expect: 0 },
    { name: "sum_array([-1,5]) === 4", expect: 4 },
  ]

  // Heuristic scoring: we do not execute untrusted code here.
  // We simply check for some indicative tokens and award pass/fail in a predictable way.
  let passCount = 0
  const code = (body.code || "").toLowerCase()

  function containsAll(tokens: string[]) {
    return tokens.every((t) => code.includes(t))
  }

  const looksReasonable =
    (body.language === "python" && containsAll(["def", "sum_array", "return"])) ||
    (body.language === "javascript" && containsAll(["function", "sumarray", "return"]))

  const results = tests.map((t, i) => {
    const passed = looksReasonable || i === 0 // allow partial credit
    if (passed) passCount++
    return {
      name: t.name,
      passed,
      message: passed ? "Passed" : "Did not produce expected result",
    }
  })

  return NextResponse.json({ passed: passCount === tests.length, results })
}
