// npm init -y && npm i request request-promise mkdirp iconv-lite
const request = require('request');
var mkdirp = require('mkdirp');
var iconv = require('iconv-lite');
var http = require('http')
var fs = require('fs');
var path = require('path');
var os = require('os');
var proxyList = require('./freeProxySpider.js').proxyList;

// 获取易码的返回结果
const getData = (str) => ~str.indexOf('|') ? str.split('|')[1] : str

// 将注册成功的账号保存起来
const save = (txt) => {
    mkdirp(path.join(__dirname,`/data/`), function (err) {
        if (err) console.error(err)
        fs.writeFile(path.join(__dirname,`/data/${token}.json`), txt + os.EOL, { flag: "a" }, function (err) {
            if(err) console.error("文件写入失败", err);
            else console.log("文件写入成功");
        })   
    })
}

var YM_Err_Status;
(function (YM_Err_Status) {
    YM_Err_Status[YM_Err_Status["1001"] = 1001] = "参数token不能为空";
    YM_Err_Status[YM_Err_Status["1002"] = 1002] = "参数action不能为空";
    YM_Err_Status[YM_Err_Status["1003"] = 1003] = "参数action错误";
    YM_Err_Status[YM_Err_Status["1004"] = 1004] = "token失效";
    YM_Err_Status[YM_Err_Status["1005"] = 1005] = "用户名或密码错误";
    YM_Err_Status[YM_Err_Status["1006"] = 1006] = "用户名不能为空";
    YM_Err_Status[YM_Err_Status["1007"] = 1007] = "密码不能为空";
    YM_Err_Status[YM_Err_Status["1008"] = 1008] = "账户余额不足";
    YM_Err_Status[YM_Err_Status["1009"] = 1009] = "账户被禁用";
    YM_Err_Status[YM_Err_Status["1010"] = 1010] = "参数错误";
    YM_Err_Status[YM_Err_Status["1011"] = 1011] = "账户待审核";
    YM_Err_Status[YM_Err_Status["1012"] = 1012] = "登录数达到上限";
    YM_Err_Status[YM_Err_Status["2001"] = 2001] = "参数itemid不能为空";
    YM_Err_Status[YM_Err_Status["2002"] = 2002] = "项目不存在";
    YM_Err_Status[YM_Err_Status["2003"] = 2003] = "项目未启用";
    YM_Err_Status[YM_Err_Status["2004"] = 2004] = "暂时没有可用的号码";
    YM_Err_Status[YM_Err_Status["2005"] = 2005] = "获取号码数量已达到上限";
    YM_Err_Status[YM_Err_Status["2006"] = 2006] = "参数mobile不能为空";
    YM_Err_Status[YM_Err_Status["2007"] = 2007] = "号码已被释放";
    YM_Err_Status[YM_Err_Status["2008"] = 2008] = "号码已离线";
    YM_Err_Status[YM_Err_Status["2009"] = 2009] = "发送内容不能为空";
    YM_Err_Status[YM_Err_Status["2010"] = 2010] = "号码正在使用中";
    YM_Err_Status[YM_Err_Status["3001"] = 3001] = "尚未收到短信";
    YM_Err_Status[YM_Err_Status["3002"] = 3002] = "等待发送";
    YM_Err_Status[YM_Err_Status["3003"] = 3003] = "正在发送";
    YM_Err_Status[YM_Err_Status["3004"] = 3004] = "发送失败";
    YM_Err_Status[YM_Err_Status["3005"] = 3005] = "订单不存在";
    YM_Err_Status[YM_Err_Status["3006"] = 3006] = "专属通道不存在";
    YM_Err_Status[YM_Err_Status["3007"] = 3007] = "专属通道未启用";
    YM_Err_Status[YM_Err_Status["3008"] = 3008] = "专属通道密码与项目不匹配";
    YM_Err_Status[YM_Err_Status["9001"] = 9001] = "系统错误";
    YM_Err_Status[YM_Err_Status["9002"] = 9002] = "系统异常";
    YM_Err_Status[YM_Err_Status["9003"] = 9003] = "系统繁忙";
})(YM_Err_Status || (YM_Err_Status = {}));
console.log(YM_Err_Status);

