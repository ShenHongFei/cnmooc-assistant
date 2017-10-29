/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

// 暂停计时
var answers, demo, j, len, option_id_0, pretty_print, question, questions, ref, sleep, test, test_answer, try_answer, useTimeFlag;

useTimeFlag = false;

option_id_0 = parseInt($('[option_id]').attr('option_id'));

// 初始化页面问题
questions = [];

ref = $('#exam_paper').quiz().getPractice();
for (j = 0, len = ref.length; j < len; j++) {
  question = ref[j];
  question = JSON.parse(question);
  questions.push(question);
}

// 修改自 doSubmitExam_ajax
test_answer = function(questions, test_result) {
  var allRightFlag, gradeId, i, reSubmit, score, totalScore, userQuiz2, user_Quiz, user_quizs;
  //处理每道题计时
  _quizUseTimeRecord[_quizIdRecord] = _quizUseTimeRecord[_quizIdRecord] || 0;
  _quizUseTimeRecord[_quizIdRecord] = parseInt(_quizUseTimeRecord[_quizIdRecord]) + _quizUseTime;
  user_quizs = (function() {
    var k, len1, results;
    results = [];
    for (k = 0, len1 = questions.length; k < len1; k++) {
      question = questions[k];
      results.push(JSON.stringify(question));
    }
    return results;
  })();
  reSubmit = $('#reSubmit').val();
  gradeId = $('#gradeId').val();
  userQuiz2 = [];
  totalScore = 0;
  allRightFlag = true;
  i = 0;
  while (i < user_quizs.length) {
    user_Quiz = JSON.parse(user_quizs[i]);
    user_Quiz['useTime'] = _quizUseTimeRecord[user_Quiz['quizId']];
    _quizUseTimeRecord[user_Quiz['quizId']] = 0;
    userQuiz2.push(JSON.stringify(user_Quiz));
    score = parseInt(user_Quiz['markQuizScore']);
    totalScore += score;
    if (score === 0) {
      allRightFlag = false;
    }
    i++;
  }
  if (allRightFlag) {
    totalScore = 10000;
  }
  user_quizs = userQuiz2;
  console.log(user_quizs);
  $.ajax({
    url: CONTEXTPATH + '/examSubmit/7681/saveExam/1/' + examPaperId + '/' + examSubmitId + '.mooc?testPaperId=' + examTestPaperId,
    type: 'post',
    data: {
      gradeId: gradeId,
      reSubmit: reSubmit,
      submitquizs: user_quizs,
      submitFlag: 0,
      useTime: 1,
      totalScore: totalScore,
      testPaperId: examTestPaperId
    },
    dataType: 'json',
    success: function(data) {
      if (!data.successFlag) {
        throw Error(data.successFlag = false);
      } else {
        return window.test_result = JSON.parse(data.examSubmit.submitContent);
      }
    },
    error: function() {
      return console.log('test_answer error');
    }
  });
};

sleep = function(ms) {
  return new Promise(function(resolve) {
    return setTimeout(resolve, ms);
  });
};

demo = async function() {
  await sleep(3000);
  return alert('here');
};

test = function() {
  var oi;
  test_answer(questions);
  return oi = 0b0010;
};

answers = {};

