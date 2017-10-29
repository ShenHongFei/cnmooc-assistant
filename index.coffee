# 暂停计时
useTimeFlag=false

option_id_0=parseInt $('[option_id]').attr('option_id')

# 初始化页面问题
questions=[]
for question in $('#exam_paper').quiz().getPractice()
    question=JSON.parse(question)
    questions.push question

# 修改自 doSubmitExam_ajax
test_answer=(questions,test_result)->
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
    $.ajax
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
        success:(data) ->
            if !data.successFlag
                throw Error(data.successFlag=false)
            else
                window.test_result=JSON.parse data.examSubmit.submitContent
        error:->
            console.log('test_answer error')
    return

sleep=(ms)->
    new Promise (resolve)->setTimeout(resolve,ms)
    
demo=()->
    await sleep 3000
    alert 'here'

test=()->
    test_answer(questions)
    oi=0b0010
    
answers={}
# 枚举、测试、更新答案
# 设置每道题的选项
try_answer=()->
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
                option_id_from=option_id_0+qi*4
                for i in [0..3]
                    current_round_option_ids.push option_id_from+i if option_id_flags[i]
                question.userAnswer=current_round_option_ids.join(',')
        # 枚举的答案准备完成，开始测试
        test_answer questions
        await sleep 1000
        for result in test_result
            result=JSON.parse(result)
            if result.markResult
                perfect_options=(parseInt option for option in result.userAnswer.split(','))
                answers[result.quizId]=result.userAnswer.split(',')
        console.log answers
        
try_answer()

pretty_print=()->
    pretty_options=''
    for question,qi in questions
        option_id_from=option_id_0+qi*4
        x=(String.fromCharCode('A'.charCodeAt(0)+parseInt(option)-option_id_from) for option in answers[question.quizId])
        pretty_options+="第#{qi+1}题：#{x.join(',')}\n"
    console.log pretty_options
    
pretty_print()