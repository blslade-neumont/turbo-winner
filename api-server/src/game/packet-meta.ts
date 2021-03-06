

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
    displayName: string,
    attackers: Array<{id: number, timer: number}>,
    accelerationMultiplier: number
};

export type BulletDetailsT = {
    x: number,
    y: number,
    hspeed: number,
    vspeed: number,
    ignorePlayerId: number,
};

export type BlockTypeT = 'boulder' | 'palm-tree';

export type BlockDetailsT = {
    x: number,
    y: number,
    radius: number,
    type: BlockTypeT
};

export type WorldDetailsT = {
    blocks: BlockDetailsT[]
};
