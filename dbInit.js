if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const { Pool } = require('pg');

const ssl = process.env.NODE_ENV !== "production" ? null : {
    ssl: {
        require: true,
        rejectUnauthorized: false
    }
};

const database = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: ssl
});