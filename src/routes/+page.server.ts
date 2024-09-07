import { getCachedSubscriptionData } from '@/lib/server/auth';
import type { PageServerLoad } from './$types';
interface UserPageData {
	twitchId: string;
	login: string;
	displayName: string;
	profileImageUrl: string;
	ttvAccess: string;
	ttvRefresh: string;
}

interface RequestHasErrorData {
    error: {
        where: string;
        why: string;
    };
}

export const load: PageServerLoad = async (
	event
): Promise<UserPageData | RequestHasErrorData | null> => {
	const user = event.locals.user;

    // const hasError = event.cookies.get('error');
    // if (hasError) {
    //     const [where, why] = hasError.split('::');
    //     console.log(where, why);
    //
    //     return {
    //         error: {
    //             where: where,
    //             why: why
    //         }
    //     };
    // }

	if (!user) {
		return null;
	}

	return {
		twitchId: user.twitch_id,
		login: user.login,
		displayName: user.display_name,
		profileImageUrl: user.profile_image_url,
		ttvAccess: user.access,
		ttvRefresh: user.refresh
	};
};
