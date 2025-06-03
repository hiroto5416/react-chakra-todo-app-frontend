// バックエンドのTodoエンティティに対応
export interface Todo {
  id: number
  title: string
  description: string | null
  completed: boolean
  createdAt: string // ISO文字列
  updatedAt: string // ISO文字列
}

// API リクエスト用の型
export interface CreateTodoDto {
  title: string
  description?: string
}

export interface UpdateTodoDto {
  title?: string
  description?: string
  completed?: boolean
}

// 統計情報用の型
export interface TodoStats {
  total: number
  completed: number
  remaining: number
}

// API エラーレスポンス用の型
export interface ApiError {
  message: string
  error: string
  statusCode: number
}