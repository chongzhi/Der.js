/**
 * name:微型库Der.js
 * Author:Der(www.ueder.net)
 * Date:2011/01/01
 * Update:2011/01/23
 * Description:以方法集的方式整合兼容性的底层JS功能,可按需取用
 */

//声明Der命名空间,并防止覆盖页面开发者定义的重名变量
window.Der = window.Der || {}; //变量绑定到全局空间
/**************************
 *DOM节点元素创建及获取的相关方法
 **************************/

//通过id获取节点元素
Der.getById = Der.g = function(id) {
    if (typeof id === "string" && !! id) {
        return document.getElementById(id);
    }
};

//通过节点属性attribute获取节点元素集合[返回节点数组]
Der.getByAttribute = function(attribute, value, nodeRefer) {
    /**参数解释
     * attribute:属性名,
     * value:属性值,
     * nodeRefer:参照节点 [可选]
     */


    nodeRefer = (nodeRefer) ? nodeRefer : document; //无参照节点则设参照节点为document
    var nodesResult = [],
        //结果数组
        nodesCollection = nodeRefer.getElementsByTagName("*"); //获取参照节点下所有节点
    //通过attribute筛选进数组 
    for (var i = nodesCollection.length - 1; i >= 0; i--) {
        var node = nodesCollection[i];

        //当属性为class样式时，因IE支持不一样的字符，不用getAttribute方法，直接用点符号取className属性值
        if (attribute === "className" || attribute === "class") {
            if (node.className === value) {
                nodesResult.push(node);
            }
        }

        //为其他属性时,正常getAttribute取值
        else {
            if (node.getAttribute(attribute) === value) {
                nodesResult.push(node);
            }
        }
    }

    //返回节点数组
    return nodesResult;
};

//通过class获取节点元素集合[返回节点数组]
Der.getByClass = function(cssName, nodeRefer) {
    /** 参数解释
     * cssName:样式名,
     * nodeRefer:参照节点[可选]
     */

    if (typeof document.getElementsByClassName === "function") { //判断是否原生支持getElementsByClassName
        nodeRefer = (nodeRefer) ? nodeRefer : document; //无参照节点则设参照节点为document
        return Array.prototype.slice.call(nodeRefer.getElementsByClassName(cssName)); //返回转化为数组的节点集合
    } else {
        return Der.getByAttribute("className", cssName, nodeRefer);
    }
};

//创建标签[返回节点]
Der.createElement = function(tagName, attributes) {
    /**参数解释
     * tagName:元素标签名
     * attributes:元素的属性,对象形式(范例:{"id":"myid","style":"background:red; color:blue;"})
     */

    //创建DOM标签
    var element = document.createElement(tagName);

    //遍历设置属性
    if (attributes) {
        for (var name in attributes) {
            if (attributes.hasOwnProperty(name)) { //过滤掉prototype继承的属性
                if (name === "class" || name === "className") { //如果为样式名则直接指定className
                    element.className = attributes[name];
                } else if (name === "style") { //如果为内联样式则调用style.cssText;
                    element.style.cssText = attributes[name];
                } else { //正常设置属性
                    element.setAttribute(name, attributes[name]);
                }
            }
        }
    }

    return element;
};


/**************************
 *与event事件相关的方法
 **************************/

//添加事件
Der.addEvent = function(element, type, handle) {
    /**参数解释
     * element:元素对象,
     * type:事件类型,
     * handle:事件处理函数
     */

    if (element.addEventListener) {
        element.addEventListener(type, handle, false);
    } else if (element.attachEvent) { //for ie
        element.attachEvent("on" + type, function() {
            handle.call(element); //ie下this绑定到element元素
        });
    } else {
        element["on" + type] = handle;
    }
};

//移除事件
Der.removeEvent = function(element, type, handle) {
    /**参数解释
     * element:元素对象,
     * type:事件类型,
     * handle:事件处理函数
     */

    if (element.removeEventListener) {
        element.removeEventListener(type, handle, false);
    } else if (element.detachEvent) { //for ie
        element.detachEvent("on" + type, function() {
            handle.call(element); //ie下this绑定到element元素
        });
    } else {
        element["on" + type] = null;
    }
};

//获取event对象
Der.getEvent = function(e) {
    return e || event;
};

//获取target对象(须先获取event对象)
Der.getEventTarget = function(e) {
    return e.target || e.srcElement;
};

