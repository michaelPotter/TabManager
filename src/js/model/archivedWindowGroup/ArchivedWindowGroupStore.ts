import { observable, action, makeObservable } from "mobx";
import { ArchivedWindowGroup } from "./ArchivedWindowGroup";
import ArchivedWindowGroupDAO from "./ArchivedWindowGroupDAO";
import { ArchivedWindowGroupExport } from "./ExportedArchivedWindowGroup";
import { cyrb53 } from "../../util";
import _ from 'lodash';

class ArchivedWindowGroupStore {
	archivedWindowGroups: ArchivedWindowGroup[] = [];
	dao: ArchivedWindowGroupDAO;

	constructor() {
		makeObservable(this, {
			archivedWindowGroups: observable,
			addAWG: action,
			deleteAWG: action,
			renameAWG: action,
			sortAWGS: action
		});

		this.dao = new ArchivedWindowGroupDAO(this);
		this.dao.getAllGroups()
			.then(action(awgs => this.archivedWindowGroups = awgs))
			.then(this.sortAWGS);
	}

	addAWG = (awg: ArchivedWindowGroup) => {
		this.archivedWindowGroups.push(awg);
		this.sortAWGS();
		return this.dao.createOrUpdateGroup(awg);
	}

	deleteAWG = (name: string) => {
		this.archivedWindowGroups = this.archivedWindowGroups.filter(awg => awg.name !== name);
		return this.dao.deleteGroup(name);
	}

	renameAWG = (oldName: string, newName: string) => {
		let wg = this.archivedWindowGroups.find(wg => wg.name === oldName);
		if (wg) {
			wg.name = newName;
			return this.dao.renameGroup(oldName, newName);
		} else {
			console.warn("Could not find window group to rename: ", oldName);
		}
	}

	getExportData = () => {
		return ArchivedWindowGroupDAO.toExportFormat(this.archivedWindowGroups);
	}

	importFromData = (data: ArchivedWindowGroupExport) => {
		let newGroups = ArchivedWindowGroupDAO.fromExportFormat(data);

		let existingNames = this.archivedWindowGroups.map(group => group.name);

		newGroups.forEach(group => {
			if (existingNames.includes(group.name)) {
				let existing = this.archivedWindowGroups.find(g => g.name === group.name);
				let existingClean = ArchivedWindowGroupDAO.fromExportFormat(
					ArchivedWindowGroupDAO.toExportFormat([existing!])
				)[0];

				let hash1 = cyrb53(JSON.stringify(existingClean, null, 2));
				let hash2 = cyrb53(JSON.stringify(group, null, 2));
				if (hash1 === hash2) {
					// skip because it's the same
					console.log("Skipping import of group due to equality: ", group.name);
					return;
				}

				let i = 1;
				while (existingNames.includes(group.name + " (" + i + ")")) {
					i++;
				}
				group.name = group.name + " (" + i + ")";
			}
			this.addAWG(group);
		});
	}

	/**
	 * Sorts the archived window groups by archive date, most recent first
	 */
	sortAWGS = () => {
		this.archivedWindowGroups = _.chain(this.archivedWindowGroups)
			.sortBy('archiveDate')
			.reverse()
			.value();

	}

}

export default new ArchivedWindowGroupStore();
