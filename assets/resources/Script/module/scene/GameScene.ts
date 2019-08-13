import {EnemyManager} from "../../manager/EnemyManager";
import {PlayerManager} from "../../manager/PlayerManager";
import Player from "../player/Player";
import {PoolManager} from "../../manager/PoolManager";
import {GameUtil} from "../../manager/GameUtil";
import ObstacleNode from "../obstacle/ObstacleNode";
import Pool = cc.js.Pool;
import {GameManager} from "../../manager/GameManager";
import {WXPlatform} from "../../platform/WXPlatform";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameScene extends cc.Component {

    @property(cc.Prefab)
    enemy: cc.Prefab = null;
    @property(cc.Sprite)
    player: cc.Sprite = null;
    @property(cc.Prefab)
    remoteEnemy: cc.Prefab = null;
    @property(cc.Node)
    nextLevelView:cc.Node = null;
    @property(cc.Node)
    playerNode:cc.Node = null;
    @property(cc.Prefab)
    sword:cc.Prefab = null;
    @property(cc.Prefab)
    chongfengEnemy:cc.Prefab = null;
    @property(cc.Prefab)
    jumpEnemy:cc.Prefab = null;
    @property(cc.Prefab)
    qinEnemy:cc.Prefab = null;
    @property(cc.Prefab)
    flameTower:cc.Prefab = null;
    @property(cc.Prefab)
    molingEnemy:cc.Prefab = null;
    @property(cc.Prefab)
    mofoEnemy:cc.Prefab = null;
    @property(cc.Prefab)
    gujingEnemy:cc.Prefab = null;
    @property(cc.Prefab)
    moxiangEnemy:cc.Prefab = null;
    @property(cc.Label)
    numLabel:cc.Label = null;
    @property(cc.Label)
    adNumLabel:cc.Label = null;


    private multiple: number = 1; // 广告观看后增加的倍数

    protected onLoad(): void {
        let swordNode = this.player.node.getChildByName("sword");
        let worldPos = this.player.node.convertToWorldSpaceAR(swordNode.getPosition());
        let canvasPos = cc.find("Canvas").convertToNodeSpaceAR(worldPos);
        PlayerManager.getInstance().swordPos = canvasPos;
        EnemyManager.getInstance().playerNode = this.player.node;

        // 物理碰撞
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit;
        // 开启碰撞
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDebugDraw = true;
    }

    start() {
        EnemyManager.getInstance().playerNode = this.player.node;
        EnemyManager.getInstance().randomPosArr = [];
        // 随机生成怪
        EnemyManager.getInstance().createEnemyByConfig(this.enemy,this.remoteEnemy,this.chongfengEnemy,this.jumpEnemy,this.qinEnemy,this.flameTower,this.molingEnemy,this.mofoEnemy,this.gujingEnemy,this.moxiangEnemy);
        EnemyManager.getInstance().enemyArr = this.node.getChildByName("enemyNode").children;
        // console.log("enemyArr:",EnemyManager.getInstance().enemyArr);

        // 初始化攻击力
        GameManager.getInstance().refreshAttack(true);
    }

    private restartBtnHandler(): void {
        this.node.getChildByName("WinView").active = false;
    }

    private nextLevelBtnHandler(){

        // 上传排行榜数据
        let messageType1 = "commit";
        let MAIN_MENU_NUM = "level";
        let powerNum = GameManager.getInstance().gameData.level;

        WXPlatform.postMessage(messageType1,MAIN_MENU_NUM,powerNum);

        PlayerManager.getInstance().coin = 0;
        this.nextLevelView.active = false;
        let player:Player = this.player.getComponent("Player");
        player.refreshPlayerData();
        this.player.node.active = true;
        this.node.getChildByName("ObstacleNode").removeAllChildren();
        this.node.getChildByName("enemyNode").removeAllChildren();
        this.node.getChildByName("bulletNode").removeAllChildren();
        EnemyManager.getInstance().randomPosArr = [];
        GameManager.getInstance().gameData.level += 1;
        let script:ObstacleNode = this.node.getChildByName("ObstacleNode").getComponent("ObstacleNode");
        script.createdObstacle();
        EnemyManager.getInstance().createEnemyByConfig(this.enemy,this.remoteEnemy,this.chongfengEnemy,this.jumpEnemy,this.qinEnemy,this.flameTower,this.molingEnemy,this.mofoEnemy,this.gujingEnemy,this.moxiangEnemy);

        // 初始化攻击力
        GameManager.getInstance().refreshAttack(true);
    }

    private updateBtnHandler():void{
        let num:number = Number(GameUtil.getFromLocal("swordNum"));
        if( num == 0 ){
            num = PlayerManager.getInstance().swordNum;
        }
        PlayerManager.getInstance().swordNum = num+1;
        GameUtil.saveInLocal("swordNum",num+1);
        console.log("num:",num+1);
    }

    private menuBtnHandler(){
        GameManager.getInstance().gameData.level += 1;
        GameManager.getInstance().addAward(1, PlayerManager.getInstance().coin);
        console.log("goldNum:",GameManager.getInstance().gameData.coin);
        cc.director.loadScene("MainScene");

        // 上传排行榜数据
        let messageType1 = "commit";
        let MAIN_MENU_NUM = "level";
        let powerNum = GameManager.getInstance().gameData.level;
        WXPlatform.postMessage(messageType1,MAIN_MENU_NUM,powerNum);
        PlayerManager.getInstance().coin = 0;
    }

    private getRewardBtnHandler() {
        // 添加金币
        GameManager.getInstance().addAward(1, PlayerManager.getInstance().coin);
        console.log("goldNum:",GameManager.getInstance().gameData.coin);
        this.nextLevelBtnHandler();
    }

    private getADRewardBtnHandler() {
        console.log("ad multiple:",PlayerManager.getInstance().multiple);
        GameManager.getInstance().addAward(1, PlayerManager.getInstance().coin * PlayerManager.getInstance().multiple);
        this.nextLevelBtnHandler();
    }

    update(dt) {
        if (EnemyManager.getInstance().enemyArr.length == 0) {
            this.player.node.active = false;
            this.nextLevelView.active = true;
        }
    }
}
