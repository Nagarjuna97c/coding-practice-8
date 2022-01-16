const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const express = require("express");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`Error Message:${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/todos/", async (request, response) => {
  const { search_q = "", status = "", priority = "" } = request.query;
  const todoList = `
SELECT
    *
FROM
    todo
WHERE
    todo LIKE '%${search_q}%' AND
    status LIKE '%${status}%' AND
    priority LIKE '%${priority}%'
    ;
`;
  const list = await db.all(todoList);
  response.send(list);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { search_q = "", status = "", priority = "" } = request.query;
  const todoList = `
SELECT
    *
FROM
    todo
WHERE
    id=${todoId}
    ;
`;
  const list = await db.get(todoList);
  response.send(list);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const addData = `
INSERT INTO
    todo (id,todo,priority,status)
VALUES
    (
        ${id},
        '${todo}',
        '${priority}',
        '${status}'
    );
`;
  await db.run(addData);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { todo, priority, status } = request.body;

  if (todo !== undefined) {
    const addData = `
        UPDATE
            todo
        SET
            todo='${todo}'
        WHERE
            id=${todoId};
        `;
    await db.run(addData);
    response.send("Todo Updated");
  } else if (status !== undefined) {
    const addData = `
        UPDATE
            todo
        SET
            status='${status}'
        WHERE
            id=${todoId};
        `;
    await db.run(addData);
    response.send("Status Updated");
  } else if (priority !== undefined) {
    const addData = `
        UPDATE
            todo
        SET
            priority='${priority}'
        WHERE
            id=${todoId};
        `;
    await db.run(addData);
    response.send("Priority Updated");
  }
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `
    DELETE FROM
        todo
    WHERE
        id=${todoId};
    `;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});

module.exports = app;
