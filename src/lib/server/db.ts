import sqlite from 'better-sqlite3';
import { assert } from 'console';

const db = import.meta.env.DEV ? sqlite('dev.db') : sqlite(':memory:');
db.pragma('journal_mode = WAL');

dbInit();

type TableColumns<T = string> = { [key: string]: T };

interface GenericWriteSchema {
	name: string;
	data: TableColumns;
}

interface GenericReadSchema {
	name: string;
	columns?: string[];
	where?: {
		column: string;
		value: string;
	};
}

const dbDelete = (table: GenericReadSchema) => {
	const { name, where } = table;
	const query = db
		.prepare(`DELETE FROM ${name} WHERE ${where?.column} = ?`)
		.bind(where?.value);
	query.run();
};

const dbSelect = (table: GenericReadSchema): TableColumns => {
	const { name } = table;
	const columns = table.columns ? table.columns.join(', ') : '*';
	const where = table.where ? ` WHERE ${table.where.column} = ?` : null;
	const value = table.where ? table.where.value : null;

	if (where && value) {
		const query = db
			.prepare(`SELECT ${columns} FROM ${name}${where}`)
			.bind(value as string);
		const res = query.get();
		return res as TableColumns;
	} else {
		const query = db.prepare(`SELECT ${columns} FROM ${name}`).get();
		return query as TableColumns;
	}
};

const dbUpdate = (table: GenericWriteSchema) => {
	const { data, name } = table;

	const cols = Object.keys(data).map((fn) => `${fn} = ?`);
	const vals = Object.values(data).map((fn) => fn);

	const update = db
		.prepare(
			`UPDATE ${name} SET ${cols.join(', ')} WHERE user.twitch_id = ?`
		)
		.bind(...vals, data.twitch_id);

	const res = update.run();
	return res;
};

const dbInsert = (table: GenericWriteSchema): number => {
	const { data, name } = table;
	const columns = Object.keys(data).map((fn) => fn);
	const values = Object.values(data).map((fn) => fn);

	const exists = dbSelect({
		name,
		where: { column: columns[0], value: values[0] },
	});
	if (exists && Object.keys(exists).length > 0) return 0;

	const insert = db.prepare(
		`INSERT INTO ${name} (${columns.join(', ')}) VALUES (${values.map(() => '?').join(', ')})`
	);

	const res = insert.run([...values]);
	return res.changes;
};

export const test = () => {
	dbInit(true);

	const testWrite = {
		name: 'testing',
		data: { id: '0000', twitch_id: '0123' },
	};

	const testRead = {
		name: 'testing',
		columns: ['id'],
		where: {
			column: 'twitch_id',
			value: '0123',
		},
	};

	const written = dbInsert(testWrite);
	const reader = dbSelect(testRead);

	console.assert(
		written === 1 || written === 0,
		'[T]: writer returned a non-boolean result.'
	);
	console.assert(
		reader.id === '0000',
		'[T]: reader.id returned an unexpected testing id.'
	);
};

function dbInit(test: boolean = false) {
	// testing ----------------------------------------------
	if (test && import.meta.env.DEV) {
		// delete existing test data
		const rtdb = db.prepare(`DROP TABLE testing`);
		// console.log(rtdb);
		rtdb.run();

		// build a new table for the test data
		const tdb = db.prepare(
			`CREATE TABLE IF NOT EXISTS testing (` +
				`id TEXT NOT NULL,` +
				`twitch_id TEXT NOT NULL,` +
				`PRIMARY KEY (id)` +
				`)`
		);

		// console.log(tdb);
		tdb.run();

		return;
	}
	// ------------------------------------------------------

	db.prepare(
		`CREATE TABLE IF NOT EXISTS user (` +
			`id TEXT NOT NULL PRIMARY KEY,` +
			`twitch_id TEXT NOT NULL,` +
			`login TEXT NOT NULL,` +
			`display_name TEXT NOT NULL,` +
			`profile_image_url NOT NULL,` +
			`access TEXT NOT NULL,` +
			`refresh TEXT NOT NULL,` +
			`refresh_after TEXT NOT NULL` +
			`)`
	).run();

	db.prepare(
		`CREATE TABLE IF NOT EXISTS session (` +
			`id TEXT NOT NULL PRIMARY KEY,` +
			`expires_at INTEGER NOT NULL,` +
			`user_id TEXT NOT NULL,` +
			`FOREIGN KEY (user_id) REFERENCES user(id)` +
			`)`
	).run();

	db.prepare(
		`CREATE TABLE IF NOT EXISTS ttv_cache (` +
			`user_id TEXT NOT NULL PRIMARY KEY,` +
			`subs_data TEXT,` +
			`follows_data TEXT NOT NULL,` +
			`recaps_data TEXT,` +
			`channel_data TEXT,` +
			`created_at TEXT NOT NULL,` +
			`FOREIGN KEY (user_id) REFERENCES user(id)` +
			`)`
	).run();
}

export { db, dbSelect, dbInsert, dbUpdate, dbInit, dbDelete };
