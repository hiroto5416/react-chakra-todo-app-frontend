/**
 * TodoApp.tsx
 *
 * Todoアプリケーションのメインコンポーネント
 * 以下の機能を提供します：
 * - Todoの一覧表示
 * - 新規Todoの作成
 * - Todoの完了/未完了の切り替え
 * - Todoの編集
 * - Todoの削除
 */

import React, { useState } from "react";
import type { KeyboardEvent, ChangeEvent } from "react";
import type { Todo, UpdateTodoDto } from "../types/todo";
import { useTodos } from "../hooks/useTodos";
import "./TodoApp.css";

/**
 * TodoAppコンポーネント
 *
 * @returns {JSX.Element} TodoアプリケーションのUI
 */
const TodoApp: React.FC = () => {
  // useTodosフックからTodo関連の機能と状態を取得
  const { todos, loading, error, createTodo, updateTodo, deleteTodo } =
    useTodos();

  // 新規Todo作成用の入力値の状態管理
  const [newTodoTitle, setNewTodoTitle] = useState<string>("");

  /**
   * 新規Todoを作成する関数
   * 入力値が空でない場合のみ作成を実行
   */
  const handleCreateTodo = async (): Promise<void> => {
    if (newTodoTitle.trim()) {
      await createTodo({ title: newTodoTitle });
      setNewTodoTitle(""); // 入力欄をクリア
    }
  };

  /**
   * キーボードイベントのハンドラー
   * Enterキーが押された場合に新規Todoを作成
   */
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && newTodoTitle.trim()) {
      handleCreateTodo();
    }
  };

  /**
   * Todoの完了状態を切り替える関数
   * @param {Todo} todo - 更新対象のTodo
   */
  const handleToggleComplete = async (todo: Todo): Promise<void> => {
    await updateTodo(todo.id, { completed: !todo.completed });
  };

  /**
   * Todoを削除する関数
   * @param {number} id - 削除対象のTodoのID
   */
  const handleDeleteTodo = async (id: number): Promise<void> => {
    await deleteTodo(id);
  };

  return (
    <div className="todo-app">
      <div className="container">
        <h1 className="title">Todo アプリ</h1>

        {/* エラーメッセージの表示 */}
        {error && <div className="error-message">エラー: {error}</div>}

        {/* 新規Todo作成フォーム */}
        <div className="create-form">
          <input
            type="text"
            placeholder="新しいタスクを入力..."
            value={newTodoTitle}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNewTodoTitle(e.target.value)
            }
            onKeyPress={handleKeyPress}
            className="title-input"
          />
          <button
            onClick={handleCreateTodo}
            disabled={!newTodoTitle.trim() || loading}
            className="create-button"
          >
            {loading ? "作成中..." : "タスクを作成"}
          </button>
        </div>

        {/* Todoリストの表示 */}
        <div className="todo-list">
          {loading && todos.length === 0 ? (
            <div className="loading">読み込み中...</div>
          ) : todos.length === 0 ? (
            <div className="empty-message">タスクがありません</div>
          ) : (
            todos.map((todo: Todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTodo}
                onUpdate={updateTodo}
                isLoading={loading}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * TodoItemコンポーネントのProps型定義
 */
interface TodoItemProps {
  todo: Todo; // 表示するTodoのデータ
  onToggleComplete: (todo: Todo) => Promise<void>; // 完了状態切り替えハンドラー
  onDelete: (id: number) => Promise<void>; // 削除ハンドラー
  onUpdate: (id: number, updateTodoDto: UpdateTodoDto) => Promise<boolean>; // 更新ハンドラー
  isLoading: boolean; // ローディング状態
}

/**
 * TodoItemコンポーネント
 * 個々のTodoアイテムの表示と操作を担当
 */
const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggleComplete,
  onDelete,
  onUpdate,
  isLoading,
}) => {
  // 編集モードの状態管理
  const [isEditing, setIsEditing] = useState<boolean>(false);
  // 編集中のタイトルの状態管理
  const [editTitle, setEditTitle] = useState<string>(todo.title);

  /**
   * 編集内容を保存する関数
   * 入力値が空でない場合のみ保存を実行
   */
  const handleSaveEdit = async (): Promise<void> => {
    if (editTitle.trim()) {
      const success = await onUpdate(todo.id, { title: editTitle.trim() });
      if (success) {
        setIsEditing(false);
      }
    }
  };

  /**
   * 編集をキャンセルする関数
   * 入力値を元のタイトルに戻し、編集モードを終了
   */
  const handleCancelEdit = (): void => {
    setEditTitle(todo.title);
    setIsEditing(false);
  };

  /**
   * キーボードイベントのハンドラー
   * Enter: 保存
   * Escape: キャンセル
   */
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div className={`todo-item ${todo.completed ? "completed" : ""}`}>
      {/* 完了状態のチェックボックス */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggleComplete(todo)}
        disabled={isLoading}
        className="checkbox"
      />

      {/* タイトルの表示/編集 */}
      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyPress={handleKeyPress}
          onBlur={handleSaveEdit}
          className="edit-input"
          autoFocus
        />
      ) : (
        <span className="todo-title" onClick={() => setIsEditing(true)}>
          {todo.title}
        </span>
      )}

      {/* 削除ボタン */}
      <button
        onClick={() => onDelete(todo.id)}
        disabled={isLoading}
        className="delete-button"
      >
        削除
      </button>
    </div>
  );
};

export default TodoApp;
