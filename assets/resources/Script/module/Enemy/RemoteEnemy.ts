import {EnemyManager} from "../../manager/EnemyManager";
import {PoolManager} from "../../manager/PoolManager";
import {TipsManager} from "../../manager/TipsManager";
import {GameUtil} from "../../manager/GameUtil";
import {ConfigManager} from "../../Configs/ConfigManager";
import {LevelConfigContainer} from "../../Configs/LevelConfigContainer";
import {GameManager} from "../../manager/GameManager";
import {PlayerManager} from "../../manager/PlayerManager";
import {SwordConfigContainer} from "../../Configs/SwordConfigContainer";
import {AudioManager} from "../../manager/AudioManager";
import EnemyBaseClass from "./EnemyBaseClass";
import ConstConfigContainer from "../../Configs/ConstConfigContainer";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RemoteEnemy extends EnemyBaseClass {

    @property(cc.Prefab)
    bullet: cc.Prefab = null;
    private speed: number = 20;
    @property
    isMove: boolean = false;
    @property(cc.ProgressBar)
    bloodBar: cc.ProgressBar = null;
    @property(cc.Label)
    blood: cc.Label = null;

    public bulletPool: cc.NodePool = null;
    private _time: number = 1; // 发射子弹的时间
    public deadTag: boolean = false; // 是否已经死亡
    public totalHp: number = 500; // 怪总血量
    private angle: number = 0; // 运动方向
    private controlX: number = 1; // 控制X方向
    private controlY: number = 1; // 控制Y方向
    private tickId = null;
    private tickId2 = null;
    private aggressivity: number = 0;
    private isFire: boolean = true;
    private  _curHp : number = 0; // 怪当前血量

    public get curHp(){
        return this._curHp
    }

    public set curHp(value){
        console.log("当前血量",value);
        this._curHp = value
    }

    onLoad() {
        let level = GameManager.getInstance().gameData.level;
        this.totalHp = ConfigManager.getInstance().getConfigById(LevelConfigContainer, level).totalHp; // 血量
        this.deadTag = false;
        this.curHp = this.totalHp;
        this.blood.string = String(this.totalHp);
        let initCount = 5;
        for (let i = 0; i < initCount; ++i) {
            let bullet = cc.instantiate(this.bullet); // 创建节点
            PoolManager.getInstance().put("bulletPool", bullet, 20);
        }

    }

    private fire() {
        this.isMove = false;
        if (!this.deadTag && this.isFire) {
            let bullet = PoolManager.getInstance().get("bulletPool", this.bullet);
            bullet.setPosition(this.node.getPosition());
            let bulletScript = bullet.getComponent("Bullet");
            bulletScript.fireToPlayer(0);
            bulletScript.type = 0;
            bullet.parent = cc.find("Canvas").getChildByName("bulletNode"); // 将生成的敌人加入节点树
        }
        this.scheduleOnce(this.changeMoveState,1);
    }

    onCollisionEnter(other, self) {
        let swordData = GameManager.getInstance().gameData.isUse; // 所持剑的数据
        if (other.node.name == "Sword") {
            if (self.tag == 200) {
                let num = GameUtil.randomNum(100, false);
                let rate = GameManager.getInstance().gameData.swordData[5].remarks;
                console.log("num%d,rate%d",num,rate);
                if (swordData.id == 6 && num <= rate) {
                    let crit = ConfigManager.getInstance().getConfigById(ConstConfigContainer, 1).value;
                    this.curHp -= this.aggressivity + (this.aggressivity * (crit / 100));
                    console.log("暴击。。。", this.aggressivity + (this.aggressivity * (crit / 100)));
                } else {
                    if (swordData.id == 5) {
                        this.initAggressivity(other.node.getComponent("Sword").isSplit);
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
            }
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

    onCollisionExit(other, self) {
        if (other.node.group == "stick" || other.node.group == "well") {
            // 阻挡效果
            if (self.tag == 22 || self.tag == 24) {
                this.controlY = 1;
            } else if (self.tag == 23 || self.tag == 25) {
                this.controlX = 1;
            }
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
                if ((this.angle < 0 && this.angle > -180)) {
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
                // console.log("被寒冰剑刺到。。。。。。。。。。",effectNum1);
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
                    this.speed = 0;
                    this.isFire = false;
                    let anim = this.node.getComponent(cc.Animation);
                    let animState = anim.play("missingClip2");
                    console.log("animState", animState);
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
                } else {
                    console.log("isFire", this.isFire);
                }
                break;
            case "4":
                // 剧毒剑 中毒 持续5秒 每秒作用一次
                this.lastBloodDown(swordData.remarks, 5, 1);
                break;
            case "5":
                // 子母剑 TODO
                break;
            case "6":
                // 暴击剑
                break;
            case "7":
                // 奔雷剑
                // let rate6 = Math.floor(Math.random() * 100);
                let rate6 = 1;
                let random6 = GameManager.getInstance().gameData.swordData[5].remarks;
                if (rate6 < random6) {
                    this.unschedule(this.changeMoveState);
                    this.isMove = false;
                    this.scheduleOnce(this.changeMoveState, 2);
                }
                break;
            case "8":
                // 绯云剑 TODO
                break;
            case "9":
                // 太乙剑
                this.unschedule(this.boom.bind(this));
                this.node.getComponent(cc.CircleCollider).enabled = true;
                this.scheduleOnce(this.boom.bind(this), 0.5);
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

    private boom() {
        this.node.getComponent(cc.CircleCollider).enabled = false;
    }

    start() {
        this.aggressivity = PlayerManager.getInstance().aggressivity;
        // this.aggressivity = 10;
        this.speed = ConfigManager.getInstance().getConfigById(LevelConfigContainer, GameManager.getInstance().gameData.level).speed;
        if (this.tickId) {
            clearInterval(this.tickId);
            TipsManager.getInstance().removeTickId(this.tickId);
            this.tickId = null;
        } else {
            this.tickId = setInterval(this.fire.bind(this), 3000);
            TipsManager.getInstance().addTickId(this.tickId);
        }
    }

    protected onDisable(): void {
        TipsManager.getInstance().removeAllTickId();
    }

    update(dt) {
        // this.isMove = true;
        this._time -= dt;
        if (this._time <= 0.2) {
            this._time = 1;
            // this.fire();
        }
        if (this.isMove) {
            this.angle = this.getAngle();
            let angle = EnemyManager.getInstance().followBullet(EnemyManager.getInstance().playerNode, this.node);
            this.node.x += Math.cos(angle) * this.speed * dt * this.controlX;
            this.node.y += Math.sin(angle) * this.speed * dt * this.controlY;
        }
    }
}