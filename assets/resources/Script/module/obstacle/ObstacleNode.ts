/**
 * creator: yisha
 */
import {GameUtil} from "../../manager/GameUtil";
import {EnemyManager} from "../../manager/EnemyManager";
import {PoolManager} from "../../manager/PoolManager";
import {TipsManager} from "../../manager/TipsManager";
import {ConfigManager} from "../../Configs/ConfigManager";
import {LevelConfigContainer} from "../../Configs/LevelConfigContainer";
import {GameManager} from "../../manager/GameManager";


const {ccclass, property} = cc._decorator;

@ccclass
export default class ObstacleNode extends cc.Component {

    @property({type: cc.Prefab, displayName: "箱子等"})
    stick: cc.Prefab = null; // 箱子 0
    @property({type: cc.Prefab, displayName: "水塘"})
    pool: cc.Prefab = null; // 水塘 1
    @property({type: cc.Prefab, displayName: "大药"})
    bigHP: cc.Prefab = null; // 大血瓶 2
    @property({type: cc.Prefab, displayName: "地刺"})
    thorns: cc.Prefab = null; // 地刺 3
    @property({type: cc.Prefab, displayName: "井"})
    well: cc.Prefab = null; // 井 4
    @property({type: cc.Prefab, displayName: "小药"})
    smallHP: cc.Prefab = null; // 5
    @property({type: cc.Prefab, displayName: "炸弹"})
    tnt: cc.Prefab = null;// 6
    @property({type: cc.Prefab, displayName: "草地"})
    grassland: cc.Prefab = null;// 7
    @property({type: cc.Prefab, displayName: "喷火塔"})
    bonfire: cc.Prefab = null;// 8
    @property({type: cc.Prefab, displayName: "捕兽夹"})
    trap: cc.Prefab = null;// 9
    @property({type: cc.Prefab, displayName: "泉水"})
    spring: cc.Prefab = null;// 10

    private obstacleTypeArr = []; // 障碍物类型数组


    // id:关卡 enemyNum:敌人数量 obstacleTypeNum:障碍物种类数量 obstacleNum:障碍物数量
    private mapConfig = {
        101: {enemyNum: 3, obstacleTypeNum: 1, obstacleNum: 1},
        102: {enemyNum: 3, obstacleTypeNum: 10, obstacleNum: 10}
    };

    // onLoad () {}

    start() {
        this.createdObstacle();
    }


    // 创建障碍物
    public createdObstacle() {
        this.obstacleTypeArr = [];
        let level = GameManager.getInstance().gameData.level;
        let levelConfig = ConfigManager.getInstance().getConfigById(LevelConfigContainer,level);
        if (!levelConfig) {
            // 已到达最后一关 返回主菜单
            cc.director.loadScene("GameOverScene");
            TipsManager.getInstance().removeAllTickId();
            return;
        }

        while(this.obstacleTypeArr.length<levelConfig.obstacleTypeNum-1){
            let random = GameUtil.randomNum(11,false);
            if(this.obstacleTypeArr.indexOf(random)<=-1){
                this.obstacleTypeArr.push(random);
            }
        }
        let num = levelConfig.obstacleNum;
        // let num = 1; // TODO 测试
        for (let j = 0; j < num; j++) {
            let index = GameUtil.randomNum(levelConfig.obstacleTypeNum,false);
            let random = this.obstacleTypeArr[index];
            // let random = 0;
            switch (random) {
                case 0:
                    let stickNode = PoolManager.getInstance().get("stickPool", this.stick);
                    let stickPos = EnemyManager.getInstance().createPosPlus();
                    stickNode.parent = this.node;
                    stickNode.position = cc.v2(stickNode.width * stickPos.x, stickNode.width * stickPos.y);
                    break;
                case 1:
                    let poolNode = PoolManager.getInstance().get("poolPool", this.pool);
                    let poolPos = EnemyManager.getInstance().createPosPlus();
                    poolNode.parent = this.node;
                    poolNode.position = cc.v2(poolNode.width * poolPos.x, poolNode.width * poolPos.y);
                    break;
                case 2:
                    let bigHPNode = PoolManager.getInstance().get("bigHPPool", this.bigHP);
                    let bigHPPos = EnemyManager.getInstance().createPosPlus();
                    bigHPNode.parent = this.node;
                    bigHPNode.position = cc.v2(bigHPNode.width * bigHPPos.x, bigHPNode.width * bigHPPos.y);
                    break;
                case 3:
                    // 地刺
                    let thornsNode = PoolManager.getInstance().get("thornsPool", this.thorns);
                    let thornsPos = EnemyManager.getInstance().createPosPlus();
                    thornsNode.parent = this.node;
                    thornsNode.position = cc.v2(thornsNode.width * thornsPos.x, thornsNode.width * thornsPos.y);
                    break;
                case 4:
                    // 井
                    let wellNode = PoolManager.getInstance().get("wellPool", this.well);
                    let wellPos = EnemyManager.getInstance().createPosPlus();
                    wellNode.parent = this.node;
                    wellNode.position = cc.v2(wellNode.width * wellPos.x, wellNode.width * wellPos.y);
                    break;
                case 5:
                    // 小药
                    let smallHPNode = PoolManager.getInstance().get("smallHPPool", this.smallHP);
                    let smallHPPos = EnemyManager.getInstance().createPosPlus();
                    smallHPNode.parent = this.node;
                    smallHPNode.position = cc.v2(smallHPNode.width * smallHPPos.x, smallHPNode.width * smallHPPos.y);
                    break;
                case 6:
                    // 炸弹
                    let tntNode = PoolManager.getInstance().get("tntPool", this.tnt);
                    let tntPos = EnemyManager.getInstance().createPosPlus();
                    tntNode.parent = this.node;
                    tntNode.position = cc.v2(tntNode.width * tntPos.x, tntNode.width * tntPos.y);
                    break;
                case 7:
                    // 草丛
                    let grasslandNode = PoolManager.getInstance().get("grasslandPool", this.grassland);
                    let grasslandPos = EnemyManager.getInstance().createPosPlus();
                    grasslandNode.parent = this.node;
                    grasslandNode.position = cc.v2(grasslandNode.width * grasslandPos.x, grasslandNode.width * grasslandPos.y);
                    break;
                case 8:
                    // 火堆
                    let bonfireNode = PoolManager.getInstance().get("bonfirePool", this.bonfire);
                    let bonfirePos = EnemyManager.getInstance().createPosPlus();
                    bonfireNode.parent = this.node;
                    bonfireNode.position = cc.v2(bonfireNode.width * bonfirePos.x, bonfireNode.width * bonfirePos.y);
                    break;
                case 9:
                    // 捕兽夹
                    let trapNode = PoolManager.getInstance().get("trapPool", this.trap);
                    let trapPos = EnemyManager.getInstance().createPosPlus();
                    trapNode.parent = this.node;
                    trapNode.position = cc.v2(trapNode.width * trapPos.x, trapNode.width * trapPos.y);
                    break;
                case 10:
                    // 泉水
                    let springNode = PoolManager.getInstance().get("springPool", this.well);
                    let springPos = EnemyManager.getInstance().createPosPlus();
                    springNode.parent = this.node;
                    springNode.position = cc.v2(springNode.width * springPos.x, springNode.width * springPos.y);
                    break;
            }
        }

    }


    // update (dt) {}
}
