
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
