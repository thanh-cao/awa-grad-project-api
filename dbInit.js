if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const { Pool } = require('pg');

const database = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV !== 'production' ? undefined : {
    rejectUnauthorized: false
  }
});