import Link from "next/link"
import { Button } from "@/components/ui/button"
export default function Page() {
  return (
    <>
      <div className="mt-6 flex gap-3">
        <Link href="/resume">
          <Button>Upload Resume</Button>
        </Link>
        <Link href="/technical">
          <Button variant="secondary">Technical Round</Button>
        </Link>
        <Link href="/hr">
          <Button variant="secondary">HR Round</Button>
        </Link>
        <Link href="/feedback">
          <Button variant="outline">Feedback</Button>
        </Link>
      </div>
    </>
  )
}
