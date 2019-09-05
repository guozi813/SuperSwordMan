import {EnemyManager} from "../../manager/EnemyManager";
import {AudioManager} from "../../manager/AudioManager";
import {PlayerManager} from "../../manager/PlayerManager";
import {ConfigManager} from "../../Configs/ConfigManager";
import {EnemyConfigContainer} from "../../Configs/EnemyConfigContainer";
import {LevelConfigContainer} from "../../Configs/LevelConfigContainer";
import {GameUtil} from "../../manager/GameUtil";
import {GameManager} from "../../manager/GameManager";
import Player from "../player/Player";
import {SwordConfigContainer} from "../../Configs/SwordConfigContainer";
import EnemyBaseClass, {EnemyClass} from "./EnemyBaseClass";
import ConstConfigContainer from "../../Configs/ConstConfigContainer";
import {LogWrap} from "../../manager/utils/LogWrap";


const {ccclass, property} = cc._decorator;

@ccclass
export default class Enemy extends EnemyBaseClass {

    private speed: number = 0;
    @property
    isMove: boolean = false;
    @property(cc.ProgressBar)
    bloodBar: cc.ProgressBar = null;
    @property(cc.Label)
    blood: cc.Label = null;

    // public totalHp: number = 0; // 怪总血量
    private angle: number = 0; // 运动方向
    private controlX: number = 1; // 控制X方向
    private controlY: number = 1; // 控制Y方向
    public type: number = 0; // 0:刀怪 1：盾怪
    private aggressivity: number = 0;// 玩家攻击力
    private isFire: boolean = true; // 是否发动攻击
    private  _curHp : number = 0; // 怪当前血量

    public get curHp(){
        return this._curHp
    }

    public set curHp(value){
        LogWrap.log("当前血量",value);
        this._curHp = value
    }

    // onLoad () {}

    public initData(type) {
        // TODO 刷新视图（0刀怪 1盾怪）
        this.type = type;
        let level = GameManager.getInstance().gameData.level;
        this.totalHp = ConfigManager.getInstance().getConfigById(LevelConfigContainer, level).totalHp; // 血量
        this.curHp = this.totalHp;
        this.blood.string = String(this.totalHp);
    }

    onCollisionEnter(other, self) {
        let swordData = GameManager.getInstance().gameData.isUse; // 所持剑的数据
        if (other.node.name == "Sword" && other.tag == 0) {
            if (self.tag == 300) {
                let num = GameUtil.randomNum(100, false);
                let rate = GameManager.getInstance().gameData.swordData[5].remarks;
                LogWrap.log("随机%d,概率%d",num,rate);
                if (swordData.id == 6 && num <= rate) {
                    let crit = ConfigManager.getInstance().getConfigById(ConstConfigContainer, 1).value;
                    this.curHp -= this.aggressivity + (this.aggressivity * (crit / 100));
                    LogWrap.log("暴击。。。", this.aggressivity + (this.aggressivity * (crit / 100)));
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
                this.refreshBloodBar(this.blood,this.curHp,this.bloodBar);
                this.playAttackedAnim();
                // 剑的效果
                this.effectBySword();
                AudioManager.getInstance().playSound("hurt", false);
            }
        } else if (other.node.group == "enemy" && other.tag == 226 && self.tag == 300) {
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
            if (self.tag == 222) {
                if (this.angle < 180 && this.angle >= 0) {
                    this.controlY = 0;
                } else {
                    this.controlY = 1;
                }
            } else if (self.tag == 223) {
                if ((this.angle <= 90 && this.angle > 0) || (this.angle > -90 && this.angle <= 0)) {
                    this.controlX = 0;
                } else {
                    this.controlX = 1;
                }
            } else if (self.tag == 224) {
                if ((this.angle < 0 && this.angle > -180)) {
                    this.controlY = 0;
                } else {
                    this.controlY = 1;
                }
            } else if (self.tag == 225) {
                if ((this.angle > 90 && this.angle < 180) || (this.angle < -90 && this.angle > -180)) {
                    this.controlX = 0;
                } else {
                    this.controlX = 1;
                }
            }
        }
    }

    onCollisionExit(other, self) {
        if (other.node.group == "stick" || other.node.group == "well") {
            if (self.tag == 222 || self.tag == 224) {
                this.controlY = 1;
            } else if (self.tag == 223 || self.tag == 225) {
                this.controlX = 1;
            }
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
                // let rate = 2; // TODO 测试用
                let percent = GameManager.getInstance().gameData.swordData[2].remarks;
                if (rate < percent) {
                    LogWrap.log("失去目标。。。。。。。。");
                    this.speed = 0;
                    this.isFire = false;
                    let anim = this.node.getComponent(cc.Animation);
                    let animState = anim.play("missingClip2");
                    LogWrap.log("animState", animState);
                    let posArr = animState.curves[0].values;
                    for (let i = 0; i < posArr.length; i++) {
                        if (i <= 1) {
                            posArr[i] = cc.v2(this.node.x + 20 * Math.pow(-1, i), this.node.y);
                        } else {
                            posArr[i] = cc.v2(this.node.x, this.node.y + 20 * Math.pow(-1, i));
                        }
                    }
                    anim.on("finished", function () {
                        this.speed = ConfigManager.getInstance().getConfigById(LevelConfigContainer, GameManager.getInstance().gameData.level).speed;
                        this.isFire = true;
                    }.bind(this), this);
                }
                break;
            case "4":
                // 剧毒剑 中毒 持续5秒 每秒作用一次
                this.lastBloodDown(swordData.remarks, 5, 1);
                break;
            case "5":
            // 子母剑
            case "6":
                // 暴击剑
                break;
            case "7":
                // 奔雷剑
                let rate6 = Math.floor(Math.random() * 100);
                // let rate6 = 1;
                let random6 = GameManager.getInstance().gameData.swordData[5].remarks;
                console.log("眩晕  rate", rate6, "config", random6);
                if (rate6 < random6) {
                    this.unschedule(this.changeMoveState);
                    this.isMove = false;
                    this.scheduleOnce(this.changeMoveState, 2);
                }
                break;
            case "8":
                // 绯云剑 吸血
                break;
            case "9":
                // 太乙剑
                this.unschedule(this.boom.bind(this));
                this.node.getComponent(cc.CircleCollider).enabled = true;
                this.scheduleOnce(this.boom.bind(this), 0.5);
                break;
        }
    }

    private changeMoveState() {
        this.isMove = true;
    }

    private boom() {
        this.node.getComponent(cc.CircleCollider).enabled = false;
    }

    /**
     * 持续掉血
     * @param num
     */
    private lastBloodDown(num:number,times:number,interval:number){
        this.unschedule(this.callback);
        // self.unscheduleAllCallbacks();
        this.schedule(this.callback,interval);
        console.log( cc.director.getScheduler().isScheduled(this.callback,this) )
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

    start() {
        // this.initData();
        this.aggressivity = PlayerManager.getInstance().aggressivity;
        // this.aggressivity = 10;
        this.speed = ConfigManager.getInstance().getConfigById(EnemyConfigContainer, this.type + 1).speed;
        this.angle = EnemyManager.getInstance().followBullet(EnemyManager.getInstance().playerNode, this.node);
    }

    update(dt) {
        if (this.isMove) {
            let angle = EnemyManager.getInstance().followBullet(EnemyManager.getInstance().playerNode, this.node);
            this.angle = this.getAngle();
            this.node.x += Math.cos(angle) * this.speed * dt * this.controlX;
            this.node.y += Math.sin(angle) * this.speed * dt * this.controlY;
        }
    }
}
