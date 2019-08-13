/**
 * creator: yisha
 */
import EnemyBaseClass from "./EnemyBaseClass";
import {ConfigManager} from "../../Configs/ConfigManager";
import {EnemyConfigContainer} from "../../Configs/EnemyConfigContainer";
import {PoolManager} from "../../manager/PoolManager";
import {GameUtil} from "../../manager/GameUtil";
import {GameManager} from "../../manager/GameManager";
import {PlayerManager} from "../../manager/PlayerManager";
import {AudioManager} from "../../manager/AudioManager";
import ConstConfigContainer from "../../Configs/ConstConfigContainer";
import {EnemyManager} from "../../manager/EnemyManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class MofoChild extends EnemyBaseClass {

    @property(cc.Prefab)
    child: cc.Prefab = null;
    @property(cc.ProgressBar)
    bloodBar:cc.ProgressBar = null;
    @property(cc.Label)
    blood:cc.Label = null;
    @property
    isMove: boolean = true;

    private direction:number = 0; // 控制移动方向 0：上 1：下 2：左 3：右

    private speedX:number = 0; //
    private speedY:number = 0; //
    private speed:number = 0;
    public bulletPool: cc.NodePool = null;
    public deadTag: boolean = false; // 是否已经死亡
    public totalHp: number = 500; // 怪总血量
    private aggressivity:number = 0;
    private isFire:boolean= true;
    public generation: number = null;

    private  _curHp : number = 0; // 怪当前血量

    public get curHp(){
        return this._curHp
    }

    public set curHp(value){
        console.log("当前血量",value);
        this._curHp = value
    }

    onLoad () {
    }

    start () {
        this.totalHp = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,11).hp/2;
        this.curHp = this.totalHp;
        this.speed = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,11).speed;
        this.aggressivity = PlayerManager.getInstance().aggressivity;
        // this.aggressivity = 10;
        this.schedule(this.changeMoveState,1);
        this.schedule(this.getDirection,5);
        this.blood.string = String(this.curHp);
        this.speedX = this.speed;
    }


    private getDirection(){
        this.direction = GameUtil.randomNum(4,false);
        switch(this.direction){
            case 0:
                this.speedX = this.speed;
                this.speedY = 0;
                break;
            case 1:
                this.speedX = -this.speed;
                this.speedY = 0;
                break;
            case 2:
                this.speedX = 0;
                this.speedY = -this.speed;
                break;
            case 3:
                this.speedX = 0;
                this.speedY = this.speed;
                break;
        }
        this.isMove = false;
        if (this.totalHp > 50) {
            let childNode = PoolManager.getInstance().get("MofoChildPool", this.child);
            childNode.setPosition(this.node.getPosition());
            childNode.parent = this.node.parent;
            let script = childNode.getComponent("MofoChild");
            script.generation = this.generation + 1;
        }
    }

    protected onDisable(): void {
        this.unscheduleAllCallbacks();
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
                // console.log("被寒冰剑刺到。。。。。。。。。。",effectNum1);
                this.speed -= this.speed*(effectNum1/100);
                console.log("speed",this.speed);
                if(this.speedX !=0){
                    if(this.speedX>0){
                        this.speedX = this.speed;
                    }else{
                        this.speedX = -this.speed;
                    }
                }else if(this.speedY !=0){
                    if(this.speedY>0){
                        this.speedY = this.speed;
                    }else{
                        this.speedY = -this.speed;
                    }
                }
                break;
            case "3":
                // 烈焰剑 失去目标 停止攻击 持续3秒
                if(this.curHp <=0){
                    break;
                }
                let rate = Math.floor(Math.random()*100);
                // let rate = 1;
                let percent = GameManager.getInstance().gameData.swordData[2].remarks;
                if(rate < percent){
                    this.speed = 0;
                    this.isFire = false;
                    let anim = this.node.getComponent(cc.Animation);
                    let animState = anim.play("missingClip2");
                    console.log("animState",animState);
                    let posArr = animState.curves[0].values;
                    for(let i=0;i<posArr.length;i++){
                        if(i<=1){
                            posArr[i] = cc.v2(this.node.x+20*Math.pow(-1,i),this.node.y);
                        }else{
                            posArr[i] = cc.v2(this.node.x,this.node.y+20*Math.pow(-1,i));
                        }
                    }
                    anim.on("finished",function () {
                        this.speed = ConfigManager.getInstance().getConfigById(EnemyConfigContainer,8).speed;
                        this.isFire = true;
                    }.bind(this),this);
                }else{
                    console.log("isFire",this.isFire);
                }
                break;
            case "4":
                // 剧毒剑 中毒 持续5秒 每秒作用一次
                this.lastBloodDown(swordData.remarks,5,1);
                break;
            case "5":
                // 子母剑 TODO
                break;
            case "6":
                // 暴击剑
                break;
            case "7":
                // 奔雷剑
                // let rate6 = Math.floor(Math.random()*100);
                let rate6 = 1;
                let random6 = GameManager.getInstance().gameData.swordData[5].remarks;
                if(rate6 < random6){
                    this.unschedule(this.changeMoveState);
                    this.isMove = false;
                    this.scheduleOnce(this.changeMoveState,2);
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

    private changeMoveState(){
        if(!this.isMove){
            this.isMove = true;
        }
    }

    private initAggressivity(isSplit:boolean){
        GameManager.getInstance().refreshAttack(isSplit);
        this.aggressivity = PlayerManager.getInstance().aggressivity;
    }

    private boom(){
        this.node.getComponent(cc.CircleCollider).enabled = false;
    }

    public isDead(curHp){
        if (curHp <= 0) {
            console.log("击杀魔佛小怪",PlayerManager.getInstance().coin);
            let num  = Math.floor(GameUtil.randomNumByRange(100,200)/2);
            PlayerManager.getInstance().coin += num;
            console.log("num:%d,coin:%d",num,PlayerManager.getInstance().coin);
            this.node.removeFromParent(true);
        }
    }


    onCollisionEnter(other,self){
        let swordData = GameManager.getInstance().gameData.isUse; // 所持剑的数据
        if (other.node.name == "Sword") {
            if (self.tag == 200) {
                let num = GameUtil.randomNum(100,false);
                let rate = GameManager.getInstance().gameData.swordData[5].remarks;
                if(swordData.id == 6 && num<=rate){
                        let crit = ConfigManager.getInstance().getConfigById(ConstConfigContainer,1).value;
                        this.curHp -= this.aggressivity+(this.aggressivity*(crit/100));
                        console.log("暴击。。。",this.aggressivity+(this.aggressivity*(crit/100)));
                        // this.refreshBloodBar(this.blood,this.curHp,this.bloodBar);
                }else{
                    if(swordData.id == 5){
                        this.initAggressivity(other.node.getComponent("Sword").isSplit);
                        console.log("子剑攻击力",this.aggressivity);
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
        }else if (other.node.group == "stick" || other.node.group == "well"|| other.node.group == "wall") {
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

    update (dt) {
        if(this.isMove){
            this.node.x +=this.speedX*dt;
            this.node.y +=this.speedY*dt;
        }
    }
}
