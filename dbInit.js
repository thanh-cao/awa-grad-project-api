if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
};

const { Sequelize, DataTypes } = require('sequelize'); // setting up Sequelize to query database
// const { seedDB } = require('./seedDB');

/* if local database is used (meaning we are in the 'development' environment),
we do not need ssl authentication. If production database is used (like heroku's postgres),
we need to set to use ssl to connect. 
*/
const dialectOptions = process.env.NODE_ENV !== 'production' ? null : {
    ssl: {
        require: true,
        rejectUnauthorized: false
    }
};

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions: dialectOptions
});

async function initDB() {
    // this is only to check if database is connected.
    try {
        sequelize.authenticate();
        console.log('Connection has been established successfully.');
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
    }
    /* 
    sequelize.sync() is used to sync up our postgres database with the data models we have set up here.
    If you set {force: true}, it means that it will delete everything currently existing in the database before syncing up.
    If not set, it will only sync whatever that is not already existing in the database.
    When you create a new model and define new relationships with existing models, it might happen that you need
    to use {force: true} in order to properly create PK and FK so that sequelize can create 'join table' queries with eager loading.
    */
    // await sequelize.sync({ force: true });
    // seedDB();
};

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.BLOB,
        allowNull: false
    },
    salt: { // salt a random data that is used to encrypt/decrypt user's password
        type: DataTypes.BLOB,
        allowNull: false
    },
    about: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    interests: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    countrycode: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    languages: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    }
});

const ContactInfo = sequelize.define('ContactInfo', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    facebook: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    instagram: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    },
    twitter: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
    }
});

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    reviewerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

// defining relationships between tables with PK and FK
User.hasMany(Review, { foreignKey: 'receiverId' });
User.hasMany(Review, { foreignKey: 'reviewerId' });
Review.belongsTo(User, { targetKey: 'id', foreignKey: 'receiverId', as: 'receiver' });
Review.belongsTo(User, { targetKey: 'id', foreignKey: 'reviewerId', as: 'reviewer' });

User.hasOne(ContactInfo, { foreignKey: 'userId' });
ContactInfo.belongsTo(User, { targetKey: 'id', foreignKey: 'userId' });

module.exports = { initDB, sequelize, User, Review, ContactInfo };