import { useEffect, useRef } from 'react'
import { FileSearch, SendHorizontal } from 'lucide-react'
import { Button, Input, Select } from 'antd'

import { ChatEmpty, KnowledgeSourceEmpty, MatchList, MessageRow } from './knowledge-base/components'
import { useKnowledgeBaseChat } from './knowledge-base/useKnowledgeBaseChat'

const TOP_K_OPTIONS = [3, 5, 8, 10].map((value) => ({
  label: `${value} 条资料`,
  value,
}))

export default function KnowledgeBase() {
  const messageEndRef = useRef<HTMLDivElement>(null)
  const {
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
  } = useKnowledgeBaseChat()

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  return (
    <div className="h-[calc(100vh-6rem)] overflow-hidden bg-slate-100 px-4 py-4 md:px-6">
      <div className="mx-auto grid h-full max-w-[1920px] gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col rounded-[10px] border border-slate-200 bg-slate-50 shadow-sm">
          <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="my-0 text-base font-semibold text-slate-900">检索资料</h2>
                <div className="mt-1 text-xs text-slate-500">
                  {latestMatchResult ? `命中 ${latestMatchResult.matches.length} 条，topK=${latestMatchResult.topK}` : '展示最近一次提问的资料片段'}
                </div>
              </div>
              <FileSearch className="shrink-0 text-slate-400" size={18} strokeWidth={2.1} />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {latestMatchResult && latestMatchResult.matches.length > 0 ? (
              <MatchList matches={latestMatchResult.matches} />
            ) : (
              <KnowledgeSourceEmpty status={latestMatchStatus} />
            )}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col rounded-[10px] border border-slate-200 bg-white shadow-sm">
          <div className="shrink-0 border-b border-slate-200 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="my-0 text-xl font-semibold text-slate-900">知识库</h2>
                <div className="mt-1 text-sm text-slate-500">基于承压类特种设备资料进行检索增强问答</div>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-4 py-5 md:px-6">
            {messages.length === 0 ? (
              <ChatEmpty
                onSelectQuestion={(sample) => {
                  setQuestion(sample)
                  setQuestionError(null)
                }}
              />
            ) : (
              <div className="space-y-5">
                {messages.map((message) => (
                  <MessageRow key={message.id} message={message} />
                ))}
                <div ref={messageEndRef} />
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 md:px-5">
            {questionError ? <div className="mb-2 text-sm text-rose-600">{questionError}</div> : null}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <div className="min-w-0 flex-1">
                <Input.TextArea
                  className="rounded-[8px] bg-white text-sm"
                  disabled={isLoading}
                  maxLength={500}
                  onChange={(event) => {
                    setQuestion(event.target.value)
                    if (questionError) {
                      setQuestionError(null)
                    }
                  }}
                  onPressEnter={(event) => {
                    if ((event.ctrlKey || event.metaKey) && !isLoading) {
                      void handleSubmit()
                    }
                  }}
                  placeholder="请输入设备巡检、异常处置、法规依据等问题"
                  rows={3}
                  showCount
                  value={question}
                />
              </div>
              <div className="flex flex-col shrink-0 items-center justify-between gap-2 lg:justify-start">
                <Select
                  className="w-[122px]"
                  disabled={isLoading}
                  onChange={setTopK}
                  options={TOP_K_OPTIONS}
                  value={topK}
                />
                <Button
                  className="h-9 rounded-[6px] w-full px-3 text-sm font-medium"
                  disabled={trimmedQuestion.length === 0}
                  icon={<SendHorizontal size={15} strokeWidth={2.2} />}
                  loading={isLoading}
                  onClick={() => void handleSubmit()}
                  type="primary"
                >
                  发送
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
