import { log } from '$logging';
import { pg } from '$server/postgres/postgres';
import type { UserInsert } from '$types';
import type {
    HelixColorData,
    HelixUserData,
    HelixSubscriptionData,
} from '$types/helix/api-response-types';
import { HELIX } from './utils';

export const hx = {
    user: async (headers: Headers, userId?: string): Promise<HelixUserData> => {
        let uri = HELIX.USER;
        if (userId) {
            uri += `?id=${userId}`;
        }

        const response = await fetch(uri, {
            method: 'GET',
            headers: headers,
        });

        return await response.json();
    },

    colors: async (
        headers: Headers,
        userId: string,
    ): Promise<HelixColorData> => {
        const response = await fetch(`${HELIX.COLOR}?user_id=${userId}`, {
            method: 'GET',
            headers: headers,
        });

        return await response.json();
    },

    fetchUserAndColor: async (
        headers: Headers,
        userId?: string,
    ): Promise<UserInsert> => {
        try {
            const userBody = await hx.user(headers, userId);
            const colorBody = await hx.colors(headers, userBody.data[0].id);
            const userInsert: UserInsert = {
                id: userBody.data[0].id,
                login: userBody.data[0].login,
                display_name: userBody.data[0].display_name,
                description: userBody.data[0].description,
                profile_image_url: userBody.data[0].profile_image_url,
                created_at: userBody.data[0].created_at,
                color: colorBody.data[0].color,
                last_sync: new Date(),
            };
            return userInsert;
        } catch (err) {
            throw err;
        }
    },

    subscription: async (
        id: { user: string; broadcaster: string },
        headers: Headers,
    ): Promise<HelixSubscriptionData | null> => {
        const response = await fetch(
            `${HELIX.SUBSCRIPTIONS}?user_id=${id.user}&broadcaster_id=${id.broadcaster}`,
            {
                method: 'GET',
                headers: headers,
            },
        );

        if (response.status === 404) {
            return null;
        }

        return await response.json();
    },
};
