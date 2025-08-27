<template>
	<view class="my-container">
		<!-- 用户信息区域 -->
		<view class="user-info-section" v-if="isLogin">
			<view class="avatar-container" @click="goToProfile">
				<image class="avatar" :src="userInfo.avatarUrl || '/static/default-avatar.png'" mode="aspectFill"></image>
			</view>
			<view class="user-details" @click="goToProfile">
				<text class="username">{{ userInfo.nickName || userInfo.username || '用户' }}</text>
				<text class="user-id">ID: {{ userInfo.userId || userInfo.openid || '' }}</text>
				<text class="login-type">登录方式: {{ getLoginTypeText() }}</text>
			</view>
			<view class="logout-btn" @click="handleLogout">
				<text>退出</text>
			</view>
		</view>
		
		<!-- 未登录状态 -->
		<view class="login-section" v-else>
			<view class="login-prompt">
				<text class="login-text">请登录以使用完整功能</text>
			</view>
			<view class="login-buttons">
				<button class="login-btn primary" @click="goToLogin">
					<text class="login-icon">🔑</text>
					<text>去登录</text>
				</button>
			</view>
		</view>
		
		<!-- 功能菜单 -->
		<view class="menu-section">
			<view class="menu-item" v-for="(item, index) in menuItems" :key="index" @click="handleMenuClick(item)">
				<view class="menu-icon">
					<text class="iconfont" :class="item.icon"></text>
				</view>
				<view class="menu-content">
					<text class="menu-title">{{ item.title }}</text>
					<text class="menu-desc">{{ item.desc }}</text>
				</view>
				<view class="menu-arrow">
					<text class="iconfont icon-arrow-right"></text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			isLogin: false,
			userInfo: {},
			loginType: '',
			menuItems: [
				{
					title: '个人资料',
					desc: '编辑个人信息',
					icon: 'icon-user',
					action: 'profile'
				},
				{
					title: '我的收藏',
					desc: '查看收藏内容',
					icon: 'icon-heart',
					action: 'favorites'
				},
				{
					title: '设置',
					desc: '应用设置',
					icon: 'icon-settings',
					action: 'settings'
				},
				{
					title: '关于我们',
					desc: '了解更多信息',
					icon: 'icon-info',
					action: 'about'
				}
			]
		};
	},
	
	onShow() {
		this.checkLoginStatus();
	},
	
	methods: {
		// 检查登录状态
		async checkLoginStatus() {
			try {
				const userInfo = uni.getStorageSync('userInfo');
				const token = uni.getStorageSync('token');
				const loginType = uni.getStorageSync('loginType');
				
				if (userInfo && token) {
					this.isLogin = true;
					this.userInfo = userInfo;
					this.loginType = loginType;
				} else {
					this.isLogin = false;
					this.userInfo = {};
					this.loginType = '';
				}
			} catch (error) {
				console.error('检查登录状态失败:', error);
				this.isLogin = false;
			}
		},
		
		// 获取登录方式文本
		getLoginTypeText() {
			const typeMap = {
				'wechat': '微信登录',
				'quick': '一键登录',
				'password': '账号密码',
				'sms': '手机验证码'
			};
			return typeMap[this.loginType] || '未知方式';
		},
		
		// 跳转到登录页面
		goToLogin() {
			uni.navigateTo({
				url: '/pages/login/login'
			});
		},
		
		// 退出登录
		async handleLogout() {
			uni.showModal({
				title: '确认退出',
				content: '确定要退出登录吗？',
				success: async (res) => {
					if (res.confirm) {
						try {
							// 调用退出登录云函数
							await uniCloud.callFunction({
								name: 'logout',
								data: { token: uni.getStorageSync('token') }
							});
							
							// 清除本地存储
							uni.removeStorageSync('userInfo');
							uni.removeStorageSync('token');
							uni.removeStorageSync('loginType');
							uni.removeStorageSync('openid');
							uni.removeStorageSync('sessionKey');
							
							// 更新页面状态
							await this.checkLoginStatus();
							
							uni.showToast({
								title: '已退出登录',
								icon: 'success'
							});
						} catch (error) {
							console.error('退出登录失败:', error);
							// 即使云函数调用失败，也要清除本地数据
							uni.removeStorageSync('userInfo');
							uni.removeStorageSync('token');
							uni.removeStorageSync('loginType');
							uni.removeStorageSync('openid');
							uni.removeStorageSync('sessionKey');
							
							await this.checkLoginStatus();
							
							uni.showToast({
								title: '已退出登录',
								icon: 'success'
							});
						}
					}
				}
			});
		},
		
		// 处理菜单点击
		handleMenuClick(item) {
			if (!this.isLogin && item.action !== 'about') {
				uni.showToast({
					title: '请先登录',
					icon: 'none'
				});
				return;
			}
			
			switch (item.action) {
				case 'profile':
					this.goToProfile();
					break;
				case 'favorites':
					this.goToFavorites();
					break;
				case 'settings':
					this.goToSettings();
					break;
				case 'about':
					this.goToAbout();
					break;
			}
		},
		
		// 跳转方法
		goToProfile() {
			uni.navigateTo({ url: '/pages/profile/profile' });
		},
		
		goToFavorites() {
			uni.navigateTo({ url: '/pages/favorites/favorites' });
		},
		
		goToSettings() {
			uni.navigateTo({ url: '/pages/settings/settings' });
		},
		
		goToAbout() {
			uni.navigateTo({ url: '/pages/about/about' });
		}
	}
}
</script>

