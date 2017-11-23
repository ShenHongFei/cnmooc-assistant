examLockTips = undefined

delayClose = ->
    window.setTimeout (->
        examLockTips.close()
        return
    ), 2000
    return

###*
# 更新条目学习完成记录
# @return
###

updateExamStudyOver = ->
    itemId = '270513'
    if itemId == ''
        itemId = $('#itemId').val()
    $.ajax
        type: 'post'
        url: CONTEXTPATH + '/study/update/item.mooc'
        data: itemId: itemId
        dataType: 'json'
        success: (response) ->
        error: ->
    return

### ==================客观练习 使用js================###

###*
# 客观题练习获取试卷
# testPaperId:
# submitId:
# paperId:
# limitTime:
# modelType：practice:做题模式 view:查看浏览模式（教学互动中使用）preview:预览（课件预览中使用）
#
###

getExamObjPaper = (testPaperId, submitId, paperId, limitTime, submitFlag, modelType, examQuizNum, curSubmitNum, callback) ->
    url = CONTEXTPATH + '/examSubmit/7681/getExamPaper-' + submitId + '.mooc'
    examLockTips = $.dialog.lockTips('正在加载试卷，请稍后...', 60)
    $.ajax
        url: url
        type: 'post'
        data:
            testPaperId: testPaperId
            paperId: paperId
            limitTime: limitTime
            modelType: modelType
            examQuizNum: examQuizNum
            curSubmitNum: curSubmitNum
        dataType: 'json'
        success: (JsonData) ->
            `var submitId`
            paper = JsonData['paper'] or {}
            submit = JsonData['examSubmit'] or {}
            submitId = JsonData['submitId']
            learningMode = JsonData['learningMode'] or 0
            answerReviewType = JsonData['answerReviewType'] or 1
            answerReviewTypeFlag = answerReviewType == 2 and submitFlag == 1
            examPaperId = paper['paperId']
            examSubmitId = submitId
            icon = '<i class="q-mark"></i>'
            if submitFlag == 1
                icon = '<i class=""></i>'
            $('#exam_paper').quiz(
                divClass: 'practice-item'
                icon: icon
                practice: true
                solution: answerReviewTypeFlag
                response: answerReviewTypeFlag
                showDifficult: false
                autoReview: submitFlag == 1
                practiceChange: (index, doneFlag) ->
                    userQuiz = $('#exam_paper').quiz().getPractice()
                    quizDone index, doneFlag
                    return
                success: ->
                    $('.practice-item').eq(0).addClass 'current'

                    ###提交保存试卷###

                    $('#exam_paper').find('.practice-item').css 'min-height', '240px'
                    if modelType == 'practice'
                        #做题模式下
                        setObjectiveUserAnswer()
                        # setExamEvent();
                    else if modelType == 'preview'
                        makeQuizNav()
                        # setExamEvent();
                    setTimeout setExamEvent, 2000
                    if submitFlag == 1
                        #已经提交显示答案
                        #if(learningMode == 0){
                        $('#exam_paper').quiz().autoReview()
                        #}
                        $('.view-shadow').remove()
                        #去除阴影遮罩
                        useTimeFlag = false
                        #取消倒计时
                        $('#submit_exam').remove()
                        #去除提交按钮
                        $('#save_exam').remove()
                        #去除暂存按钮
                    return
            ).setPaper(paper).setSubmit(submit).builder()
            examLockTips.close()
            callback and callback()
            return
        error: ->
            examLockTips.close()
            $.dialog.tips '服务器忙，请稍后再试...'
            return
    return

#构建题目导航部分

setObjectiveUserAnswer = ->
    dataList = $('#exam_paper').quiz().getData()
    quizNav = []
    #题目导航部分
    done = undefined
    n = 0
    i = 0
    while i < dataList.length
        data = dataList[i]
        quizId = data['quizId'] or {}
        quiz = data['quizId'] or {}
        submit = data['submit'] or {}
        n = n + 1
        done = false
        if typeof submit['userAnswer'] != 'undefined' and submit['userAnswer'] != ''
            done = true
        if done
            quizNav.push '<a class="p-no done" href="javascript:void(0)">' + n + '</a>'
        else
            quizNav.push '<a class="p-no" href="javascript:void(0)">' + n + '</a>'
        i++
    $('.practice-no').append quizNav.join('')
    return

