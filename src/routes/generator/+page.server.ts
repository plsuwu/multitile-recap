import type { PageServerLoad } from "../$types";
import { redirectErrorConstructor } from "$lib/server/error_constructor";
import { getCachedTTVData } from "@/lib/server/auth";

export const load: PageServerLoad = async (event) => {
	const user = event.locals.user;

	if (!user) {
        const reason = 0;
        redirectErrorConstructor(reason, event);
        return;
    }

    let cached = getCachedTTVData(user.id);

    const getLocalSubdata = async () => {
        setTimeout(() => {
             cached = getCachedTTVData(user.id);

            if (!cached) {
                getLocalSubdata();
            }
        }, 500);

    }

    if (!cached || cached == null) {
        await getLocalSubdata();
    }

    return {

        // these ARE NOT null
        subs: cached?.subs,
        follows: cached?.follows,
    };
};

