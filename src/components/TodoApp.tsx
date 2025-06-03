import React, { useState } from "react";
import type { KeyboardEvent, ChangeEvent } from "react";
import type { Todo, UpdateTodoDto } from "../types/todo";
import { useTodos } from "../hooks/useTodos";
import "./TodoApp.css";

const TodoApp: React.FC = () => {
  const { todos, loading, error, createTodo, updateTodo, deleteTodo } =
    useTodos();

  const [newTodoTitle, setNewTodoTitle] = useState<string>("");

  const handleCreateTodo = async (): Promise<void> => {
    if (newTodoTitle.trim()) {
      await createTodo({ title: newTodoTitle });
      setNewTodoTitle("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && newTodoTitle.trim()) {
      handleCreateTodo();
    }
  };

  const handleToggleComplete = async (todo: Todo): Promise<void> => {
    await updateTodo(todo.id, { completed: !todo.completed });
  };

  const handleDeleteTodo = async (id: number): Promise<void> => {
    await deleteTodo(id);
  };

  return (
    <div className="todo-app">
      <div className="container">
        <h1 className="title">Todo アプリ</h1>

        {error && <div className="error-message">エラー: {error}</div>}

        {/* 新規作成フォーム */}
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

        {/* Todoリスト */}
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

// TodoItemコンポーネント
interface TodoItemProps {
  todo: Todo;
  onToggleComplete: (todo: Todo) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onUpdate: (id: number, updateTodoDto: UpdateTodoDto) => Promise<boolean>;
  isLoading: boolean;
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggleComplete,
  onDelete,
  onUpdate,
  isLoading,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>(todo.title);

  const handleSaveEdit = async (): Promise<void> => {
    if (editTitle.trim()) {
      const success = await onUpdate(todo.id, { title: editTitle.trim() });
      if (success) {
        setIsEditing(false);
      }
    }
  };

  const handleCancelEdit = (): void => {
    setEditTitle(todo.title);
    setIsEditing(false);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggleComplete(todo)}
        disabled={isLoading}
        className="checkbox"
      />

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
