import { Icon } from '../types';
import FileDAO from '../fileDAO';

export default class IconDAO {

	dao: FileDAO<Icon>;

	constructor() {
		this.dao = new FileDAO<Icon>('favicons');
	}

	async createOrUpdateIcon(icon: Icon) {
		return await this.dao.createOrUpdateEntity(icon);
	}

	async deleteIcon(icon: string) {
		return await this.dao.deleteEntity(icon);
	}

	getIcon(icon: string): Icon|null {
		return this.dao.getEntity(icon);
	}
}