//获取相关元素,在mouseover,mouseout时使用(须先获取event对象)
Der.getRelatedTarget = function(e) {
    if (e.relatedTarget) {
        return e.relatedTarget;
    } else if (e.toElement) { //for ie
        return e.toElement;
    } else if (e.fromElement) { //for ie
        return e.fromElement;
    } else {
        return null;
    }
};

//阻止冒泡(须先获取event对象)
Der.stopPropagation = function(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    } else {
        e.cancelBubble = true; //for ie
    }
};

//阻止默认行为(须先获取event对象)
Der.preventDefault = function(e) {
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false; //for ie
    }
};

//window加载完毕
Der.windowLoad = function(handle) {
    /**参数解释
     * handle:事件处理函数
     */

    var win = window;
    Der.addEvent(win, "load", function() {
        Der.removeEvent(win, "load", arguments.callee); //移除事件,释放内存
        handle();
    });
};

//DOM文档树加载完毕
Der.DOMReady = function(handle) {
    /**参数解释
     * handle:事件处理函数
     */

    var doc = document;
    if (doc.addEventListener) { // 支持标准DOM事件的浏览器使用DOMContentLoaded即可判断页面DOM文档树加载完毕
        doc.addEventListener("DOMContentLoaded", function() {
            doc.removeEventListener("DOMContentLoaded", arguments.callee, false); //移除事件,释放内存
            handle();
        }, false);
    } else if (doc.attachEvent) { //ie下则使用document的readystatechange事件来模拟判断文档树加载完毕
        doc.attachEvent("onreadystatechange", function() {
            if (doc.readyState === "interactive" || doc.readyState === "complete") { //ie下可能发生两种情况中的一种
                doc.detachEvent("onreadystatechange", arguments.callee); //移除事件，防止执行两次
                handle();
            }
        });
    }
};


/**********************
 *获取、设置、删除cookie等相关方法
 *********************/

//设置cookie
Der.setCookie = function(name, value, days, path, domain, secure) {
    /**参数解释
     * name:cookie名,
     * value:cookie值,
     * days:失效天数,[可选]
     * path:路径,[可选]
     * domain:域,[可选]
     * secure:安全标志(可选值true/false)[可选]
     */

    //name value 编码
    var cookieText = encodeURIComponent(name) + "=" + encodeURIComponent(value);

    if (days) { //cookie保存天数
        var _exp = new Date();
        _exp.setTime(_exp.getTime() + days * 24 * 60 * 60 * 1000);
        cookieText += "; expires=" + _exp.toGMTString();
    }
    if (path) { //路径
        cookieText += "; path=" + path;
    }
    if (domain) { //域
        cookieText += "; domain=" + domain;
    }
    if (secure) { //安全标志
        cookieText += "; secure";
    }

    //写入cookie
    document.cookie = cookieText;
};

//获取cookie
Der.getCookie = function(name) {
    /**参数解释
     * name:cookie名
     */

    var cookieName = encodeURIComponent(name) + "=",
        cookieStart = document.cookie.indexOf(cookieName),
        //获取cookieName在cookie中的字符位置
        cookieValue = ""; //cookie值
    if (cookieStart > -1) { //如果存在cookieName
        var cookieEnd = document.cookie.indexOf(";", cookieStart); //获取所需cookie末位置
        if (cookieEnd === -1) {
            cookieEnd = document.cookie.length; //cookie在最后一条时
        }
        cookieValue = decodeURIComponent(document.cookie.slice(cookieStart + cookieName.length, cookieEnd)); //截取cookie
    }

    //返回cookie值
    return cookieValue;
};

//删除cookie
Der.deleteCookie = function(name) {
    /**参数解释
     * name:cookie名
     */

    Der.setCookie(name, "", -1); //通过设置cookie过期来删除相应cookie
};



/**********************
 *ajax以及加载外部js,css文件
 *********************/

