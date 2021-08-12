const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const date = require("date-fns/isDate");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeAndStart = async () => {
  try {
    database: await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => console.log("The port is starting at port 3000"));
  } catch (error) {
    console.log(`The DataBaseError: ${error.message}`);
    process.exit(1);
  }
};

initializeAndStart();

const checkParameter = (request, response, next) => {
  const { status, priority, category, dueDate } = request.query;
  const priorityValues = ["HIGH", "MEDIUM", "LOW"];
  const statusValues = ["TO DO", "IN PROGRESS", "DONE"];
  const categoryValue = ["WORK", "HOME", "LEARNING"];
  let isPresent;
  let givenValue;

  switch (true) {
    case status !== undefined:
      const isStatus = statusValues.includes(status);
      if (isStatus === true) {
        isPresent = true;
      } else {
        isPresent = false;
        givenValue = "Status";
      }
      break;
    case priority !== undefined:
      const isPriority = priorityValues.includes(priority);
      if (isPriority === true) {
        isPresent = true;
      } else {
        isPresent = false;
        givenValue = "Priority";
      }
      break;
    case category !== undefined:
      const isCategory = categoryValue.includes(category);
      if (isCategory === true) {
        isPresent = true;
      } else {
        isPresent = false;
        givenValue = "Category";
      }
      break;
    default:
      const validDate = date(dueDate);
      if (validDate === true) {
        isPresent = true;
      } else {
        isPresent = false;
        givenValue = "Due Date";
      }
  }

  if (isPresent === true) {
    next();
  } else {
    response.status(400);
    response.send(`Invalid Todo ${givenValue}`);
  }
};

const hasPriorityAndCategory = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.category !== undefined
  );
};

const hasCategoryAndStatus = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityAndStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasOnlyStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasOnlyPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasOnlyCategory = (requestQuery) => {
  return requestQuery.category !== undefined;
};

app.get("/todos/", checkParameter, async (request, response) => {
  let getQuery = "";
  let result = null;
  const { search_q, status, priority, category } = request.query;
  switch (true) {
    case hasPriorityAndCategory(request.query):
      getQuery = `
        SELECT 
          *
        FROM
          todo
        WHERE
          priority LIKE '${priority}' 
          AND category= '${category}';`;

      result = await database.all(getQuery);
      response.send(result);
      break;
    case hasCategoryAndStatus(request.query):
      getQuery = `
        SELECT 
          *
        FROM
          todo
        WHERE
          status LIKE '${status}' 
          AND category= '${category}';`;

      result = await database.all(getQuery);
      response.send(result);
      break;
    case hasPriorityAndStatus(request.query):
      getQuery = `
        SELECT 
          *
        FROM
          todo
        WHERE
          priority LIKE '${priority}' 
          AND status = '${status}';`;

      result = await database.all(getQuery);
      response.send(result);
      break;
    case hasOnlyStatus(request.query):
      getQuery = `
        SELECT 
          *
        FROM
          todo
        WHERE
          status LIKE '${status}';`;

      result = await database.all(getQuery);
      response.send(result);
      break;
    case hasOnlyPriority(request.query):
      getQuery = `
        SELECT 
          *
        FROM
          todo
        WHERE
          priority LIKE '${priority}';`;

      result = await database.all(getQuery);
      response.send(result);
      break;
    case hasOnlyCategory(request.query):
      getQuery = `
        SELECT 
          *
        FROM
          todo
        WHERE
          category LIKE '${category}';`;

      result = await database.all(getQuery);
      response.send(result);
      break;
    default:
      getQuery = `
        SELECT 
          *
        FROM
          todo
        WHERE
          todo LIKE '${search_q}'`;

      result = await database.all(getQuery);
      response.send(result);
  }
});

/*
Scenario 1
Sample API
/todos/?status=TO%20DO

Scenario 2
Sample API
/todos/?priority=HIGH

Scenario 3
Sample API
/todos/?priority=HIGH&status=IN%20PROGRESS

Scenario 4
Sample API
/todos/?search_q=Buy

Scenario 5
Sample API
/todos/?category=WORK&status=DONE

Scenario 6
Sample API
/todos/?category=HOME

Scenario 7
Sample API
/todos/?category=LEARNING&priority=HIGH*/
