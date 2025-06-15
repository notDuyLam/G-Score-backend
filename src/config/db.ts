import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

let sequelize: Sequelize;

if (isProduction && process.env.DATABASE_URL) {
  // Production: Use DATABASE_URL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    pool: {
      max: 20,
      min: 5,
      acquire: 60000,
      idle: 10000,
    },
  });
} else {
  // Development: Use individual environment variables
  sequelize = new Sequelize({
    database: process.env.DB_NAME!,
    username: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    dialect: "postgres",
    logging: false,
  });
}

export { sequelize };
