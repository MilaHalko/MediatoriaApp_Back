export const urlIsValid = async (URL, timeout = 5000) => { // 5000ms timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const res = await fetch(URL, { signal: controller.signal });
        clearTimeout(timeoutId);
        return res.status >= 200 && res.status < 300;
    } catch (e) {
        console.log('URL is not valid:', URL);
        return false;
    }
}