<style lang="scss">
.my-container {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.user-info-section {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 40rpx 30rpx;
	display: flex;
	align-items: center;
	color: white;
	position: relative;
	
	.avatar-container {
		margin-right: 30rpx;
		
		.avatar {
			width: 120rpx;
			height: 120rpx;
			border-radius: 60rpx;
			border: 4rpx solid rgba(255, 255, 255, 0.3);
		}
	}
	
	.user-details {
		flex: 1;
		
		.username {
			font-size: 36rpx;
			font-weight: bold;
			display: block;
			margin-bottom: 10rpx;
		}
		
		.user-id {
			font-size: 24rpx;
			opacity: 0.8;
			display: block;
			margin-bottom: 8rpx;
		}
		
		.login-type {
			font-size: 22rpx;
			opacity: 0.7;
		}
	}
	
	.logout-btn {
		position: absolute;
		top: 30rpx;
		right: 30rpx;
		background: rgba(255, 255, 255, 0.2);
		padding: 15rpx 25rpx;
		border-radius: 25rpx;
		border: 1rpx solid rgba(255, 255, 255, 0.3);
		
		text {
			font-size: 24rpx;
			color: white;
		}
		
		&:active {
			background: rgba(255, 255, 255, 0.3);
		}
	}
}

.login-section {
	background: white;
	padding: 40rpx 30rpx;
	text-align: center;
	
	.login-prompt {
		margin-bottom: 30rpx;
		
		.login-text {
			font-size: 28rpx;
			color: #666;
		}
	}
	
	.login-buttons {
		.login-btn {
			width: 100%;
			height: 80rpx;
			border-radius: 40rpx;
			font-size: 28rpx;
			border: none;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 20rpx;
			
			&.primary {
				background: #2867ce;
				color: white;
			}
			
			.login-icon {
				font-size: 32rpx;
			}
		}
	}
}

.menu-section {
	background: white;
	margin-top: 20rpx;
	
	.menu-item {
		display: flex;
		align-items: center;
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
		
		&:last-child {
			border-bottom: none;
		}
		
		&:active {
			background-color: #f8f8f8;
		}
		
		.menu-icon {
			width: 60rpx;
			text-align: center;
			margin-right: 20rpx;
			
			.iconfont {
				font-size: 36rpx;
				color: #2867ce;
			}
		}
		
		.menu-content {
			flex: 1;
			
			.menu-title {
				font-size: 30rpx;
				color: #333;
				display: block;
				margin-bottom: 8rpx;
			}
			
			.menu-desc {
				font-size: 24rpx;
				color: #999;
			}
		}
		
		.menu-arrow {
			.iconfont {
				font-size: 24rpx;
				color: #ccc;
			}
		}
	}
}
</style>
