var examLockTips;

function delayClose(){
    window.setTimeout(function(){
        examLockTips.close();
    },2000);
}

/**
 * 更新条目学习完成记录
 * @return
 */
function updateExamStudyOver(){
    var itemId="270513";
    if(itemId==''){
        itemId=$("#itemId").val();
    }
    $.ajax({
        type:"post",
        url:CONTEXTPATH+"/study/update/item.mooc",
        data:{
            itemId:itemId
        },
        dataType:"json",
        success:function(response){

        },
        error:function(){}
    });
}

$(function(){
    $("body").heartFactory({
        heartExec:defaultHeart
    }).heartStart();
})

/* ==================客观练习 使用js================*/
/**
 * 客观题练习获取试卷
 * testPaperId:
 * submitId:
 * paperId:
 * limitTime:
 * modelType：practice:做题模式 view:查看浏览模式（教学互动中使用）preview:预览（课件预览中使用）
 **/
function getExamObjPaper(testPaperId,submitId,paperId,limitTime,submitFlag,modelType,examQuizNum,curSubmitNum,callback){
    var url=CONTEXTPATH+'/examSubmit/7681/getExamPaper-'+submitId+'.mooc';
    examLockTips=$.dialog.lockTips('正在加载试卷，请稍后...',60);
    $.ajax({
        url:url,
        type:'post',
        data:{testPaperId:testPaperId,paperId:paperId,limitTime:limitTime,modelType:modelType,examQuizNum:examQuizNum,curSubmitNum:curSubmitNum},
        dataType:"json",
        success:function(JsonData){
            var paper=JsonData['paper']||{};
            var submit=JsonData['examSubmit']||{};
            var submitId=JsonData['submitId'];
            var learningMode=JsonData['learningMode']||0;
            var answerReviewType=JsonData['answerReviewType']||1;
            var answerReviewTypeFlag=(answerReviewType==2&&submitFlag==1);
            examPaperId=paper['paperId'];
            examSubmitId=submitId;
            var icon='<i class="q-mark"></i>';
            if(submitFlag==1){
                icon='<i class=""></i>';
            }
            $("#exam_paper").quiz({
                divClass:"practice-item",
                icon:icon,
                practice:true,
                solution:answerReviewTypeFlag,
                response:answerReviewTypeFlag,
                showDifficult:false,
                autoReview:submitFlag==1,
                practiceChange:function(index,doneFlag){
                    var userQuiz=$("#exam_paper").quiz().getPractice();
                    quizDone(index,doneFlag)
                },
                success:function(){
                    $(".practice-item").eq(0).addClass("current");
                    /*提交保存试卷*/

                    $("#exam_paper").find(".practice-item").css("min-height","240px");
                    if(modelType=="practice"){//做题模式下
                        setObjectiveUserAnswer();
                        // setExamEvent();
                    }else if(modelType=="preview"){
                        makeQuizNav();
                        // setExamEvent();
                    }
                    setTimeout(setExamEvent,2000);
                    if(submitFlag==1){//已经提交显示答案
                        //if(learningMode == 0){
                        $("#exam_paper").quiz().autoReview();
                        //}
                        $(".view-shadow").remove();//去除阴影遮罩
                        useTimeFlag=false;//取消倒计时
                        $("#submit_exam").remove();//去除提交按钮
                        $("#save_exam").remove();//去除暂存按钮
                    }
                }
            }).setPaper(paper).setSubmit(submit).builder();

            examLockTips.close();
            callback&&callback();
        },
        error:function(){
            examLockTips.close();
            $.dialog.tips("服务器忙，请稍后再试...");
        }
    })
}

//构建题目导航部分
function setObjectiveUserAnswer(){
    var dataList=$("#exam_paper").quiz().getData();
    var quizNav=[];//题目导航部分
    var done;

    var n=0;
    for(var i=0; i<dataList.length; i++){
        var data=dataList[i];
        var quizId=data['quizId']||{};
        var quiz=data['quizId']||{};
        var submit=data['submit']||{};
        n=n+1;
        done=false;
        if(typeof submit['userAnswer']!="undefined"&&submit['userAnswer']!=''){
            done=true;
        }
        if(done){
            quizNav.push('<a class="p-no done" href="javascript:void(0)">'+(n)+'</a>');
        }else{
            quizNav.push('<a class="p-no" href="javascript:void(0)">'+(n)+'</a>');
        }

    }
    $(".practice-no").append(quizNav.join(""));
}

