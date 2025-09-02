import { NextResponse } from "next/server"

export async function GET() {
  const questions = [
    {
      id: "q1",
      question: "Which HTTP status code represents a successful GET request?",
      options: ["200 OK", "201 Created", "400 Bad Request", "404 Not Found"],
      answerIndex: 0,
    },
    {
      id: "q2",
      question: "In JavaScript, which method converts a JSON string to an object?",
      options: ["JSON.parse()", "JSON.stringify()", "Object.assign()", "toJSON()"],
      answerIndex: 0,
    },
    {
      id: "q3",
      question: "Which of these is NOT a relational database?",
      options: ["PostgreSQL", "MySQL", "MongoDB", "SQLite"],
      answerIndex: 2,
    },
    {
      id: "q4",
      question: "What does CSS stand for?",
      options: ["Cascading Style Sheets", "Computer Style Sheets", "Creative Styling System", "Cascaded System Styles"],
      answerIndex: 0,
    },
    {
      id: "q5",
      question: "Which command initializes a new Git repository?",
      options: ["git start", "git init", "git new", "git repo"],
      answerIndex: 1,
    },
  ]
  return NextResponse.json({ questions })
}
