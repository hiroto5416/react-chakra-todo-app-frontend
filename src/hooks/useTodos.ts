/**
 * useTodos.ts
 *
 * Todoアプリケーションのカスタムフック
 * TodoのCRUD操作と状態管理を提供します：
 * - Todoの取得（一覧、個別）
 * - Todoの作成
 * - Todoの更新
 * - Todoの削除
 * - ローディング状態の管理
 * - エラー状態の管理
 */

import { useState, useEffect, useCallback } from "react";
import {
  getTodos,
  createTodo as createTodoApi,
  updateTodo as updateTodoApi,
  deleteTodo as deleteTodoApi,
} from "../services/todoApi";
import type {
  Todo,
  CreateTodoDto,
  UpdateTodoDto,
  TodoStats,
} from "../types/todo";

/**
 * useTodosフックの戻り値の型定義
 */
interface UseTodosReturn {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  stats: TodoStats;
  fetchTodos: () => Promise<void>;
  createTodo: (createTodoDto: CreateTodoDto) => Promise<boolean>;
  updateTodo: (id: number, updateTodoDto: UpdateTodoDto) => Promise<boolean>;
  deleteTodo: (id: number) => Promise<boolean>;
}

/**
 * Todoアプリケーションのカスタムフック
 *
 * @returns {UseTodosReturn} Todo関連の状態と操作関数
 */
export const useTodos = (): UseTodosReturn => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 統計情報を計算
  const stats: TodoStats = {
    total: todos.length,
    completed: todos.filter((todo) => todo.completed).length,
    remaining: todos.filter((todo) => !todo.completed).length,
  };

  /**
   * Todo一覧を取得する関数
   * エラーハンドリングを含む
   */
  const fetchTodos = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTodos();
      setTodos(data);
    } catch (err) {
      setError("Todoの取得に失敗しました");
      console.error("Error fetching todos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // コンポーネントマウント時にTodo一覧を取得
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  /**
   * 新規Todoを作成する関数
   * @param {CreateTodoDto} todo - 作成するTodoのデータ
   */
  const createTodo = useCallback(
    async (createTodoDto: CreateTodoDto): Promise<boolean> => {
      if (!createTodoDto.title.trim()) {
        setError("タイトルを入力してください");
        return false;
      }

      setLoading(true);
      setError(null);
      try {
        const newTodo = await createTodoApi({
          title: createTodoDto.title.trim(),
          description: createTodoDto.description?.trim() || undefined,
        });

        // 楽観的更新：即座にUIを更新
        setTodos((prevTodos) => [newTodo, ...prevTodos]);
        return true;
      } catch (err) {
        setError("Todoの作成に失敗しました");
        console.error("Error creating todo:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Todoを更新する関数
   * @param {number} id - 更新対象のTodoのID
   * @param {UpdateTodoDto} todo - 更新するデータ
   * @returns {Promise<boolean>} 更新の成功/失敗
   */
  const updateTodo = useCallback(
    async (id: number, updateTodoDto: UpdateTodoDto): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const updatedTodo = await updateTodoApi(id, updateTodoDto);

        // 楽観的更新：即座にUIを更新
        setTodos((prevTodos) =>
          prevTodos.map((todo) => (todo.id === id ? updatedTodo : todo))
        );
        return true;
      } catch (err) {
        setError("Todoの更新に失敗しました");
        console.error("Error updating todo:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Todoを削除する関数
   * @param {number} id - 削除対象のTodoのID
   */
  const deleteTodo = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await deleteTodoApi(id);

      // 楽観的更新：即座にUIを更新
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
      return true;
    } catch (err) {
      setError("Todoの削除に失敗しました");
      console.error("Error deleting todo:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    todos,
    loading,
    error,
    stats,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
  };
};
