'use strict';

const db = uniCloud.database();

exports.main = async function(event, context) {
	const { userInfo, openid } = event;
	
	if (!userInfo || !openid) {
		return {
			code: -1,
			message: '缺少必要参数'
		};
	}
	
	try {
		const userCollection = db.collection('users');
		
		// 更新用户信息
		const updateData = {
			nickName: userInfo.nickName,
			avatarUrl: userInfo.avatarUrl,
			gender: userInfo.gender,
			country: userInfo.country,
			province: userInfo.province,
			city: userInfo.city,
			language: userInfo.language,
			update_time: new Date()
		};
		
		const result = await userCollection.where({
			openid: openid
		}).update(updateData);
		
		if (result.updated === 1) {
			return {
				code: 0,
				message: '用户信息更新成功'
			};
		} else {
			return {
				code: -1,
				message: '用户信息更新失败'
			};
		}
		
	} catch (error) {
		console.error('保存用户信息失败:', error);
		return {
			code: -1,
			message: '服务器错误'
		};
	}
};
