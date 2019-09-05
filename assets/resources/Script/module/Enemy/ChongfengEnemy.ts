import {EnemyManager} from "../../manager/EnemyManager";
import {AudioManager} from "../../manager/AudioManager";
import {PlayerManager} from "../../manager/PlayerManager";
import {TipsManager} from "../../manager/TipsManager";
import {GameManager} from "../../manager/GameManager";
import {GameUtil} from "../../manager/GameUtil";
import {ConfigManager} from "../../Configs/ConfigManager";
import {LevelConfigContainer} from "../../Configs/LevelConfigContainer";
import {SwordConfigContainer} from "../../Configs/SwordConfigContainer";
import EnemyBaseClass from "./EnemyBaseClass";
import ConstConfigContainer from "../../Configs/ConstConfigContainer";
import {LogWrap} from "../../manager/utils/LogWrap";


const {ccclass, property} = cc._decorator;

@ccclass
export default class ChongfengEnemy extends EnemyBaseClass {
    @property
    isMove: boolean = true;
    @property(cc.ProgressBar)
    bloodBar: cc.ProgressBar = null;
    @property(cc.Label)
    blood: cc.Label = null;

    public totalHp: number = 100; // 怪总血量
    private angle: number = 0; // 运动方向
    private angle2: number = 0; // 运动方向
    private controlX: number = 1; // 控制X方向
    private controlY: number = 1; // 控制Y方向
    private collider: boolean = false;// 发生碰撞
    private tickId2 = null;
    private aggressivity: number = 0;

    @property({displayName: "发动冲锋的cd"})
    private cd: number = 0.5; // 冲锋cd
    @property({displayName: "冲锋时的速度"})
    private speed2: number = 200;
    private speed: number = 20;
    private isCharge: boolean = false;// 发生碰撞
    private isFire: boolean = true;
    private  _curHp : number = 0; // 怪当前血量

    public get curHp(){
        return this._curHp
    }

    public set curHp(value){
        LogWrap.log("当前血量",value);
        this._curHp = value
    }

    // onLoad () {}

    public initData() {

        let level = GameManager.getInstance().gameData.level;
        this.totalHp = ConfigManager.getInstance().getConfigById(LevelConfigContainer, level).totalHp; // 血量
        this.curHp = this.totalHp;
        this.blood.string = String(this.totalHp);
    }

    onCollisionEnter(other, self) {
        let swordData = GameManager.getInstance().gameData.isUse; // 所持剑的数据
        if (other.node.name == "Sword") {
            if (self.tag == 200) {
                let num = GameUtil.randomNum(100, false);
                let rate = GameManager.getInstance().gameData.swordData[5].remarks;
                if (swordData.id == 6 && num <= rate) {
                    let crit = ConfigManager.getInstance().getConfigById(ConstConfigContainer, 1).value;
                    this.curHp -= this.aggressivity + (this.aggressivity * (crit / 100));
                    LogWrap.log("暴击。。。", this.aggressivity + (this.aggressivity * (crit / 100)));
                    this.refreshBloodBar(this.blood, this.curHp, this.bloodBar);
                    this.playAttackedAnim();
                } else {
                    if (swordData.id == 5) {
                        this.initAggressivity(other.node.getComponent("Sword").isSplit);
                        LogWrap.log("子剑攻击力", this.aggressivity);
                    }
                    this.curHp -= this.aggressivity;
                    if (this.curHp < 0) {
                        this.curHp = 0;
                    }
                }

                this.refreshBloodBar(this.blood, this.curHp, this.bloodBar);
                this.playAttackedAnim();
                // 剑的效果
                this.effectBySword();
                AudioManager.getInstance().playSound("hurt", false);
            }
        } else if (other.node.group == "stick" || other.node.group == "well") {
            this.collider = true;
            this.node.stopAllActions();
        } else if (other.node.group == "enemy" && other.tag == 226 && self.tag == 200) {
            if (swordData.id == 9) {
                this.initAggressivity(false);
                this.curHp -= this.aggressivity;
                if (this.curHp < 0) {
                    this.curHp = 0;
                }
                this.refreshBloodBar(this.blood,this.curHp,this.bloodBar);
                this.playAttackedAnim();
            }
            AudioManager.getInstance().playSound("hurt", false);
        }
    }

