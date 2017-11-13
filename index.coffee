
sleep=(ms)->
    new Promise (resolve)->setTimeout(resolve,ms)

# 满分批阅当前
mark=()->
    $('input[id^=quiz_]').each (i,e)->
        max_point=e.className.match(/max\[(\d+)\]/)[1]
        e.setAttribute('value',max_point)
    await sleep(200)
    $('#submitReviewBtn').click()
    await sleep(200)
    $("input[value='提交互评']").click()
    await sleep(200)
    $("input[value='确定']").click()

# 满分批阅所有
mark_all=()->
    $('#gotoReviewSubmitBtn').click()
    for i in [1..3]
        await sleep(700)
        mark()
        

# 完成视频等项目
complete_item=()->
    updateExamStudyOver()
    

    