setExamEvent = ->
    #    $('.practice-wrapper').live("scrollstart",function(event, d){
    #        var $item = $(".practice-item");
    #        var psize = $item.size();
    #        if (vIndex > 0 && vIndex < psize - 1)
    #            event.preventDefault();
    #        if (d > 0) {
    #            scrollbar(vIndex - 1);
    #        } else {
    #            scrollbar(vIndex + 1);
    #        }
    #    });

    scrollbar = (n) ->
        $item = $('.practice-item')
        psize = $item.size()
        setObjectExamCookie '431329'
        if n < 0 or n > psize - 1
            return false
        if !running
            vIndex = n
            $pcurrent = $('.practice-item.current')
            if $pcurrent.length == 0
                $pcurrent = $('.practice-item').eq(n)
            if vIndex < psize

                ###习题操作###

                $pcurrent.removeClass 'current'
                $($item.get(vIndex)).addClass 'current'

                ###左侧题号操作###

                $('.p-no.current').removeClass 'current'
                $($('.p-no').get(vIndex)).addClass 'current'
            _scrollTop = $('.practice-item.current').position().top
            height = $('.practice-item.current').outerHeight()
            pHeight = $('.practice-wrapper').outerHeight()
            if pHeight > height
                compare = (pHeight - height) / 2
                _scrollTop = _scrollTop - compare
            running = true
            $('.practice-wrapper').animate { scrollTop: _scrollTop }, 200, ->
                running = false
                return
        #给单个题记录做题时间
        qid = $('.practice-item.current').attr('quiz_id')
        if _quizUseTime > 0
            _quizUseTimeRecord[_quizIdRecord] = _quizUseTimeRecord[_quizIdRecord] or 0
            _quizUseTimeRecord[_quizIdRecord] = parseInt(_quizUseTimeRecord[_quizIdRecord]) + _quizUseTime
        _quizIdRecord = qid
        _quizUseTime = 0
        return

    $('.practice-options').scrollFix()
    vIndex = 0
    running = false
    #遍历所有item找出最高的一个
    wrapHeight = $('.practice-wrapper').outerHeight()
    $('.practice-wrapper').find('.practice-item').each ->
        height = $(this).outerHeight()
        if height > wrapHeight
            wrapHeight = height
        return
    $('.practice-wrapper').css 'height': wrapHeight
    $('.practice-wrapper').live 'mousewheel', (event, d) ->
        $item = $('.practice-item')
        psize = $item.size()
        if vIndex > 0 and vIndex < psize - 1
            event.preventDefault()
        if d > 0
            scrollbar vIndex - 1
        else
            scrollbar vIndex + 1
        return

    ###上下按键###

    $(document).off 'keydown.test'
    $(document).on 'keydown.test', (event) ->
        setObjectExamCookie '431329'
        keyIndex = $('.practice-item.current').index()
        switch event.keyCode
            when 38
                scrollbar keyIndex - 1
            when 40
                scrollbar keyIndex + 1
        return
    scrollbar 0

    ###习题题号点击事件###

    $(document).on 'click.p-no', '.p-no', ->
        index = $(this).index()
        scrollbar index
        return
    return

### ==================客观练习 使用js end================###

### ==================主观练习 使用js   ================###

showPeerReviewTips = ->
    $.dialog
        title: Msg.get('exam.peer.review.note')
        content: $('.dialog')[0]
        width: '680px'
        lock: true
        okValue: Msg.get('exam.know')
        ok: ->
            shake $('.btn-icon-intro'), 'highlight', 2, 300
            return
    return

### ==================主观练习 使用js end================###

### ==================教学互动 使用js================###

#计算每个合计分值

sumExamPeerReviewScore = ->
    $('[id^=\'totalScoreTd_\']').each (i, n) ->
        uId = $(n).attr('id').split('_')[1]
        tScore = 0
        $('.reviewRecordScore_' + uId).each (j, m) ->
            tScore = tScore + parseInt($(m).text())
            return
        $(n).text tScore
        return
    return

