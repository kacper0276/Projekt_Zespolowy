import React, { useState } from "react";
import { IToDoItem } from "../../interfaces/IToDoItem";
import { IToDoList } from "../../interfaces/IToDoList";
import { useApiJson } from "../../config/api";
import { ApiResponse } from "../../types/api.types";

interface ItemProps {
  taskId: number;
}

const ToDoList: React.FC<ItemProps> = ({ taskId }) => {
  const api = useApiJson();
  const [toDoList, setToDoList] = useState<IToDoList | null>(null);
  const [newListName, setNewListName] = useState<string>("");
  const [newItemName, setNewItemName] = useState<string>("");
  const [items, setItems] = useState<IToDoItem[]>([]);

  const createToDoList = async () => {
    if (!newListName.trim()) {
      console.log("Lista nie możę być pusta");
      return;
    }

    try {
      const response = await api.post<ApiResponse<IToDoList>>(
        `to-do-lists/${taskId}`,
        {
          name: newListName,
        }
      );
      setToDoList(response.data.data ?? null);
      setNewListName("");
      alert("Lista została utworzona!");
    } catch (error) {
      console.error("Błąd podczas tworzenia listy:", error);
      alert("Nie udało się utworzyć listy.");
    }
  };

  const addToDoItem = async () => {
    if (!newItemName.trim() || !toDoList) {
      alert(
        "Nazwa zadania nie może być pusta lub lista nie została utworzona!"
      );
      return;
    }

    try {
      const response = await api.post<IToDoItem>("/api/todo-items", {
        name: newItemName,
        isDone: false,
        toDoList: toDoList,
      });
      setItems((prevItems) => [...prevItems, response.data]);
      setNewItemName("");
      alert("Zadanie zostało dodane!");
    } catch (error) {
      console.error("Błąd podczas dodawania zadania:", error);
      alert("Nie udało się dodać zadania.");
    }
  };

  return (
    <div>
      <h1>To-Do List</h1>

      <div>
        <input
          type="text"
          placeholder="Nazwa nowej listy"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
        />
        <button onClick={createToDoList}>Utwórz listę</button>
      </div>

      {toDoList && (
        <div>
          <h2>Lista: {toDoList.name}</h2>
          <input
            type="text"
            placeholder="Nazwa nowego zadania"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
          <button onClick={addToDoItem}>Dodaj zadanie</button>
        </div>
      )}

      {items.length > 0 && (
        <div>
          <h3>Zadania:</h3>
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                {item.name} - {item.isDone ? "Zrobione" : "Do zrobienia"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ToDoList;
