<script lang="ts">
    export let e: string | undefined;
    $: error = parseError(e);

    function parseError(error: string | undefined) {
        if (!error) {
            return '';
        }

        switch (error) {
            case 'missing%20credentials':
                return 'Missing or invalid credentials. Maybe try logging out and back in?';

            case 'csrf%20mismatch':
                return 'CSRF token set by client did not match the token returned by Twitch. Maybe try logging out and back in?';

            case 'already%20revoked':
                return 'Token was already invalid.';

            case 'client_id%20not%20found':
                return 'The server\'s Client ID could not be found by Twitch.';

            case 'remote%20unknown%20response':
                return 'The Twitch API returned an undocumented response status code. Try again later.';

            case 'issue%20fetching%20recaps':
                return 'Issue fetching channel recaps. Maybe try logging out and back in?';

            case 'issue%20fetching%20follows':
                return 'Issue fetching followed channels.';

            case 'OAuth2RequestError':
                return 'OAuth Request Error.';

            case 'unhandled%20error':
                return 'Unknown internal error.';

            default:
                // this param should be sanitized
                if (error.includes('wait')) {
                    // matchAll(/some regex/) ...
                    const timer = error.split('%20')[0].split(' ')[1];
                    return `Refresh unavailable for another ${timer} seconds.`;
                }

            return `?? An unknown error occurred.`;
        }

    }


</script>

<div class=''>
    {error}
</div>
