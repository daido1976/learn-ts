import fs from "fs";
import express from "express";
const app = express();
const port = 3000;
const todoFilePath = "tmp/todo.json";

type Todo = {
  id: number;
  title: string;
  body: string;
};

type ReqTodo = {
  title: string;
  body: string;
};

app.use(express.json());

app.get("/todos", (_req, res) => {
  const todos: Todo[] = JSON.parse(fs.readFileSync(todoFilePath, "utf8"));
  res.json(todos);
});

app.get("/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const todos: Todo[] = JSON.parse(fs.readFileSync(todoFilePath, "utf8"));
  const todo = todos.find((todo) => todo.id === id);
  todo
    ? res.json(todo)
    : res.status(404).send({ error: `Todo with id ${id} not found` });
});

app.post("/todos", (req, res) => {
  const reqTodo: ReqTodo = req.body;
  const todos: Todo[] = JSON.parse(fs.readFileSync(todoFilePath, "utf8"));
  const newId = todos.length + 1;
  const newTodo: Todo = { id: newId, ...reqTodo };
  const newTodos = [...todos, newTodo];
  fs.writeFileSync(todoFilePath, JSON.stringify(newTodos, null, 2));

  res.json(newTodo);
});

app.patch("/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const reqTodo: ReqTodo = req.body;
  const todos: Todo[] = JSON.parse(fs.readFileSync(todoFilePath, "utf8"));
  let updatedTodo;
  const newTodos = todos.map((todo) => {
    if (todo.id === id) {
      todo.title = reqTodo.title;
      todo.body = reqTodo.body;
      updatedTodo = todo;
    }
    return todo;
  });

  if (updatedTodo) {
    fs.writeFileSync(todoFilePath, JSON.stringify(newTodos, null, 2));
    res.json(updatedTodo);
  } else {
    res.status(404).send({ error: `Todo with id ${id} not found` });
  }
});

app.delete("/todos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const todos: Todo[] = JSON.parse(fs.readFileSync(todoFilePath, "utf8"));
  const newTodos = todos.filter((todo) => todo.id !== id);
  if (JSON.stringify(newTodos) !== JSON.stringify(todos)) {
    fs.writeFileSync(todoFilePath, JSON.stringify(newTodos, null, 2));
    res.json({});
  } else {
    res.status(404).send({ error: `Todo with id ${id} not found` });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
