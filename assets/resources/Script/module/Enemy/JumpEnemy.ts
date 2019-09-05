import {EnemyManager} from "../../manager/EnemyManager";
import {AudioManager} from "../../manager/AudioManager";
import {PlayerManager} from "../../manager/PlayerManager";
import box = primitive.box;
import {TipsManager} from "../../manager/TipsManager";
import {GameUtil} from "../../manager/GameUtil";
import {ConfigManager} from "../../Configs/ConfigManager";
import {LevelConfigContainer} from "../../Configs/LevelConfigContainer";
import {GameManager} from "../../manager/GameManager";
import {SwordConfigContainer} from "../../Configs/SwordConfigContainer";
import log = cc.log;
import EnemyBaseClass from "./EnemyBaseClass";
import ConstConfigContainer from "../../Configs/ConstConfigContainer";
import {LogWrap} from "../../manager/utils/LogWrap";


const {ccclass, property} = cc._decorator;

@ccclass
export default class JumpEnemy extends EnemyBaseClass {

    private speed: number = 20;
    @property({displayName:"跳跃的速度"})
    private speed2: number = 10000;
    @property
    isMove: boolean = false;
    @property(cc.ProgressBar)
    bloodBar: cc.ProgressBar = null;
    @property(cc.Sprite)
    sprite:cc.Sprite = null;
    @property(cc.Label)
    blood:cc.Label = null;

    public totalHp: number = 100; // 怪总血量
    private angle: number = 0; // 运动方向
    private controlX: number = 1; // 控制X方向
    private controlY: number = 1; // 控制Y方向
    private cd:number = 3; // 跳跃的cd
    private boxCollider:cc.BoxCollider = null; // 降落波及范围
    private tickId = null;
    private tickId2 = null;
    private aggressivity:number = 0;
    private isFire:boolean = true;
    private animState= null;
    private anim= null;
    private  _curHp : number = 0; // 怪当前血量

    public get curHp(){
        return this._curHp
    }

    public set curHp(value){
        LogWrap.log("当前血量",value);
        this._curHp = value
    }

