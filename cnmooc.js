/*倒计时处理*/
var SysUseTime=0;
var SysSecond=parseInt("563");//parseInt($("#remainSeconds").html()); //这里获取倒计时的起始时间;
var useTimeFlag=(SysSecond>0);//是否倒计时  false 停止倒计时

var userSubmitFlag=0;//提交状态，如果提交则显示答案

var timeLimitFlag=SysSecond>0;//false:不限时

var _quizUseTimeRecord={};
var _quizUseTime=0;
var _quizIdRecord=0;

var learningMode=0;


function SetRemainTime(){
    SysUseTime=SysUseTime+1;
    _quizUseTime=_quizUseTime+1;
    if(timeLimitFlag){
        if(SysSecond>0&&useTimeFlag){
            SysSecond=SysSecond-1;
            var second=Math.floor(SysSecond%60);             // 计算秒
            var minite=Math.floor((SysSecond/60)%60);      //计算分
            var hour=Math.floor((SysSecond/3600)%24);      //计算小时
            var timer=(hour<10?("0"+hour):hour)+":"+(minite<10?("0"+minite):minite)+":"+(second<10?("0"+second):second);
            if(SysSecond<(60*10)){//最后10分钟显示红色
                timer="<span style="
                color:red
                ">"+timer+"</span>";
            }
            $("#remainTime").html(timer);
            if((SysUseTime%(3*60))==0){//每3分钟保存一次
                doSubmitExam(0,true);
                SysUseTime=0;
            }
        }else{//剩余时间小于或等于0的时候，就停止间隔函数
            if(useTimeFlag){//倒计时情况下
                doSubmitExamForce();//强制提交
            }
            $("#exam_paper").heartFactory().destroy();
        }
    }else{

    }
}

/*倒计时处理 end*/

var examSubmitId="39480_431329_1";
var examPaperId=0;
var examTestPaperId="39480";

$(function(){
    if(typeof isNeedHeart=='undefined'||isNeedHeart!=1){
        logStudy('50','270513','7681');
    }
    if(getObjectExamCookie("431329")=="431329"){
        $(".mouse-hover").hide();
    }else{
        /*滚轮提示图片*/
        $(".mouse-hover").click(function(){
            $(".mouse-hover").fadeOut(200);
        });
        setTimeout(function(){
            $(".mouse-hover").fadeOut(200);
        },2000);
    }


    // 修改从练习与作业列表进入 ，返回的操作
    if($(".main").has("#r_back").length>0){
        $(document).off("click","#r_back");
        $(document).on("click","#r_back",function(){
            if(userSubmitFlag==1&&learningMode==1){
                enterObjExam("7681","39480");
            }else{
                doSubmitExamBack();
            }
        });
    }

//    获取做题的试卷
    getExamObjPaper('39480','39480_431329_1','9956','600',userSubmitFlag,
        "practice",'10','2',function(){
            $("#exam_paper").heartFactory({
                execTime:0,
                execWaitingOut:1,
                heartExec:function(){
                    gM.log(' $("#exam_paper").heartFactory')
                    SetRemainTime()
                    return true
                }
            }).heartStart();

        });

    $("#submit_exam").click(function(){
        doSubmitExam(1,false);
    });
    $("#save_exam").click(function(){
        doSubmitExam(0,false);
    });
})
;


/**
 * submitFlag:1 提交　０　暂存
 * autoFlag　true:间隔时间自动保存 　false非自动保存
 **/
function doSubmitExam(submitFlag,autoFlag){
    if(!autoFlag){
        useTimeFlag=false;//非自动提交需要停止倒计时
    }
    var userQuiz=$("#exam_paper").quiz().getPractice();
    var userQuiz2=[];
    var undo_num=0;
    for(var i=0; i<userQuiz.length; i++){
        var user_Quiz=JSON.parse(userQuiz[i]);
        if(typeof user_Quiz['userAnswer']=="undefined"||user_Quiz['userAnswer'].length==0){
            undo_num++;
        }
    }
    var tips=Msg.get("exam.tips.submit");
    if(submitFlag==0){//暂存
        tips=Msg.get("exam.tips.save.success");
        doSubmitExam_ajax(submitFlag,tips,autoFlag);
    }
    else if(submitFlag==1){
        if(undo_num>0){
            tips=Msg.get("exam.tips.submit2",undo_num);
        }
        var d=$.dialog({
            title:Msg.get("exam.tips.do"),
            content:tips,
            lock:true,//增加锁屏
            okValue:Msg.get("exam.tips.continue.do"),
            ok:function(){
                tips=Msg.get("exam.tips.submit.success");
                doSubmitExam_ajax(submitFlag,tips,false);
            },
            cancelValue:Msg.get("exam.continue.do"),
            cancel:function(){
                useTimeFlag=true;
                if(SysSecond>0){//继续倒计时
                    $("#exam_paper").heartFactory().heartStart();
                }
                d.close();
            }
        });
        d.visible();
    }


}

