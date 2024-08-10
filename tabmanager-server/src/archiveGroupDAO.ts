import * as fs from 'node:fs';

import { ArchivedWindowGroup } from './types';
import { config } from './config';

export default class ArchiveWindowGroupDAO {

	dir: string;

	/**
	 * Keep a copy in memory for speed. We'll just keep the disk in sync.
	 */
	data: {
		[name: string]: ArchivedWindowGroup;
	} = {};

	constructor() {
		this.dir = config().dataDir + "/archiveGroups";
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

	private async writeGroup(group: ArchivedWindowGroup) {
		let file = `${this.dir}/${group.name}.json`;
		fs.promises.writeFile(file, JSON.stringify(group), 'utf8');
	}

	listGroups(): string[] {
		return Object.keys(this.data);
	}

	async createOrUpdateGroup(group: ArchivedWindowGroup) {
		this.data[group.name] = group;
		await this.writeGroup(group);
	}

	async updateGroup(name: string, group: ArchivedWindowGroup) {
		if (name !== group.name) {
			// This is a rename
			await this.deleteGroup(name);
			await this.createOrUpdateGroup(group);
		} else {
			await this.createOrUpdateGroup(group);
		}
	}

	async deleteGroup(groupName: string) {
		delete this.data[groupName];
		await fs.promises.unlink(`${this.dir}/${groupName}.json`);
	}

	getGroup(groupName: string): ArchivedWindowGroup|null {
		return this.data[groupName];
	}
}
