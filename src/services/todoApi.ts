import axios from "axios";
import type { Todo, CreateTodoDto, UpdateTodoDto } from "../types/todo";

// axiosインスタンスの作成
const apiClient = axios.create({
  baseURL: "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10秒でタイムアウト
});

// レスポンスインターセプターでエラーハンドリング
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // サーバーからエラーレスポンスが返された場合
      console.error("API Error:", error.response.data);
    } else if (error.request) {
      // リクエストが送信されたが、レスポンスが返されなかった場合
      console.error("Network Error:", error.request);
    } else {
      // その他のエラー
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// Todoの取得
export const getTodos = async (): Promise<Todo[]> => {
  const response = await apiClient.get<Todo[]>("/todos");
  return response.data;
};

// Todoの作成
export const createTodo = async (todo: CreateTodoDto): Promise<Todo> => {
  const response = await apiClient.post<Todo>("/todos", todo);
  return response.data;
};

// Todoの更新
export const updateTodo = async (
  id: number,
  todo: UpdateTodoDto
): Promise<Todo> => {
  const response = await apiClient.patch<Todo>(`/todos/${id}`, todo);
  return response.data;
};

// Todoの削除
export const deleteTodo = async (id: number): Promise<void> => {
  await apiClient.delete(`/todos/${id}`);
};
