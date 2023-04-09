import express from "express";
import cors from "cors";

const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());

const pageLength = 10;
const users = [];
const tweets = [];

function getPage(page) {
  const end = Math.max(0, tweets.length - (page - 1) * pageLength);
  const start = Math.max(0, end - pageLength);
  return tweets
    .slice(start, end)
    .map((tweet) => {
      const { avatar } = users.find((user) => user.username === tweet.username);
      return { ...tweet, avatar };
    })
    .reverse();
}

function getTweetsFromUser(user) {
  if (!user) {
    return [];
  }

  const { username, avatar } = user;
  return tweets
    .filter((tweet) => tweet.username === username)
    .map((tweet) => ({ ...tweet, avatar }))
    .reverse();
}

app.post("/sign-up", (req, res) => {
  const { username, avatar } = req.body;

  if (
    typeof username !== "string" ||
    username === "" ||
    typeof avatar !== "string" ||
    avatar === ""
  ) {
    return res.status(400).send("Todos os campos são obrigatórios!");
  }

  const user = users.find((user) => user.username === username);

  if (user) {
    user.avatar = avatar;
    return res.send("OK!");
  }

  users.push({ username, avatar });
  return res.status(201).send("OK!");
});

app.post("/tweets", (req, res) => {
  const { user: username } = req.headers;
  const { tweet } = req.body;

  if (!username) {
    return res.status(401).send("UNAUTHORIZED");
  }

  if (typeof tweet !== "string" || tweet === "") {
    return res.status(400).send("Todos os campos são obrigatórios!");
  }

  const user = users.find((user) => user.username === username);

  if (!user) {
    return res.status(401).send("UNAUTHORIZED");
  }

  tweets.push({ username, tweet });
  return res.status(201).send("OK!");
});

app.get("/tweets", (req, res) => {
  let { page } = req.query;

  if (!page) {
    page = 1;
  }

  page = parseInt(page);

  if (Number.isNaN(page) || page < 1) {
    return res.status(400).send("Informe uma página válida!");
  }

  return res.json(getPage(page));
});

app.get("/tweets/:username", (req, res) => {
  const { username } = req.params;
  const user = users.find((user) => user.username === username);
  return res.json(getTweetsFromUser(user));
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
