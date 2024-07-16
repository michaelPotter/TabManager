import { observable, action, makeObservable } from "mobx";
import { ArchivedWindowGroup } from "./ArchivedWindowGroup";
import ArchivedWindowGroupDAO from "./ArchivedWindowGroupDAO";

class ArchivedWindowGroupStore {
	archivedWindowGroups: ArchivedWindowGroup[] = [];

	constructor() {
		makeObservable(this, {
			archivedWindowGroups: observable,
			addAWG: action,
			importFromData: action,
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

	deleteAWG = (name: string) => {
		this.archivedWindowGroups = this.archivedWindowGroups.filter(awg => awg.name !== name);
		this.#persist();
	}

	importFromData = (data: any) => {
		this.archivedWindowGroups = ArchivedWindowGroupDAO.fromExportFormat(data);
		this.#persist();
	}

	#persist() {
		ArchivedWindowGroupDAO.storeAllArchivedWindowGroups(this.archivedWindowGroups);
	}
}

export default new ArchivedWindowGroupStore();

