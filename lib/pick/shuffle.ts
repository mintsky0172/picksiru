/**
 * 피셔-예이츠 셔플
 * 배열을 제자리에서 섞음
 */
export function shuffleInPlace<T>(arr: T[], rng: () => number = Math.random): T[] {
    for(let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * 원본을 보존하고 싶은 경우 사용(새 배열 반환)
 */
export function shuffle<T>(arr: readonly T[], rng: () => number = Math.random): T[] {
    const copy = [...arr];
    return shuffleInPlace(copy, rng);
}

/**
 * 셔플 기반으로 1개 뽑기(원본 보호)
 * - 매번 섞고 첫 번째를 반환
 */

export function pickOneShuffled<T>(arr: readonly T[], rng: () => number = Math.random): T | null {
    if(!arr || arr.length === 0) return null;
    const [first] = shuffle(arr,rng);
    return first ?? null;
}