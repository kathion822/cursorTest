'use strict';

const db = uniCloud.database();
const crypto = require('crypto');

exports.main = async function(event, context) {
	console.log('=== 统一登录云函数开始执行 ===');
	console.log('接收到的参数:', event);
	
	const { loginType, userData } = event;
	
	if (!loginType || !userData) {
		console.log('缺少必要参数:', { loginType, userData });
		return {
			code: -1,
			message: '缺少必要参数'
		};
	}
	
	try {
		console.log('开始处理登录类型:', loginType);
		console.log('用户数据:', userData);
		
		let userInfo = {};
		let userId = '';
		
		// 根据登录类型处理用户信息
		switch (loginType) {
			case 'wechat':
				userInfo = await handleWechatLogin(userData);
				break;
			case 'quick':
				userInfo = await handleQuickLogin(userData);
				break;
			case 'password':
				userInfo = await handlePasswordLogin(userData);
				break;
			case 'sms':
				userInfo = await handleSmsLogin(userData);
				break;
			default:
				console.log('不支持的登录类型:', loginType);
				return {
					code: -1,
					message: '不支持的登录类型'
				};
		}
		
		console.log('处理后的用户信息:', userInfo);
		
		if (!userInfo) {
			console.log('用户信息处理失败');
			return {
				code: -1,
				message: '登录处理失败'
			};
		}
		
		// 生成或获取统一用户ID
		console.log('开始处理用户ID，当前userInfo:', userInfo);
		console.log('userInfo.userId是否存在:', !!userInfo.userId);
		console.log('userInfo.userId值:', userInfo.userId);
		
		if (!userInfo.userId) {
			console.log('用户信息中没有userId，开始生成...');
			console.log('调用generateUnifiedUserId，参数:', { loginType, userData });
			userId = await generateUnifiedUserId(loginType, userData);
			console.log('generateUnifiedUserId返回结果:', userId);
			// 更新用户信息
			userInfo.userId = userId;
			console.log('更新后的userInfo.userId:', userInfo.userId);
		} else {
			userId = userInfo.userId;
			console.log('使用现有的userId:', userId);
		}
		
		console.log('最终用户ID:', userId);
		console.log('userId类型:', typeof userId);
		console.log('userId是否为空:', !userId);
		
		// 验证用户信息完整性
		if (!userId) {
			console.error('无法生成用户ID');
			throw new Error('无法生成用户ID');
		}
		
		// 清理用户信息，移除undefined值
		const cleanUserInfo = {};
		Object.keys(userInfo).forEach(key => {
			if (userInfo[key] !== undefined && userInfo[key] !== null) {
				cleanUserInfo[key] = userInfo[key];
			}
		});
		
		// 更新用户信息
		cleanUserInfo.userId = userId;
		cleanUserInfo.loginType = loginType;
		cleanUserInfo.lastLoginTime = new Date();
		
		console.log('清理后的用户信息:', cleanUserInfo);
		
		// 暂时跳过数据库操作，直接返回成功
		console.log('跳过数据库操作，直接返回成功');
		
		// 生成token
		const token = generateToken(userId);
		
		console.log('=== 统一登录云函数执行成功 ===');
		console.log('用户信息:', cleanUserInfo);
		console.log('生成的token:', token);
		
		return {
			code: 0,
			message: userInfo.isNewUser ? '注册并登录成功' : '登录成功',
			userInfo: cleanUserInfo,
			token: token
		};
		
	} catch (error) {
		console.error('=== 统一登录云函数执行失败 ===');
		console.error('错误详情:', error);
		console.error('错误堆栈:', error.stack);
		
		return {
			code: -1,
			message: `登录失败: ${error.message}`
		};
	}
};

// 处理微信登录
async function handleWechatLogin(userData) {
	console.log('处理微信登录数据:', userData);
	
	const { nickName, avatarUrl, gender, country, province, city, language, openid, sessionKey, userId, isNewUser } = userData;
	
	console.log('提取的微信数据:', { nickName, avatarUrl, gender, country, province, city, language, openid, sessionKey, userId, isNewUser });
	
	// 如果微信登录云函数已经创建了用户，直接使用
	if (userId && isNewUser) {
		console.log('微信登录云函数已创建新用户，userId:', userId);
		const result = {
			nickName: nickName || '',
			avatarUrl: avatarUrl || '',
			gender: gender || 0,
			country: country || '',
			province: province || '',
			city: city || '',
			language: language || '',
			openid: openid || '',
			sessionKey: sessionKey || '',
			userId: userId,
			platform: 'wechat',
			isNewUser: true
		};
		
		// 移除空字符串
		Object.keys(result).forEach(key => {
			if (result[key] === '') {
				delete result[key];
			}
		});
		
		console.log('返回的微信登录结果（新用户）:', result);
		return result;
	}
	
	// 否则返回基本信息，让统一登录处理
	const result = {
		nickName: nickName || '',
		avatarUrl: avatarUrl || '',
		gender: gender || 0,
		country: country || '',
		province: province || '',
		city: city || '',
		language: language || '',
		openid: openid || '',
		sessionKey: sessionKey || '',
		platform: 'wechat'
	};
	
	// 移除空字符串
	Object.keys(result).forEach(key => {
		if (result[key] === '') {
			delete result[key];
		}
	});
	
	console.log('返回的微信登录结果（老用户）:', result);
	return result;
}

