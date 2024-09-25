import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { checkSessionLocals } from '@server/utility';
import RedisCacheWorker from '@server/cache';
import type { CacheData, } from '$lib/types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
    const res = await checkSessionLocals(locals, fetch);
    const body = await res.json();

    if (!res.ok) {
        console.error('[!] Err: ', body);
        redirect(300, body.location);
    }

    const worker = new RedisCacheWorker({});
    let cached = await worker.readData<CacheData>(body.id);

    if (!cached || !cached.data.following) {
        const cacheRes = await fetch('/api/generate?type=base', {
            method: 'GET',
        });

        const cacheResJson = await cacheRes.json();
        if (cacheResJson.error) {
            worker.close();
            redirect(300, '/?err=issue%20fetching%20follows');
        }

        cached = await worker.readData<CacheData>(body.id) as CacheData;
    }

    worker.close();
    const { following, subscriptions } = cached.data;
    return {
        subscriptions,
        following,
    };
};
