/**
 * creator: yisha
 */
import {BaseConfigContainer} from "./BaseConfigContainer";
import {ConfigConst} from "../Data/Const";
export class LevelConfigData
{
    id:number;
    enemyTypeNum:number;
    enemyNum:string;
    obstacleTypeNum:string;
    obstacleNum:string;
    speed:string;
    aggressivity:number;
    totalHp:number;
    gold:number;
}
export class LevelConfigContainer extends BaseConfigContainer {
    private levelConfigData: LevelConfigData[] = [];
    constructor(callback: Function, caller: any, arg: any)
    {
        super();
        cc.loader.loadRes(ConfigConst.CONFIG_FILE_DIR+ "level", (err, object)=>
            {
                if (err) {
                    cc.log("load level.json err");
                    cc.log(err);
                }
                else {
                    object = object.json;
                    for(var i in object)
                    {
                        this.levelConfigData[i] = object[i];
                        this.levelConfigData[i]["id"] = i;
                    }
                    if(callback)
                    {
                        callback.call(caller, arg);
                    }
                }
            }
        );
    }

    getConfigData(): LevelConfigData[]
    {
        return this.levelConfigData;
    }
}
