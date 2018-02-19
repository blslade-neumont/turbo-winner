import { CircleT } from './circle';

export function doCirclesCollide(circleOne: CircleT, circleTwo: CircleT) {
    let diffVector: {x: number, y: number} = {x: circleOne.x - circleTwo.x, y: circleOne.y - circleTwo.y};
    let radiusSum: number = circleOne.r + circleTwo.r;
    return (diffVector.x*diffVector.x+diffVector.y*diffVector.y) < (radiusSum*radiusSum);
}
