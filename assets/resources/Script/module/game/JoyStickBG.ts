import Enemy from "../Enemy/Enemy";
import {EnemyManager} from "../../manager/EnemyManager";
import {PlayerManager} from "../../manager/PlayerManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class JoyStickBG extends cc.Component {

    @property(cc.Sprite)
    dot: cc.Sprite = null;

    @property(cc.Sprite)
    player: cc.Sprite = null;

    public _angle = 0;
    private _radian = 0;
    public _speed: number = 0;          //实际速度
    private _speed1: number = 3.2;         //一段速度
    private _speed2: number = 6.4;         //二段速度
    private _opacity: number = 0;      //透明度
    private _width: number = 0; // 屏幕的宽度
    private _height: number = 0; // 屏幕的高度
    private _topHeight:number = 0; // 顶高
    private _bottomHeight:number = 0; // 底线

    private _initTouchEvent() {
        this.node.on(cc.Node.EventType.TOUCH_START, this._touchStartEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._touchMoveEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._touchEndEvent, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._touchEndEvent, this);
    }

    private _touchStartEvent(event) {
        // 获取触摸位置的世界坐标转换成圆圈的相对坐标（以圆圈的锚点为基准）
        let touchPos = this.node.convertToNodeSpaceAR(event.getLocation());
        // 触摸点与圆圈中心的距离
        let distance = this._getDistance(touchPos, cc.v2(0, 0));
        //圆圈半径
        var radius = this.node.width / 2;
        var posX = this.node.getPosition().x + touchPos.x;
        var posY = this.node.getPosition().y + touchPos.y;
        //手指在圆圈内触摸,控杆跟随触摸点
        if (radius > distance) {
            this.dot.node.setPosition(cc.v2(posX, posY));
            return true;
        }
        return false;
    }

    private _touchMoveEvent(event) {
        PlayerManager.getInstance().isMove = true;
        let touchPos = this.node.convertToNodeSpaceAR(event.getLocation());
        let distance = this._getDistance(touchPos, cc.v2(0, 0));
        let radius = this.node.width / 2;
        let posX = this.node.getPosition().x + touchPos.x;
        let posY = this.node.getPosition().y + touchPos.y;
        if (radius > distance) {
            this.dot.node.setPosition(cc.v2(posX, posY));
        } else {
            let x = this.node.getPosition().x + Math.cos(this._getRadian(cc.v2(posX, posY))) * radius;
            let y = this.node.getPosition().y + Math.sin(this._getRadian(cc.v2(posX, posY))) * radius;
            this.dot.node.setPosition(cc.v2(x, y));
        }
        this._getAngle(cc.v2(posX, posY));
        this._setSpeed(cc.v2(posX, posY));
    }

    private _touchEndEvent(event) {
        PlayerManager.getInstance().isMove = false;
        // console.log("touchEnd isMove",PlayerManager.getInstance().isMove);
        this.dot.node.setPosition(this.node.getPosition());
        this._speed = 0;
    }

    public _getDistance(pos1, pos2) {
        return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
    }

    /*角度/弧度转换
   角度 = 弧度 * 180 / Math.PI
   弧度 = 角度 * Math.PI / 180*/

    //计算弧度并返回
    public _getRadian(point) {
        this._radian = Math.PI / 180 * this._getAngle(point);
        return this._radian;
    }

    //计算角度并返回
    public _getAngle(point) {
        var pos = this.node.getPosition();
        this._angle = Math.atan2(point.y - pos.y, point.x - pos.x) * (180 / Math.PI);
        PlayerManager.getInstance().angle = this._angle;
        return this._angle;
    }

    //设置实际速度
    public _setSpeed(point) {
        //触摸点和遥控杆中心的距离
        var distance = this._getDistance(point, this.node.getPosition());

        let radius = this.node.width / 2;

        //如果半径
        if (distance < radius) {
            this._speed = this._speed1;
        } else {
            this._speed = this._speed2;
        }
    }

    private _allDirectionsMove() {
        this.player.node.x += Math.cos(this._angle * (Math.PI / 180)) * this._speed * PlayerManager.getInstance().reduceSpeed * PlayerManager.getInstance().controlX;
        if (this.player.node.x < -this._width / 2+this.player.node.width/2) {
            this.player.node.x = -this._width / 2+this.player.node.width/2;
        } else if (this.player.node.x > (this._width / 2 - this.player.node.width/2-32)) {
            this.player.node.x = this._width / 2 - this.player.node.width/2-32;
        }
        this.player.node.y += Math.sin(this._angle * (Math.PI / 180)) * this._speed * PlayerManager.getInstance().reduceSpeed * PlayerManager.getInstance().controlY;
        if (this.player.node.y < -this.player.node.parent.height/2+this.player.node.height/2) {
            // let nodePos = this.player.node.parent.convertToNodeSpaceAR(cc.v2(0, 550));
            this.player.node.y = -this.player.node.parent.height/2+this.player.node.height/2;
        }else if(this.player.node.y > this.player.node.parent.height/2-this.player.node.height/2){
            this.player.node.y = this.player.node.parent.height/2-this.player.node.height/2;
        }
        let swordNode = this.player.node.getChildByName("sword");
        let worldPos = this.player.node.convertToWorldSpaceAR(swordNode.getPosition());
        let canvasPos = cc.find("Canvas").convertToNodeSpaceAR(worldPos);
        PlayerManager.getInstance().swordPos = canvasPos;
        EnemyManager.getInstance().playerNode = this.player.node;
    }

    onLoad() {
    }

    start() {
        this._initTouchEvent();
        this._width = cc.director.getScene().getChildByName("Canvas").getChildByName("realWall").width;
        this._height = cc.director.getScene().getChildByName("Canvas").getChildByName("realWall").height;
        this._topHeight = 1670;
        this._bottomHeight = 450;
    }

    update(dt) {
        this._allDirectionsMove();
    }
}