    onCollisionStay(other, self) {
        if (other.node.group == "stick" || other.node.group == "well") {
            if (self.tag == 22) {
                if (this.angle < 180 && this.angle >= 0) {
                    this.controlY = 0;
                } else {
                    this.controlY = 1;
                }
            } else if (self.tag == 23) {
                if ((this.angle <= 90 && this.angle > 0) || (this.angle > -90 && this.angle <= 0)) {
                    this.controlX = 0;
                } else {
                    this.controlX = 1;
                }
            } else if (self.tag == 24) {
                if ((this.angle < 0 && this.angle > -180)){
                    this.controlY = 0;
                } else {
                    this.controlY = 1;
                }
            } else if (self.tag == 25) {
                if ((this.angle > 90 && this.angle < 180) || (this.angle < -90 && this.angle > -180)) {
                    this.controlX = 0;
                } else {
                    this.controlX = 1;
                }
            }
            // this.controlY = 0;
        }
    }

    onCollisionExit(other, self) {
        if (other.node.group == "stick" || other.node.group == "well") {
            this.collider = false;
            if (self.tag == 22 || self.tag == 24) {
                this.controlY = 1;
            } else if (self.tag == 23 || self.tag == 25) {
                this.controlX = 1;
            }
        }
        // this.controlY = 1;
    }

    // 播放冲锋动画
    private playAnim() {
        if (!this.collider && this.isFire) {
            this.isMove = false;
            let dir = EnemyManager.getInstance().playerNode.position.sub(this.node.position);
            let dist = 200 / dir.mag();
            let n = dir.mul(dist);
            let pos = this.node.position.add(n);
            let wall = cc.find("Canvas").getChildByName("realWall");
            if (pos.x < 0) {
                if (pos.x < -(wall.width / 2 + wall.x - this.node.width / 2)) {
                    pos.x = -(wall.width / 2 + wall.x + this.node.width / 2);
                }
            } else {
                if (pos.x > (wall.width / 2 + wall.x - this.node.width / 2)) {
                    pos.x = wall.width / 2 + wall.x - this.node.width / 2;
                }
            }
            if (pos.y < 0) {
                if (pos.y < -(wall.height / 2 + wall.y + this.node.height / 2)) {
                    pos.y = -(wall.height / 2 + wall.y + this.node.height / 2);
                }
            } else {
                if (pos.y > (wall.height / 2 + wall.y - this.node.height / 2)) {
                    pos.y = wall.height / 2 + wall.y - this.node.height / 2;
                }
            }
            // LogWrap.log("position",EnemyManager.getInstance().playerNode.position);
            // LogWrap.log("position",pos);
            this.node.runAction(cc.sequence(cc.moveTo(1, pos), cc.callFunc(function () {
                this.isMove = true;
            }.bind(this))));
        }
    }

    private changeMoveState() {
        if (!this.isMove) {
            this.isMove = true;
        }
    }

