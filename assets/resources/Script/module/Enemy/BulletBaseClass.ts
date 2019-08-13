/**
 * creator: yisha
 */

export interface BulletBase<T extends BulletBaseClass> {
    new():T;

}

const {ccclass, property} = cc._decorator;

@ccclass
export default class BulletBaseClass extends cc.Component {


    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
