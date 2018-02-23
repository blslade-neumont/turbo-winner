

export function lerp(from : number, to : number, perc : number): number {
    let t : number = perc < 0.0 ? 0.0 : (perc > 1.0 ? 1.0 : perc);
    return (from * (1-t)) + (to*t);
}
