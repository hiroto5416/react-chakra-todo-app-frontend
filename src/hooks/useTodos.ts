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

  // 全てのTodoを取得
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

  // 新しいTodoを作成
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

  // Todoを更新
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

  // Todoを削除
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

  // 初回読み込み
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

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
