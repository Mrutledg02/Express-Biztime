/** Database setup for BizTime. */

const { Client } = require("pg");
const password = process.env.PG_PASSWORD || 'Spumante17';

// Check if we're in the test environment
if (process.env.NODE_ENV === 'test') {
    DB_URI = `postgresql://megan:${password}@localhost/biztime_test`;  // Use the test DB URI
  } else {
    DB_URI = `postgresql://megan:${password}@localhost/biztime`;  // Use the regular DB URI
  }

let db = new Client({
  connectionString: DB_URI
});

// Attempt to connect to the database
db.connect()
  .then(() => {
    console.log(`Connected to the database: ${DB_URI}`);
  })
  .catch(err => {
    console.error("Failed to connect to the database", err);
    process.exit(1); // Exit the process if we can't connect to the database
  });

// Handle closing the connection on process termination (e.g., CTRL+C)
process.on("SIGINT", () => {
    db.end()
      .then(() => {
        console.log("Database connection closed.");
        process.exit(0); // Gracefully exit the process
      })
      .catch(err => {
        console.error("Error while closing the database connection", err);
        process.exit(1);
      });
  });


module.exports = db;