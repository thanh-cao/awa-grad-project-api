if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
};

const { Sequelize, DataTypes } = require('sequelize');

const dialectOptions = {
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
    try {
        sequelize.authenticate();
        console.log('Connection has been established successfully.');
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
    }
    // await sequelize.sync({ force: true });
};

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        foreignKey: true
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
    salt: {
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
    languages: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: null
    },
    profilePicture: {
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


User.hasMany(Review, { foreignKey: 'receiverId' });
Review.belongsTo(User, { targetKey: 'id', foreignKey: 'receiverId' });

module.exports = { initDB, sequelize, User, Review };