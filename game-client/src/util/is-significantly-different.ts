

export function isSignificantlyDifferent(lhs: number, rhs: number, threshold = .001): boolean {
    return Math.abs(lhs - rhs) - threshold >= 0;
}
