export type MusicBrainzRecording = {
	id: string;
	title: string;
	disambiguation?: string;
	artist_credit: {
		name: string;
		artist: {
			id: string;
			name: string;
			sort_name: string;
		};
	}[];
	releases?: {
		id: string;
		title: string;
		status?: string;
		date?: string;
		country?: string;
		"release-group"?: {
			id: string;
			type?: string;
		};
	}[];
};

export type MusicBrainzResponse = {
	created: string;
	count: number;
	offset: number;
	recordings: MusicBrainzRecording[];
};
