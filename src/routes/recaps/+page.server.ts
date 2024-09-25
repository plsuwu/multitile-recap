import RedisCacheWorker from '@server/cache';
import type { CacheData } from '@/lib/types';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { checkSessionLocals } from '@server/utility';

export const load: PageServerLoad = async ({ locals, fetch }) => {
    const res = await checkSessionLocals(locals, fetch);
    const body = await res.json();

    if (!res.ok) {
        redirect(300, body.location);
    }

    const worker = new RedisCacheWorker({});
    let cached = await worker.readData<CacheData>(body.id);
    const hasAuth = await worker.readTempAuth(body.id);

    if ((!cached || !cached.data.recaps) && !hasAuth) {
        worker.close();
        redirect(302, '/access');
    }


    if (cached && cached.data.recaps) {
        const { following, subscriptions, recaps } = cached.data;
        if (following && subscriptions && recaps && hasAuth) {
            console.warn('[*] Recaps data ok - purging associated user\'s global auth.');
            await worker.deleteAuth(body.id);
        }

        worker.close();
        const display_name = locals.user?.display_name;
        return {
            display_name,
            subs: subscriptions,
            follows: following,
            recaps: recaps,
            error: false,
            message: null,
        };
    }

};
