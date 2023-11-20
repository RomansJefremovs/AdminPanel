import sqlite3 from 'sqlite3';

export const initializeDatabase = () => {
    const db = new sqlite3.Database('./mydatabase.db', (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Connected to the SQLite database.');
        }
    });

    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS Users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                email TEXT
            );
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS Events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                price REAL,
                image TEXT,
                date TEXT
            );
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS WineTastings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                price REAL,
                image TEXT,
                date TEXT
            );
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS Wines (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                wineTastingId INTEGER,
                country TEXT,
                region TEXT,
                type TEXT,
                year INTEGER,
                rating REAL,
                FOREIGN KEY (wineTastingId) REFERENCES WineTastings(id)
            );
        `);
    });

    // It's better to close the database in a callback when all operations are done
    db.close((err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Closed the database connection.');
        }
    });
};
