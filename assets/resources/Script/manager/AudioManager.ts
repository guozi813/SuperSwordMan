import {SoundConst} from "../Data/Const";

export class AudioManager
{
    private static instance: AudioManager = null;
    public static bgm: string = "";
    public static musicId:number;
    private static _caseSoundsRes:any = {};//音效缓存
    public isOpenMusic:boolean = true;//是否开启背景音乐
    public isOpenSound:boolean = true;//是否开启音效
    public static getInstance(): AudioManager
    {
        if(this.instance == null)
        {
            this.instance = new AudioManager();
        }
        return this.instance;
    }

    public playSound(soundName: string, loop?: boolean, volume?: number)
    {

        if (!this.isOpenSound) return;
        let clip = AudioManager._caseSoundsRes[soundName];
        if (clip) {
            // LogWrap.log("播放音效：");
            cc.audioEngine.play(clip, loop?loop:false, volume?volume:1);
            return;
        }
        let path = SoundConst.AUDIO_DIR + soundName;
        //cc.audioEngine.play(cc.url.raw(path), loop?loop:false, volume?volume:1);
        cc.loader.loadRes(path, cc.AudioClip, function (err, clip) {
            if(err)
            {
                cc.error(err);
                return;
            }
            let name = clip.name;
            AudioManager._caseSoundsRes[name] = clip;
            var audioID = cc.audioEngine.play(clip, loop?loop:false, volume?volume:1);
        });
    }

    public stopAll()
    {
        cc.audioEngine.stopAll();
    }

    public pauseAll()
    {
        cc.audioEngine.pauseAll();
    }

    public resumeAll()
    {
        cc.audioEngine.resumeAll();
    }

    public playBGM(soundName: string)
    {

        if (!this.isOpenMusic)return;
        if(AudioManager.bgm == soundName)
        {
            return;
        }
        AudioManager.bgm = soundName;
        cc.audioEngine.stopMusic();
        let clip = AudioManager._caseSoundsRes[soundName];
        if (clip) {
            // LogWrap.log("播放背景：" + soundName);
            cc.audioEngine.playMusic(clip, true);
            return;
        }
        let path = SoundConst.AUDIO_DIR + soundName;
        //cc.audioEngine.play(cc.url.raw(path), loop?loop:false, volume?volume:1);
        cc.loader.loadRes(path, cc.AudioClip, function (err, clip) {
            if(err)
            {
                cc.error(err);
                return;
            }
            AudioManager._caseSoundsRes[clip.name] = clip;
            if (clip.name == AudioManager.bgm) {
                // LogWrap.log("播放背景：" + clip.name);
                cc.audioEngine.playMusic(clip, true);
            }
        });
    }



    /**
     * 预加载资源
     */
    public preLoadSound(soundName:string):void {
        let path = SoundConst.AUDIO_DIR + soundName;
        cc.loader.loadRes(path, cc.AudioClip, function (err, clip) {
            if(err)
            {
                cc.error(err);
                return;
            }else {
            }
        });
    }

    public resumeBGM()
    {
        cc.audioEngine.stopMusic();
        let path = SoundConst.AUDIO_DIR + AudioManager.bgm;
        let clip = AudioManager._caseSoundsRes[AudioManager.bgm];
        if (clip) {
            cc.audioEngine.playMusic(clip, true);
            return;
        }
        cc.loader.loadRes(path, cc.AudioClip, function (err, clip) {
            if(err)
            {
                cc.error(err);
                return;
            }
            cc.audioEngine.playMusic(clip, true);
        });
    }

    /**
     * 停掉背景音乐
     */
    public stopBGM():void {
        cc.audioEngine.stopMusic();
    }

    /**
     * 按钮点击
     */
    public btnOnClick():void{
        this.playSound("click");
    }

    /**
     * 升级
     */

    public levelBtn():void{
        this.playSound("levelUp1");
    }
}