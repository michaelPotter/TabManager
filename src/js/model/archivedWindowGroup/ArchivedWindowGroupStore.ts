import { observable, action, makeObservable } from "mobx";
import { ArchivedWindowGroup } from "./ArchivedWindowGroup";
import ArchivedWindowGroupDAO from "./ArchivedWindowGroupDAO";

class ArchivedWindowGroupStore {
	archivedWindowGroups: ArchivedWindowGroup[] = [];

	constructor() {
		makeObservable(this, {
			archivedWindowGroups: observable,
			addAWG: action,
		});

		ArchivedWindowGroupDAO.getAll()
			.then(action(awgs => this.archivedWindowGroups = awgs));
	}

	addAWG = (awg: ArchivedWindowGroup) => {
		this.archivedWindowGroups.push(awg);
		this.#persist();
	}

	getExportData = () => {
		return ArchivedWindowGroupDAO.toExportFormat(this.archivedWindowGroups);
	}

	#persist() {
		ArchivedWindowGroupDAO.storeAllArchivedWindowGroups(this.archivedWindowGroups);
	}
}

export default new ArchivedWindowGroupStore();

