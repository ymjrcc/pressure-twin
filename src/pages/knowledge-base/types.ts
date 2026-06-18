import type { KnowledgeAnswerResult } from '@/types/knowledge'

export type UserMessage = {
  id: string
  question: string
  role: 'user'
}

export type AssistantMessage = {
  answerResult?: KnowledgeAnswerResult
  error?: string
  id: string
  role: 'assistant'
  status: 'loading' | 'success' | 'error'
}

export type ChatMessage = UserMessage | AssistantMessage
