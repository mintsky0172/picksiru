export function pickOne<T>(arr: T[]):T | null {
    if(!arr || arr.length === 0) return null;
    const idx = Math.floor(Math.random() * arr.length);
    return arr[idx] ?? null;
}