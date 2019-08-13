/**
 * creator: yisha
 */
import {BaseConfigContainer} from "./BaseConfigContainer";
import {ConfigConst} from "../Data/Const";
import {SwordConfigData} from "./SwordConfigContainer";


export class SkillConfigData {
    id:number;
    name:string;
    des:string;
    image:string;
    gold:number;
    goldFactor:number;
    unlock:number;
    num:number;
    numFactor:number;
    skillExplain:string
}

export class SkillConfigContainer extends BaseConfigContainer{
    private skillConfigData:SkillConfigData[] = [];
    constructor(callback:Function,caller:any,arg:any){
        super();
        cc.loader.loadRes(ConfigConst.CONFIG_FILE_DIR+ "skill",(err,object)=>{
            if(err){
                cc.log("load skill.json err");
            }else{
                object = object.json;
                for (let i in object){
                    this.skillConfigData[i] = object[i];
                    this.skillConfigData[i]["id"] = i;
                }
                if(callback){
                    callback.call(caller,arg);
                }
            }
        });
    }
    public getConfigData():SkillConfigData[] {
        return this.skillConfigData;
    }
}
