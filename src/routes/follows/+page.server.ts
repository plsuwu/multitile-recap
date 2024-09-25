import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { checkSessionLocals } from '@server/utility';
import RedisCacheWorker from '@server/cache';
import type { CacheData, } from '$lib/types';

export const load: PageServerLoad = async ({ locals, fetch }) => {
    const res = await checkSessionLocals(locals, fetch);
    const body = await res.json();

    if (!res.ok) {
        redirect(300, body.location);
    }

    const worker = new RedisCacheWorker({});
    const cached = await worker.readData<CacheData>(body.id);
    worker.close();

    if (!cached || !cached.data.following) {
        const cacheRes = await fetch('/api/generate?type=base', {
            method: 'GET',
        });

        if (!cacheRes.ok) {
            const cacheOk = await cacheRes.json();
             return {
                 error: cacheOk,
             }
        }
    }

    const { following, subscriptions } = (cached as CacheData).data;
    return {
        subscriptions,
        following,
    };
};
