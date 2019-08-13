
const {ccclass, property} = cc._decorator;

@ccclass
export class PlayerManager {

    private static _instance:PlayerManager;
    public static getInstance():PlayerManager{
        if( !this._instance ){
            this._instance = new PlayerManager();
        }
        return this._instance;
    }

    public isMove:boolean = null; // 人物是否移动
    public swordNum:number = 1; // 玩家拥有的剑数量
    public goldNum:number = 0; // 玩家拥有的金币数
    // public recoverNum:number = 0; // 玩家回收的剑数量
    public fireSword:number = 0; // 玩家发射的剑数量
    public swordPos:any = null; // 剑初始位置
    public totalHp: number = 1000; // 玩家总血量
    public _curHp: number = 0; // 玩家当前血量
    public controlX:number =1; // 控制x坐标变不变
    public controlY:number =1; // 控制y坐标变不变
    public angle:number = 0; // 运动方向
    public reduceSpeed:number = 1; // 减速
    public coin:number = 0; // 每局获得金币数
    public aggressivity:number = 0;
    public multiple:number = 0;
    public checkOutSkillId:number = 1; // 查看的技能id

    // 重置血量
    public refreshHp(){
        this._curHp = this.totalHp;
    }

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
window["PlayerManager"] =PlayerManager.getInstance();