getExamNodeAttr = (attrNodeId, attrNodeName, attrNodeSize, attrNodeState) ->
    attrNodeId = attrNodeId or ''
    attrNodeName = attrNodeName or ''
    attrNodeSize = attrNodeSize or ''
    attrNodeState = JSON.parse(attrNodeState or '{}')
    attrNode = []
    arr_nId = []
    arr_nName = []
    arr_nSize = []
    if typeof attrNodeId != 'undefined' and $.trim(attrNodeId + '').length > 0 and attrNodeId.indexOf(',') >= 0
        arr_nId = attrNodeId.split(',')
        arr_nId.length--
        arr_nId.shift()
        if typeof attrNodeName != 'undefined' and $.trim(attrNodeName + '').length > 0 and attrNodeName.indexOf(',') >= 0
            arr_nName = attrNodeName.split(',')
            arr_nName.length--
            arr_nName.shift()
        if typeof attrNodeSize != 'undefined' and $.trim(attrNodeSize + '').length > 0 and attrNodeSize.indexOf(',') >= 0
            arr_nSize = attrNodeSize.split(',')
            arr_nSize.length--
            arr_nSize.shift()
    x = 0
    while x < arr_nId.length
        attr_node = {}
        attr_node['node_id'] = arr_nId[x]
        attr_node['node_name'] = arr_nName[x]
        attr_node['node_size'] = arr_nSize[x]
        attr_node['node_state'] = attrNodeState[arr_nId[x]] or 0
        attrNode.push attr_node
        x++
    attrNode

quizDone = (index, doneFlag) ->
    if doneFlag == 0
        #未做
        $($('.p-no').get(index)).removeClass 'done'
    else if doneFlag == 1
        #已做
        $($('.p-no').get(index)).addClass 'done'
    return

showByPeerReviewInfo = (openId, submitId) ->
    url = CONTEXTPATH + '/examReview/' + openId + '/showByPeerReviewInfo-' + submitId + '.mooc'
    $.ajax
        type: 'post'
        url: url
        dataType: 'html'
        success: (result) ->

            goToByScroll = (index) ->
                if index == 1
                    $('html,body').animate { scrollTop: $('#scroll-item-' + index).offset().top }, 'slow'
                else
                    $('html,body').animate { scrollTop: $('#scroll-item-' + index).offset().top - 38 }, 'slow'
                return

            scrollAnimate = ->
                $rootBtn = $('.button-mark-last')
                initLeft = $rootBtn.offset().left

                scroll = ->
                    `var temp`
                    i = 0
                    j = 0
                    while map[i++] <= $(window).scrollTop()
                        temp = i - 1
                        $($targetBtn.get(temp)).show(0).siblings().removeClass 'current'
                        $($targetBtn.get(temp)).addClass 'current'
                        $('#' + name[temp]).find('.button-mark').hide 0
                        k = temp
                        while k < $targetBtn.length
                            $($targetBtn.get(++k)).removeClass('current').hide 0
                            $('#' + name[k]).find('.button-mark').show 0
                    while map[j++] > $(window).scrollTop() - 1
                        temp = j - 1
                        $($targetBtn.get(temp)).removeClass('current').hide 0
                        $('#' + name[temp]).find('.button-mark').show 0
                    return

                $('.process-group').css left: initLeft
                map = []
                name = []
                $('.processItem').each (n) ->
                    map[n] = $(this).offset().top
                    if n != 0
                        map[n] = $(this).offset().top - (n * 38)
                    #map[n] = $(this).offset().top;
                    name[n] = $(this).attr('id')
                    return
                scroll()
                $(window).on 'scroll', ->
                    scroll()
                    return
                return

            $('.score-detail-box').html()
            $('.score-detail-box').html result
            sumExamPeerReviewScore()
            $('.main_viewcomment').append '<div class="view-tooltip"><i class="icon-remove"></i><h3 class="vt-header">评语</h3><div class="vt-body"></div></div>'

            ###滚动效果###

            $targetBtn = $('.process-group').find('.button-mark')
            $targetBtn.click ->
                _index = $(this).index() + 1
                goToByScroll _index
                $(this).siblings().removeClass 'current'
                $(this).addClass 'current'
                return
            $(window).bind 'resize', ->
                initLeft = $('.button-mark-last').offset().left
                $('.process-group').css left: initLeft
                return
            scrollAnimate()
            return
        error: ->
    return

$ ->
    $('body').heartFactory(heartExec: defaultHeart).heartStart()
    return

### ==================教学互动 使用js end================###
