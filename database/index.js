const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { Sequelize } = require('sequelize');
const { Umzug, SequelizeStorage } = require('umzug');
const { performance } = require('perf_hooks');

const { round } = require('../app/utils');
const basename = path.basename(__filename);

const db = {};

const sequelizeOptions = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  dialect: process.env.DB_DIALECT,
  storage: process.env.DB_STORAGE,
  operatorsAliases: false,
};

// initialize sequelize instance
if (process.env.DB_CONNECTION_URL) {
  db.sequelize = new Sequelize(process.env.DB_CONNECTION_URL, sequelizeOptions);
} else {
  db.sequelize = new Sequelize(sequelizeOptions);
}

// get all models
fs.readdirSync(path.resolve('database', 'models'))
  // filter by models
  .filter((file) => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
  })
  // import model
  .forEach((file) => {
    // eslint-disable-next-line global-require
    const model = require(path.resolve('database', 'models', file))(db.sequelize);
    db[model.name] = model;
  });

// associate models
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.migrations = {
  // umzug instance for migrations
  migrations: (() => {
    const migrations = new Umzug({
      migrations: {
        glob: './database/migrations/*.js',
      },
      context: db.sequelize.getQueryInterface(),
      storage: new SequelizeStorage({
        sequelize: db.sequelize,
        modelName: '.migrations',
        timestamps: true,
        operatorsAliases: false,
      }),
    });

    let startMigrationTime = 0;

    migrations.on('migrating', ({ name }) => {
      console.log(chalk.green(`- start ${name.slice(0, -3)}`));
      startMigrationTime = performance.now();
    });

    migrations.on('migrated', () => {
      console.log(
        chalk.green(`- migrated successfully ${chalk.cyan(`(${round(performance.now() - startMigrationTime, 3)}ms)`)}`)
      );
    });

    return migrations;
  })(),

  // apply migrations
  up: ({ migrations: { migrations } }) => {
    const startTime = performance.now();

    console.info(chalk.yellow('Migrating DB...'));

    return migrations
      .up()
      .then(() => {
        console.log(
          chalk.green(`DB migrating complete in ${chalk.cyan(`(${round(performance.now() - startTime, 3)}ms)`)}`)
        );
      })
      .catch((err) => {
        console.log(chalk.red('An Error occurred while seeding'));
        throw err;
      });
  },
};

db.seeders = {
  // umzug instance for seeders
  seeders: (() => {
    const seeders = new Umzug({
      migrations: {
        glob: './database/seeders/*.js',
      },
      context: db.sequelize.getQueryInterface(),
      storage: new SequelizeStorage({
        sequelize: db.sequelize,
        modelName: '.seeders',
        timestamps: true,
        operatorsAliases: false,
      }),
    });

    let startSeedingTime = 0;

    seeders.on('migrating', ({ name }) => {
      console.log(chalk.green(`- start ${name.slice(0, -3)}`));
      startSeedingTime = performance.now();
    });

    seeders.on('migrated', () => {
      console.log(
        chalk.green(`- seeded successfully ${chalk.cyan(`(${round(performance.now() - startSeedingTime, 3)}ms)`)}`)
      );
    });

    return seeders;
  })(),

  // apply seeders
  up: ({ seeders: { seeders } }) => {
    const startTime = performance.now();

    console.info(chalk.yellow('Seeding DB...'));

    return seeders
      .up()
      .then(() => {
        console.log(
          chalk.green(`DB seeding complete in ${chalk.cyan(`(${round(performance.now() - startTime, 3)}ms)`)}`)
        );
      })
      .catch((err) => {
        console.log(chalk.red('An Error occurred while seeding'));
        throw err;
      });
  },
};

module.exports = db;
