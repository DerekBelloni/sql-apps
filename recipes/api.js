const path = require("path");
const express = require("express");
const router = express.Router();

// client side static assets
router.get("/", (_, res) => res.sendFile(path.join(__dirname, "./index.html")));
router.get("/client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./client.js"))
);
router.get("/detail-client.js", (_, res) =>
  res.sendFile(path.join(__dirname, "./detail-client.js"))
);
router.get("/style.css", (_, res) =>
  res.sendFile(path.join(__dirname, "../style.css"))
);
router.get("/detail", (_, res) =>
  res.sendFile(path.join(__dirname, "./detail.html"))
);

/**
 * Student code starts here
 */
const pg = require("pg");
const pool = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "recipeguru",
  password: "lol",
  port: 5432,
});

// think of search more as list, not like list in ingredients
router.get("/search", async function (req, res) {
  console.log("search recipes");

  // return recipe_id, title, and the first photo as url - DISTINCT
  //
  // for recipes without photos, return url as default.jpg - COALESCE
  const { rows } = await pool.query(`
    SELECT DISTINCT 
    ON (r.recipe_id) 
      r.recipe_id AS recipe_id,  
      r.title AS title, 
      COALESCE(rp.url, 'default.jpg') AS url
    FROM 
      recipes r 
    LEFT JOIN 
      recipes_photos as rp 
    ON 
      r.recipe_id = rp.recipe_id`
    );
  
  res.json({ rows }).end();
});

router.get("/get", async (req, res) => {
  const recipeId = req.query.id ? +req.query.id : 1;
  console.log("recipe get", recipeId);

  const ingredientsPromise = await pool.query(`
      SELECT
        i.image AS ingredient_image,
        i.type AS ingredient_type,
        i.title AS ingredient_title
      FROM
        recipe_ingredients ri
      INNER JOIN
        ingredients i
      ON
        i.id = ri.ingredient_id
      WHERE
        ri.recipe_id = $1;
    `, [recipeId]);

  const photosPromise = await pool.query(`
      SELECT
        r.title,
        r.body,
        COALESCE(rp.url, 'default.jpg') as url
      FROM 
        recipes r
      LEFT JOIN
        recipes_photos as rp
      ON
        rp.recipe_id = r.recipe_id
      WHERE
        rp.recipe_id = $1;
    `, [recipeId]);

  const [{ rows: photosRows }, { rows: ingredientsRows }] = await Promise.all([
    photosPromise,
    ingredientsPromise,
  ]);

  res.json({
    ingredients: ingredientsRows,
    photos: photosRows.map((photo) => photo.url),
    title: photosRows[0].title,
    body: photosRows[0].body
  });
});
/**
 * Student code ends here
 */

module.exports = router;
