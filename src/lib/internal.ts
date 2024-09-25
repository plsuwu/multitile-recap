const handleRefresh = async () => {
    const res = await fetch('/api/refresh/data', {
        method: 'GET',
    });

    const body = await res.json()
    if (body.error) {
        console.error('[!] Couldn\'t refresh data:', body.message);
        if (res.status == 401) {
            console.log('BODY TIMEOUT:', body.timeout);
            body.location = `wait%20${body.timeout}`;
        } else {
            body.location = 'issue%20during%20refresh';
        }
    }

    return body;
}

export { handleRefresh };
