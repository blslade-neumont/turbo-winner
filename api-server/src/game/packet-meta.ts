

export type PlayerDetailsT = {
    x: number,
    y: number,
    color: string,
    forward: { x: number, y: number },
    accel: { x: number, y: number },
    hspeed: number,
    vspeed: number,
    health: number,
    invulnTime: number,
    isDead: boolean,
    respawnTime: number,
    ignoreAuthority: boolean,
    isDisconnected: boolean,
    timeUntilRemoval: number,
    score: number,
    targetID: number,
    displayName: string
};

export type BulletDetailsT = {
    x: number,
    y: number,
    hspeed: number,
    vspeed: number,
    ignorePlayerId: number,
};
