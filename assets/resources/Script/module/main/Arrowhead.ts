
const {ccclass, property} = cc._decorator;

@ccclass
export default class Arrowhead extends cc.Component {
    private tag = 1;
    // onLoad () {}

    start () {
    }

    private upDown(){
        let moveUp = cc.moveTo(0.5,cc.v2(-5,55));
        let moveDown = cc.moveTo(0.5,cc.v2(-5,45));

        this.node.runAction(cc.sequence(moveUp,moveDown).repeatForever());
    }

    protected onEnable(): void {
        this.upDown();
    }

    protected  (): void {
        this.node.stopAllActions();
    }

    // update (dt) {}
}
