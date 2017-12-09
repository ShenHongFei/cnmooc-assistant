# ==UserScript==
# @name         好大学在线 助手
# @namespace    https://github.com/ShenHongFei/cnmooc-assistant
# @homepage     https://github.com/ShenHongFei/cnmooc-assistant
# @author       沈鸿飞
# @description  .
# @version      2017.12.09
# @match        http://www.cnmooc.org/study/initplay/*.mooc
# @match        http://www.cnmooc.org/study/unit/*.mooc
# @match        http://www.cnmooc.org/examTest/stuExamList/*.mooc
# @run-at       document-idle
# @license      MIT License
# ==/UserScript==

# 满分批阅当前 mark()
# 使用方法：在console中调用assistant.mark()
mark=->
    sleep=(ms)->
        new Promise (resolve)->setTimeout(resolve,ms)
        
    $('input[id^=quiz_]').each (i,e)->
        max_point=e.className.match(/max\[(\d+)\]/)[1]
        e.setAttribute('value',max_point)
    if $('#reviewSubmitDiv').css('display')!='none'
        $('#submitReviewBtn').click()
    else
        $('#gotoReviewSubmitBtn').click()
    await sleep(1000)
    $("input[value='提交互评']").click()
    await sleep(2000)
    console.log '完成一次批阅'
    $("input[value='确定']").click()

# 修改doSubExam逻辑可以在跳转是插入自己逻辑
    
# 完成该项
complete_item=->
    updateStudyOver()

# 解锁视频进度
unblock_video_progress=->
    $('#isOver').val(2)
    eval($(".video-show script").html())

# 暂停计时
pause_quiz_timer=->
    if unsafeWindow?
        unsafeWindow.useTimeFlag=false
    else useTimeFlag=false

# answers={question.quizId:[options(string)]}
answers=null
questions=null
options=null

# async 修改自 doSubmitExam_ajax
test_answer=(questions)->
    #处理每道题计时
    _quizUseTimeRecord[_quizIdRecord]=_quizUseTimeRecord[_quizIdRecord] or 0
    _quizUseTimeRecord[_quizIdRecord]=parseInt(_quizUseTimeRecord[_quizIdRecord])+_quizUseTime
    user_quizs=(JSON.stringify question for question in questions)
    reSubmit=$('#reSubmit').val()
    gradeId=$('#gradeId').val()
    userQuiz2=[]
    totalScore=0
    allRightFlag=true
    i=0
    while i<user_quizs.length
        user_Quiz=JSON.parse(user_quizs[i])
        user_Quiz['useTime']=_quizUseTimeRecord[user_Quiz['quizId']]
        _quizUseTimeRecord[user_Quiz['quizId']]=0
        
        userQuiz2.push JSON.stringify(user_Quiz)
        score=parseInt(user_Quiz['markQuizScore'])
        totalScore+=score
        if score==0
            allRightFlag=false
        i++
    if allRightFlag
        totalScore=10000
        
    user_quizs=userQuiz2
    console.log(user_quizs)
    ret_data=await $.when $.ajax
        url:CONTEXTPATH+'/examSubmit/7681/saveExam/1/'+examPaperId+'/'+examSubmitId+'.mooc?testPaperId='+examTestPaperId
        type:'post'
        data:
            gradeId:gradeId
            reSubmit:reSubmit
            submitquizs:user_quizs
            submitFlag:0
            useTime:1
            totalScore:totalScore
            testPaperId:examTestPaperId
        dataType:'json'
        success:(data) -> if !data.successFlag then throw Error(data.successFlag=false)
        error:-> console.log('test_answer error')
    JSON.parse ret_data.examSubmit.submitContent

# async
get_quiz_answers=->
    # 初始化页面问题
    questions=(JSON.parse question for question in $('#exam_paper').quiz().getPractice())
    
    # 枚举、测试、更新答案
    options=$('[option_id]').map (i,e)-> e.getAttribute('option_id')
    answers={}
    for oi in [1,2,4,8,3,5,6,7,9,10,11,12,13,14,15]
        option_id_flags=[]
        for i in [0..3]
            option_id_flags.push (oi<<i&0b1000)==0b1000
        # 检测已有正确答案，对每一题生成答案，设置userAnswer
        for question,qi in questions
            perfect_answer=answers[question.quizId]
            if perfect_answer
                question.userAnswer=perfect_answer.join(',')
            else
                current_round_option_ids=[]
                # option_id 并非连续
                for i in [0..3]
                    current_round_option_ids.push options[qi*4+i] if option_id_flags[i]
                question.userAnswer=current_round_option_ids.join(',')
        console.log questions
        # 枚举的答案准备完成，开始测试
        test_result=await test_answer(questions)
        for result in test_result
            result=JSON.parse(result)
            if result.markResult
                # perfect_options=(parseInt option for option in result.userAnswer.split(','))
                answers[result.quizId]=result.userAnswer.split(',')
    console.log answers
    answers

# async 查看习题答案
print_answers=->
    await get_quiz_answers() if !answers
    pretty_options=''
    for question,qi in questions
        option_id_from=options[qi*4]
        x=(String.fromCharCode('A'.charCodeAt(0)+parseInt(option)-option_id_from) for option in answers[question.quizId])
        pretty_options+="第#{qi+1}题：#{x.join(',')}\n"
    console.log(pretty_options)
    alert(pretty_options)
    return

# 自动完成习题
auto_fill=->
    await get_quiz_answers() if !answers
    answer_ids=[]
    for k,v of answers
        answer_ids=answer_ids.concat v
    # todo:多选题再次点击会取消选择
    $("[option_id]").filter (i,e)->e.getAttribute('option_id') in answer_ids
        .find('[class|="input"]')
        .click()
    return

assistant_api=
    '解锁视频进度':unblock_video_progress
    '完成该项'    :complete_item
    '暂停答题计时':pause_quiz_timer
    '自动完成习题':auto_fill
    '查看习题答案':print_answers

fold_unit_nav=->
    $('.tr-chapter').click()
    
# userscript 环境
if unsafeWindow?
    # 暴露assistant接口
    unsafeWindow.assistant={}
    for name,fun of assistant_api
        unsafeWindow.assistant[fun.name]=fun
    unsafeWindow.assistant.mark=mark
    
    # 返回课程主页改为返回导航
    $('#backCourse').contents().last().replaceWith('返回导航')
    $('#backCourse').off('click')
    $("#backCourse").on 'click', ->
        location.href = CONTEXTPATH + "/portal/session/unitNavigation/" + $("#courseOpenId").val() + ".mooc"
    
    # 助手界面显示
    assistant_div=document.createElement('div')
    assistant_div.id='assistant'
    $('.main-scroll').prepend(assistant_div)
    
    # 助手界面添加按钮
    add_button=(text,fun)->
        btn=document.createElement('button')
        btn.textContent=text
        btn.onclick=fun
        # todo:优雅的样式设置
        btn.style='margin:5px;padding:5px'
        assistant_div.appendChild(btn)
        
    for name,fun of assistant_api
        add_button(name,fun)
        
    # tab切换
    $('.tab-inner').on 'click',->
        # todo:智能判断可用功能
        console.log this
        
    fold_unit_nav()
    
    unsafeWindow.doSubExam=doSubExam
        
#router=
#    10:video_helper_init
##    20:pdf_helper # pdf页面
##    50:quiz_helper # 选择题
#    
#router[$('#itemType').val()]()

