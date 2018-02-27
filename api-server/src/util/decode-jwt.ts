import * as decode_jwt from 'jwt-decode';

export function decodeJwt(token: string): any {
    try {
        return decode_jwt(token);
    }
    catch (e) {
        return null;
    }
}
