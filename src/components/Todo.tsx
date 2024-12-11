import React, { useEffect, useState } from "react";
import Footer from "./Footer";
import ReactTimeAgo from "react-time-ago";
import TimeAgo from "javascript-time-ago";

import en from "javascript-time-ago/locale/en";

TimeAgo.addDefaultLocale(en);

interface Todo {
  id: number;
  text: string;
  isEditing: boolean;
  date: Date;
}

const currentDate = new Date();
const d = currentDate.getDay();

const weekday = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const day = weekday[d];

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>("");
  const [editText, setEditText] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    if (localStorage.getItem("localItems")) {
      const storedList = JSON.parse(localStorage.getItem("localItems") || "[]");
      setTodos(storedList);
    }
  }, []);

  const addTodo = () => {
    if (newTodo.trim() === "") return;
    const updatedTodos = [
      ...todos,
      { id: Date.now(), text: newTodo, isEditing: false, date: new Date() },
    ];
    setTodos(updatedTodos);
    setNewTodo("");
    localStorage.setItem("localItems", JSON.stringify(updatedTodos));
  };

  const deleteTodo = (id: number) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
    localStorage.setItem("localItems", JSON.stringify(updatedTodos));
  };

  const editTodo = (id: number, currentText: string) => {
    setEditText(currentText);
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, isEditing: true } : todo
    );
    setTodos(updatedTodos);
  };

  const saveTodo = (id: number) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id
        ? { ...todo, text: editText, isEditing: false, date: new Date() }
        : todo
    );
    setTodos(updatedTodos);
    setEditText("");
    localStorage.setItem("localItems", JSON.stringify(updatedTodos));
  };

  const clearTodos = () => {
    setTodos([]);
    localStorage.removeItem("localItems");
    setShowModal(false);
  };

  return (
    <div className='text-white h-screen w-screen bg-blue-400 flex flex-col justify-between '>
      <div className='text-center mb-1 text-md px-5 font-bold border-8 border-black md:border-white md:mt-2 md:rounded-lg bg-black w-full md:w-1/3 mx-auto p-1'>
        <div className='text-center font-bold text-white bg-black w-full md:w-fit mx-auto lowercase'>
          Today is <span className='text-yellow-300'>{day}</span>
        </div>
        <div>
          {todos.length > 0 ? (
            <h2 className='text-white'>
              {todos.length === 1 ? (
                <span>
                  {" "}
                  there is{" "}
                  <span className='text-yellow-300'>{todos.length}</span> item
                  to buy
                </span>
              ) : (
                <span>
                  {" "}
                  there are{" "}
                  <span className='text-yellow-300'>{todos.length}</span> items
                  to buy
                </span>
              )}
            </h2>
          ) : (
            <h2>nothing to buy</h2>
          )}
        </div>
      </div>{" "}
      <div className='content flex py-2 m-auto bg-blue-400'>
        <img
          src={"/images/ggf.png"}
          alt='git grocery things logo'
          className='w-3/4 h-15 m-auto md:w-1/4'
        />
      </div>
      <div className='sticky bottom-0 flex flex-row mb-6 bg-blue-400 pl-1'>
        <div className='basis-5/6 pr-1'>
          <input
            type='text'
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder='Add item to shopping list'
            className=' text-black w-full p-3 rounded-lg border-white'
          />
        </div>
        <div className='basis-1/6 pr-1'>
          <button
            className='bg-green-400 text-white rounded-lg border border-white w-full h-full'
            onClick={() => addTodo()}
          >
            Add
          </button>
          <button></button>
        </div>
      </div>
      <ul className='flex flex-col bg-blue-400'>
        {todos
          .slice()
          .reverse()
          .map((todo) => (
            <li key={todo.id} className='flex flex-row '>
              {todo.isEditing ? (
                <>
                  <div className='basis-3/4 p-1'>
                    <div className='text-white bg-black w-full border rounded-lg pb-3 pt-1 px-3 break-words h-full'>
                      <input
                        type='text'
                        maxLength={100}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        placeholder='Edit todo'
                        className='text-black w-full p-1 rounded-lg border bg-white'
                      />
                    </div>
                  </div>
                  <div className='basis-1/4 pr-2 py-1'>
                    <button
                      className='bg-amber-300 text-black rounded-lg border border-black w-full h-full'
                      onClick={() => saveTodo(todo.id)}
                    >
                      Save
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className='basis-4/6 p-1'>
                    <div className='text-white bg-black w-full border rounded-lg pb-1 pt-1 px-3 break-words h-full'>
                      <p className='text-black w-full p-1 rounded-lg border bg-white'>
                        {todo.text}
                      </p>
                      <p className='text-xs text-right'>
                        <ReactTimeAgo date={todo.date} locale='en-US' />
                      </p>
                    </div>
                  </div>
                  <div className='basis-1/6 py-1 pr-1'>
                    <button
                      onClick={() => editTodo(todo.id, todo.text)}
                      className='bg-amber-300 text-black rounded-lg border border-white w-full h-full'
                    >
                      Edit
                    </button>
                  </div>
                  <div className='basis-1/6 py-1 pr-1'>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className='bg-red-500 text-white rounded-lg border border-white w-full h-full'
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
      </ul>
      {todos.length > 0 && (
        <div className='flex justify-center mb-4 mt-8'>
          <button
            onClick={() => setShowModal(true)}
            className='bg-red-500 text-white p-2 rounded-lg border border-white'
          >
            Clear All Todos
          </button>
        </div>
      )}
      {showModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
          <div className='bg-white p-4 rounded-lg'>
            <h2 className='text-black mb-4'>
              Are you sure you want to clear all todos?
            </h2>
            <div className='flex justify-end'>
              <button
                onClick={() => setShowModal(false)}
                className='bg-gray-500 text-white p-2 rounded-lg mr-2'
              >
                Cancel
              </button>
              <button
                onClick={clearTodos}
                className='bg-red-500 text-white p-2 rounded-lg'
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default TodoApp;