function setExamEvent(){
    $(".practice-options").scrollFix();
    var vIndex=0;
    var running=false;

    //遍历所有item找出最高的一个
    var wrapHeight=$(".practice-wrapper").outerHeight();
    $(".practice-wrapper").find(".practice-item").each(function(){
        var height=$(this).outerHeight();
        if(height>wrapHeight){
            wrapHeight=height;
        }
    });
    $(".practice-wrapper").css({"height":wrapHeight});


    $('.practice-wrapper').live("mousewheel",function(event,d){
        var $item=$(".practice-item");
        var psize=$item.size();
        if(vIndex>0&&vIndex<psize-1)
            event.preventDefault();
        if(d>0){
            scrollbar(vIndex-1);
        }else{
            scrollbar(vIndex+1);
        }
    });


//    $('.practice-wrapper').live("scrollstart",function(event, d){
//        var $item = $(".practice-item");
//        var psize = $item.size();
//        if (vIndex > 0 && vIndex < psize - 1)
//            event.preventDefault();
//        if (d > 0) {
//            scrollbar(vIndex - 1);
//        } else {
//            scrollbar(vIndex + 1);
//        }
//    });

    function scrollbar(n){
        var $item=$(".practice-item");
        var psize=$item.size();
        setObjectExamCookie("431329");
        if(n<0||n>psize-1)
            return false;
        if(!running){
            vIndex=n;
            var $pcurrent=$(".practice-item.current");
            if($pcurrent.length==0){
                $pcurrent=$(".practice-item").eq(n);
            }
            if(vIndex<psize){
                /*习题操作*/
                $pcurrent.removeClass("current");
                $($item.get(vIndex)).addClass("current");
                /*左侧题号操作*/
                $(".p-no.current").removeClass("current");
                $($(".p-no").get(vIndex)).addClass("current");
            }
            var _scrollTop=$(".practice-item.current").position().top;
            var height=$(".practice-item.current").outerHeight();
            var pHeight=$('.practice-wrapper').outerHeight();

            if(pHeight>height){
                var compare=(pHeight-height)/2;

                _scrollTop=_scrollTop-compare;
            }
            running=true;
            $('.practice-wrapper').animate({
                scrollTop:_scrollTop
            },200,function(){
                running=false;
            });
        }

        //给单个题记录做题时间
        var qid=$(".practice-item.current").attr("quiz_id");
        if(_quizUseTime>0){
            _quizUseTimeRecord[_quizIdRecord]=_quizUseTimeRecord[_quizIdRecord]||0;
            _quizUseTimeRecord[_quizIdRecord]=parseInt(_quizUseTimeRecord[_quizIdRecord])+_quizUseTime;
        }
        _quizIdRecord=qid;
        _quizUseTime=0;
    }


    /*上下按键*/
    $(document).off("keydown.test");
    $(document).on("keydown.test",function(event){
        setObjectExamCookie("431329");
        var keyIndex=$(".practice-item.current").index();
        switch(event.keyCode){
            case 38:
                scrollbar(keyIndex-1);
                break;
            case 40:
                scrollbar(keyIndex+1);
                break;
        }
    });

    scrollbar(0);
    /*习题题号点击事件*/
    $(document).on("click.p-no",".p-no",function(){
        var index=$(this).index();
        scrollbar(index);
    });
}

/* ==================客观练习 使用js end================*/

/* ==================主观练习 使用js   ================*/
function showPeerReviewTips(){
    $.dialog({
        title:Msg.get("exam.peer.review.note"),
        content:$(".dialog")[0],
        width:"680px",
        lock:true,
        okValue:Msg.get("exam.know"),
        ok:function(){
            shake($(".btn-icon-intro"),"highlight",2,300);
        }
    });
}

/* ==================主观练习 使用js end================*/




/* ==================教学互动 使用js================*/

//计算每个合计分值
function sumExamPeerReviewScore(){
    $("[id^='totalScoreTd_']").each(function(i,n){
        var uId=$(n).attr("id").split("_")[1];
        var tScore=0;
        $(".reviewRecordScore_"+uId).each(function(j,m){
            tScore=tScore+parseInt($(m).text());
        });
        $(n).text(tScore)
    });
}

