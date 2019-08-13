/**
 * creator: yisha
 */
import {BaseConfigContainer} from "./BaseConfigContainer";
import {ConfigConst} from "../Data/Const";
import {EnemyConfigData} from "./EnemyConfigContainer";

export class ObstacleConfigData {
    name:string;
    des:string;
    image:string;
    penetrate:string;
    moderate:string;
    obstruct:string;
    healling:number;
    hurting:number;
    cross:string;
    size:number;
    remark:string;
}
export class ObstacleConfigContainer extends BaseConfigContainer {
    private obstacleConfigData: ObstacleConfigData[] = [];
    constructor(callback: Function, caller: any, arg: any)
    {
        super();
        cc.loader.loadRes(ConfigConst.CONFIG_FILE_DIR+ "obstacle", (err, object)=>
            {
                if (err) {
                    cc.log("load obstacle.json err");
                    cc.log(err);
                }
                else {
                    object = object.json;
                    for(var i in object)
                    {
                        this.obstacleConfigData[i] = object[i];
                        this.obstacleConfigData[i]["id"] = i;
                    }
                    if(callback)
                    {
                        callback.call(caller, arg);
                    }
                }
            }
        );
    }

    getConfigData(): ObstacleConfigData[]
    {
        return this.obstacleConfigData;
    }
}