// 枚举、测试、更新答案
// 设置每道题的选项
try_answer = async function() {
  var current_round_option_ids, i, k, l, len1, len2, len3, m, n, o, oi, option, option_id_flags, option_id_from, perfect_answer, perfect_options, qi, ref1, result, results;
  ref1 = [1, 2, 4, 8, 3, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15];
  results = [];
  for (k = 0, len1 = ref1.length; k < len1; k++) {
    oi = ref1[k];
    option_id_flags = [];
    for (i = l = 0; l <= 3; i = ++l) {
      option_id_flags.push((oi << i & 0b1000) === 0b1000);
    }
    // 检测已有正确答案，对每一题生成答案，设置userAnswer
    for (qi = m = 0, len2 = questions.length; m < len2; qi = ++m) {
      question = questions[qi];
      perfect_answer = answers[question.quizId];
      if (perfect_answer) {
        question.userAnswer = perfect_answer.join(',');
      } else {
        current_round_option_ids = [];
        option_id_from = option_id_0 + qi * 4;
        for (i = n = 0; n <= 3; i = ++n) {
          if (option_id_flags[i]) {
            current_round_option_ids.push(option_id_from + i);
          }
        }
        question.userAnswer = current_round_option_ids.join(',');
      }
    }
    // 枚举的答案准备完成，开始测试
    test_answer(questions);
    await sleep(1000);
    for (o = 0, len3 = test_result.length; o < len3; o++) {
      result = test_result[o];
      result = JSON.parse(result);
      if (result.markResult) {
        perfect_options = (function() {
          var len4, p, ref2, results1;
          ref2 = result.userAnswer.split(',');
          results1 = [];
          for (p = 0, len4 = ref2.length; p < len4; p++) {
            option = ref2[p];
            results1.push(parseInt(option));
          }
          return results1;
        })();
        answers[result.quizId] = result.userAnswer.split(',');
      }
    }
    results.push(console.log(answers));
  }
  return results;
};

try_answer();

pretty_print = function() {
  var k, len1, option, option_id_from, pretty_options, qi, x;
  pretty_options = '';
  for (qi = k = 0, len1 = questions.length; k < len1; qi = ++k) {
    question = questions[qi];
    option_id_from = option_id_0 + qi * 4;
    x = (function() {
      var l, len2, ref1, results;
      ref1 = answers[question.quizId];
      results = [];
      for (l = 0, len2 = ref1.length; l < len2; l++) {
        option = ref1[l];
        results.push(String.fromCharCode('A'.charCodeAt(0) + parseInt(option) - option_id_from));
      }
      return results;
    })();
    pretty_options += `第${qi + 1}题：${x.join(',')}\n`;
  }
  return console.log(pretty_options);
};

