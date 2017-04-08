export function bitCount(i: number): number {
    i = i - ((i >>> 1) & 0x55555555);
    i = (i & 0x33333333) + ((i >>> 2) & 0x33333333);
    i = (i + (i >>> 4)) & 0x0f0f0f0f;
    i = i + (i >>> 8);
    i = i + (i >>> 16);
    return i & 0x3f;
}

/**
 * {@link https://docs.oracle.com/javase/jp/8/docs/api/java/lang/System.html#arraycopy-java.lang.Object-int-java.lang.Object-int-int-}
 */
export function arraycopy(src: any[], srcPos: number, dest: any[], destPos: number, length: number) {
    if (src == null || dest == null) {
        throw new Error("src and dest array should not be null.")
    }
    const slicedSrc = src.slice(srcPos, srcPos + length);

    for (let i = 0; i < slicedSrc.length; i++) {
        dest[destPos + i] = slicedSrc[i];
    }
}

/**
 * @param pattern1 first pattern
 * @param pattern2 second pattern
 * @return distance between two points
 */
export function distance(pattern1: {x: number, y: number}, pattern2: {x: number, y: number}) {
    const xDiff = pattern1.x - pattern2.x;
    const yDiff = pattern1.y - pattern2.y;
    return Math.sqrt((xDiff * xDiff + yDiff * yDiff));
}

/**
 * Ends up being a bit faster than {@link Math#round(float)}. This merely rounds its
 * argument to the nearest int, where x.5 rounds up to x+1. Semantics of this shortcut
 * differ slightly from {@link Math#round(float)} in that half rounds down for negative
 * values. -2.5 rounds to -3, not -2. For purposes here it makes no difference.
 *
 * @param d real value to round
 * @return nearest {@code int}
 */
export function round(d: number): number {
    return Math.floor(d + (d < 0.0 ? -0.5 : 0.5));
}

/// <summary> Returns the z component of the cross product between vectors BC and BA.</summary>
export function crossProductZ(pointA, pointB, pointC) {
    const bX = pointB.x;
    const bY = pointB.y;
    return ((pointC.x - bX) * (pointA.y - bY)) - ((pointC.y - bY) * (pointA.x - bX));
}
