/**
 * successful `<HELIX.USER>` API request
 * @property {string} data.id
 * @property {string} data.login
 * @property {string} data.display_name
 * @property {'admin' | 'global_mod' | 'staff' | ''} data.type
 * @property {'affiliate' | 'partner' | ''} data.broadcaster_type
 * @property {string} data.description
 * @property {string} data.profile_image_url
 * @property {string} data.offline_image_url
 * @property {string} data.view_count
 * @property {string} data.created_at
 * */
export interface HelixUserData {
	data: Array<{
		id: string;
		login: string;
		display_name: string;
		type: 'admin' | 'global_mod' | 'staff' | '';
		broadcaster_type: 'affiliate' | 'partner' | '';
		description: string;
		profile_image_url: string;
		offline_image_url: string;
		view_count: string;
		created_at: string;
	}>;
}

/**
 * Successful <HELIX.FOLLOWED> API request
 * @property {string} broadcaster_id (in data array wrapper)
 * @property {string} broadcaster_login (in data array wrapper)
 * @property {string} broadcaster_name (in data array wrapper)
 * @property {string} followed_at (in data array wrapper)
 * @property {Object} pagination (wraps `cursor` field)
 * @property {string} cursor
 * @property {number} total
 * */
export interface HelixFollowedData {
	data: Array<{
		broadcaster_id: string;
		broadcaster_login: string;
		broadcaster_name: string;
		followed_at: string;
	}>;
	pagination: {
		cursor?: string;
	};
	total: number;
}

/**
 * successful `<HELIX.SUBSCRIPTION>` API request
 * @property {string} broadcaster_id
 * @property {string} broadcaster_login
 * @property {string} broadcaster_name
 * @property {string?} gifter_id
 * @property {string?} gifter_login
 * @property {string?} gifter_name
 * @property {boolean} is_gift
 * @property {'1000' | '2000' | '3000'} tier
 * */
export interface HelixSubscriptionData {
	data: Array<{
		broadcaster_id: string;
		broadcaster_login: string;
		broadcaster_name: string;
		gifter_id?: string;
		gifter_login?: string;
		gifter_name?: string;
		is_gift: boolean;
		tier: '1000' | '2000' | '3000';
	}>;
}

/**
 * successful `<HELIX.BADGES>` API request
 * @property {string} set_id
 * @property {Object[]} versions
 * @property {string} id
 * @property {string} image_url_1x
 * @property {string} image_url_2x
 * @property {string} image_url_4x
 * @property {string} title
 * @property {string} description
 * @property {string?} click_action
 * @property {string?} click_url
 * */
export interface HelixBadgeData {
	data: Array<{
		set_id: string;
		versions: Array<{
			id: string;
			image_url_1x: string;
			image_url_2x: string;
			image_url_4x: string;
			title: string;
			description: string;
			click_action?: string;
			click_url?: string;
		}>;
	}>;
}

/**
 * successful `<HELIX.COLOR>` API request
 * @property {string} user_id
 * @property {string} user_login
 * @property {string} user_name
 * @property {string} color
 * */
export interface HelixColorData {
	data: Array<{
		user_id: string;
		user_login: string;
		user_name: string;
		color: string;
	}>;
}
