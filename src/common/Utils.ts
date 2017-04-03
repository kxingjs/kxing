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
