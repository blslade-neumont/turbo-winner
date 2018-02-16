

export type PlayerDetailsT = {
    x: number,
    y: number,
    color: string,
    forward: { x: number, y: number },
    hspeed: number,
    vspeed: number
};


export type BulletDetailsT = {
    x: number,
    y: number,
    hspeed: number,
    vspeed: number,
    ignorePlayerId: number,
};
