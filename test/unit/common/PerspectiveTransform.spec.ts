import {expect} from 'chai';
import PerspectiveTransform from '../../../src/common/PerspectiveTransform'

const EPSILON: number = 0.0001;

describe("PerspectiveTransform", () => {
    describe("testSquareToQuadrilateral", () => {
        const pt: PerspectiveTransform = PerspectiveTransform.squareToQuadrilateral(2.0, 3.0, 10.0, 4.0, 16.0, 15.0, 4.0, 9.0);
        it("should transform", () => {
            assertPointEquals(2.0, 3.0, 0.0, 0.0, pt);
        });
        it("should transform", () => {
            assertPointEquals(10.0, 4.0, 1.0, 0.0, pt);
        });
        it("should transform", () => {
            assertPointEquals(4.0, 9.0, 0.0, 1.0, pt);
        });
        it("should transform", () => {
            assertPointEquals(16.0, 15.0, 1.0, 1.0, pt);
        });
        it("should transform", () => {
            assertPointEquals(6.535211, 6.8873234, 0.5, 0.5, pt);
        });
        it("should transform", () => {
            assertPointEquals(48.0, 42.42857, 1.5, 1.5, pt);
        });
    });
    describe("testQuadrilateralToQuadrilateral", () => {
        const pt: PerspectiveTransform = PerspectiveTransform.quadrilateralToQuadrilateral(
            2.0, 3.0, 10.0, 4.0, 16.0, 15.0, 4.0, 9.0,
            103.0, 110.0, 300.0, 120.0, 290.0, 270.0, 150.0, 280.0);

        it("should transform", () => {
            assertPointEquals(103.0, 110.0, 2.0, 3.0, pt);
        });
        it("should transform", () => {
            assertPointEquals(300.0, 120.0, 10.0, 4.0, pt);
        });
        it("should transform", () => {
            assertPointEquals(290.0, 270.0, 16.0, 15.0, pt);
        });
        it("should transform", () => {
            assertPointEquals(150.0, 280.0, 4.0, 9.0, pt);
        });
        it("should transform", () => {
            assertPointEquals(7.1516876, -64.60185, 0.5, 0.5, pt);
        });
        it("should transform", () => {
            assertPointEquals(328.09116, 334.16385, 50.0, 50.0, pt);
        });
    });
});

function assertPointEquals(expectedX: number,
                           expectedY: number,
                           sourceX: number,
                           sourceY: number,
                           pt: PerspectiveTransform) {

    const points: number[] = [sourceX, sourceY];
    pt.transformPoints(points);

    expect(expectedX).to.closeTo(points[0], EPSILON);
    expect(expectedY).to.closeTo(points[1], EPSILON);
}
