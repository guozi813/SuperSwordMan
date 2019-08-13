/**
 * creator: yisha
 */
import EnemyBaseClass from "./EnemyBaseClass";
import {GameUtil} from "../../manager/GameUtil";
import {ConfigManager} from "../../Configs/ConfigManager";
import {EnemyConfigContainer} from "../../Configs/EnemyConfigContainer";
import {GameManager} from "../../manager/GameManager";
import {PlayerManager} from "../../manager/PlayerManager";
import {AudioManager} from "../../manager/AudioManager";
import {PoolManager} from "../../manager/PoolManager";
import ConstConfigContainer from "../../Configs/ConstConfigContainer";
import {EnemyManager} from "../../manager/EnemyManager";
import {TipsManager} from "../../manager/TipsManager";
import log = cc.log;


const {ccclass, property} = cc._decorator;

@ccclass
export default class MolingEnemy extends EnemyBaseClass {

    @property(cc.Prefab)
    bullet: cc.Prefab = null;
    @property
    isMove: boolean = false;
    @property(cc.ProgressBar)
    bloodBar: cc.ProgressBar = null;
    @property(cc.Label)
    blood: cc.Label = null;

    private direction: number = 0; // 控制移动方向 0：上 1：下 2：左 3：右

    private speedX: number = 0; //
    private speedY: number = 0; //
    private speed: number = 0;
    public bulletPool: cc.NodePool = null;
    private _time: number = 1; // 发射子弹的时间
    public deadTag: boolean = false; // 是否已经死亡
    public totalHp: number = 500; // 怪总血量
    private angle: number = 0; // 运动方向
    private aggressivity: number = 0;
    private isFire: boolean = true;
    private controlX: number = 1; // 控制X方向
    private controlY: number = 1; // 控制Y方向
    private  _curHp : number = 0; // 怪当前血量

    public get curHp(){
        return this._curHp
    }

    public set curHp(value){
        console.log(value);
        this._curHp = value
    }

    onLoad() {
        let initCount = 5;
        for (let i = 0; i < initCount; ++i) {
            let bullet = cc.instantiate(this.bullet); // 创建节点
            PoolManager.getInstance().put("MolingBulletPool", bullet, 20);
        }
    }

    start() {
        this.totalHp = ConfigManager.getInstance().getConfigById(EnemyConfigContainer, 8).hp;
        // this.totalHp = 600;
        this.curHp = this.totalHp;
        this.speed = ConfigManager.getInstance().getConfigById(EnemyConfigContainer, 8).speed;
        this.aggressivity = PlayerManager.getInstance().aggressivity;
        // this.aggressivity = 10;
        this.schedule(this.changeMoveState, 1);
        this.schedule(this.getDirection, 3,cc.macro.REPEAT_FOREVER,0.1);
    }


    private getDirection() {
        this.direction = GameUtil.randomNum(4, false);
        switch (this.direction) {
            case 0:
                this.speedX = this.speed;
                this.speedY = 0;
                break;
            case 2:
                this.speedX = -this.speed;
                this.speedY = 0;
                break;
            case 3:
                this.speedX = 0;
                this.speedY = -this.speed;
                break;
            case 4:
                this.speedX = 0;
                this.speedY = this.speed;
                break;
        }
        this.isMove = false;
        let bullet = PoolManager.getInstance().get("MolingBulletPool", this.bullet);
        bullet.setPosition(this.node.getPosition());
        let bulletScript = bullet.getComponent("MolingBullet");
        bullet.parent = cc.find("Canvas").getChildByName("bulletNode");
        bulletScript.fireToPlayer();
    }

    protected onDisable(): void {
        this.unscheduleAllCallbacks();
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
                this.speed -= this.speed * (effectNum1 / 100);
                console.log("被寒冰剑刺到。。。。。。。。。。",this.speed);
                break;
            case "3":
                // 烈焰剑 失去目标 停止攻击 持续3秒
                if (this.curHp <= 0) {
                    break;
                }
                let rate = Math.floor(Math.random() * 100);
                // let rate =1;
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
                        this.speed = ConfigManager.getInstance().getConfigById(EnemyConfigContainer, 8).speed;
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
                    this.schedule(this.changeMoveState, 1,cc.macro.REPEAT_FOREVER,2);
                }
                break;
            case "8":
                // 绯云剑 TODO
                break;
            case "9":
                // 太乙剑
                this.unschedule(this.boom);
                this.node.getComponent(cc.CircleCollider).enabled = true;
                this.scheduleOnce(this.boom, 0.5);
                break;
        }
    }

    private changeMoveState() {
        if (!this.isMove) {
            this.isMove = true;
        }
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

    private boom() {
        this.node.getComponent(cc.CircleCollider).enabled = false;
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
                    console.log("暴击。。。", this.aggressivity + (this.aggressivity * (crit / 100)));
                } else {
                    if (swordData.id == 5) {
                        this.initAggressivity(other.node.getComponent("Sword").isSplit);
                        console.log("子剑攻击力", this.aggressivity);
                    }
                    this.curHp -= this.aggressivity;
                    if (this.curHp < 0) {
                        this.curHp = 0;
                    }
                }
                this.refreshBloodBar(this.blood, this.curHp, this.bloodBar);
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
        } else if (other.node.group == "stick" || other.node.group == "well" || other.node.group == "wall") {
            if (self.tag == 22 || self.tag == 24) {
                this.speedY = -this.speedY;
            } else if (self.tag == 23 || self.tag == 25) {
                this.speedX = -this.speedX;
            }
        }
    }

    onCollisionExit(other, self) {
    }

    onCollisionStay(other, self) {
    }

    protected onEnable(): void {
        this.unscheduleAllCallbacks();
    }


    update(dt) {
        if (this.isMove) {
            this.node.x += this.speedX * dt;
            this.node.y += this.speedY * dt;
        }
    }
}
