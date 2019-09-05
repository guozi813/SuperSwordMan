/**
 * creator: yisha
 */
import {GameManager} from "../../manager/GameManager";
import {PlayerManager} from "../../manager/PlayerManager";
import {BaseUI} from "../../UI/BaseUI";
import {UIManager} from "../../UI/UIManager";
import Player from "../player/Player";
import {EnemyManager} from "../../manager/EnemyManager";
import ObstacleNode from "../obstacle/ObstacleNode";


const {ccclass, property} = cc._decorator;

@ccclass
export default class ResultView extends BaseUI {

    protected static className = "ResultView";
    protected static pathName = "/ui/main/";

    @property(cc.Label)
    numLabel: cc.Label = null;

    @property(cc.Label)
    adNumLabel: cc.Label = null;

    @property(cc.Prefab)
    player:cc.Prefab = null;
    @property(cc.Prefab)
    enemy: cc.Prefab = null;
    @property(cc.Prefab)
    remoteEnemy: cc.Prefab = null;
    @property(cc.Prefab)
    chongfengEnemy:cc.Prefab = null;
    @property(cc.Prefab)
    jumpEnemy:cc.Prefab = null;
    @property(cc.Prefab)
    flameTower:cc.Prefab = null;
    @property(cc.Prefab)
    qinEnemy:cc.Prefab = null;
    @property(cc.Prefab)
    molingEnemy:cc.Prefab = null;
    @property(cc.Prefab)
    MofoEnemy:cc.Prefab = null;
    @property(cc.Prefab)
    gujingEnemy:cc.Prefab = null;
    @property(cc.Prefab)
    moxiangEnemy:cc.Prefab = null;

    private multiple: number = 1; // 广告观看后增加的倍数

    // onLoad () {}

    start() {
        this.numLabel.string = String(PlayerManager.getInstance().coin);
        this.adNumLabel.string = String(PlayerManager.getInstance().coin * this.multiple);
    }

    private getRewardBtnHandler() {
        // 添加金币
        GameManager.getInstance().addAward(1, PlayerManager.getInstance().coin);
        // LogWrap.log("goldNum:",GameManager.getInstance().gameData.coin);

        UIManager.getInstance().closeUI(ResultView);
        this.nextLevel();
    }

    private getADRewardBtnHandler() {
        // TODO 添加金币 倍数？
        GameManager.getInstance().addAward(1, PlayerManager.getInstance().coin * this.multiple);
        // LogWrap.log("ad goldNum:",GameManager.getInstance().gameData.coin);
        this.nextLevel();
    }

    private nextLevel(){
        PlayerManager.getInstance().coin = 0;
        let node = cc.instantiate(this.player);
        let player:Player = node.getComponent("Player");
        node.parent = this.node.getParent().getChildByName("playerNode");
        // player.refreshPlayerData();
        // this.player.node.active = true;
        // LogWrap.log("resultView parent",this.node.getParent());
        this.node.getParent().getChildByName("ObstacleNode").removeAllChildren();
        this.node.getParent().getChildByName("enemyNode").removeAllChildren();
        this.node.getParent().getChildByName("bulletNode").removeAllChildren();
        EnemyManager.getInstance().randomPosArr = [];
        GameManager.getInstance().gameData.level += 1;
        let script:ObstacleNode = this.node.getParent().getChildByName("ObstacleNode").getComponent("ObstacleNode");
        script.createdObstacle();
        EnemyManager.getInstance().createEnemyByConfig(this.enemy,this.remoteEnemy,this.chongfengEnemy,this.jumpEnemy,this.qinEnemy,this.flameTower,this.molingEnemy,this.MofoEnemy,this.gujingEnemy,this.moxiangEnemy);
    }

    // update (dt) {}
}
