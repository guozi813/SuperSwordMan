import JoyStickBG from "./JoyStickBG";
import {PlayerManager} from "../../manager/PlayerManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Game extends cc.Component {

    @property(cc.Sprite)
    dot:cc.Sprite = null;

    @property(cc.Sprite)
    ring:cc.Sprite =null;

    @property(cc.Sprite)
    player:cc.Sprite = null;

    @property({displayName:"摇杆类型（是否跟随）"})
    isFollow:boolean = false;

    @property({displayName:"摇杆x位置"})
    private stickX:number = 0; // 摇杆X位置
    @property({displayName:"摇杆y位置"})
    private stickY:number = 0; // 摇杆Y位置
    private _touchLocation:cc.Node = null; // 世界坐标：摇杆当前位置
    private _stickPos:cc.Vec2 = null; // 当前节点：摇杆当前位置
    private joyStickBG:JoyStickBG;

    onLoad () {
        this._createStickSprite();
        if( this.isFollow ){
            this._initTouchEvent();
        }
    }

    private _initTouchEvent(){
        let self = this;
        self.node.on(cc.Node.EventType.TOUCH_START, self._touchStartEvent, self);

        self.node.on(cc.Node.EventType.TOUCH_MOVE, self._touchMoveEvent, self);

        // 触摸在圆圈内离开或在圆圈外离开后，摇杆归位，player速度为0
        self.node.on(cc.Node.EventType.TOUCH_END, self._touchEndEvent,self);
        self.node.on(cc.Node.EventType.TOUCH_CANCEL, self._touchEndEvent,self);
    }

    private _touchStartEvent(event){
        // 显示摇杆
        this.ring.node.active = true;
        this.dot.node.active = true;

        this._touchLocation = event.getLocation(); // 世界坐标
        let touchPos = this.node.convertToNodeSpaceAR(event.getLocation());
        // 更改摇杆的位置
        this.ring.node.setPosition(touchPos);
        this.dot.node.setPosition(touchPos);
        this._stickPos = touchPos; // 当前节点坐标系的坐标
    }

    // 触摸移动事件
    private _touchMoveEvent(event){
        PlayerManager.getInstance().isMove = true;
        if( this._touchLocation.x == event.getLocation().x && this._touchLocation.y == event.getLocation().y ){
            return false;
        }
        // 以圆圈为锚点获取触摸点坐标
        let touchPos = this.ring.node.convertToNodeSpaceAR(event.getLocation());
        let distance = this.joyStickBG._getDistance(touchPos,cc.v2(0,0));
        let radius = this.ring.node.width/2;

        var posX = this._stickPos.x + touchPos.x;
        var posY = this._stickPos.y + touchPos.y;

        if( radius > distance ){
            this.dot.node.setPosition(cc.v2(posX,posY));
        }else{
            var x = this._stickPos.x + Math.cos(this.joyStickBG._getRadian(cc.v2(posX,posY))) * radius;
            var y = this._stickPos.y + Math.sin(this.joyStickBG._getRadian(cc.v2(posX,posY))) * radius;
            this.dot.node.setPosition(cc.v2(x, y));
        }

        //更新角度
        this.joyStickBG._getAngle(cc.v2(posX,posY));
        //设置实际速度
        this.joyStickBG._setSpeed(cc.v2(posX,posY));
    }

    private _touchEndEvent(){

        PlayerManager.getInstance().isMove = false;

        // 隐藏摇杆
        this.ring.node.active = false;
        this.dot.node.active = false;

        // this.dot.setPosition(this.ring.node.getPosition());
        this._createStickSprite();
        this.joyStickBG._speed = 0;
    }

    // 调整摇杆的位置
    private _createStickSprite():void{
        this.ring.node.setPosition(this.stickX,this.stickY);
        this.dot.node.setPosition(this.stickX,this.stickY);
    }

    start () {
        this.joyStickBG = this.ring.node.getComponent("JoyStickBG");
    }

    protected onDisable(): void {
        this.node.off("touchmove");
    }

    // update (dt) {}
}
