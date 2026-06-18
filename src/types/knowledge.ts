export type KnowledgeChunk = {
  id: string
  documentId: string
  sourcePath: string
  fileName: string
  title: string
  headings: string[]
  sectionTitle: string
  content: string
  contentWithContext: string
  charCount: number
  sectionChunkIndex: number
  sectionChunkCount: number
  documentChunkIndex: number
  documentChunkCount: number
  metadata: Record<string, unknown>
}

export type KnowledgeMatch = {
  score: number
  chunk: KnowledgeChunk
}

export type KnowledgeMatchResult = {
  question: string
  topK: number
  matches: KnowledgeMatch[]
}

export type KnowledgeAnswerCitation = {
  ref: string
  chunkId: string
  title: string
  sourcePath: string
  sectionTitle: string
  score: number
}

export type KnowledgeAnswerResult = {
  question: string
  answer: string
  usedRefs: string[]
  citations: KnowledgeAnswerCitation[]
  isGroundedEnough: boolean
  insufficientReason: string | null
}

