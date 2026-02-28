import { useState, useEffect } from "react";
import api from "./api/axios";
import "./App.css";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // GET
  useEffect(() => {
    api.get("/todos")
      .then((res) => { 
        setTodos(res.data); 
        setLoading(false); })
      .catch(() => { setError("Cannot connect to Laravel API."); setLoading(false); 
  });
  }, []);

  //POSt
  const addTodo = async () => {
    if (!input.trim()) return;
    try {
      const res = await api.post("/todos", { title: input.trim() });
      setTodos([res.data, ...todos]);
      setInput("");
    } catch (err) {
      alert("Failed to add task: " + err.response?.data?.message);
    }
  };

  // PUT
  const toggleTodo = async (id, completed) => {
    try {
      const res = await api.put(`/todos/${id}`, { completed });
      setTodos(todos.map((t) => (t.id === id ? res.data : t)));
    } catch (err) {
      alert("Failed to update task");
    }
  };

  // DELETE
  const deleteTodo = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      setTodos(todos.filter((t) => t.id !== id));
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  const active = todos.filter((t) => !t.completed);
  const done   = todos.filter((t) => t.completed);
  const pct    = todos.length === 0 ? 0 : Math.round((done.length / todos.length) * 100);

  return (
    <div className="page">

      <div className="dashboard">
        <div className="stat-card total">
          <div className="stat-num">{todos.length}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card active">
          <div className="stat-num">{active.length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card done">
          <div className="stat-num">{done.length}</div>
          <div className="stat-label">Done</div>
        </div>
      </div>

      <div className="card">

        <div className="card-top">
          <h2>Active Tasks</h2>
        </div>

        <div className="input-row">
          <input
            placeholder="Add a new task..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <button className="btn-add" onClick={addTodo}>+ New Task</button>
        </div>

        {loading && <div className="empty">Loading from Laravel API...</div>}
        {error   && <div className="err"> {error}</div>}

        {!loading && !error && (
          <>
            {/* active */}
            {active.length > 0 && (
              <>
                <div className="section-label">Active : {active.length}</div>
                {active.map((todo) => (
                  <div className="todo-item" key={todo.id}>
                    <button className="cb" onClick={() => toggleTodo(todo.id, true)} />
                    <span className="todo-text">{todo.title}</span>
                    <button className="btn-del" onClick={() => deleteTodo(todo.id)}>×</button>
                  </div>
                ))}
              </>
            )}

            {active.length === 0 && done.length === 0 && (
              <div className="empty">No tasks yet!</div>
            )}

            {active.length === 0 && done.length > 0 && (
              <div className="empty"> All tasks completed!</div>
            )}
            {/* done */}
            {done.length > 0 && (
              <div className="done-section">
                <div className="section-label">Done — {done.length}</div>
                {done.map((todo) => (
                  <div className="todo-item" key={todo.id}>
                    <button className="cb checked" onClick={() => toggleTodo(todo.id, false)}>✓</button>
                    <span className="todo-text done-text">{todo.title}</span>
                    <button className="btn-del" onClick={() => deleteTodo(todo.id)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div className="card-footer">
          <span>{active.length} task{active.length !== 1 ? "s" : ""} remaining</span>
          <span className="pct">{pct}% done</span>
        </div>

      </div>
    </div>
  );
}
