const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const SHA256 = require("crypto-js/sha256");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const whitelist = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://my-tatra-guide-2efc021c92c4.herokuapp.com/",
];
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
// };

const corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
  },
};

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));

app.disable("etag");
const port = process.env.PORT || 3000;

app.post("/api/auth/register", async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const emailCheck = await client.query(
        `SELECT * FROM "Users" WHERE "email" = $1`,
        [req.body.email]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(409).send({ message: "Email jest już w użyciu" });
      }

      const hashedPassword = SHA256(req.body.password).toString();
      const result = await client.query(
        `INSERT INTO "Users" ("firstName", "lastName", "email", "password") VALUES ($1, $2, $3, $4) RETURNING *`,
        [req.body.firstName, req.body.lastName, req.body.email, hashedPassword]
      );
      res.status(201).send(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Server error" });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Database connection error" });
  }
});

app.post("/api/auth/user-login", async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      const email = req.body.email.toLowerCase();
      const password = SHA256(req.body.password).toString();

      let user = await client.query(
        `SELECT * FROM "Users" WHERE "email" = $1`,
        [email]
      );

      if (user.rows.length === 0) {
        res.sendStatus(401);
      } else {
        if (user.rows[0].password === password) {
          const token = jwt.sign({ email: user.rows[0].email }, "secret", {
            expiresIn: "1h",
          });
          await client.query(
            `UPDATE "Users" SET "token" = $1 WHERE "email" = $2`,
            [token, email]
          );
          res.send({
            ...user.rows[0],
            token,
          });
        } else {
          res.sendStatus(401);
        }
      }
    } catch (error) {
      console.error(error);
      res.sendStatus(401);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

app.get("/api/hiking-trails/list", (req, res) => {
  try {
    pool.connect(async (error, client, release) => {
      let resp = await client.query(
        `SELECT "id", "mountain_range", "trail_name", "start_point", "end_point", "difficulty_level", "child_friendly", "wheelchair_accessible", "suitable_for_seniors", "skill_level", "route_length", "route_time", "elevation_gain", "description" FROM "Hiking_trails"`
      );
      res.send(resp.rows);
      release();
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/reviews/list", (req, res) => {
  try {
    pool.connect(async (error, client, release) => {
      let resp = await client.query(
        `SELECT "id", "userID", "routeID", "date", "rating", "content", "userName" FROM "Reviews"`
      );
      res.send(resp.rows);
      release();
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/hiking-trails/details/:id", (req, res) => {
  const { id } = req.params;
  try {
    pool.connect(async (error, client, release) => {
      let resp = await client.query(
        `SELECT "id", "mountain_range", "trail_name", "start_point", "end_point", "difficulty_level", "child_friendly", "wheelchair_accessible", "suitable_for_seniors", "skill_level", "route_length", "route_time", "description", "gpx" FROM "Hiking_trails" WHERE "id"='${id}'`
      );
      res.send(resp.rows);
      release();
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/user-info", async (req, res) => {
  const id = req.body.id;
  let client;

  try {
    client = await pool.connect();

    const userQuery = `
      SELECT "totalDist", "totalRoutes", "totalChallenges"
      FROM "Users"
      WHERE "id" = $1`;
    const userResult = await client.query(userQuery, [id]);

    const trailsQuery = `
      SELECT *
      FROM "User_trails"
      WHERE "userID" = $1`;
    const trailsResult = await client.query(trailsQuery, [id]);

    const hikingTrailsQuery = `
      SELECT *
      FROM "Hiking_trails"`;
    const hikingTrailsResult = await client.query(hikingTrailsQuery);

    const tripsQuery = `
      SELECT *
      FROM "User_trips"
      WHERE "userID" = $1`;
    const tripsResult = await client.query(tripsQuery, [id]);

    const userChallengesQuery = `
      SELECT *
      FROM "User_challenges"
      WHERE "userID" = $1`;
    const userChallengesResult = await client.query(userChallengesQuery, [id]);

    const challengesQuery = `
      SELECT *
      FROM "Challenges"`;
    const challengesResult = await client.query(challengesQuery);

    const reviewsQuery = `
      SELECT *
      FROM "Reviews"
      WHERE "userID" = $1`;
    const reviewsResult = await client.query(reviewsQuery, [id]);

    const response = {
      userInfo: userResult.rows[0],
      userTrails: trailsResult.rows,
      hikingTrails: hikingTrailsResult.rows,
      userTrips: tripsResult.rows,
      userChallenges: userChallengesResult.rows,
      challenges: challengesResult.rows,
      userReviews: reviewsResult.rows,
    };

    res.send(response);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.post("/api/trails/user-check", async (req, res) => {
  const { userID, routeID } = req.body;

  try {
    const client = await pool.connect();
    const queryText = `
      SELECT * 
      FROM "User_trails" 
      WHERE "userID" = $1 AND "routeID" = $2`;
    const values = [userID, routeID];
    const result = await client.query(queryText, values);
    client.release();

    if (result.rows.length > 0) {
      res.send(result.rows);
    } else {
      res.send([]);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
});

app.post("/api/trails/save", async (req, res) => {
  const { userID, routeID } = req.body;
  let client;

  try {
    client = await pool.connect();

    const insertUserTrailQuery = `
      INSERT INTO "User_trails" ("userID", "routeID")
      VALUES ($1, $2)
      RETURNING *`;
    const values = [userID, routeID];

    const result = await client.query(insertUserTrailQuery, values);

    res.status(201).send(result.rows[0]);
  } catch (error) {
    console.error("Error saving user trail:", error);
    res.status(500).send("Server error");
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.post("/api/trails/delete", async (req, res) => {
  const { userID, routeID } = req.body;
  let client;

  try {
    client = await pool.connect();

    await client.query("BEGIN");

    // Usuń trasę użytkownika
    const deleteUserTrailQuery = `
      DELETE FROM "User_trails"
      WHERE "userID" = $1 AND "routeID" = $2
      RETURNING *`;
    const deleteValues = [userID, routeID];

    const deleteResult = await client.query(deleteUserTrailQuery, deleteValues);

    // Pobierz zaktualizowaną listę tras użytkownika
    const getUserTrailsQuery = `
      SELECT *
      FROM "User_trails"
      WHERE "userID" = $1`;
    const getUserTrailsValues = [userID];

    const userTrailsResult = await client.query(
      getUserTrailsQuery,
      getUserTrailsValues
    );

    await client.query("COMMIT");

    res.status(200).send(userTrailsResult.rows);
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.error("Error deleting user trail:", error);
    res.status(500).send("Server error");
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.get("/api/challenges/list", (req, res) => {
  try {
    pool.connect(async (error, client, release) => {
      let resp = await client.query(
        `SELECT "id", "name", "challengeType", "challengeValue"  FROM "Challenges"`
      );
      res.send(resp.rows);
      release();
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/challenges/user", async (req, res) => {
  const { userID } = req.body;

  try {
    const client = await pool.connect();

    const queryText = `
      SELECT * FROM "User_challenges"
      WHERE "userID" = $1`;
    const values = [userID];
    const result = await client.query(queryText, values);

    console.log("User Challenges from DB:", result.rows);
    client.release();

    res.send(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
});

app.post("/api/challenges/start", async (req, res) => {
  const {
    userID,
    challengeID,
    status,
    challangeType,
    challengeValue,
    timeStart,
  } = req.body;

  try {
    const client = await pool.connect();

    const queryText = `
      INSERT INTO "User_challenges" ("userID", "challengeID", "status", "challangeType", "challengeValue", "timeStart")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
    const values = [
      userID,
      challengeID,
      status,
      challangeType,
      challengeValue,
      timeStart,
    ];
    const result = await client.query(queryText, values);

    client.release();

    res.send(result.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
});

app.post("/api/trip/new", async (req, res) => {
  const { userID, status, trips, name } = req.body;

  try {
    const client = await pool.connect();

    const insertTripQuery = `
      INSERT INTO "User_trips" ("userID", "status", "trips", "name")
      VALUES ($1, $2, $3, $4)
      RETURNING *`;
    const values = [userID, status, JSON.stringify(trips), name];

    const result = await client.query(insertTripQuery, values);
    client.release();

    res.send(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

app.post("/api/trip/getTrips", async (req, res) => {
  const { userID } = req.body;

  try {
    const client = await pool.connect();

    const queryText = `
      SELECT id, "userID", status, trips, name
      FROM "User_trips"
      WHERE "userID" = $1`;
    const values = [userID];

    const result = await client.query(queryText, values);
    client.release();

    res.send(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

app.post("/api/trip/startRoute", async (req, res) => {
  const { tripID, dayIndex, routeIndex } = req.body;

  try {
    const client = await pool.connect();

    const queryText = `
      UPDATE "User_trips"
      SET trips = jsonb_set(
        jsonb_set(
          trips,
          '{${dayIndex},${routeIndex},status}',
          '"started"',
          true
        ),
        '{${dayIndex},${routeIndex},timeStart}',
        to_jsonb(now())::jsonb,
        true
      )
      WHERE id = $1
      RETURNING *`;
    const values = [tripID];

    const result = await client.query(queryText, values);
    client.release();

    res.send(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

app.post("/api/trip/endRoute", async (req, res) => {
  const { tripID, dayIndex, routeIndex, userID, userTime, timeStart, timeEnd } =
    req.body;
  let client;

  try {
    client = await pool.connect();

    await client.query("BEGIN");

    // Update the route status to 'ended' and set userTime, timeStart, and timeEnd
    const queryText = `
      UPDATE "User_trips"
      SET trips = jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              trips,
              '{${dayIndex},${routeIndex},status}',
              '"ended"',
              true
            ),
            '{${dayIndex},${routeIndex},userTime}',
            '"${userTime}"',
            true
          ),
          '{${dayIndex},${routeIndex},timeStart}',
          '"${timeStart}"',
          true
        ),
        '{${dayIndex},${routeIndex},timeEnd}',
        '"${timeEnd}"',
        true
      )
      WHERE id = $1
      RETURNING *`;
    const values = [tripID];

    const result = await client.query(queryText, values);

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).send("Trip not found");
    }

    const trip = result.rows[0];
    const route = trip.trips[dayIndex][routeIndex];
    const routeDist = parseFloat(route.routeDist);

    // Update user's challenges
    const userChallengesQuery = `
      SELECT * FROM "User_challenges"
      WHERE "userID" = $1`;
    const userChallengesResult = await client.query(userChallengesQuery, [
      userID,
    ]);

    for (let challenge of userChallengesResult.rows) {
      let challengeProgress = parseFloat(challenge.challangeProgress) || 0;
      let challengeProgressAfter =
        parseFloat(challenge.challangeProgressAfter) || 0;

      if (challenge.challangeType === "dist") {
        challengeProgressAfter += routeDist;

        if (challenge.status !== "zakończono") {
          challengeProgress += routeDist;

          if (challengeProgress >= parseFloat(challenge.challengeValue)) {
            challengeProgress = challenge.challengeValue;
            const updateChallengeQuery = `
              UPDATE "User_challenges"
              SET "challangeProgress" = $1, "status" = 'zakończono', "timeEnd" = $3, "challangeProgressAfter" = $4
              WHERE "id" = $2`;
            await client.query(updateChallengeQuery, [
              challengeProgress,
              challenge.id,
              new Date().toISOString(),
              challengeProgressAfter,
            ]);
          } else {
            const updateChallengeQuery = `
              UPDATE "User_challenges"
              SET "challangeProgress" = $1, "challangeProgressAfter" = $3
              WHERE "id" = $2`;
            await client.query(updateChallengeQuery, [
              challengeProgress,
              challenge.id,
              challengeProgressAfter,
            ]);
          }
        } else {
          const updateChallengeQuery = `
            UPDATE "User_challenges"
            SET "challangeProgressAfter" = $1
            WHERE "id" = $2`;
          await client.query(updateChallengeQuery, [
            challengeProgressAfter,
            challenge.id,
          ]);
        }
      } else if (challenge.challangeType === "trails") {
        challengeProgressAfter += 1;

        if (challenge.status !== "zakończono") {
          challengeProgress += 1;

          if (challengeProgress >= parseFloat(challenge.challengeValue)) {
            challengeProgress = challenge.challengeValue;
            const updateChallengeQuery = `
              UPDATE "User_challenges"
              SET "challangeProgress" = $1, "status" = 'zakończono', "timeEnd" = $3, "challangeProgressAfter" = $4
              WHERE "id" = $2`;
            await client.query(updateChallengeQuery, [
              challengeProgress,
              challenge.id,
              new Date().toISOString(),
              challengeProgressAfter,
            ]);
          } else {
            const updateChallengeQuery = `
              UPDATE "User_challenges"
              SET "challangeProgress" = $1, "challangeProgressAfter" = $3
              WHERE "id" = $2`;
            await client.query(updateChallengeQuery, [
              challengeProgress,
              challenge.id,
              challengeProgressAfter,
            ]);
          }
        } else {
          const updateChallengeQuery = `
            UPDATE "User_challenges"
            SET "challangeProgressAfter" = $1
            WHERE "id" = $2`;
          await client.query(updateChallengeQuery, [
            challengeProgressAfter,
            challenge.id,
          ]);
        }
      }
    }

    // Check if all routes are ended, and update trip status if necessary
    let allRoutesEnded = true;
    for (let day of trip.trips) {
      for (let route of day) {
        if (route.status !== "ended") {
          allRoutesEnded = false;
          break;
        }
      }
      if (!allRoutesEnded) break;
    }

    if (allRoutesEnded) {
      const updateTripStatusQuery = `
        UPDATE "User_trips"
        SET status = 'finished'
        WHERE id = $1`;
      await client.query(updateTripStatusQuery, [tripID]);
    }

    await client.query("COMMIT");

    res.send(trip); // Sending the updated trip information
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.error(error);
    res.status(500).send("Server error");
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.post("/api/reviews/create", async (req, res) => {
  const { userID, userName, routeID, rating, content, date } = req.body;
  let client;

  try {
    client = await pool.connect();

    const insertReviewQuery = `
      INSERT INTO "Reviews" ("userID", "userName", "routeID", "rating", "content", "date")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`;
    const values = [userID, userName, routeID, rating, content, date];

    const result = await client.query(insertReviewQuery, values);

    res.status(201).send(result.rows[0]);
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).send("Server error");
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.post("/api/reviews/getByRoute", async (req, res) => {
  const { routeID } = req.body;
  let client;

  try {
    client = await pool.connect();

    const getReviewsQuery = `
      SELECT *
      FROM "Reviews"
      WHERE "routeID" = $1`;
    const values = [routeID];

    const result = await client.query(getReviewsQuery, values);

    res.status(200).send(result.rows);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).send("Server error");
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.post("/api/trip/getById", async (req, res) => {
  const { tripID } = req.body;
  let client;

  try {
    client = await pool.connect();

    const getTripByIdQuery = `
      SELECT *
      FROM "User_trips"
      WHERE "id" = $1`;
    const values = [tripID];

    const result = await client.query(getTripByIdQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).send("Trip not found");
    }

    res.status(200).send(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.post("/api/trip/update", async (req, res) => {
  const { tripID, name, trips, userID } = req.body;
  let client;

  try {
    client = await pool.connect();

    await client.query("BEGIN");

    const originalTripQuery = `
      SELECT * FROM "User_trips"
      WHERE "id" = $1`;
    const originalTripResult = await client.query(originalTripQuery, [tripID]);

    if (originalTripResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).send("Trip not found");
    }

    const originalTrip = originalTripResult.rows[0];
    const originalTrips = originalTrip.trips;

    const updateTripQuery = `
      UPDATE "User_trips"
      SET "name" = $1, "trips" = $2::jsonb
      WHERE "id" = $3
      RETURNING *`;
    const values = [name, JSON.stringify(trips), tripID];

    const result = await client.query(updateTripQuery, values);
    const updatedTrip = result.rows[0];

    const allRoutesEnded = trips.every((day) =>
      day.every((route) => route.status === "ended")
    );
    const newTripStatus = allRoutesEnded ? "finished" : "started";

    const updateTripStatusQuery = `
      UPDATE "User_trips"
      SET "status" = $1
      WHERE "id" = $2`;
    await client.query(updateTripStatusQuery, [newTripStatus, tripID]);

    const originalEndedCount = originalTrips
      .flat()
      .filter((route) => route.status === "ended").length;
    const updatedEndedCount = trips
      .flat()
      .filter((route) => route.status === "ended").length;

    const originalEndedDistance = originalTrips
      .flat()
      .filter((route) => route.status === "ended")
      .reduce((sum, route) => sum + parseFloat(route.routeDist), 0);
    const updatedEndedDistance = trips
      .flat()
      .filter((route) => route.status === "ended")
      .reduce((sum, route) => sum + parseFloat(route.routeDist), 0);

    const userChallengesQuery = `
      SELECT * FROM "User_challenges"
      WHERE "userID" = $1`;
    const userChallengesResult = await client.query(userChallengesQuery, [
      userID,
    ]);

    for (let challenge of userChallengesResult.rows) {
      let challengeProgress = parseFloat(challenge.challangeProgress) || 0;
      let challengeProgressAfter =
        parseFloat(challenge.challangeProgressAfter) || 0;

      if (challenge.challangeType === "dist") {
        const distChange = updatedEndedDistance - originalEndedDistance;

        if (distChange > 0) {
          challengeProgress += distChange;
          challengeProgressAfter += distChange;
        } else if (distChange < 0) {
          const newChallengeProgressAfter = challengeProgressAfter + distChange;
          challengeProgressAfter = Math.max(newChallengeProgressAfter, 0);
          if (challengeProgressAfter < parseFloat(challenge.challengeValue)) {
            challengeProgress = challengeProgressAfter;
            challenge.status = "rozpoczęto";
          }
        }
      } else if (challenge.challangeType === "trails") {
        const trailsChange = updatedEndedCount - originalEndedCount;

        if (trailsChange > 0) {
          challengeProgress += trailsChange;
          challengeProgressAfter += trailsChange;
        } else if (trailsChange < 0) {
          const newChallengeProgressAfter =
            challengeProgressAfter + trailsChange;
          challengeProgressAfter = Math.max(newChallengeProgressAfter, 0);
          if (challengeProgressAfter < parseFloat(challenge.challengeValue)) {
            challengeProgress = challengeProgressAfter;
            challenge.status = "rozpoczęto";
          }
        }
      }

      if (challengeProgress >= parseFloat(challenge.challengeValue)) {
        challenge.status = "zakończono";
        challengeProgress = parseFloat(challenge.challengeValue);
      }

      const updateChallengeQuery = `
        UPDATE "User_challenges"
        SET "challangeProgress" = $1, "challangeProgressAfter" = $2, "status" = $3
        WHERE "id" = $4`;
      await client.query(updateChallengeQuery, [
        challengeProgress,
        challengeProgressAfter,
        challenge.status,
        challenge.id,
      ]);
    }

    await client.query("COMMIT");

    res.status(200).send(updatedTrip);
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.error(error);
    res.status(500).send("Server error");
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.post("/api/trip/delete", async (req, res) => {
  const { tripID, userID } = req.body;
  let client;

  try {
    client = await pool.connect();

    await client.query("BEGIN");

    // Pobierz oryginalną wycieczkę
    const originalTripQuery = `
      SELECT * FROM "User_trips"
      WHERE "id" = $1`;
    const originalTripResult = await client.query(originalTripQuery, [tripID]);

    if (originalTripResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).send("Trip not found");
    }

    const originalTrip = originalTripResult.rows[0];
    const originalTrips = originalTrip.trips;

    // Oblicz liczbę zakończonych tras i dystans
    const originalEndedCount = originalTrips
      .flat()
      .filter((route) => route.status === "ended").length;
    const originalEndedDistance = originalTrips
      .flat()
      .filter((route) => route.status === "ended")
      .reduce((sum, route) => sum + parseFloat(route.routeDist), 0);

    // Usuń wycieczkę
    const deleteTripQuery = `
      DELETE FROM "User_trips"
      WHERE "id" = $1`;
    await client.query(deleteTripQuery, [tripID]);

    // Aktualizuj wyzwania użytkownika
    const userChallengesQuery = `
      SELECT * FROM "User_challenges"
      WHERE "userID" = $1`;
    const userChallengesResult = await client.query(userChallengesQuery, [
      userID,
    ]);

    for (let challenge of userChallengesResult.rows) {
      let challengeProgress = parseFloat(challenge.challangeProgress) || 0;
      let challengeProgressAfter =
        parseFloat(challenge.challangeProgressAfter) || 0;

      if (challenge.challangeType === "dist") {
        const distChange = -originalEndedDistance;

        challengeProgressAfter += distChange;
        challengeProgressAfter = Math.max(challengeProgressAfter, 0);
        if (challengeProgressAfter < parseFloat(challenge.challengeValue)) {
          challengeProgress = challengeProgressAfter;
          challenge.status = "rozpoczęto";
        }
      } else if (challenge.challangeType === "trails") {
        const trailsChange = -originalEndedCount;

        challengeProgressAfter += trailsChange;
        challengeProgressAfter = Math.max(challengeProgressAfter, 0);
        if (challengeProgressAfter < parseFloat(challenge.challengeValue)) {
          challengeProgress = challengeProgressAfter;
          challenge.status = "rozpoczęto";
        }
      }

      if (challengeProgress >= parseFloat(challenge.challengeValue)) {
        challenge.status = "zakończono";
        challengeProgress = parseFloat(challenge.challengeValue);
      }

      const updateChallengeQuery = `
        UPDATE "User_challenges"
        SET "challangeProgress" = $1, "challangeProgressAfter" = $2, "status" = $3
        WHERE "id" = $4`;
      await client.query(updateChallengeQuery, [
        challengeProgress,
        challengeProgressAfter,
        challenge.status,
        challenge.id,
      ]);
    }

    await client.query("COMMIT");

    res.status(200).send({ message: "Trip deleted successfully" });
  } catch (error) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.error(error);
    res.status(500).send("Server error");
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.post("/api/trails/user-trails", async (req, res) => {
  const { userID } = req.body;
  let client;

  try {
    client = await pool.connect();

    // Query to get all trails assigned to the user
    const userTrailsQuery = `
      SELECT * FROM "User_trails"
      WHERE "userID" = $1`;
    const userTrailsResult = await client.query(userTrailsQuery, [userID]);

    // Send the user trails as the response
    res.status(200).send(userTrailsResult.rows);
  } catch (error) {
    console.error("Error fetching user trails:", error);
    res.status(500).send("Server error");
  } finally {
    if (client) {
      client.release();
    }
  }
});

app.use(
  express.static(path.join(__dirname, "..", "client", "tatra-app", "dist"))
);

app.get("*", (req, res) => {
  res.sendFile(
    path.resolve(__dirname, "..", "client", "tatra-app", "dist", "index.html")
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
