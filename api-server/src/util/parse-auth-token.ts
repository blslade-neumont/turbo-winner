import { User } from '../models/user';
import { decodeJwt } from './decode-jwt';

export function parseAuthToken(authToken: string): User | null {
    let json = decodeJwt(authToken);
    if (!json) return null;
    return json;
}
