/**
 * todo.ts
 *
 * Todoアプリケーションで使用する型定義
 * バックエンドのAPIとフロントエンドの間でデータをやり取りする際の
 * 型の整合性を保証します。
 */

/**
 * Todoアイテムの型定義
 * バックエンドのデータモデルと一致
 */
export interface Todo {
  id: number; // Todoの一意の識別子
  title: string; // Todoのタイトル
  description?: string; // Todoの説明（オプション）
  completed: boolean; // 完了状態
  createdAt: string; // 作成日時（ISO 8601形式）
  updatedAt: string; // 更新日時（ISO 8601形式）
}

/**
 * 新規Todo作成時のデータ型
 * バックエンドのCreateTodoDtoと一致
 */
export interface CreateTodoDto {
  title: string; // Todoのタイトル（必須）
  description?: string; // Todoの説明（オプション）
}

/**
 * Todo更新時のデータ型
 * バックエンドのUpdateTodoDtoと一致
 * 全てのフィールドがオプション（部分更新を可能にするため）
 */
export interface UpdateTodoDto {
  title?: string; // 更新するタイトル（オプション）
  description?: string; // 更新する説明（オプション）
  completed?: boolean; // 更新する完了状態（オプション）
}

// 統計情報用の型
export interface TodoStats {
  total: number;
  completed: number;
  remaining: number;
}

// API エラーレスポンス用の型
export interface ApiError {
  message: string;
  error: string;
  statusCode: number;
}