function doSubmitExamForce(){
    useTimeFlag=false;
    var tips=Msg.get("exam.tips.submit.force");
    doSubmitExam_ajax(1,tips,false);
}

//点返回 不保存试题 记录使用时间
function doSubmitExamBack(){
    useTimeFlag=false;//停止倒计时
    var tips="";
    doSubmitExam_ajax(0,tips,false);
}

function doSubmitExam_ajax(submitFlag,tips,autoFlag){
    var useTime=SysUseTime;
    gM.log("useTime===="+useTime);
    //处理每道题计时
    _quizUseTimeRecord[_quizIdRecord]=_quizUseTimeRecord[_quizIdRecord]||0;
    _quizUseTimeRecord[_quizIdRecord]=parseInt(_quizUseTimeRecord[_quizIdRecord])+_quizUseTime;
    var user_quizs=$("#exam_paper").quiz().getPractice();
    var reSubmit=$("#reSubmit").val();
    var gradeId=$("#gradeId").val();
    var userQuiz2=[];
    var undo_num=0;
    var totalScore=0;
    var allRightFlag=true;
    for(var i=0; i<user_quizs.length; i++){
        var user_Quiz=JSON.parse(user_quizs[i]);
        user_Quiz['useTime']=_quizUseTimeRecord[user_Quiz['quizId']];
        _quizUseTimeRecord[user_Quiz['quizId']]=0;
        userQuiz2.push(JSON.stringify(user_Quiz));
        var score=parseInt(user_Quiz['markQuizScore']);
        totalScore+=score;
        if(score==0){
            allRightFlag=false;
        }
    }
    if(allRightFlag){
        totalScore=10000;
    }
    user_quizs=userQuiz2;
    var url=CONTEXTPATH+'/examSubmit/7681/saveExam/1/'+examPaperId+'/'+examSubmitId+'.mooc?testPaperId=39480';
    if(!autoFlag){
        examLockTips=$.dialog.lockTips('正在提交，请稍后...',60);
    }
    $.ajax({
        url:url,
        type:'post',
        data:{gradeId:gradeId,reSubmit:reSubmit,submitquizs:user_quizs,submitFlag:submitFlag,useTime:useTime,totalScore:totalScore,testPaperId:examTestPaperId},
        dataType:"json",
        success:function(JsonData){
            examLockTips.close();
            if(JsonData.saveNeedFlag==false){//不保存直接跳出
                enterObjExam("7681","39480");
            }else{
                if(!autoFlag){
                    //if (submitFlag == 1) {
                    //    if (typeof updateExamStudyOver == "function") {
                    //        updateExamStudyOver();// 设置学习进度
                    //    }
                    //}
                    if(tips!=""){
                        $.dialog.tips(tips);
                    }
                    enterObjExam("7681","39480");
                }
            }
        },
        error:function(){
            examLockTips.close();
            $.dialog.tips("服务器忙，请稍后再试...");
        }
    });
}


function qmark_click(){
    $(this).addClass("marked");
    var _index=$(this).parents(".practice-item").index();
    $($(".p-no").get(_index)).addClass("marked");
}


function setQuizShadow(){
    var htmlShadow='<div class="view-shadow"></div>';
    $(".practice-item").each(function(){
        $(this).append(htmlShadow);
        $(this).find(".test-practice").css("min-height","240px");
    });
}


///设置cookie
function setObjectExamCookie(uId){
    var cval=getObjectExamCookie(uId);
    if(cval==null||cval!=uId){//不存在，再添加
        var ExpireDate=new Date();
        ExpireDate.setTime(ExpireDate.getTime()+(100*365*24*3600*1000));
        var nameOfCookie="objectExamCookie_"+uId;
        document.cookie=nameOfCookie+"="+uId+";path=/; expires="+ExpireDate.toGMTString();
    }


}

///获取cookie值
function getObjectExamCookie(uId){
    var nameOfCookie="objectExamCookie_"+uId;

    if(document.cookie.length>0){
        var begin=document.cookie.indexOf(nameOfCookie+"=");
        if(begin!= -1){
            begin+=nameOfCookie.length+1;//cookie值的初始位置
            var end=document.cookie.indexOf(";",begin);//结束位置
            if(end== -1) end=document.cookie.length;//没有;则end为字符串结束位置
            return document.cookie.substring(begin,end);
        }
    }
    return null;
}

