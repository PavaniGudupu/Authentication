import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";

const app = express();
const saltRounds = 10;
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  database: "Authentication",
  host: "localhost",
  password: "123456",
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try {
    const stored_data = await db.query(
      "SELECT * FROM auth_lv1 where username=($1)",
      [username]
    );
    const data = stored_data.rows;
    if (data.length > 0) {
      res.send("User already exists. Try to Login.");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.log(err.message);
          res.send(err.message);
        } else {
          const reg_data = await db.query(
            "INSERT INTO auth_lv1 VALUES ($1, $2)",
            [username, hash]
          );
          res.render("secrets.ejs");
          console.log(reg_data.rows);
        }
      });
    }
  } catch (err) {
    console.log(err.message);
    res.send(err.message);
  }
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const login_password = req.body.password;
  try {
    const stored_data = await db.query(
      "SELECT * FROM auth_lv1 WHERE username=($1)",
      [username]
    );
    const data = stored_data.rows;
    if (data.length > 0) {
      const user = data[0];
      const stored_hashed_password = user.password;

      bcrypt.compare(login_password, stored_hashed_password, (err, result) => {
        if(err) {
          console.log(err.message);
          res.send(err.message);
        } else {
          if(result) {
            res.render("secrets.ejs");
          } else { res.send("Invalid password. Try it again.."); }
        }
      });
    } else {
      res.send("No user exists. Try to Register first !!");
    }
  } catch (err) {
    console.log(err.message);
    res.send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