class guss {
	constructor (ip, token, itemid = '10438', share = "ec19c0ca") {
		  this.ip = "http://" + ip
		  this.share = share
		  this.token = token
		  this.itemid = itemid
	}

	// 第一步：获取手机号码
	getmobile () {
		request({
		    method: 'GET',
		    uri: `http://api.fxhyd.cn/UserInterface.aspx?action=getmobile&token=${this.token}&itemid=${this.itemid}`,
		}, (err, response, body) => {
		    if (err) throw new Error(err)

		    // 从易码的返回结果中拿到我要的数据
		    var mobile = getData(body);

		    // 【猴子补丁】
		    // 如果是4位，则说明返回的是错误码，因为手机号码都是11位的
		    if (mobile.length === 4) {
		        // 延迟重新请求
		        setTimeout(function () {
		        	// 打印出错误信息，并且尝试重新获取...
		        	console.log(`获取手机号码失败(${mobile}：${YM_Err_Status[mobile]})，正在重新获取...`);
		            this.getmobile();
		        }, 1000);
		    } else {
		        this.sendsms(mobile);
		    }
		})
	}

	sendsms (mobile) {
		var count = 0
		var _sendsms = () => {
			request({
			    method: 'GET',
			    uri: `http://guss.one/api/api/user/getCode?phone=${mobile}&_=${mobile}`,
			    proxy: this.ip,
			}, (err, response, body) => {
			    if (err) throw new Error(err)

			    if (~body.indexOf('发送成功')) {
			        console.log("发送短信成功：", mobile);
			        this.getsms(mobile)
			    } else {
			    	// 最多重新三次
			    	if (++count < 3) {
				        console.log(`发送短信验证码失败，正在重新获取...${count}`, body);
				    	_sendsms();
			        } else {
			        	console.log(`发送短信验证码尝试${count}次后失败...`, body, mobile)
			        }
			    }
			})
		}
		_sendsms()
	}

	getsms (mobile) {
		var count = 0
		var _getsms = function () {
		    request({
		        method: 'GET',
		        uri: `http://api.fxhyd.cn/UserInterface.aspx?action=getsms&token=${this.token}&itemid=${this.itemid}&mobile=${mobile}&release=1`,
		    }, (err, response, body) => {
		        if (err) throw new Error(err)

		        // 如果短信未收到
		        if (body == '3001' && count <= 60) {
		            // 官方推荐5秒之后再请求
		            setTimeout(function () {
		                count += 5
		                console.log("短信未收到，正在重新获取...", count);
		                _getsms()
		            }, 5000);
		        } else if (count >= 60) {
		            throw new Error('获取短信超时：' + mobile)
		        } else {
		            // 截取验证码
		            var code = body.match(/\d{4,}/)[0]
		            console.log("获取了验证码", code);
		            register(mobile, code)
		        }
		    })
		}
		_getsms();
	}

	register (mobile, code) {
		request({
		    method: 'POST',
		    uri: 'http://guss.one/api/api/user/register',
		    headers: {
		        'Content-Type': 'application/json',
		        'X-Requested-With': 'XMLHttpRequest',
		    },
		    proxy: this.ip,
		    timeout: 30000,
		    body: JSON.stringify({
		        'Phone': mobile,
		        'Code': code,
		        'Pwd': '12345678',
		        'Share': this.share
		    })
		}, (err, response, body) => {
		    if (err) throw new Error(err.message + proxy_ip);

		    // 各种tm操蛋的异常错误
		    if (~body.indexOf('注册异常') || 
		        ~body.indexOf('无效用户') || 
		        ~body.indexOf('Too Many Requests') || 
		        ~body.indexOf('502 Bad Gateway')) {
		            console.log("注册失败", body);
		    } else {
	            console.log("注册成功", body);
	            save(`${mobile} ———— ${pwd}`);
		    }
		})
	}
}


module.exports = guss