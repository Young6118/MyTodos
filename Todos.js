//辅助函数
const log = function() {
    console.log.apply(console, arguments)
}

var e = function(selector) {
    return document.querySelector(selector)
}

const ea = function(selector) {
    return document.querySelectorAll(selector)
}

const removeClass = function(className) {
    var selector = '.' + className
    var elements = ea(selector)
    for(var i = 0; i < elements.length; i++) {
        var element = elements[i]
        element.classList.remove(className)
    }
}

// 这个函数用于开关一个元素某个 class
var toggleClass = function(element, className) {
    if (element.classList.contains(className)) {
        element.classList.remove(className)
    } else {
        element.classList.add(className)
    }
}

//功能函数
var templateTodo = function(todo, done, time, id) {
    var status = ''
    var describe = '未完成'
    if(done) {
        status = 'done'
        describe = '已完成'
    }
    var t = `
        <div class='todo-cell ${status}' data-id=${id}>
            <span class='todo-content' contenteditable='true'>${todo}</span>
            <span class="state">${describe}</span>
            <div class="date">${time}</div>
            <div class='todo-buttons'>
                <button class='todo-done'>完成</button>
                <button class='todo-delete'>删除</button>
            </div>
        </div>
        `
    return t
}

var insertTodo = function(todo, done, time, id) {
    // 添加到 container 中
    var todoContainer = e('#id-div-container')
    var t = templateTodo(todo, done, time, id)
    todoContainer.insertAdjacentHTML('beforeend', t);
    // container.innerHTML += t
}

var load = function() {
    var s = localStorage.todos
    var emptyArray = JSON.stringify([])
    if(s != undefined && s != emptyArray) {
        return JSON.parse(s)
    }
    else {
        return []
    }
}

var loadTodos = function(page) {
    var end = page * 10
    var start = end - 10
    var todos = load()
    var exitedTodos = e('#id-div-container')
    exitedTodos.innerHTML = ''
    if(todos[start] == undefined) {
        var page = page - 1
        end = page * 10
        start = end - 10
    }
    for (var i = start; i < end; i++) {
        var todo = todos[i]
        if (todo != undefined) {
            insertTodo(todo.content, todo.done, todo.time, todo.id)
        }
    }
    var page_number = ea('.page_number')
    for (var i = 0; i < page_number.length; i++) {
        //p = 每一个 span
        var p = page_number[i]
        if (p.classList[0].slice(-1) == page) {
             removeClass('active')
             p.classList.add('active')
            break
        }
    }
}

var pageLoadTodos = function(event) {
    var self = event.target
    log(self)
    var todos = load()
    if(self.classList.contains('page_number')) {
        removeClass('active')
        self.classList.add('active')
        //找出在 class 存的页码
        var page = self.classList[0].slice(-1)
        //算出要展示的 todo 的下标
        var secondNum = page * 10
        var firstNum = secondNum - 10
        var container = e('#id-div-container')
        container.innerHTML = ''
        for (var i = firstNum; i < secondNum; i++) {
            var todo = todos[i]
            if (todo != undefined) {
                insertTodo(todo.content, todo.done, todo.time, todo.id)
            }
        }
    }
}

var insertPagination = function() {
    var pagination = e('.pagination')
    var todos = load()
    var length = todos.length
    //向上取整，算出有几页(每页展示 10 个)
    var number = Math.ceil(length / 10)
    //第一页一直存在
    pagination.innerHTML = '<span class="page_1 page_number active">1</span>'
    //第一页默认一直存在，从第二页开始
    for (var i = 2; i <= number; i++) {
        var t = `
            <span class="page_${i} page_number">${i}</span>
        `
        pagination.innerHTML += t
    }
}

var zfill = function(n, width) {
    /*
    n 是 int 类型
    width 是 int 类型

    把 n 的位数变成 width 这么长，并在右对齐，不足部分用 0 补足并返回
    具体请看测试, 注意, 返回的是 string 类型

    返回 string 类型
    */
    var char = '0'
    var s = String(n)
    var len = s.length
    len = width - len
    for(var i = 0; i < len; i++) {
        s = char + s
    }
    return s
}

var now = function() {
    var d = new Date()
    var nm = d.getFullYear()
    var yt = d.getMonth() + 1
    var ri = d.getDate()
    var ui = d.getHours()
    var ff = d.getMinutes()
    var mc = d.getSeconds()
    var vbji = d.getDay()
    var dict = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    yt = zfill(yt, 2)
    ri = zfill(ri, 2)
    ui = zfill(ui, 2)
    ff = zfill(ff, 2)
    mc = zfill(mc, 2)
    vbji = dict[vbji]
    return `${nm}/${yt}/${ri} ${ui}:${ff}:${mc} ${vbji}`
}

