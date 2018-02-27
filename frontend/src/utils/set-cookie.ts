import { deleteCookie } from './delete-cookie';

export function setCookie(name: string, value: string | null) {
    if (!value) deleteCookie(name);
    else document.cookie = `${name}=${value}; Path=/;`;
}
