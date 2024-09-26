import RedisCacheWorker from '@server/cache';
import type { CacheData } from '@/lib/types';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { checkSessionLocals } from '@server/utility';

export const load: PageServerLoad = async ({ locals, fetch }) => {
    const res = await checkSessionLocals(locals, fetch);
    const body = await res.json();

    if (!res.ok) {
        console.error('[!] Err: ', body);
        redirect(302, body.location);
    }

    const worker = new RedisCacheWorker({});
    let cached = await worker.readData<CacheData>(body.id);
    const hasAuth = await worker.readTempAuth(body.id);

    if ((!cached || !cached.data.recaps) && !hasAuth) {
        worker.close();
        redirect(302, '/access');
    }

    if (hasAuth && (!cached || !cached.data.recaps)) {
        const res = await fetch('/api/generate?type=recaps', {
            method: 'GET',
        });

        const written = await res.json();
        if (written.error) {
            worker.close();
            redirect(302, '/?err=issue%20fetching%20recaps');
        }

        cached = await worker.readData<CacheData>(body.id) as CacheData; // just assume the data is cached
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
