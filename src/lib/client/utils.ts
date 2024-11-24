export function readableColor(color: string, fade: boolean = false) {
    if (color === '' || color === '#000000') {
        if (fade) {
            return { fg: 'rgba(0, 0, 0, 1)', bg: 'rgba(0, 0, 0, 0.2)' };
        }

        return { fg: 'rgba(255, 255, 255, 1)', bg: 'rgba(0, 0, 0, 0.95)' };
    }

    const hex = color.slice(1);
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    console.log(r,g,b)
    let backgroundColor;
    if (fade) {
        backgroundColor = `rgba(${r}, ${g}, ${b}, 0.2)`;
    } else {
        backgroundColor = `rgba(${r}, ${g}, ${b}, 0.55)`;
    }

    const darkest = Math.min(r, g, b);
    if (darkest === r) {
        r = Math.floor(r * 0.0);
        g = Math.floor(g * 0.3);
        b = Math.floor(b * 0.3);
    } else if (darkest === g) {
        r = Math.floor(r * 0.3);
        g = Math.floor(g * 0.0);
        b = Math.floor(b * 0.3);
    } else if (darkest === b) {
        r = Math.floor(r * 0.3);
        g = Math.floor(g * 0.3);
        b = Math.floor(b * 0.0);
    }

    const foregroundColor = `rgba(${r}, ${g}, ${b}, 1)`;
    return { fg: foregroundColor, bg: backgroundColor };
}

/**
 * creates POST-able data from a JSON-like object that can be used when the `Content-Type` header is set to
 * `application/x-www-form-urlencoded`
 * @param body - a `{ key: value }`-structure
 * @returns the data in the `body` arg as a URL-encoded string
 */
export function makeEncodedPayload(body: Record<string, any>) {
	const buffer = new Array();
	for (const prop in body) {
		let key = encodeURIComponent(prop);
		let val = encodeURIComponent(body[prop]);
		buffer.push(key + '=' + val);
	}

	return buffer.join('&');
}

