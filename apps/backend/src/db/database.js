import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { env } from "../config/env.js";

let db;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getDatabase() {
  if (db) return db;

  await fs.mkdir(path.dirname(env.databaseFile), { recursive: true });

  db = await open({
    filename: env.databaseFile,
    driver: sqlite3.Database
  });

  await db.exec("PRAGMA foreign_keys = ON;");

  return db;
}

export async function initializeDatabase() {
  const database = await getDatabase();
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = await fs.readFile(schemaPath, "utf8");

  await database.exec(schema);
  await seedInitialData(database);
}

async function seedInitialData(database) {
  const now = new Date().toISOString();

  await database.run(
    `INSERT OR IGNORE INTO vehicles
      (id, name, type, plate, status, battery, current_lat, current_lng, speed, created_at, updated_at)
     VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "BUS-001",
      "Ruta Centro",
      "bus",
      "POC-001",
      "idle",
      100,
      27.4828,
      -109.9304,
      0,
      now,
      now
    ]
  );

  const eventCount = await database.get("SELECT COUNT(*) AS total FROM events");
  if (eventCount.total === 0) {
    await database.run(
      `INSERT INTO events (vehicle_id, event_type, channel, topic, payload_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "BUS-001",
        "system.initialized",
        "rest",
        null,
        JSON.stringify({ message: "Base de datos inicializada para Fase 1" }),
        now
      ]
    );
  }
}
