import type { FollowsData } from '$lib/types';

export function formatIndex(index: number, total: number): string {
	let res: string = (index + 1).toString();
	const digits = total.toString().length;

	if (res.length < digits) {
		res = res.padStart(digits, '0');
	}

	return res;
}

//  --------------------------
export const paginate = (
	bcs: FollowsData[],
	pageLen: number = 25
): FollowsData[][] => {
	if (!bcs || bcs.length < 1) {
		return [[]];
	}

	const fpage = Math.max(0, Math.floor(bcs.length / pageLen));
	let paginated: FollowsData[][] = [];

	for (let i = 0; i < bcs.length / pageLen; ++i) {
		let page: FollowsData[] = bcs.slice(i * pageLen, i * pageLen + pageLen);
		paginated.push(page);
	}

	const last: number = paginated[fpage].length;
	const first: number = paginated[0].length;

	if (last < first) {
		paginated[fpage].length = first;
		paginated[fpage].fill(
			{
				broadcaster_name: '',
				broadcaster_id: '',
				broadcaster_login: '',
				followed_at: '',
			},
			last,
			first
		);
	}

	return paginated;
};

export function followAge(followedAt: string) {}
