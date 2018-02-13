import { Collection } from "mongodb";


export interface User {
    name: string;
    score: number;
    color: string;
}
export let Users: Collection<User>;
export function provideUsers(users: Collection<User>) {
    Users = users;
}