    private effectBySword() {
        let swordData = GameManager.getInstance().gameData.isUse; // 所持剑的数据
        switch (swordData.id) {
            case "1":
                let angle = EnemyManager.getInstance().followBullet(EnemyManager.getInstance().playerNode, this.node);
                if (Math.sin(angle) < 0) {
                    this.node.y += swordData.remarks;
                } else {
                    this.node.y -= swordData.remarks;
                }
                break;
            case "2":
                // 寒冰剑 减速
                let effectNum1 = swordData.remarks;
                // LogWrap.log("被寒冰剑刺到。。。。。。。。。。",effectNum1);
                this.speed -= this.speed * (effectNum1 / 100);
                break;
            case "3":
                // 烈焰剑 失去目标 停止攻击 持续3秒
                if (this.curHp <= 0) {
                    break;
                }
                let rate = Math.floor(Math.random() * 100);
                let percent = GameManager.getInstance().gameData.swordData[2].remarks;
                if (rate < percent) {
                    this.node.stopAllActions();
                    this.isMove = false;
                    this.isFire = false;
                    let anim = this.node.getComponent(cc.Animation);
                    let animState = anim.play("missingClip2");
                    LogWrap.log("anim.curveData", animState.curves[0]);
                    let posArr = animState.curves[0].values;
                    for (let i = 0; i < posArr.length; i++) {
                        if (i <= 1) {
                            posArr[i] = cc.v2(this.node.x + 20 * Math.pow(-1, i), this.node.y);
                        } else {
                            posArr[i] = cc.v2(this.node.x, this.node.y + 20 * Math.pow(-1, i));
                        }
                    }
                    anim.on("finished", function () {
                        this.isMove = true;
                        this.isFire = true;
                    }.bind(this), this);
                } else {
                    LogWrap.log("isFire", this.isFire);
                }
                break;
            case "4":
                // 剧毒剑 中毒 持续5秒 每秒作用一次
                this.lastBloodDown(swordData.remarks, 5, 1);
                break;
            case "5":
                // 子母剑
                break;
            case "6":
                // 暴击剑
                break;
            case "7":
                // 奔雷剑
                let rate6 = Math.floor(Math.random() * 100);
                // let rate6 = 1;
                let random6 = GameManager.getInstance().gameData.swordData[5].remarks;
                if (rate6 < random6) {
                    this.node.stopAllActions();
                    this.unschedule(this.changeMoveState);
                    this.unschedule(this.playAnim);
                    this.isMove = false;
                    this.scheduleOnce(this.changeMoveState, 2);
                    this.schedule(this.playAnim,3,cc.macro.REPEAT_FOREVER,2);
                }
                break;
            case "8":
                // 绯云剑 TODO
                break;
            case "9":
                // 太乙剑
                this.unschedule(this.boom);
                this.node.getComponent(cc.CircleCollider).enabled = true;
                this.scheduleOnce(this.boom,0.5);
                break;
        }
    }

    /**
     * 持续掉血
     * @param num 伤害
     */
    private lastBloodDown(num:number,times:number,interval:number){
        this.unschedule(this.callback);
        // self.unscheduleAllCallbacks();
        this.schedule(this.callback,interval);
        LogWrap.log( cc.director.getScheduler().isScheduled(this.callback,this) )
    }
    count = 0;
    private callback(){
        let swordData = GameManager.getInstance().gameData.isUse; // 所持剑的数据
        if(this.count == 5){
            this.unschedule(this.callback);
            this.count=0;
        }
        this.curHp -= swordData.remarks;
        this.refreshBloodBar(this.blood,this.curHp,this.bloodBar);
        this.count ++;
    }

    private initAggressivity(isSplit: boolean) {
        GameManager.getInstance().refreshAttack(isSplit);
        this.aggressivity = PlayerManager.getInstance().aggressivity;
    }

    private boom() {
        this.node.getComponent(cc.CircleCollider).enabled = false;
    }

    start() {
        this.aggressivity = PlayerManager.getInstance().aggressivity;
        this.speed = ConfigManager.getInstance().getConfigById(LevelConfigContainer, GameManager.getInstance().gameData.level).speed;
        this.initData();
        this.angle = EnemyManager.getInstance().followBullet(EnemyManager.getInstance().playerNode, this.node);

        if (this.tickId2) {
            clearInterval(this.tickId2);
            TipsManager.getInstance().removeTickId(this.tickId2);
            this.tickId2 = null;
        } else {
            this.tickId2 = setInterval(this.changeMoveState.bind(this), 2000);
            TipsManager.getInstance().addTickId(this.tickId2);
        }

        this.schedule(this.playAnim, 3);

    }

    protected onDisable(): void {
        this.unscheduleAllCallbacks();
    }

    update(dt) {
        let speed = this.speed;
        this.cd -= dt;
        if (this.isMove) {
            let angle = EnemyManager.getInstance().followBullet(EnemyManager.getInstance().playerNode, this.node);
            this.angle = this.getAngle();
            this.node.x += Math.cos(angle) * speed * dt * this.controlX;
            this.node.y += Math.sin(angle) * speed * dt * this.controlY;
        }
    }
}