var save = function(array) {
    var s = JSON.stringify(array)
    localStorage.todos = s
}

var addToLocal = function() {
    var input = e('#id-input-todo')
    var val = input.value
    var t = now()
    //创建一个 todo 模版
    var local = localStorage.todos
    var todos = load()
    var len = todos.length
    var todo = {
        id: 0,
        done: false,
        content: val,
        time: t,
    }
    //判断 localStorage 中有无数据
    //如果空的或者删完了，就直接把新 todo 存进去
    //否则有数据，则解析出来，再加上新的数据，再存进去
    var emptyArray = JSON.stringify([])
    if (local == undefined ||local == emptyArray) {
        todos = []
    } else {
        lastTodo = todos[len - 1]
        todo.id = lastTodo.id + 1
    }
    todos.push(todo)
    save(todos)
    len = todos.length
    var page = Math.ceil(len / 10)
    insertPagination()

    loadTodos(page)
}

var operateTodo = function(event) {
    var self = event.target
    var todos = load()
    var len = todos.length
    if(self.classList.contains('todo-delete')) {
        var p = self.closest('.todo-cell')
        var todoId = p.dataset.id
        for(var i = 0; i < len; i++) {
            var todo = todos[i]
            if (todo.id == todoId) {
                var index = i
                break
            }
        }
        var nowPage = Math.ceil(index / 10)
        for (i = 0; i < len; i++) {
            todo = todos[i]
            if (todo.id == todoId) {
                todos.splice(i, 1)
                break
            }
        }
        if(nowPage == 0) {
            nowPage = 1
        }
        save(todos)
        insertPagination()
        loadTodos(nowPage)
    } else if(self.classList.contains('todo-done')) {
        var p = self.closest('.todo-cell')
        var todoId = p.dataset.id
        toggleClass(p, 'done')
        var state = p.querySelector('.state')
        if (state.innerText == '未完成') {
            state.innerText = '已完成'
        } else {
            state.innerText = '未完成'
        }

        if(todos[todoId].done == true) {
            todos[todoId].done = false
        } else {
            todos[todoId].done = true
        }
        save(todos)
    }
}

var nextPage = function() {
    var pageNumbers = ea('.page_number')
    var len = pageNumbers.length
    for (var i = 0; i < len; i++) {
        var p = pageNumbers[i]
        if (p.classList.contains('active')) {
            var oldPage = p.classList[0].slice(-1)
            break
        }
    }
    var nextPage = parseInt(oldPage) + 1
    loadTodos(nextPage)
}

var lastPage = function() {
    //获取当前页码
    var pageNumbers = ea('.page_number')
    var len = pageNumbers.length
    for (var i = 0; i < len; i++) {
        var p = pageNumbers[i]
        if (p.classList.contains('active')) {
            var oldPage = p.classList[0].slice(-1)
            break
        }
    }
    //算出上一页的页码，判断当前是否第一页
    var nextPage = parseInt(oldPage) - 1
    if (nextPage == 0) {
        nextPage = 1
    }
    //加载上一页的内容到页面
    loadTodos(nextPage)
}

var bindAdd = function() {
    var addButton = e('#id-button-add')
    addButton.addEventListener('click', addToLocal)
}

var bindOpt = function() {
    var all = e('.all')
    all.addEventListener('click', operateTodo)
}

//委托页码点击事件
var bindPages = function() {
    var p = e('.pagination')
    p.addEventListener('click', pageLoadTodos)
}

// 绑定下一页按钮事件
var bindNext = function() {
    var nextPageButton = document.querySelector('.next_page')
    nextPageButton.addEventListener('click', nextPage)
}

// 绑定上一页按钮事件
var bindLast = function() {
    var lastPageButton = e('.last_page')
    lastPageButton.addEventListener('click', lastPage)
}

//绑定所有事件集合
var bindAll = function() {
    bindAdd()
    bindOpt()
    bindPages()
    bindNext()
    bindLast()
}

// var logTime = function() {
//     var carton = e('.carton')
//     var t = "现在是" + now()
//     carton.insertAdjacentHTML('beforeend', t);
//     var car = document.getElementsByClassName('carton')
// log(carton, car)
//     // carton.parentNode.removeChild(carton);
//     // setTimeout("carton.remove()", 2000)
//
//     //setInterval
// }
//主函数
var __main = function() {
    // logTime()
    bindAll()
    //创建页码
    insertPagination()
    //默认加载第一页的 todo
    loadTodos(1)
}
//程序入口
__main()
