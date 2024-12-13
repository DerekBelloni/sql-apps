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

  // return all ingredients of a type
  const { rows } = await pool.query(`SELECT * FROM ingredients WHERE type=$1`, [
    type,
  ]);

  res.status(200).json({ status: "success", rows: rows});
  // res.status(501).json({ status: "not implemented", rows: [] });
});

router.get("/search", async (req, res) => {
  console.log('full request url:', req.url);
  console.log('req query: ', req.query);
  let { term, page } = req.query;
  page = page ? page : 0;
  console.log("search ingredients", term, page);
  const count = await pool.query(``)
  const { rows } = await pool.query(`SELECT title, image, type FROM ingredients WHERE CONCAT(title, type) ILIKE $1 LIMIT 5`, [
    `%${term}%`,
  ]);
  console.log('rows from search: ', rows);

  // return all columns as well as the count of all rows as total_count
  // make sure to account for pagination and only return 5 rows at a time

  res.status(501).json({ status: "not implemented", rows: [] });
});

/**
 * Student code ends here
 */

module.exports = router;
