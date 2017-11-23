###倒计时处理###

SysUseTime = 0
SysSecond = parseInt('563')
#parseInt($("#remainSeconds").html()); //这里获取倒计时的起始时间;
useTimeFlag = SysSecond > 0
#是否倒计时  false 停止倒计时
userSubmitFlag = 0
#提交状态，如果提交则显示答案
timeLimitFlag = SysSecond > 0
#false:不限时
_quizUseTimeRecord = {}
_quizUseTime = 0
_quizIdRecord = 0
learningMode = 0

###倒计时处理 end###

examSubmitId = '39480_431329_1'
examPaperId = 0
examTestPaperId = '39480'

SetRemainTime = ->
    SysUseTime = SysUseTime + 1
    _quizUseTime = _quizUseTime + 1
    if timeLimitFlag
        if SysSecond > 0 and useTimeFlag
            SysSecond = SysSecond - 1
            second = Math.floor(SysSecond % 60)
            # 计算秒
            minite = Math.floor(SysSecond / 60 % 60)
            #计算分
            hour = Math.floor(SysSecond / 3600 % 24)
            #计算小时
            timer = (if hour < 10 then '0' + hour else hour) + ':' + (if minite < 10 then '0' + minite else minite) + ':' + (if second < 10 then '0' + second else second)
            if SysSecond < 60 * 10
                #最后10分钟显示红色
                timer = '<span style=\'color:red\'>' + timer + '</span>'
            $('#remainTime').html timer
            if SysUseTime % 3 * 60 == 0
                #每3分钟保存一次
                doSubmitExam 0, true
                SysUseTime = 0
        else
            #剩余时间小于或等于0的时候，就停止间隔函数
            if useTimeFlag
                #倒计时情况下
                doSubmitExamForce()
                #强制提交
            $('#exam_paper').heartFactory().destroy()
    else
    return

###*
# submitFlag:1 提交　０　暂存
# autoFlag　true:间隔时间自动保存 　false非自动保存
#
###

doSubmitExam = (submitFlag, autoFlag) ->
    if !autoFlag
        useTimeFlag = false
        #非自动提交需要停止倒计时
    userQuiz = $('#exam_paper').quiz().getPractice()
    userQuiz2 = []
    undo_num = 0
    i = 0
    while i < userQuiz.length
        user_Quiz = JSON.parse(userQuiz[i])
        if typeof user_Quiz['userAnswer'] == 'undefined' or user_Quiz['userAnswer'].length == 0
            undo_num++
        i++
    tips = Msg.get('exam.tips.submit')
    if submitFlag == 0
        #暂存
        tips = Msg.get('exam.tips.save.success')
        doSubmitExam_ajax submitFlag, tips, autoFlag
    else if submitFlag == 1
        if undo_num > 0
            tips = Msg.get('exam.tips.submit2', undo_num)
        d = $.dialog(
            title: Msg.get('exam.tips.do')
            content: tips
            lock: true
            okValue: Msg.get('exam.tips.continue.do')
            ok: ->
                tips = Msg.get('exam.tips.submit.success')
                doSubmitExam_ajax submitFlag, tips, false
                return
            cancelValue: Msg.get('exam.continue.do')
            cancel: ->
                useTimeFlag = true
                if SysSecond > 0
                    #继续倒计时
                    $('#exam_paper').heartFactory().heartStart()
                d.close()
                return
        )
        d.visible()
    return

doSubmitExamForce = ->
    useTimeFlag = false
    tips = Msg.get('exam.tips.submit.force')
    doSubmitExam_ajax 1, tips, false
    return

#点返回 不保存试题 记录使用时间

doSubmitExamBack = ->
    useTimeFlag = false
    #停止倒计时
    tips = ''
    doSubmitExam_ajax 0, tips, false
    return