function getExamNodeAttr(attrNodeId,attrNodeName,attrNodeSize,attrNodeState){
    attrNodeId=attrNodeId||"";
    attrNodeName=attrNodeName||"";
    attrNodeSize=attrNodeSize||"";
    attrNodeState=JSON.parse(attrNodeState||"{}");
    var attrNode=[];
    var arr_nId=[],arr_nName=[],arr_nSize=[];
    if(typeof attrNodeId!="undefined"&&$.trim(attrNodeId+"").length>0&&attrNodeId.indexOf(",")>=0){
        arr_nId=attrNodeId.split(",");
        arr_nId.length--;
        arr_nId.shift();
        if(typeof attrNodeName!="undefined"&&$.trim(attrNodeName+"").length>0&&attrNodeName.indexOf(",")>=0){
            arr_nName=attrNodeName.split(",");
            arr_nName.length--;
            arr_nName.shift();
        }
        if(typeof attrNodeSize!="undefined"&&$.trim(attrNodeSize+"").length>0&&attrNodeSize.indexOf(",")>=0){
            arr_nSize=attrNodeSize.split(",");
            arr_nSize.length--;
            arr_nSize.shift();
        }
    }
    for(var x=0; x<arr_nId.length; x++){
        var attr_node={};
        attr_node['node_id']=arr_nId[x];
        attr_node['node_name']=arr_nName[x];
        attr_node['node_size']=arr_nSize[x];
        attr_node['node_state']=attrNodeState[arr_nId[x]]||0;
        attrNode.push(attr_node);
    }
    return attrNode;
}

function quizDone(index,doneFlag){
    if(doneFlag==0){//未做
        $($(".p-no").get(index)).removeClass("done");
    }else if(doneFlag==1){//已做
        $($(".p-no").get(index)).addClass("done");
    }
}


function showByPeerReviewInfo(openId,submitId){
    var url=CONTEXTPATH+"/examReview/"+openId+"/showByPeerReviewInfo-"+submitId+".mooc";
    $.ajax({
        type:"post",
        url:url,
        dataType:"html",
        success:function(result){
            $(".score-detail-box").html();
            $(".score-detail-box").html(result);
            sumExamPeerReviewScore();

            $(".main_viewcomment").append("<div class=\"view-tooltip\"><i class=\"icon-remove\"></i><h3 class=\"vt-header\">评语</h3><div class=\"vt-body\"></div></div>")


            /*滚动效果*/
            var $targetBtn=$(".process-group").find(".button-mark");
            $targetBtn.click(function(){
                var _index=$(this).index()+1;
                goToByScroll(_index);
                $(this).siblings().removeClass("current");
                $(this).addClass("current");
            });

            function goToByScroll(index){
                if(index==1){
                    $('html,body').animate({
                        scrollTop:$("#scroll-item-"+index).offset().top
                    },'slow');
                }else{
                    $('html,body').animate({
                        scrollTop:$("#scroll-item-"+index).offset().top-38
                    },'slow');
                }

            }

            $(window).bind("resize",function(){
                var initLeft=$(".button-mark-last").offset().left;
                $(".process-group").css({
                    left:initLeft
                });
            });

            function scrollAnimate(){
                var $rootBtn=$(".button-mark-last");
                var initLeft=$rootBtn.offset().left;
                $(".process-group").css({
                    left:initLeft
                });
                var map=[],name=[];
                $('.processItem').each(function(n){
                    map[n]=$(this).offset().top;
                    if(n!=0){
                        map[n]=$(this).offset().top-(n*38);
                    }
                    //map[n] = $(this).offset().top;
                    name[n]=$(this).attr("id");
                });

                function scroll(){
                    var i=0,j=0;
                    while(map[i++]<=$(window).scrollTop()){
                        var temp=i-1;
                        $($targetBtn.get(temp)).show(0).siblings().removeClass("current");
                        $($targetBtn.get(temp)).addClass("current");
                        $("#"+name[temp]).find(".button-mark").hide(0);
                        var k=temp;
                        while(k<$targetBtn.length){
                            $($targetBtn.get(++k)).removeClass("current").hide(0);
                            $("#"+name[k]).find(".button-mark").show(0);
                        }
                    }
                    while(map[j++]>$(window).scrollTop()-1){
                        var temp=j-1;
                        $($targetBtn.get(temp)).removeClass("current").hide(0);
                        $("#"+name[temp]).find(".button-mark").show(0);
                    }
                }

                scroll();
                $(window).on('scroll',function(){
                    scroll();
                });
            }

            scrollAnimate()


        },
        error:function(){}
    });
}



/* ==================教学互动 使用js end================*/
