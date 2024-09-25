const handleRefresh = async () => {
    const res = await fetch('/api/refresh/data', {
        method: 'GET',
    });

    const body = await res.json()
    if (body.error) {
        console.error('[!] Couldn\'t refresh data:', body.message);
        if (res.status == 401) {
            body.location = `wait%20${body.timeout}`;
        } else {
            body.location = 'issue%20during%20refresh';
        }
    }

    return body;
}

export { handleRefresh };

export function getRgba(color: string) {
    const hex = color.slice(1);
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    const backgroundColor = `rgba(${r}, ${g}, ${b}, 1)`;
    const darkest = Math.min(r, g, b);
    if (darkest === r) {
        r = Math.floor(r * 0.1);
        g = Math.floor(g * 0.5);
        b = Math.floor(b * 0.5);
    } else if (darkest === g) {
        r = Math.floor(r * 0.5);
        g = Math.floor(g * 0.1);
        b = Math.floor(b * 0.5);
    } else if (darkest === b) {
        r = Math.floor(r * 0.5);
        g = Math.floor(g * 0.5);
        b = Math.floor(b * 0.1);
    }

    const foregroundColor = `rgba(${r}, ${g}, ${b}, 1)`;
    return { fg: foregroundColor, bg: backgroundColor };
}

