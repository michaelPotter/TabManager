// See also ExportedArchivedWindowGroup.ts

// Used for local browser storage
export type ArchivedWindowGroupDataV1 = {
	"$schemaVersion": "v1",
	"$schemaName": "ArchivedWindowGroupsInternal",
	archivedWindowGroups: ArchivedWindowGroup[];
}
export type ArchivedWindowGroupData = ArchivedWindowGroupDataV1;

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
	favIconUrl?: string;
	url: string;
	active: boolean;
}
