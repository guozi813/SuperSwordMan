/**
 * creator: yisha
 */
import {BaseUI} from "../../UI/BaseUI";
import {ListenerManager} from "../../manager/listen/ListenManager";
import {ListenerType} from "../../Data/Const";


const {ccclass, property} = cc._decorator;

@ccclass
export default class LoadingView extends BaseUI {

    protected static className = "LoadingView";
    protected static pathName = "/ui/loading/";

    @property(cc.Node)
    loadIcon:cc.Node = null;
    @property(cc.Label)
    loadLabel:cc.Label = null;
    @property(Number)
    rotationSpeed:number = 1;
    private _type:number = 1;

    //2，网络加载中，1，进度，3，匹配中...

    constructor() {
        super();
    }

    start() {
        if (this._type == 1) {
            ListenerManager.getInstance().add(ListenerType.LOADPROGRESS,this,this.updateProgress);
            this.loadLabel.string = "0%";
        }else if (this._type == 2) {
            this.loadLabel.string = "网络请求中...";
        }else if (this._type == 3){
            this.loadLabel.string = "正在匹配中...";
        }
        // this.node.getChildByName("bg").on(cc.Node.EventType.TOUCH_END,function () {
        //     UIManager.getInstance().closeUI(LoadingView);
        // }.bind(this),this);
    }

    updateProgress(data):void {
        let completedCount = data[0];
        let totalCount = data[1];
        // cc.log("当前加载进度：" + completedCount + "/" + totalCount);
        let percent = Math.round(completedCount/totalCount * 100);
        this.loadLabel.string = percent + "%";
    }
    update(dt) {
        this.loadIcon.angle -= this.rotationSpeed + dt;
    }


    /**
     * 根据不同的类型显示
     * @param type 1网络加载中，2资源加载进度
     */
    initWithParameter(type:number):void {

        if (type) {
            this._type = type;
        }
    }

    onDestroy() {
        // super.onDestroy();
        ListenerManager.getInstance().remove(ListenerType.LOADPROGRESS,this,this.updateProgress);
        this._type = 1;
    }
}
