const express = require("express");


const app = express();
const port = process.env.PORT || 3020;
app.use(express.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static("public"))





app.post("/addUser", async (req, res) => {
  try {
    const { firstName, lastName, email, age } = req.body;

    await pool.query(
      `INSERT INTO users (first_name, last_name, email, age)
       VALUES ($1, $2, $3, $4)`,
      [firstName, lastName, email, age]
    );

    res.redirect("/");
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

  app.post("/editUser", async (req, res) => {
    try {
      const { userID, firstName, lastName, email, age } = req.body;
  
      const result = await pool.query(
        `UPDATE users
         SET first_name=$1, last_name=$2, email=$3, age=$4
         WHERE user_id=$5
         RETURNING *`,
        [firstName, lastName, email, age, userID]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json({ message: "User updated", user: result.rows[0] });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  

app.post('/deleteUser', async (req, res) => {
  try {
    const { userID } = req.body;

    const result = await pool.query(
      "DELETE FROM users WHERE user_id=$1",
      [userID]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/users", async (req, res) => {
  try {
    const { sortBy = "first_name", order = "asc" } = req.query;

    const allowedFields = ["first_name", "last_name", "email", "age"];
    const field = allowedFields.includes(sortBy) ? sortBy : "first_name";
    const direction = order === "desc" ? "DESC" : "ASC";

    const result = await pool.query(
      `SELECT user_id AS "userID",
              first_name AS "firstName",
              last_name AS "lastName",
              email,
              age
       FROM users
       ORDER BY ${field} ${direction}`
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



  app.get("/search", async (req, res) => {
    try {
      const { q } = req.query;
  
      const result = await pool.query(
        `SELECT user_id AS "userID",
                first_name AS "firstName",
                last_name AS "lastName",
                email,
                age
         FROM users
         WHERE first_name ILIKE $1
            OR last_name ILIKE $1`,
        [`%${q}%`]
      );
  
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.listen(port, (err) => {
    if (err) console.log(err);
    console.log(`App Server listen on port: ${port}`);

});