//ajax异步请求
Der.ajax = function(settings) {
    /**参数解释
     * settings:对象形式的参数,
     * 范例:{
     *          url:"json.php", //ajax请求地址
     *          type:"get", //请求类型,可为get或post
     *          data:"name=Der&value=frontEngineer", //请求类型为post时,传递的数据
     *          isJson:false, //对返回数据是否进行json格式转换
     *          success:function(response){ //返回数据成功时的回调函数
     *              alert(response);
     *          }
     *      }
     */

    //参数默认值扩展
    settings = Der.extend({
        url: "",
        type: "get",
        data: "",
        isJson: false
    }, settings);

    //参数
    var url = Der.trim(settings.url),
        //url去除前后空格
        type = settings.type.toLowerCase(),
        data = settings.data,
        isJson = settings.isJson,
        success = settings.success,
        response;

    //url合法性筛选
    if (typeof url !== "string" || url === "") return;

    //创建XMLHttpRequest对象

    function createXHR() {
        if (typeof XMLHttpRequest === "function") { //支持XMLHttpRequest的浏览器
            return new XMLHttpRequest();
        } else if (typeof ActiveXObject === "function") { //IE6等支持ActiveXObject
            return new ActiveXObject("Microsoft.XMLHTTP");
        }
    }

    //发送http请求
    var xhr = createXHR();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304 || xhr.status === 1223) {
                var response = decodeURIComponent(xhr.responseText);
                if (isJson) {
                    response = eval("(" + response + ")"); //json格式解析
                }
                if (success) {
                    success(response);
                }
            }
        }
    }
    xhr.open(type, url, true);
    if (type === "get") {
        xhr.send(null);
    } else if (type === "post") {
        xhr.send(data);
    }
};

//动态加载外部js文件
Der.loadScript = function(url, callback) {
    /**参数解释
     * url:需要加载的外部JS路径,
     * callback:加载完毕回调函数[可选]
     */

    setTimeout(function() { //setTimeout将加载js彻底移出文档加载流，实现异步，不阻塞页面其他内容           
        //创建script
        var script = Der.createElement("script", {
            "src": url,
            "type": "text/javascript"
        });

        //为script添加加载完毕判断事件
        if (script.readyState) { //ie不支持DOM标签的onload事件,支持readystatechange事件
            Der.addEvent(script, "readystatechange", function() {
                if (script.readyState === "loaded" || script.readyState === "complete") {
                    //加载完执行回调函数
                    if (callback) {
                        callback();
                    }
                    //此处销毁事件引用，防止IE下执行两次
                    Der.removeEvent(script, "readystatechange", arguments.callee);
                }
            });
        } else { //DOM标签的onload事件
            Der.addEvent(script, "load", function() {
                //加载完执行回调函数
                if (callback) {
                    callback();
                }
                //此处销毁事件引用
                Der.removeEvent(script, "load", arguments.callee)
            });
        }

        //加入head
        document.getElementsByTagName("head")[0].appendChild(script);
    }, 0);
};

//动态加载外部css文件,无回调
Der.loadCss = function(url) {
    /**参数解释
     * url:需要加载的外部CSS路径
     */

    //创建引用外部CSS的link标签
    var css = Der.createElement("link", {
        "href": url,
        "rel": "stylesheet",
        "type": "text/css"
    });

    //加入head
    document.getElementsByTagName("head")[0].appendChild(css);
};

/**********************
 *工具类方法
 *********************/

//去除字符串的左右空格
Der.trim = function(str, pos) {
    /**参数解释
     * str:需要去除空格的字符串
     * pos:去除空格的位置,可选值为"left","right"[可选]
     */

    var trimLeft = /^[\s\xA0]+/,
        trimRight = /[\s\xA0]+$/;
    if (!pos || (pos !== "left" && pos !== "right")) { //默认去除字符串两边空格
        return str.replace(trimLeft, "").replace(trimRight, "");
    } else if (pos === "left") { //去除字符串左空格
        return str.replace(trimLeft, "");
    } else if (pos === "right") { //去除字符串右空格
        return str.replace(trimRight, "");
    }
};

//扩展对象(默认值替换)
Der.extend = function(target, obj) {
    /**参数解释
     * target:默认值对象
     * obj:待扩展的对象
     */

    if (obj) {
        for (var i in target) {
            if ((typeof obj[i]) === "undefined") {
                obj[i] = target[i];
            }
        }
        return obj;
    } else {
        return target;
    }
}

//类型判断
Der.type = function(arg) {
    /**参数解释
     * arg:待判断类型的参数
     */

    if (arg == null) return String(arg); //arg等于null或undefined时返回强制转换字符串
    var typeStr = Object.prototype.toString.call(arg); // 获取参数类型字符串
    return typeStr.slice(8, typeStr.length - 1).toLowerCase();
}
