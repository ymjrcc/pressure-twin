import { useMemo, useState } from 'react'

import { answerKnowledgeQuestion, matchKnowledge } from '@/api/knowledge'
import type { KnowledgeMatchResult } from '@/types/knowledge'

import type { AssistantMessage, ChatMessage, UserMessage } from './types'

function createMessageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function useKnowledgeBaseChat() {
  const [question, setQuestion] = useState('')
  const [topK, setTopK] = useState(5)
  const [questionError, setQuestionError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [latestMatchResult, setLatestMatchResult] = useState<KnowledgeMatchResult | null>(null)
  const [latestMatchStatus, setLatestMatchStatus] = useState<'empty' | 'no-match'>('empty')

  const trimmedQuestion = useMemo(() => question.trim(), [question])

  const handleSubmit = async () => {
    if (trimmedQuestion.length === 0) {
      setQuestionError('请输入要查询的问题')
      return
    }

    const userMessage: UserMessage = {
      id: createMessageId('user'),
      question: trimmedQuestion,
      role: 'user',
    }
    const assistantMessageId = createMessageId('assistant')
    const assistantMessage: AssistantMessage = {
      id: assistantMessageId,
      role: 'assistant',
      status: 'loading',
    }

    setMessages((currentMessages) => [...currentMessages, userMessage, assistantMessage])
    setQuestion('')
    setQuestionError(null)
    setIsLoading(true)
    setLatestMatchResult(null)
    setLatestMatchStatus('empty')

    try {
      const matches = await matchKnowledge(trimmedQuestion, topK)

      if (matches.matches.length === 0) {
        setLatestMatchStatus('no-match')
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === assistantMessageId
              ? {
                  error: '知识库查询失败：未检索到相关资料',
                  id: assistantMessageId,
                  role: 'assistant',
                  status: 'error',
                }
              : message,
          ),
        )
        return
      }

      setLatestMatchResult(matches)
      const answerResult = await answerKnowledgeQuestion(trimmedQuestion, topK, matches.matches)
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === assistantMessageId
            ? {
                answerResult,
                id: assistantMessageId,
                role: 'assistant',
                status: 'success',
              }
            : message,
        ),
      )
    } catch (error) {
      setLatestMatchStatus('empty')
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === assistantMessageId
            ? {
                error: `知识库查询失败：${error instanceof Error ? error.message : '请稍后重试'}`,
                id: assistantMessageId,
                role: 'assistant',
                status: 'error',
              }
            : message,
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  return {
    handleSubmit,
    isLoading,
    latestMatchResult,
    latestMatchStatus,
    messages,
    question,
    questionError,
    setQuestion,
    setQuestionError,
    setTopK,
    topK,
    trimmedQuestion,
  }
}
