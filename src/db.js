import { openDB } from 'idb';

const DB_NAME = 'fitness-db';
const STORE_NAME = 'workouts';

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    }
  });
}

export async function addWorkout(workout) {
  const db = await getDB();
  await db.add(STORE_NAME, workout);
}

export async function getWorkouts() {
  const db = await getDB();
  return await db.getAll(STORE_NAME);
}

export async function deleteWorkout(id) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}
