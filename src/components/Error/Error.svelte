<script lang="ts">
    export let e: string | undefined;

    $: error = parseError(e);

    console.log(e);

    function parseError(error: string | undefined) {
        if (!error) {
            return '';
        }

        switch (error) {
            case 'missing%20credentials':
                return 'Missing or invalid credentials.';

            case 'csrf%20mismatch':
                return 'CSRF token set by client did not match the token returned by Twitch.';

            case 'already%20revoked':
                return 'Token was already invalid.';

            case 'client_id%20not%20found':
                return 'The server\'s Client ID could not be found by Twitch.';

            case 'remote%20unknown%20response':
                return 'Twitch API returned an undocumented response status code.';

            case 'issue%20fetching%20recaps':
                return 'Issue fetching channel recaps.';

            case 'issue%20fetching%20follows':
                return 'Issue fetching followed channels.';

            case 'OAuth2RequestError':
                return 'OAuth Request Error.';

            case 'unhandled%20error':
                return 'Unknown internal error.';

            default:
                if (error.includes('wait')) {
                    const timer = error.split('%20')[0].split(' ')[1];
                    console.log('timer:', timer);
                    return `Refresh unavailable for another ${timer} seconds.`;
                }

            return `??`;
        }

    }


</script>

<div class=''>
    {error}
</div>