    onLoad () {
        this.anim = this.node.getComponent(cc.Animation);
        this.animState = this.anim.getAnimationState("missingClip2");
        this.anim.on('finished',function () {
            if(this.anim.currentClip.name == 'missingClip2'){
                this.isMove = true;
                this.isFire = true;
            }
        },this);
    }

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
                let num = GameUtil.randomNum(100,false);
                let rate = GameManager.getInstance().gameData.swordData[5].remarks;
                if(swordData.id == 6 && num<=rate){
                        let crit = ConfigManager.getInstance().getConfigById(ConstConfigContainer,1).value;
                        this.curHp -= this.aggressivity+(this.aggressivity*(crit/100));
                        LogWrap.log("暴击。。。",this.aggressivity+(this.aggressivity*(crit/100)));
                }else{
                    if(swordData.id == 5){
                        this.initAggressivity(other.node.getComponent("Sword").isSplit);
                        LogWrap.log("子剑攻击力",this.aggressivity);
                    }
                    this.curHp -= this.aggressivity;
                    if(this.curHp<0){
                        this.curHp = 0;
                    }
                }
                this.refreshBloodBar(this.blood,this.curHp,this.bloodBar);
                this.playAttackedAnim();
                // 剑的效果
                this.effectBySword();
                AudioManager.getInstance().playSound("hurt", false);
            }
        }else if(other.node.group == "enemy" && other.tag == 226 && self.tag==200){
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

    onCollisionExit(other, self) {
        if (other.node.group == "stick" || other.node.group == "well") {
            if (self.tag == 22 || self.tag == 24) {
                this.controlY = 1;
            } else if (self.tag == 23 || self.tag == 25) {
                this.controlX = 1;
            }
        }
        // this.controlY = 1;
    }

    public isDead() {
        if (this.curHp <= 0) {
            let num  =GameUtil.randomNumByRange(100,200);
            PlayerManager.getInstance().coin += num;
            // LogWrap.log("num:%d,coin:%d",num,PlayerManager.getInstance().coin);
            clearInterval(this.tickId);
            clearInterval(this.tickId2);
            TipsManager.getInstance().removeTickId(this.tickId);
            TipsManager.getInstance().removeTickId(this.tickId2);
            this.node.stopAllActions();
            this.node.removeFromParent(true);
        }
    }

    private jumpToPlayer(){
        if(this.isFire){
            LogWrap.log("jump=======================");
            this.isMove = false;
            let moveTo = cc.moveTo(1,EnemyManager.getInstance().playerNode.position);
            this.node.runAction(cc.sequence(moveTo,cc.callFunc(function () {
                let anim = this.node.getChildByName("dropDown").getComponent(cc.Animation);
                anim.play("boomClip2");
                this.boxCollider.enabled = true;
                // this.sprite.node.active = true;
            }.bind(this))));
        }
    }

    private changeMoveState(){
        if(!this.isMove){
            this.isMove = true;
        }
        this.boxCollider.enabled = false;
        // this.sprite.node.active = false;
    }

    private effectBySword(){
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
                this.speed -= this.speed*(effectNum1/100);
                break;
            case "3":
                // 烈焰剑 失去目标 停止攻击 持续3秒
                if(this.curHp <=0){
                    break;
                }
                let rate = Math.floor(Math.random()*100);
                let percent = GameManager.getInstance().gameData.swordData[2].remarks;
                if(rate < percent){
                    this.node.stopAllActions();
                    this.isMove = false;
                    this.isFire = false;

                    LogWrap.log("animState",this.animState);
                    let posArr = this.animState.curves[0].values;
                    for(let i=0;i<posArr.length;i++){
                        if(i<=1){
                            posArr[i] = cc.v2(this.node.x+20*Math.pow(-1,i),this.node.y);
                        }else{
                            posArr[i] = cc.v2(this.node.x,this.node.y+20*Math.pow(-1,i));
                        }
                    }
                    this.anim.play("missingClip2");
                }
                break;
            case "4":
                // 剧毒剑 中毒 持续5秒 每秒作用一次
                this.lastBloodDown(swordData.remarks,5,1);
                break;
            case "5":
                // 子母剑
                break;
            case "6":
                // 暴击剑
                break;
            case "7":
                // 奔雷剑
                let rate6 = Math.floor(Math.random()*100);
                // let rate6 = 1;
                let random6 = GameManager.getInstance().gameData.swordData[5].remarks;
                if(rate6 < random6){
                    this.node.stopAllActions();
                    this.unschedule(this.jumpToPlayer);
                    this.unschedule(this.changeMoveState);
                    this.isMove = false;
                    this.scheduleOnce(this.changeMoveState,2);
                    this.schedule(this.jumpToPlayer,3,cc.macro.REPEAT_FOREVER,2);
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
     * @param num
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

    private initAggressivity(isSplit:boolean){
        GameManager.getInstance().refreshAttack(isSplit);
        this.aggressivity = PlayerManager.getInstance().aggressivity;
    }

    private boom(){
        this.node.getComponent(cc.CircleCollider).enabled = false;
    }

    start() {
        this.aggressivity = PlayerManager.getInstance().aggressivity;
        // this.aggressivity = 10;
        this.speed = ConfigManager.getInstance().getConfigById(LevelConfigContainer,GameManager.getInstance().gameData.level).speed;
        this.initData();
        this.angle = EnemyManager.getInstance().followBullet(EnemyManager.getInstance().playerNode, this.node);
        let boxColliders = this.node.getComponents(cc.BoxCollider);
        for(let i=0;i<boxColliders.length;i++){
            let obj = boxColliders[i];
            if(obj.tag == 276){
                this.boxCollider = obj;
            }
        }
        this.schedule(this.changeMoveState,2);
        this.schedule(this.jumpToPlayer,3);
    }

    update(dt) {
        let speed = this.speed;
        this.cd-=dt;
        if(this.cd<=0){
            // this.node.position = EnemyManager.getInstance().playerNode.position;
            // this.jumpToPlayer();
            this.cd = 3;
        }
        if (this.isMove) {
            let angle = EnemyManager.getInstance().followBullet(EnemyManager.getInstance().playerNode, this.node);
            this.angle = this.getAngle();
            this.node.x += Math.cos(angle) * speed * dt * this.controlX;
            this.node.y += Math.sin(angle) * speed * dt * this.controlY;
        }
    }
}
