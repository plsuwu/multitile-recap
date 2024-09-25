import type { FollowsData } from '$lib/types';
import { totalPages } from '$lib/stores';

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

	const fpage = Math.max(0, Math.floor(bcs.length / pageLen - 1));
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

	totalPages.set(paginated.length);
	return paginated;
};
//  --------------------------

// return more accurate results by slicing haystack into windows with size of needle.length
const getMinDistance = (needle: string, haystack: string): number => {
	if (needle.length > haystack.length) {
		return damerauLevenshtein(needle, haystack);
	}

	let minDistance = Infinity;
	for (let i = 0; i <= haystack.length; ++i) {
		const substr = haystack.slice(i, i + needle.length);
		const distance = damerauLevenshtein(needle, substr);
		minDistance = Math.min(minDistance, distance);
	}

	return minDistance;
};

// Damerau-Levenshtein distance algorithm
const damerauLevenshtein = (source: string, target: string): number => {
	const matrix: number[][] = [];

	for (let i = 0; i <= source.length; ++i) {
		matrix[i] = [i];
	}
	for (let j = 0; j <= target.length; ++j) {
		matrix[0][j] = j;
	}

	for (let i = 1; i <= source.length; ++i) {
		for (let j = 1; j <= target.length; ++j) {
			const cost = source[i - 1] === target[j - 1] ? 0 : 1;
			matrix[i][j] = Math.min(
				matrix[i - 1][j] + 1, // deletion
				matrix[i][j - 1] + 1, // insertion
				matrix[i - 1][j - 1] + cost // substitution
			);

			if (
				i > 1 &&
				j > 1 &&
				source[i - 1] === target[j - 2] &&
				source[i - 2] === target[j - 1]
			) {
				matrix[i][j] = Math.min(
					matrix[i][j],
					matrix[i - 2][j - 2] + cost // transposition
				);
			}
		}
	}

	return matrix[source.length][target.length];
};

// normalize the matching distance scale
const normalized = (
	distance: number,
	sourceLen: number,
	targetLen: number
): number => {
	const max = Math.max(sourceLen, targetLen);
	return max === 0 ? 0 : distance / max;
};

// search handler function
export function search(haystack: FollowsData[], needle: string): any[] {
	const maxDistance = 1;
	const res = haystack
		.map((broadcaster) => {
			const distance = getMinDistance(
				needle.toLowerCase(),
				broadcaster.broadcaster_name.toLowerCase()
			);
			const sim =
				1 -
				normalized(
					distance,
					needle.length,
					broadcaster.broadcaster_name.length
				);

			return { broadcaster, distance, sim };
		})
		.filter((r) => r.distance <= maxDistance)
		.filter((r) => r.sim > 0.5)
		.sort((a, b) => b.sim - a.sim);

	return [...res.map((r) => r.broadcaster)];
}
