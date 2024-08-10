export type AppConfig = {
	port: number;
	dataDir: string;
}

export type ArchivedWindowGroup = {
	name: string;
	windows: any[];
	archiveDate: Date;
}

// TODO change to Map probably
export type ArchivedWindowGroupServerData = {
	[name: string]: ArchivedWindowGroup;
}
