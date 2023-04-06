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
  const { username, avatar } = user;
  return tweets
    .filter((tweet) => tweet.username === username)
    .map((tweet) => ({ ...tweet, avatar }))
    .reverse();
}

app.post("/sign-up", (req, res) => {
  let { username, avatar } = req.body;
  username = username ?? "";
  avatar = avatar ?? "";

  if (username === "" || avatar === "") {
    return res.status(400).send("Todos os campos são obrigatórios!");
  }

  const user = users.find((user) => user.username === username);

  if (user) {
    return res.status(409).send("Já existe um usuário com esse username!");
  }

  users.push({ username, avatar });
  return res.status(201).send("OK!");
});

app.post("/tweets", (req, res) => {
  const username = req.headers.user;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return res.status(401).send("UNAUTHORIZED");
  }

  let { tweet } = req.body;
  tweet = tweet ?? "";

  if (tweet === "") {
    return res.status(400).send("Todos os campos são obrigatórios!");
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

  if (page === NaN || page < 1) {
    return res.status(400).send("Informe uma página válida!");
  }

  return res.json(getPage(page));
});

app.get("/tweets/:username", (req, res) => {
  const { username } = req.params;
  const user = users.find((user) => user.username === username);

  if (!user) {
    return res.json([]);
  }

  return res.json(getTweetsFromUser(user));
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
