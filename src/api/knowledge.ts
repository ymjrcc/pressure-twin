import type { KnowledgeAnswerResult, KnowledgeMatch, KnowledgeMatchResult } from '@/types/knowledge'

type ApiResponse<T> = {
  data?: T
  error?: {
    message?: string
  }
  ok: boolean
}

export async function matchKnowledge(question: string, topK: number): Promise<KnowledgeMatchResult> {
  const response = await fetch('/api/ai/knowledge-match', {
    body: JSON.stringify({ question, topK }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  const result = (await response.json()) as ApiResponse<KnowledgeMatchResult>

  if (!response.ok || !result.ok || !result.data) {
    throw new Error(result.error?.message ?? `Request failed with status ${response.status}`)
  }

  return result.data
}

export async function answerKnowledgeQuestion(
  question: string,
  topK: number,
  matches: KnowledgeMatch[],
): Promise<KnowledgeAnswerResult> {
  const response = await fetch('/api/ai/knowledge-answer', {
    body: JSON.stringify({ question, topK, matches }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })

  const result = (await response.json()) as ApiResponse<KnowledgeAnswerResult>

  if (!response.ok || !result.ok || !result.data) {
    throw new Error(result.error?.message ?? `Request failed with status ${response.status}`)
  }

  return result.data
}

