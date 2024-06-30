import { observable, action, makeObservable } from "mobx";
import { ArchivedWindowGroup } from "./ArchivedWindowGroup";

class ArchivedWindowGroupStore {
	archivedWindowGroups: ArchivedWindowGroup[] = [];

	construtor() {
		makeObservable(this, {
			archivedWindowGroups: observable,
			addAWG: action,
		});
	}

	async _init() {
		// TODO read from storage
	}

	addAWG = (awg: ArchivedWindowGroup) => {
		this.archivedWindowGroups.push(awg);
		this.#persist();
	}


	#persist() {
		// TODO
	}
}

export default new ArchivedWindowGroupStore();