doSubmitExam_ajax = (submitFlag, tips, autoFlag) ->
    useTime = SysUseTime
    gM.log 'useTime====' + useTime
    #处理每道题计时
    _quizUseTimeRecord[_quizIdRecord] = _quizUseTimeRecord[_quizIdRecord] or 0
    _quizUseTimeRecord[_quizIdRecord] = parseInt(_quizUseTimeRecord[_quizIdRecord]) + _quizUseTime
    user_quizs = $('#exam_paper').quiz().getPractice()
    reSubmit = $('#reSubmit').val()
    gradeId = $('#gradeId').val()
    userQuiz2 = []
    undo_num = 0
    totalScore = 0
    allRightFlag = true
    i = 0
    while i < user_quizs.length
        user_Quiz = JSON.parse(user_quizs[i])
        user_Quiz['useTime'] = _quizUseTimeRecord[user_Quiz['quizId']]
        _quizUseTimeRecord[user_Quiz['quizId']] = 0
        userQuiz2.push JSON.stringify(user_Quiz)
        score = parseInt(user_Quiz['markQuizScore'])
        totalScore += score
        if score == 0
            allRightFlag = false
        i++
    if allRightFlag
        totalScore = 10000
    user_quizs = userQuiz2
    url = CONTEXTPATH + '/examSubmit/7681/saveExam/1/' + examPaperId + '/' + examSubmitId + '.mooc?testPaperId=39480'
    if !autoFlag
        examLockTips = $.dialog.lockTips('正在提交，请稍后...', 60)
    $.ajax
        url: url
        type: 'post'
        data:
            gradeId: gradeId
            reSubmit: reSubmit
            submitquizs: user_quizs
            submitFlag: submitFlag
            useTime: useTime
            totalScore: totalScore
            testPaperId: examTestPaperId
        dataType: 'json'
        success: (JsonData) ->
            examLockTips.close()
            if JsonData.saveNeedFlag == false
                #不保存直接跳出
                enterObjExam '7681', '39480'
            else
                if !autoFlag
                    #if (submitFlag == 1) {
                    #    if (typeof updateExamStudyOver == "function") {
                    #        updateExamStudyOver();// 设置学习进度
                    #    }
                    #}
                    if tips != ''
                        $.dialog.tips tips
                    enterObjExam '7681', '39480'
            return
        error: ->
            examLockTips.close()
            $.dialog.tips '服务器忙，请稍后再试...'
            return
    return

qmark_click = ->
    $(this).addClass 'marked'
    _index = $(this).parents('.practice-item').index()
    $($('.p-no').get(_index)).addClass 'marked'
    return

setQuizShadow = ->
    htmlShadow = '<div class="view-shadow"></div>'
    $('.practice-item').each ->
        $(this).append htmlShadow
        $(this).find('.test-practice').css 'min-height', '240px'
        return
    return

#/设置cookie

setObjectExamCookie = (uId) ->
    cval = getObjectExamCookie(uId)
    if cval == null or cval != uId
        #不存在，再添加
        ExpireDate = new Date
        ExpireDate.setTime ExpireDate.getTime() + 100 * 365 * 24 * 3600 * 1000
        nameOfCookie = 'objectExamCookie_' + uId
        document.cookie = nameOfCookie + '=' + uId + ';path=/; expires=' + ExpireDate.toGMTString()
    return

#/获取cookie值

getObjectExamCookie = (uId) ->
    nameOfCookie = 'objectExamCookie_' + uId
    if document.cookie.length > 0
        begin = document.cookie.indexOf(nameOfCookie + '=')
        if begin != -1
            begin += nameOfCookie.length + 1
            #cookie值的初始位置
            end = document.cookie.indexOf(';', begin)
            #结束位置
            if end == -1
                end = document.cookie.length
            #没有;则end为字符串结束位置
            return document.cookie.substring(begin, end)
    null

$ ->
    if typeof isNeedHeart == 'undefined' or isNeedHeart != 1
        logStudy '50', '270513', '7681'
    if getObjectExamCookie('431329') == '431329'
        $('.mouse-hover').hide()
    else

        ###滚轮提示图片###

        $('.mouse-hover').click ->
            $('.mouse-hover').fadeOut 200
            return
        setTimeout (->
            $('.mouse-hover').fadeOut 200
            return
        ), 2000
    # 修改从练习与作业列表进入 ，返回的操作
    if $('.main').has('#r_back').length > 0
        $(document).off 'click', '#r_back'
        $(document).on 'click', '#r_back', ->
            if userSubmitFlag == 1 and learningMode == 1
                enterObjExam '7681', '39480'
            else
                doSubmitExamBack()
            return
    #    获取做题的试卷
    getExamObjPaper '39480', '39480_431329_1', '9956', '600', userSubmitFlag, 'practice', '10', '2', ->
        $('#exam_paper').heartFactory(
            execTime: 0
            execWaitingOut: 1
            heartExec: ->
                gM.log ' $("#exam_paper").heartFactory'
                SetRemainTime()
                true
        ).heartStart()
        return
    $('#submit_exam').click ->
        doSubmitExam 1, false
        return
    $('#save_exam').click ->
        doSubmitExam 0, false
        return
    return
