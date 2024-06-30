
export type ArchivedWindowGroup = {
	name: string;
	windows: ArchivedWindow[];
	archiveDate: Date;
}

export type ArchivedWindow = {
	name: string;
	tabs: ArchivedTab[];
}

export type ArchivedTab = {
	title: string;
	url: string;
}
