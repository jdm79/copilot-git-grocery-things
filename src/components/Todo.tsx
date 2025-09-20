import React, { useEffect, useState } from "react";
import Footer from "./Footer";
import ReactTimeAgo from "react-time-ago";
import TimeAgo from "javascript-time-ago";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

import en from "javascript-time-ago/locale/en";

TimeAgo.addDefaultLocale(en);

interface Todo {
  id: number;
  text: string;
  date: Date;
  edited?: boolean;
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

interface SortableTodoItemProps {
  todo: Todo;
  onEdit: (id: number, text: string) => void;
  onDelete: (id: number) => void;
}

const SortableTodoItem: React.FC<SortableTodoItemProps> = ({ todo, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex flex-row ${isDragging ? 'z-50' : ''}`}
    >
      <div className='basis-4/6 p-1'>
        <div
          {...attributes}
          {...listeners}
          className='text-white bg-black w-full border rounded-lg pb-1 pt-1 px-3 break-words h-full cursor-grab active:cursor-grabbing touch-none'
        >
          <p className='text-black w-full p-1 rounded-lg border bg-white'>
            {todo.text}
          </p>
          {todo.edited ? (
            <p className='text-xs text-right my-1'>
              Edited:{" "}
              {todo.date && !isNaN(new Date(todo.date).getTime()) ? (
                <ReactTimeAgo date={todo.date} locale='en-US' />
              ) : (
                'just now'
              )}
            </p>
          ) : (
            <p className='text-xs text-right my-1'>
              {todo.date && !isNaN(new Date(todo.date).getTime()) ? (
                <ReactTimeAgo date={todo.date} locale='en-US' />
              ) : (
                'just now'
              )}
            </p>
          )}
        </div>
      </div>
      <div className='basis-1/6 py-1 pr-1'>
        <button
          onClick={() => onEdit(todo.id, todo.text)}
          className='bg-amber-300 text-black rounded-lg border border-white w-full h-full'
        >
          Edit
        </button>
      </div>
      <div className='basis-1/6 py-1 pr-1'>
        <button
          onClick={() => onDelete(todo.id)}
          className='bg-red-500 text-white rounded-lg border border-white w-full h-full'
        >
          Delete
        </button>
      </div>
    </li>
  );
};

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>("");
  const [editText, setEditText] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (localStorage.getItem("localItems")) {
      const storedList = JSON.parse(localStorage.getItem("localItems") || "[]");
      const todosWithDates = storedList.map((todo: any) => {
        const parsedDate = new Date(todo.date);
        return {
          ...todo,
          date: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
        };
      });
      setTodos(todosWithDates);
    }
  }, []);

  const addTodo = () => {
    if (newTodo.trim() === "") return;
    const updatedTodos = [
      ...todos,
      {
        id: Date.now(),
        text: newTodo,
        date: new Date(),
      },
    ];
    setTodos(updatedTodos);
    setNewTodo("");
    localStorage.setItem("localItems", JSON.stringify(updatedTodos));
  };

  const openDeleteModal = (id: number) => {
    setDeletingTodoId(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteTodo = () => {
    if (deletingTodoId === null) return;

    const updatedTodos = todos.filter((todo) => todo.id !== deletingTodoId);
    setTodos(updatedTodos);
    localStorage.setItem("localItems", JSON.stringify(updatedTodos));
    setDeletingTodoId(null);
    setShowDeleteModal(false);
  };

  const cancelDelete = () => {
    setDeletingTodoId(null);
    setShowDeleteModal(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = todos.findIndex((todo) => todo.id === active.id);
      const newIndex = todos.findIndex((todo) => todo.id === over?.id);

      const reorderedTodos = arrayMove(todos, oldIndex, newIndex);
      setTodos(reorderedTodos);
      localStorage.setItem("localItems", JSON.stringify(reorderedTodos));
    }
  };

  const editTodo = (id: number, currentText: string) => {
    setEditText(currentText);
    setEditingTodoId(id);
    setShowEditModal(true);
  };

  const saveTodo = () => {
    if (editingTodoId === null) return;

    const updatedTodos = todos.map((todo) =>
      todo.id === editingTodoId
        ? {
            ...todo,
            text: editText,
            date: new Date(),
            edited: true,
          }
        : todo
    );
    setTodos(updatedTodos);
    setEditText("");
    setEditingTodoId(null);
    setShowEditModal(false);
    localStorage.setItem("localItems", JSON.stringify(updatedTodos));
  };

  const cancelEdit = () => {
    setEditText("");
    setEditingTodoId(null);
    setShowEditModal(false);
  };

  const clearTodos = () => {
    setTodos([]);
    localStorage.removeItem("localItems");
    setShowModal(false);
  };

  return (
    <div className='text-white h-screen w-screen bg-blue-400 flex flex-col justify-between no-select'>
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
                  <span className='text-yellow-300'>{todos.length}</span> thing
                  to git done
                </span>
              ) : (
                <span>
                  {" "}
                  there are{" "}
                  <span className='text-yellow-300'>{todos.length}</span> things
                  to git done
                </span>
              )}
            </h2>
          ) : (
            <h2>nothing to git done</h2>
          )}
        </div>
      </div>{" "}
      <div className='text-center mb-4'>
        <pre className='text-black text-xs md:text-sm font-mono leading-tight'>
{`┌─────────────────────┐
│ ☑ Complete tasks    │
│ ☐ Add new todos     │
│ ☐ Stay organized    │
│ ☑ Git things done!  │
└─────────────────────┘`}
        </pre>
      </div>
      <div className='sticky bottom-0 flex flex-row mb-6 bg-blue-400 pl-1'>
        <div className='basis-5/6 pr-1'>
          <input
            type='text'
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder='Add thing to git done'
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={todos.slice().reverse()} strategy={verticalListSortingStrategy}>
          <ul className='flex flex-col bg-blue-400'>
            {todos
              .slice()
              .reverse()
              .map((todo) => (
                <SortableTodoItem
                  key={todo.id}
                  todo={todo}
                  onEdit={editTodo}
                  onDelete={openDeleteModal}
                />
              ))}
          </ul>
        </SortableContext>
      </DndContext>
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
      {showEditModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4'>
          <div className='bg-white p-6 rounded-lg w-full max-w-md'>
            <h2 className='text-black text-xl font-bold mb-4'>Edit Item</h2>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder='Edit your todo item...'
              className='w-full p-3 border border-gray-300 rounded-lg resize-none text-black'
              rows={3}
              maxLength={100}
              autoFocus
            />
            <div className='text-right text-sm text-gray-500 mt-1'>
              {editText.length}/100
            </div>
            <div className='flex justify-end gap-3 mt-6'>
              <button
                onClick={cancelEdit}
                className='bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={saveTodo}
                disabled={editText.trim() === ''}
                className='bg-amber-400 text-black px-4 py-2 rounded-lg hover:bg-amber-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed'
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4'>
          <div className='bg-white p-6 rounded-lg w-full max-w-md'>
            <h2 className='text-black text-xl font-bold mb-4'>Delete Item</h2>
            <p className='text-gray-600 mb-6'>
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className='flex justify-end gap-3'>
              <button
                onClick={cancelDelete}
                className='bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTodo}
                className='bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors'
              >
                Delete
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
