import { ActiveWindowGroup } from '../types';
import FileDAO from '../fileDAO';

export default class ActiveWindowGroupDAO {

	dao: FileDAO<ActiveWindowGroup>;

	constructor() {
		this.dao = new FileDAO<ActiveWindowGroup>('activeGroups');
	}

	listGroups(): string[] {
		return this.dao.listEntities();
	}

	async createOrUpdateGroup(group: ActiveWindowGroup) {
		return await this.dao.createOrUpdateEntity(group);
	}

	async updateGroup(name: string, group: ActiveWindowGroup) {
		return await this.dao.updateEntity(name, group);
	}

	async deleteGroup(groupName: string) {
		return await this.dao.deleteEntity(groupName);
	}

	getGroup(groupName: string): ActiveWindowGroup|null {
		return this.dao.getEntity(groupName);
	}
}
