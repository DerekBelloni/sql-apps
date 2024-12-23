const path = require("path");
const express = require("express");
const { Pool } = require("pg");
const router = express.Router();

// client side static assets
router.get("/", (_, res) => res.sendFile(path.join(__dirname, "./index.html")));
router.get("/client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./client.js"))
);

/**
 * Student code starts here
 */

// connect to postgres
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "recipeguru",
  password: "lol",
  port: 5432,
})

router.get("/type", async (req, res) => {
  const { type } = req.query;

  const { rows } = await pool.query(`SELECT * FROM ingredients WHERE type=$1`, [
    type,
  ]);

  res.json({ rows: rows});
});

router.get("/search", async (req, res) => {
  let { term, page } = req.query;
  page = page ? page : 0;
  offset = page * 5;

  const count = await pool.query(`SELECT COUNT(title) FROM ingredients`);

  let whereClause;
  const params = [page * 5];

  if (term) {
    whereClause = `WHERE CONCAT(title, type) ILIKE $2`;
    params.push(`%${term}%`);
  }


  let { rows } = await pool.query(`
    SELECT *, COUNT(*) OVER ()::INTEGER AS total_count FROM ingredients ${whereClause} OFFSET $1 LIMIT 5`, 
    params
  );
  console.log('total ingredient count: ', count.rows);
  console.log('rows from search: ', rows);

  // return all columns as well as the count of all rows as total_count
  // make sure to account for pagination and only return 5 rows at a time
  if (rows.length > 0) {
    res.json({ rows: rows });
  } else {
    rows = [];
  }
});

/**
 * Student code ends here
 */

module.exports = router;