pretty_print();


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMzg5MTljMDcxNmI5Yzg3OWU1NmIiLCJ3ZWJwYWNrOi8vLy4vaW5kZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztBQzdEQTtBQUFBOztBQUNBLGNBQVk7O0FBRVosY0FBWSxTQUFTLEVBQUUsYUFBRixDQUFnQixDQUFDLElBQWpCLENBQXNCLFdBQXRCLENBQVQsRUFIWjs7O0FBTUEsWUFBVTs7QUFDVjtBQUFBOztFQUNJLFdBQVMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxRQUFYO0VBQ1QsU0FBUyxDQUFDLElBQVYsQ0FBZSxRQUFmO0FBRkosQ0FQQTs7O0FBWUEsY0FBWSxTQUFDLFNBQUQsRUFBVyxXQUFYO0FBRVI7O0VBQUEsa0JBQW1CLGVBQW5CLEdBQWtDLGtCQUFtQixlQUFuQixJQUFxQztFQUN2RSxrQkFBbUIsZUFBbkIsR0FBa0MsU0FBUyxrQkFBbUIsZUFBNUIsSUFBNEM7RUFDOUU7O0FBQVk7SUFBQTs7bUJBQUEsSUFBSSxDQUFDLFNBQUwsQ0FBZSxRQUFmO0lBQUE7OztFQUNaLFdBQVMsRUFBRSxXQUFGLENBQWMsQ0FBQyxHQUFmO0VBQ1QsVUFBUSxFQUFFLFVBQUYsQ0FBYSxDQUFDLEdBQWQ7RUFDUixZQUFVO0VB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Q0FBQyxHQUFSLENBQVksT0FBWjtFQXZCSjs7QUFETzs7QUEwQlg7O0FBRUEsZUFBYTtBQUNUO0VBQUEsaUJBQWU7RUFDZjs7SUFDSSxpQkFBZSxjQUFZLEtBQUc7SUFDOUI7O0FBQUc7QUFBQTtNQUFBOztxQkFBQSxNQUFNLENBQUMsWUFBUCxDQUFvQixHQUFHLENBQUMsVUFBSixDQUFlLENBQWYsSUFBa0IsU0FBUyxNQUFULENBQWxCLEdBQW1DLGNBQXZEO01BQUE7OztJQUNILGtCQUFnQixJQUFJLEtBQUcsQ0FBUCxDQUFTLEVBQVQsRUFBYSxDQUFDLENBQUMsSUFBRixDQUFPLEdBQVAsQ0FBYixDQUF5QixFQUF6QjtFQUhwQjtTQUlBLE9BQU8sQ0FBQyxHQUFSLENBQVksY0FBWjtBQU5TOztBQVFiIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgMzg5MTljMDcxNmI5Yzg3OWU1NmIiLCIjIOaaguWBnOiuoeaXtlxudXNlVGltZUZsYWc9ZmFsc2Vcblxub3B0aW9uX2lkXzA9cGFyc2VJbnQgJCgnW29wdGlvbl9pZF0nKS5hdHRyKCdvcHRpb25faWQnKVxuXG4jIOWIneWni+WMlumhtemdoumXrumimFxucXVlc3Rpb25zPVtdXG5mb3IgcXVlc3Rpb24gaW4gJCgnI2V4YW1fcGFwZXInKS5xdWl6KCkuZ2V0UHJhY3RpY2UoKVxuICAgIHF1ZXN0aW9uPUpTT04ucGFyc2UocXVlc3Rpb24pXG4gICAgcXVlc3Rpb25zLnB1c2ggcXVlc3Rpb25cblxuIyDkv67mlLnoh6ogZG9TdWJtaXRFeGFtX2FqYXhcbnRlc3RfYW5zd2VyPShxdWVzdGlvbnMsdGVzdF9yZXN1bHQpLT5cbiAgICAj5aSE55CG5q+P6YGT6aKY6K6h5pe2XG4gICAgX3F1aXpVc2VUaW1lUmVjb3JkW19xdWl6SWRSZWNvcmRdPV9xdWl6VXNlVGltZVJlY29yZFtfcXVpeklkUmVjb3JkXSBvciAwXG4gICAgX3F1aXpVc2VUaW1lUmVjb3JkW19xdWl6SWRSZWNvcmRdPXBhcnNlSW50KF9xdWl6VXNlVGltZVJlY29yZFtfcXVpeklkUmVjb3JkXSkrX3F1aXpVc2VUaW1lXG4gICAgdXNlcl9xdWl6cz0oSlNPTi5zdHJpbmdpZnkgcXVlc3Rpb24gZm9yIHF1ZXN0aW9uIGluIHF1ZXN0aW9ucylcbiAgICByZVN1Ym1pdD0kKCcjcmVTdWJtaXQnKS52YWwoKVxuICAgIGdyYWRlSWQ9JCgnI2dyYWRlSWQnKS52YWwoKVxuICAgIHVzZXJRdWl6Mj1bXVxuICAgIHRvdGFsU2NvcmU9MFxuICAgIGFsbFJpZ2h0RmxhZz10cnVlXG4gICAgaT0wXG4gICAgd2hpbGUgaTx1c2VyX3F1aXpzLmxlbmd0aFxuICAgICAgICB1c2VyX1F1aXo9SlNPTi5wYXJzZSh1c2VyX3F1aXpzW2ldKVxuICAgICAgICB1c2VyX1F1aXpbJ3VzZVRpbWUnXT1fcXVpelVzZVRpbWVSZWNvcmRbdXNlcl9RdWl6WydxdWl6SWQnXV1cbiAgICAgICAgX3F1aXpVc2VUaW1lUmVjb3JkW3VzZXJfUXVpelsncXVpeklkJ11dPTBcbiAgICAgICAgXG4gICAgICAgIHVzZXJRdWl6Mi5wdXNoIEpTT04uc3RyaW5naWZ5KHVzZXJfUXVpeilcbiAgICAgICAgc2NvcmU9cGFyc2VJbnQodXNlcl9RdWl6WydtYXJrUXVpelNjb3JlJ10pXG4gICAgICAgIHRvdGFsU2NvcmUrPXNjb3JlXG4gICAgICAgIGlmIHNjb3JlPT0wXG4gICAgICAgICAgICBhbGxSaWdodEZsYWc9ZmFsc2VcbiAgICAgICAgaSsrXG4gICAgaWYgYWxsUmlnaHRGbGFnXG4gICAgICAgIHRvdGFsU2NvcmU9MTAwMDBcbiAgICAgICAgXG4gICAgdXNlcl9xdWl6cz11c2VyUXVpejJcbiAgICBjb25zb2xlLmxvZyh1c2VyX3F1aXpzKVxuICAgICQuYWpheFxuICAgICAgICB1cmw6Q09OVEVYVFBBVEgrJy9leGFtU3VibWl0Lzc2ODEvc2F2ZUV4YW0vMS8nK2V4YW1QYXBlcklkKycvJytleGFtU3VibWl0SWQrJy5tb29jP3Rlc3RQYXBlcklkPScrZXhhbVRlc3RQYXBlcklkXG4gICAgICAgIHR5cGU6J3Bvc3QnXG4gICAgICAgIGRhdGE6XG4gICAgICAgICAgICBncmFkZUlkOmdyYWRlSWRcbiAgICAgICAgICAgIHJlU3VibWl0OnJlU3VibWl0XG4gICAgICAgICAgICBzdWJtaXRxdWl6czp1c2VyX3F1aXpzXG4gICAgICAgICAgICBzdWJtaXRGbGFnOjBcbiAgICAgICAgICAgIHVzZVRpbWU6MVxuICAgICAgICAgICAgdG90YWxTY29yZTp0b3RhbFNjb3JlXG4gICAgICAgICAgICB0ZXN0UGFwZXJJZDpleGFtVGVzdFBhcGVySWRcbiAgICAgICAgZGF0YVR5cGU6J2pzb24nXG4gICAgICAgIHN1Y2Nlc3M6KGRhdGEpIC0+XG4gICAgICAgICAgICBpZiAhZGF0YS5zdWNjZXNzRmxhZ1xuICAgICAgICAgICAgICAgIHRocm93IEVycm9yKGRhdGEuc3VjY2Vzc0ZsYWc9ZmFsc2UpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgd2luZG93LnRlc3RfcmVzdWx0PUpTT04ucGFyc2UgZGF0YS5leGFtU3VibWl0LnN1Ym1pdENvbnRlbnRcbiAgICAgICAgZXJyb3I6LT5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0ZXN0X2Fuc3dlciBlcnJvcicpXG4gICAgcmV0dXJuXG5cbnNsZWVwPShtcyktPlxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlKS0+c2V0VGltZW91dChyZXNvbHZlLG1zKVxuICAgIFxuZGVtbz0oKS0+XG4gICAgYXdhaXQgc2xlZXAgMzAwMFxuICAgIGFsZXJ0ICdoZXJlJ1xuXG50ZXN0PSgpLT5cbiAgICB0ZXN0X2Fuc3dlcihxdWVzdGlvbnMpXG4gICAgb2k9MGIwMDEwXG4gICAgXG5hbnN3ZXJzPXt9XG4jIOaemuS4vuOAgea1i+ivleOAgeabtOaWsOetlOahiFxuIyDorr7nva7mr4/pgZPpopjnmoTpgInpoblcbnRyeV9hbnN3ZXI9KCktPlxuICAgIGZvciBvaSBpbiBbMSwyLDQsOCwzLDUsNiw3LDksMTAsMTEsMTIsMTMsMTQsMTVdXG4gICAgICAgIG9wdGlvbl9pZF9mbGFncz1bXVxuICAgICAgICBmb3IgaSBpbiBbMC4uM11cbiAgICAgICAgICAgIG9wdGlvbl9pZF9mbGFncy5wdXNoIChvaTw8aSYwYjEwMDApPT0wYjEwMDBcbiAgICAgICAgIyDmo4DmtYvlt7LmnInmraPnoa7nrZTmoYjvvIzlr7nmr4/kuIDpopjnlJ/miJDnrZTmoYjvvIzorr7nva51c2VyQW5zd2VyXG4gICAgICAgIGZvciBxdWVzdGlvbixxaSBpbiBxdWVzdGlvbnNcbiAgICAgICAgICAgIHBlcmZlY3RfYW5zd2VyPWFuc3dlcnNbcXVlc3Rpb24ucXVpeklkXVxuICAgICAgICAgICAgaWYgcGVyZmVjdF9hbnN3ZXJcbiAgICAgICAgICAgICAgICBxdWVzdGlvbi51c2VyQW5zd2VyPXBlcmZlY3RfYW5zd2VyLmpvaW4oJywnKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGN1cnJlbnRfcm91bmRfb3B0aW9uX2lkcz1bXVxuICAgICAgICAgICAgICAgIG9wdGlvbl9pZF9mcm9tPW9wdGlvbl9pZF8wK3FpKjRcbiAgICAgICAgICAgICAgICBmb3IgaSBpbiBbMC4uM11cbiAgICAgICAgICAgICAgICAgICAgY3VycmVudF9yb3VuZF9vcHRpb25faWRzLnB1c2ggb3B0aW9uX2lkX2Zyb20raSBpZiBvcHRpb25faWRfZmxhZ3NbaV1cbiAgICAgICAgICAgICAgICBxdWVzdGlvbi51c2VyQW5zd2VyPWN1cnJlbnRfcm91bmRfb3B0aW9uX2lkcy5qb2luKCcsJylcbiAgICAgICAgIyDmnprkuL7nmoTnrZTmoYjlh4blpIflrozmiJDvvIzlvIDlp4vmtYvor5VcbiAgICAgICAgdGVzdF9hbnN3ZXIgcXVlc3Rpb25zXG4gICAgICAgIGF3YWl0IHNsZWVwIDEwMDBcbiAgICAgICAgZm9yIHJlc3VsdCBpbiB0ZXN0X3Jlc3VsdFxuICAgICAgICAgICAgcmVzdWx0PUpTT04ucGFyc2UocmVzdWx0KVxuICAgICAgICAgICAgaWYgcmVzdWx0Lm1hcmtSZXN1bHRcbiAgICAgICAgICAgICAgICBwZXJmZWN0X29wdGlvbnM9KHBhcnNlSW50IG9wdGlvbiBmb3Igb3B0aW9uIGluIHJlc3VsdC51c2VyQW5zd2VyLnNwbGl0KCcsJykpXG4gICAgICAgICAgICAgICAgYW5zd2Vyc1tyZXN1bHQucXVpeklkXT1yZXN1bHQudXNlckFuc3dlci5zcGxpdCgnLCcpXG4gICAgICAgIGNvbnNvbGUubG9nIGFuc3dlcnNcbiAgICAgICAgXG50cnlfYW5zd2VyKClcblxucHJldHR5X3ByaW50PSgpLT5cbiAgICBwcmV0dHlfb3B0aW9ucz0nJ1xuICAgIGZvciBxdWVzdGlvbixxaSBpbiBxdWVzdGlvbnNcbiAgICAgICAgb3B0aW9uX2lkX2Zyb209b3B0aW9uX2lkXzArcWkqNFxuICAgICAgICB4PShTdHJpbmcuZnJvbUNoYXJDb2RlKCdBJy5jaGFyQ29kZUF0KDApK3BhcnNlSW50KG9wdGlvbiktb3B0aW9uX2lkX2Zyb20pIGZvciBvcHRpb24gaW4gYW5zd2Vyc1txdWVzdGlvbi5xdWl6SWRdKVxuICAgICAgICBwcmV0dHlfb3B0aW9ucys9XCLnrKwje3FpKzF96aKY77yaI3t4LmpvaW4oJywnKX1cXG5cIlxuICAgIGNvbnNvbGUubG9nIHByZXR0eV9vcHRpb25zXG4gICAgXG5wcmV0dHlfcHJpbnQoKVxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL2luZGV4LmNvZmZlZSJdLCJzb3VyY2VSb290IjoiIn0=