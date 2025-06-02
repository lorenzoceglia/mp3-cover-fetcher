export interface DiscogsResponse {
	pagination: {
		per_page: number;
		items: number;
		page: number;
		urls: { last?: string; next?: string };
		pages: number;
	};
	results: Array<{
		id: number;
		title: string;
		thumb: string;
		cover_image: string;
	}>;
}
