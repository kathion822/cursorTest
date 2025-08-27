'use strict';

const db = uniCloud.database();

exports.main = async function(event, context) {
	console.log('=== 微信登录云函数开始执行 ===');
	console.log('云函数环境信息:', {
		platform: context.PLATFORM,
		clientIP: context.CLIENTIP,
		userAgent: context.USERAGENT,
		requestId: context.REQUESTID
	});
	
	const { code } = event;
	
	if (!code) {
		console.error('缺少登录凭证code');
		return {
			code: -1,
			message: '缺少登录凭证'
		};
	}
	
	try {
		console.log('开始处理微信登录，code长度:', code.length);
		console.log('code前10位:', code.substring(0, 10) + '***');
		
		// 获取微信小程序配置
		const appid = 'wxaa156d6e179e74ea'; // 从manifest.json中获取的appid
		const secret = 'a389c278b568bf4359bd03dc29e21bdc'; // 需要从微信小程序后台获取
		
		console.log('使用的微信配置:', { appid, secret: secret.substring(0, 8) + '***' });
		
		// 调用微信接口获取openid和session_key
		const wxLoginUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
		
		console.log('准备调用微信API，URL:', wxLoginUrl.replace(secret, '***'));
		console.log('调用微信API获取openid...');
		
		const wxResponse = await uniCloud.httpclient.request(wxLoginUrl, {
			method: 'GET',
			dataType: 'json',
			timeout: 15000
		});
		
		console.log('微信API响应状态码:', wxResponse.status);
		console.log('微信API响应头:', wxResponse.headers);
		
		if (wxResponse.status !== 200) {
			console.error('微信API调用失败，状态码:', wxResponse.status);
			console.error('响应内容:', wxResponse.data);
			return {
				code: -1,
				message: '微信接口调用失败'
			};
		}
		
		const wxData = wxResponse.data;
		console.log('微信API完整响应:', wxData);
		
		if (wxData.errcode) {
			console.error('微信API返回错误:', wxData);
			return {
				code: -1,
				message: `微信登录失败: ${wxData.errmsg}`
			};
		}
		
		const { openid, session_key } = wxData;
		console.log('成功获取openid和session_key');
		console.log('openid长度:', openid ? openid.length : 0);
		console.log('session_key长度:', session_key ? session_key.length : 0);
		
		// 检查用户是否已存在
		const userCollection = db.collection('users');
		const existingUser = await userCollection.where({
			openid: openid
		}).get();
		
		let isNewUser = false;
		let userId = '';
		
		if (existingUser.data.length === 0) {
			// 新用户，自动创建账号
			console.log('检测到新用户，开始自动注册...');
			isNewUser = true;
			
			// 生成统一用户ID
			const timestamp = Date.now();
			const random = Math.random().toString(36).substring(2, 11);
			userId = `user_${timestamp}_${random}`;
			
			// 创建新用户记录
			const newUser = {
				userId: userId,
				openid: openid,
				session_key: session_key,
				loginType: 'wechat',
				platform: 'wechat',
				status: 1, // 启用状态
				createTime: new Date(),
				updateTime: new Date(),
				lastLoginTime: new Date()
			};
			
			const addResult = await userCollection.add(newUser);
			console.log('新用户自动注册成功:', addResult);
			
		} else {
			// 老用户，更新信息
			console.log('老用户登录，更新session_key');
			const user = existingUser.data[0];
			userId = user.userId;
			
			await userCollection.where({
				openid: openid
			}).update({
				session_key: session_key,
				updateTime: new Date(),
				lastLoginTime: new Date()
			});
		}
		
		console.log('=== 微信登录云函数执行成功 ===');
		
		return {
			code: 0,
			message: isNewUser ? '注册并登录成功' : '登录成功',
			openid: openid,
			sessionKey: session_key,
			userId: userId,
			isNewUser: isNewUser
		};
		
	} catch (error) {
		console.error('=== 微信登录云函数执行失败 ===');
		console.error('错误详情:', error);
		console.error('错误堆栈:', error.stack);
		
		return {
			code: -1,
			message: `服务器错误: ${error.message}`
		};
	}
};
