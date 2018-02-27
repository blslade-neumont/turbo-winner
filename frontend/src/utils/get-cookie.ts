

export function getCookie(name: string): string | null {
    let cookieValue = '; ' + document.cookie;
    let parts = cookieValue.split(`; ${name}=`);
    if (parts.length === 2) return parts[1].split(';')[0];
    return null;
}
