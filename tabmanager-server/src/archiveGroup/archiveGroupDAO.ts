import { ArchivedWindowGroup } from '../types';
import FileDAO from '../fileDAO';

export default class ArchiveWindowGroupDAO {

	dao: FileDAO<ArchivedWindowGroup>;

	constructor() {
		this.dao = new FileDAO<ArchivedWindowGroup>('archiveGroups');
	}

	listGroups(): string[] {
		return this.dao.listEntities();
	}

	async createOrUpdateGroup(group: ArchivedWindowGroup) {
		return await this.dao.createOrUpdateEntity(group);
	}

	async updateGroup(name: string, group: ArchivedWindowGroup) {
		return await this.dao.updateEntity(name, group);
	}

	async deleteGroup(groupName: string) {
		return await this.dao.deleteEntity(groupName);
	}

	getGroup(groupName: string): ArchivedWindowGroup|null {
		return this.dao.getEntity(groupName);
	}
}