// 处理一键登录
async function handleQuickLogin(userData) {
	// 这里可以根据实际的一键登录SDK获取用户信息
	return {
		username: `user_${Date.now()}`,
		platform: 'quick',
		...userData
	};
}

// 处理账号密码登录
async function handlePasswordLogin(userData) {
	const { username, password } = userData;
	
	// 验证用户名密码
	const userCollection = db.collection('users');
	const user = await userCollection.where({
		username: username,
		password: password // 实际应用中应该加密验证
	}).get();
	
	if (user.data.length === 0) {
		throw new Error('用户名或密码错误');
	}
	
	return {
		username,
		platform: 'password',
		...user.data[0]
	};
}

// 处理手机验证码登录
async function handleSmsLogin(userData) {
	const { phone, code } = userData;
	
	// 验证短信验证码
	const isValidCode = await verifySmsCode(phone, code);
	if (!isValidCode) {
		throw new Error('验证码错误或已过期');
	}
	
	return {
		phone,
		platform: 'sms'
	};
}

// 验证短信验证码
async function verifySmsCode(phone, code) {
	// 这里应该实现短信验证码验证逻辑
	// 暂时返回true用于测试
	return true;
}

// 生成统一用户ID
async function generateUnifiedUserId(loginType, userData) {
	console.log('开始生成统一用户ID，登录类型:', loginType);
	console.log('用户数据:', userData);
	
	let uniqueIdentifier = '';
	
	switch (loginType) {
		case 'wechat':
			uniqueIdentifier = userData.openid;
			break;
		case 'quick':
			uniqueIdentifier = userData.phone || userData.deviceId;
			break;
		case 'password':
			uniqueIdentifier = userData.username;
			break;
		case 'sms':
			uniqueIdentifier = userData.phone;
			break;
	}
	
	console.log('提取的唯一标识符:', uniqueIdentifier);
	
	// 直接生成新用户ID，不查询数据库
	console.log('生成新用户ID');
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 11);
	const userId = `user_${timestamp}_${random}`;
	console.log('生成的用户ID:', userId);
	
	return userId;
}

// 保存用户到数据库
async function saveUserToDatabase(userInfo) {
	console.log('开始保存用户到数据库:', userInfo);
	
	try {
		const userCollection = db.collection('users');
		
		// 确保userId存在
		if (!userInfo.userId) {
			console.error('用户ID不存在，无法保存');
			throw new Error('用户ID不存在');
		}
		
		console.log('准备查询用户，userId:', userInfo.userId);
		
		// 检查用户是否已存在
		const existingUser = await userCollection.where({
			userId: userInfo.userId
		}).get();
		
		console.log('查询现有用户结果:', existingUser);
		
		if (existingUser.data && existingUser.data.length > 0) {
			// 更新现有用户
			console.log('更新现有用户');
			const updateResult = await userCollection.where({
				userId: userInfo.userId
			}).update({
				...userInfo,
				updateTime: new Date()
			});
			
			console.log('更新结果:', updateResult);
		} else {
			// 创建新用户
			console.log('创建新用户');
			
			// 确保必要字段存在
			const newUserData = {
				...userInfo,
				createTime: new Date(),
				updateTime: new Date()
			};
			
			// 移除可能的undefined值
			Object.keys(newUserData).forEach(key => {
				if (newUserData[key] === undefined) {
					delete newUserData[key];
				}
			});
			
			console.log('准备创建的用户数据:', newUserData);
			
			const addResult = await userCollection.add(newUserData);
			console.log('创建结果:', addResult);
		}
		
		console.log('用户保存完成');
	} catch (error) {
		console.error('保存用户到数据库失败:', error);
		throw error;
	}
}

// 生成token
function generateToken(userId) {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 11);
	const token = crypto.createHash('md5').update(`${userId}_${timestamp}_${random}`).digest('hex');
	return token;
}
