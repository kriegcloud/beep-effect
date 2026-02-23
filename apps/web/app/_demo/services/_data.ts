import { generateIssues } from "../data"

const ISSUES_COUNT = process.env.NODE_ENV === "production" ? 30000 : 1000

export const ISSUES = generateIssues(ISSUES_COUNT)
