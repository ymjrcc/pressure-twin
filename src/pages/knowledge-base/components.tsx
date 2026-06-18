import { Fragment } from 'react'
import { AlertCircle, BookOpenText, CheckCircle2, FileSearch, LoaderCircle } from 'lucide-react'

import type { KnowledgeMatch } from '@/types/knowledge'

import type { AssistantMessage, ChatMessage } from './types'

const SAMPLE_QUESTIONS = [
  '压力容器日常巡检重点有哪些？',
  '安全阀异常应如何初步处置？',
  '压力表、液位计和测温仪表巡检时需要关注什么？',
  '如果巡检资料不足以判断风险，知识库应如何回答？',
]

function formatScore(score: number) {
  return `${Math.round(score * 1000) / 10}%`
}

function getMatchRef(index: number) {
  return `资料${index + 1}`
}

function renderAnswerWithRefs(answer: string) {
  const refPattern = /(\[资料\d+\])/g
  const exactRefPattern = /^\[资料\d+\]$/
  const parts = answer.split(refPattern)

  return parts.map((part, index) => {
    if (!part) {
      return null
    }

    if (exactRefPattern.test(part)) {
      return (
        <span
          key={`${part}-${index}`}
          className="rounded-[6px] bg-blue-50 px-1.5 py-0.5 font-medium text-blue-700"
        >
          {part}
        </span>
      )
    }

    return <Fragment key={`${index}-${part.slice(0, 12)}`}>{part}</Fragment>
  })
}

export function KnowledgeSourceEmpty({ status }: { status: 'empty' | 'no-match' }) {
  const message = status === 'empty' ? '请先在右侧提问，检索资料将在这里显示。' : '未检索到相关资料。'

  return (
    <div className="grid min-h-[260px] place-items-center rounded-[8px] border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
      <div>
        <FileSearch className="mx-auto text-slate-400" size={32} strokeWidth={2} />
        <div className="mt-4 text-base font-medium text-slate-700">暂无检索资料</div>
        <div className="mt-1 text-sm text-slate-500">{message}</div>
      </div>
    </div>
  )
}

export function MatchList({ matches }: { matches: KnowledgeMatch[] }) {
  return (
    <div className="space-y-3">
      {matches.map((match, index) => (
        <article key={match.chunk.id} className="rounded-[8px] border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 rounded-[999px] bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
                {getMatchRef(index)}
              </span>
              <h3 className="my-0 min-w-0 text-sm font-semibold text-slate-900">{match.chunk.title}</h3>
            </div>
            <div className="shrink-0 text-xs font-medium text-slate-500">相似度 {formatScore(match.score)}</div>
          </div>
          <div className="mt-2 text-xs leading-5 text-slate-500">
            <div>章节：{match.chunk.sectionTitle}</div>
            <div className="break-all">路径：{match.chunk.sourcePath}</div>
          </div>
          <p className="mb-0 mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{match.chunk.content}</p>
        </article>
      ))}
    </div>
  )
}

export function ChatEmpty({ onSelectQuestion }: { onSelectQuestion: (question: string) => void }) {
  return (
    <div className="grid min-h-full place-items-center px-4 text-center">
      <div className="w-full max-w-[720px]">
        <BookOpenText className="mx-auto text-slate-400" size={38} strokeWidth={2} />
        <div className="mt-4 text-lg font-semibold text-slate-800">开始一次知识库问答</div>
        <div className="mt-2 text-sm text-slate-500">答案会基于检索资料生成，左侧同步展示最近一次命中的资料片段。</div>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {SAMPLE_QUESTIONS.map((sample) => (
            <button
              key={sample}
              className="rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-left text-sm leading-6 text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => onSelectQuestion(sample)}
              type="button"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function AssistantBubble({ message }: { message: AssistantMessage }) {
  if (message.status === 'loading') {
    return (
      <div className="max-w-[860px] rounded-[10px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <LoaderCircle className="animate-spin text-blue-500" size={17} strokeWidth={2.2} />
          正在检索资料并生成回答...
        </div>
      </div>
    )
  }

  if (message.status === 'error' || !message.answerResult) {
    return (
      <div className="max-w-[860px] rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-700 shadow-sm">
        {message.error ?? '知识库查询失败，请稍后重试'}
      </div>
    )
  }

  const result = message.answerResult

  return (
    <div className="max-w-[860px] space-y-3 rounded-[10px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div
        className={`rounded-[8px] border px-3 py-2 ${
          result.isGroundedEnough
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-amber-200 bg-amber-50 text-amber-800'
        }`}
      >
        <div className="flex items-start gap-2">
          {result.isGroundedEnough ? (
            <CheckCircle2 className="mt-0.5 shrink-0" size={16} strokeWidth={2.2} />
          ) : (
            <AlertCircle className="mt-0.5 shrink-0" size={16} strokeWidth={2.2} />
          )}
          <div className="min-w-0">
            <div className="text-sm font-semibold">{result.isGroundedEnough ? '依据充分' : '依据不足'}</div>
            {!result.isGroundedEnough && result.insufficientReason ? (
              <div className="mt-1 text-sm leading-6">{result.insufficientReason}</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{renderAnswerWithRefs(result.answer)}</div>

      <div className="border-t border-slate-200 pt-3">
        <div className="mb-2 text-xs font-semibold text-slate-500">引用来源</div>
        {result.citations.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {result.citations.map((citation) => (
              <div
                key={`${citation.ref}-${citation.chunkId}`}
                className="max-w-full rounded-[999px] border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs text-blue-700"
                title={`${citation.title} / ${citation.sectionTitle}`}
              >
                <span className="font-semibold">{citation.ref}</span>
                <span className="ml-1">{citation.title}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-slate-500">本次回答未引用具体资料。</div>
        )}
      </div>
    </div>
  )
}

export function MessageRow({ message }: { message: ChatMessage }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[760px] rounded-[10px] bg-blue-600 px-4 py-3 text-sm leading-7 text-white shadow-sm">
          {message.question}
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <AssistantBubble message={message} />
    </div>
  )
}
