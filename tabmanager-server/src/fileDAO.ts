import * as fs from 'node:fs';

import { config } from './config';

interface Nameable {
	name: string;
}

/**
 * A reusable DAO for reading and writing name based entities to disk.
 */
export default class FileDAO<T extends Nameable> {

	dir: string;

	/**
	 * Keep a copy in memory for speed. We'll just keep the disk in sync.
	 */
	data: {
		[name: string]: T;
	} = {};

	constructor(storageDirName: string) {
		this.dir = config().dataDir + `/${storageDirName}`;
		fs.mkdirSync(this.dir, { recursive: true });
		this.loadFromDisk();
	}

	private async loadFromDisk() {
		let files = await fs.promises.readdir(this.dir);

		let promises = files.map(async file => {
			let name = file.replace(/\.json$/, '');
			let fileData = await fs.promises.readFile(`${this.dir}/${file}`, 'utf8')
			try {
				this.data[name] = JSON.parse(fileData);
			} catch (e) {
				throw new Error(`Error parsing ${file}`, {cause: e});
			}
		});

		await Promise.all(promises);
	}

	private async writeEntity(entity: T) {
		let file = `${this.dir}/${entity.name}.json`;
		fs.promises.writeFile(file, JSON.stringify(entity), 'utf8');
	}

	////////////////////////////////////////////////////////////////////////
	//                               PUBLIC                               //
	////////////////////////////////////////////////////////////////////////

	listEntities(): string[] {
		return Object.keys(this.data);
	}

	async createOrUpdateEntity(entity: T) {
		this.data[entity.name] = entity;
		await this.writeEntity(entity);
	}

	async updateEntity(name: string, entity: T) {
		if (name !== entity.name) {
			// This is a rename
			await this.deleteEntity(name);
			await this.createOrUpdateEntity(entity);
		} else {
			await this.createOrUpdateEntity(entity);
		}
	}

	async deleteEntity(entityName: string) {
		delete this.data[entityName];
		await fs.promises.unlink(`${this.dir}/${entityName}.json`);
	}

	getEntity(entityName: string): T|null {
		return this.data[entityName];
	}
}
