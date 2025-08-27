<template>
	<view class="login-container">
		<!-- 页面标题 -->
		<view class="login-header">
			<text class="login-title">用户登录</text>
			<text class="login-subtitle">选择您喜欢的登录方式</text>
		</view>
		
		<!-- 登录方式选择 -->
		<view class="login-methods">
			<!-- 微信登录 -->
			<view class="login-method-item" @click="handleWechatLogin">
				<view class="method-icon wechat">
					<text>📱</text>
				</view>
				<view class="method-info">
					<text class="method-title">微信登录</text>
					<text class="method-desc">快速登录，安全便捷</text>
				</view>
				<view class="method-arrow">
					<text>→</text>
				</view>
			</view>
			
			<!-- 一键登录 -->
			<view class="login-method-item" @click="handleQuickLogin">
				<view class="method-icon quick">
					<text>⚡</text>
				</view>
				<view class="method-info">
					<text class="method-title">一键登录</text>
					<text class="method-desc">无需密码，快速登录</text>
				</view>
				<view class="method-arrow">
					<text>→</text>
				</view>
			</view>
			
			<!-- 账号密码登录 -->
			<view class="login-method-item" @click="showPasswordLogin = true">
				<view class="method-icon password">
					<text>🔐</text>
				</view>
				<view class="method-info">
					<text class="method-title">账号密码登录</text>
					<text class="method-desc">使用用户名和密码登录</text>
				</view>
				<view class="method-arrow">
					<text>→</text>
				</view>
			</view>
			
			<!-- 手机验证码登录 -->
			<view class="login-method-item" @click="showSmsLogin = true">
				<view class="method-icon sms">
					<text>📱</text>
				</view>
				<view class="method-info">
					<text class="method-title">手机验证码登录</text>
					<text class="method-desc">使用手机号和验证码登录</text>
				</view>
				<view class="method-arrow">
					<text>→</text>
				</view>
			</view>
		</view>
		
		<!-- 其他选项 -->
		<view class="login-options">
			<text class="register-link" @click="goToRegister">还没有账号？立即注册</text>
			<text class="forgot-password" @click="goToForgotPassword">忘记密码？</text>
		</view>
		
		<!-- 测试按钮 -->
		<view class="test-section">
			<button class="test-btn" @click="testJump">测试跳转</button>
		</view>
		
		<!-- 账号密码登录弹窗 -->
		<uni-popup ref="passwordLoginPopup" type="center" :mask-click="false">
			<view class="login-modal">
				<view class="modal-header">
					<text class="modal-title">账号密码登录</text>
					<text class="close-btn" @click="showPasswordLogin = false">×</text>
				</view>
				<view class="modal-body">
					<view class="input-group">
						<input class="input-field" v-model="passwordLoginForm.username" placeholder="请输入用户名/手机号/邮箱" />
					</view>
					<view class="input-group">
						<input class="input-field" v-model="passwordLoginForm.password" type="password" placeholder="请输入密码" />
					</view>
					<button class="submit-btn" @click="handlePasswordLogin">登录</button>
				</view>
			</view>
		</uni-popup>
		
		<!-- 手机验证码登录弹窗 -->
		<uni-popup ref="smsLoginPopup" type="center" :mask-click="false">
			<view class="login-modal">
				<view class="modal-header">
					<text class="modal-title">手机验证码登录</text>
					<text class="close-btn" @click="showSmsLogin = false">×</text>
				</view>
				<view class="modal-body">
					<view class="input-group">
						<input class="input-field" v-model="smsLoginForm.phone" placeholder="请输入手机号" />
					</view>
					<view class="input-group sms-code-group">
						<input class="input-field sms-input" v-model="smsLoginForm.code" placeholder="请输入验证码" />
						<button class="send-code-btn" :disabled="smsCountdown > 0" @click="sendSmsCode">
							{{ smsCountdown > 0 ? `${smsCountdown}s` : '发送验证码' }}
						</button>
					</view>
					<button class="submit-btn" @click="handleSmsLogin">登录</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
export default {
	data() {
		return {
			showPasswordLogin: false,
			showSmsLogin: false,
			passwordLoginForm: {
				username: '',
				password: ''
			},
			smsLoginForm: {
				phone: '',
				code: ''
			},
			smsCountdown: 0
		};
	},
	
	methods: {
		// 微信登录
		async handleWechatLogin() {
			try {
				uni.showLoading({ title: '登录中...' });
				
				// 获取微信用户信息
				const userInfo = await this.getWechatUserInfo();
				if (!userInfo) return;
				
				console.log('获取到微信用户信息:', userInfo);
				
				// 获取微信登录凭证
				const loginResult = await this.getWechatLoginCode();
				console.log('微信登录结果:', loginResult);
				
				if (loginResult.code === 0) {
					// 显示登录/注册状态
					const statusText = loginResult.isNewUser ? '注册并登录中...' : '登录中...';
					uni.showLoading({ title: statusText });
					
					// 统一登录处理
					const unifiedResult = await this.handleUnifiedLogin('wechat', {
						...userInfo,
						openid: loginResult.openid,
						sessionKey: loginResult.sessionKey,
						userId: loginResult.userId,
						isNewUser: loginResult.isNewUser
					});
					
					if (unifiedResult) {
						// 显示成功消息
						const successText = loginResult.isNewUser ? '注册并登录成功！' : '登录成功！';
						uni.showToast({
							title: successText,
							icon: 'success',
							duration: 1500
						});
						
						// 立即跳转到个人资料页
						setTimeout(() => {
							console.log('准备跳转到个人资料页');
							uni.redirectTo({
								url: '/pages/profile/profile',
								success: () => {
									console.log('跳转成功');
								},
								fail: (err) => {
									console.error('跳转失败:', err);
									// 如果跳转失败，尝试使用navigateTo
									uni.navigateTo({
										url: '/pages/profile/profile',
										fail: (err2) => {
											console.error('navigateTo也失败:', err2);
											uni.showToast({
												title: '页面跳转失败',
												icon: 'none'
											});
										}
									});
								}
							});
						}, 1000);
					}
				} else {
					uni.showToast({
						title: loginResult.message || '微信登录失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('微信登录失败:', error);
				uni.showToast({
					title: '登录失败，请重试',
					icon: 'none'
				});
			} finally {
				uni.hideLoading();
			}
		},
		
		// 获取微信用户信息
		getWechatUserInfo() {
			return new Promise((resolve, reject) => {
				console.log('开始获取微信用户信息...');
				console.log('当前运行环境:', uni.getSystemInfoSync());
				
				// 检查是否支持getUserProfile
				if (!uni.getUserProfile) {
					console.error('当前环境不支持getUserProfile');
					uni.showToast({
						title: '当前环境不支持微信登录',
						icon: 'none'
					});
					reject(new Error('不支持getUserProfile'));
					return;
				}
				
				uni.getUserProfile({
					desc: '用于完善用户资料',
					success: (res) => {
						console.log('getUserProfile成功:', res);
						resolve(res.userInfo);
					},
					fail: (err) => {
						console.error('getUserProfile失败:', err);
						console.error('错误详情:', {
							errMsg: err.errMsg,
							errCode: err.errCode,
							platform: uni.getSystemInfoSync().platform
						});
						
						// 针对真机的特殊处理
						if (err.errMsg && err.errMsg.includes('deny')) {
							uni.showToast({
								title: '用户拒绝授权，请在微信中重新授权',
								icon: 'none',
								duration: 3000
							});
						} else {
							uni.showToast({
								title: '获取用户信息失败',
								icon: 'none'
							});
						}
						reject(err);
					}
				});
			});
		},
		
		// 获取微信登录凭证
		getWechatLoginCode() {
			return new Promise((resolve, reject) => {
				console.log('开始调用uni.login...');
				console.log('当前运行环境:', uni.getSystemInfoSync());
				
				// 检查是否支持uni.login
				if (!uni.login) {
					console.error('当前环境不支持uni.login');
					uni.showToast({
						title: '当前环境不支持微信登录',
						icon: 'none'
					});
					reject(new Error('不支持uni.login'));
					return;
				}
				
				uni.login({
					provider: 'weixin',
					success: async (loginRes) => {
						try {
							console.log('uni.login成功:', loginRes);
							console.log('登录code长度:', loginRes.code ? loginRes.code.length : 0);
							console.log('登录code前10位:', loginRes.code ? loginRes.code.substring(0, 10) + '***' : 'null');
							
							console.log('开始调用微信登录云函数...');
							const result = await uniCloud.callFunction({
								name: 'wechat-login',
								data: { code: loginRes.code }
							});
							
							console.log('微信登录云函数返回结果:', result);
							console.log('云函数result字段:', result.result);
							
							if (result.result && result.result.code === 0) {
								resolve(result.result);
							} else {
								console.error('微信登录云函数返回错误:', result.result);
								reject(new Error(result.result ? result.result.message : '微信登录失败'));
							}
						} catch (error) {
							console.error('调用云函数失败:', error);
							console.error('错误详情:', {
								message: error.message,
								stack: error.stack,
								platform: uni.getSystemInfoSync().platform
							});
							reject(error);
						}
					},
					fail: (error) => {
						console.error('uni.login失败:', error);
						console.error('登录失败详情:', {
							errMsg: error.errMsg,
							errCode: error.errCode,
							platform: uni.getSystemInfoSync().platform
						});
						
						// 针对真机的特殊处理
						if (error.errMsg && error.errMsg.includes('deny')) {
							uni.showToast({
								title: '用户拒绝登录，请在微信中重新授权',
								icon: 'none',
								duration: 3000
							});
						} else {
							uni.showToast({
								title: '微信登录失败',
								icon: 'none'
							});
						}
						reject(error);
					}
				});
			});
		},
		
		// 一键登录
		async handleQuickLogin() {
			try {
				uni.showLoading({ title: '登录中...' });
				
				// 调用一键登录云函数
				const result = await uniCloud.callFunction({
					name: 'quick-login',
					data: {}
				});
				
				if (result.result.code === 0) {
					await this.handleUnifiedLogin('quick', result.result.userInfo);
				} else {
					uni.showToast({
						title: result.result.message || '一键登录失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('一键登录失败:', error);
				uni.showToast({
					title: '登录失败，请重试',
					icon: 'none'
				});
			} finally {
				uni.hideLoading();
			}
		},
		
		// 账号密码登录
		async handlePasswordLogin() {
			if (!this.passwordLoginForm.username || !this.passwordLoginForm.password) {
				uni.showToast({
					title: '请输入用户名和密码',
					icon: 'none'
				});
				return;
			}
			
			try {
				uni.showLoading({ title: '登录中...' });
				
				const result = await uniCloud.callFunction({
					name: 'password-login',
					data: this.passwordLoginForm
				});
				
				if (result.result.code === 0) {
					await this.handleUnifiedLogin('password', result.result.userInfo);
					this.showPasswordLogin = false;
					this.passwordLoginForm = { username: '', password: '' };
				} else {
					uni.showToast({
						title: result.result.message || '登录失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('账号密码登录失败:', error);
				uni.showToast({
					title: '登录失败，请重试',
					icon: 'none'
				});
			} finally {
				uni.hideLoading();
			}
		},
		
		// 发送短信验证码
		async sendSmsCode() {
			if (!this.smsLoginForm.phone) {
				uni.showToast({
					title: '请输入手机号',
					icon: 'none'
				});
				return;
			}
			
			try {
				const result = await uniCloud.callFunction({
					name: 'send-sms-code',
					data: { phone: this.smsLoginForm.phone }
				});
				
				if (result.result.code === 0) {
					uni.showToast({
						title: '验证码已发送',
						icon: 'success'
					});
					this.startSmsCountdown();
				} else {
					uni.showToast({
						title: result.result.message || '发送失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('发送验证码失败:', error);
				uni.showToast({
					title: '发送失败，请重试',
					icon: 'none'
				});
			}
		},
		
		// 开始短信倒计时
		startSmsCountdown() {
			this.smsCountdown = 60;
			const timer = setInterval(() => {
				this.smsCountdown--;
				if (this.smsCountdown <= 0) {
					clearInterval(timer);
				}
			}, 1000);
		},
		
		// 手机验证码登录
		async handleSmsLogin() {
			if (!this.smsLoginForm.phone || !this.smsLoginForm.code) {
				uni.showToast({
					title: '请输入手机号和验证码',
					icon: 'none'
				});
				return;
			}
			
			try {
				uni.showLoading({ title: '登录中...' });
				
				const result = await uniCloud.callFunction({
					name: 'sms-login',
					data: this.smsLoginForm
				});
				
				if (result.result.code === 0) {
					await this.handleUnifiedLogin('sms', result.result.userInfo);
					this.showSmsLogin = false;
					this.smsLoginForm = { phone: '', code: '' };
				} else {
					uni.showToast({
						title: result.result.message || '登录失败',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('手机验证码登录失败:', error);
				uni.showToast({
					title: '登录失败，请重试',
					icon: 'none'
				});
			} finally {
				uni.hideLoading();
			}
		},
		
		// 统一登录处理
		async handleUnifiedLogin(loginType, userData) {
			try {
				console.log('开始统一登录处理:', { loginType, userData });
				
				// 调用统一登录云函数
				const result = await uniCloud.callFunction({
					name: 'unified-login',
					data: {
						loginType,
						userData
					}
				});
				
				console.log('统一登录云函数返回结果:', result);
				
				if (result.result && result.result.code === 0) {
					// 保存登录信息
					uni.setStorageSync('userInfo', result.result.userInfo);
					uni.setStorageSync('token', result.result.token);
					uni.setStorageSync('loginType', loginType);
					
					console.log('登录信息已保存到本地存储');
					
					uni.showToast({
						title: '登录成功',
						icon: 'success'
					});
					
					return true; // 返回成功标志
				} else {
					const errorMsg = result.result ? result.result.message : '登录失败';
					console.error('统一登录失败:', errorMsg);
					uni.showToast({
						title: errorMsg || '登录失败',
						icon: 'none'
					});
					return false;
				}
			} catch (error) {
				console.error('统一登录处理失败:', error);
				uni.showToast({
					title: '登录失败，请重试',
					icon: 'none'
				});
				return false;
			}
		},
		
		// 测试跳转方法
		testJump() {
			console.log('测试跳转方法被调用');
			uni.showToast({
				title: '测试跳转',
				icon: 'none'
			});
			
			// 尝试跳转
			setTimeout(() => {
				console.log('准备跳转到个人资料页');
				uni.redirectTo({
					url: '/pages/profile/profile',
					success: () => {
						console.log('跳转成功');
					},
					fail: (err) => {
						console.error('跳转失败:', err);
						// 尝试使用navigateTo
						uni.navigateTo({
							url: '/pages/profile/profile',
							success: () => {
								console.log('navigateTo成功');
							},
							fail: (err2) => {
								console.error('navigateTo也失败:', err2);
								uni.showToast({
									title: '页面跳转失败',
									icon: 'none'
								});
							}
						});
					}
				});
			}, 1000);
		},
		
		// 跳转方法
		goToRegister() {
			uni.navigateTo({ url: '/pages/register/register' });
		},
		
		goToForgotPassword() {
			uni.navigateTo({ url: '/pages/forgot-password/forgot-password' });
		}
	}
}
</script>

<style lang="scss">
.login-container {
	min-height: 100vh;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 40rpx 30rpx;
}

.login-header {
	text-align: center;
	margin-bottom: 80rpx;
	padding-top: 60rpx;
	
	.login-title {
		font-size: 48rpx;
		font-weight: bold;
		color: white;
		display: block;
		margin-bottom: 20rpx;
	}
	
	.login-subtitle {
		font-size: 28rpx;
		color: rgba(255, 255, 255, 0.8);
	}
}

.login-methods {
	background: white;
	border-radius: 20rpx;
	padding: 20rpx;
	margin-bottom: 40rpx;
	
	.login-method-item {
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
		
		.method-icon {
			width: 80rpx;
			height: 80rpx;
			border-radius: 40rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-right: 30rpx;
			font-size: 40rpx;
			
			&.wechat {
				background: #07c160;
				color: white;
			}
			
			&.quick {
				background: #ff6b35;
				color: white;
			}
			
			&.password {
				background: #2867ce;
				color: white;
			}
			
			&.sms {
				background: #ffc107;
				color: white;
			}
		}
		
		.method-info {
			flex: 1;
			
			.method-title {
				font-size: 32rpx;
				color: #333;
				display: block;
				margin-bottom: 8rpx;
				font-weight: 500;
			}
			
			.method-desc {
				font-size: 24rpx;
				color: #999;
			}
		}
		
		.method-arrow {
			font-size: 32rpx;
			color: #ccc;
		}
	}
}

.login-options {
	text-align: center;
	
	.register-link, .forgot-password {
		display: block;
		color: rgba(255, 255, 255, 0.9);
		font-size: 28rpx;
		margin-bottom: 20rpx;
		text-decoration: underline;
	}
}

.test-section {
	margin-top: 40rpx;
	text-align: center;
	
	.test-btn {
		width: 100%;
		height: 80rpx;
		background: #ff6b35;
		color: white;
		border: none;
		border-radius: 10rpx;
		font-size: 30rpx;
	}
}

.login-modal {
	background: white;
	border-radius: 20rpx;
	width: 600rpx;
	
	.modal-header {
		padding: 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		
		.modal-title {
			font-size: 32rpx;
			font-weight: bold;
			color: #333;
		}
		
		.close-btn {
			font-size: 40rpx;
			color: #999;
			line-height: 1;
		}
	}
	
	.modal-body {
		padding: 30rpx;
		
		.input-group {
			margin-bottom: 30rpx;
			
			&.sms-code-group {
				display: flex;
				gap: 20rpx;
				
				.sms-input {
					flex: 1;
				}
				
				.send-code-btn {
					width: 200rpx;
					height: 80rpx;
					background: #2867ce;
					color: white;
					border: none;
					border-radius: 10rpx;
					font-size: 24rpx;
					
					&:disabled {
						background: #ccc;
					}
				}
			}
			
			.input-field {
				width: 100%;
				height: 80rpx;
				border: 1rpx solid #ddd;
				border-radius: 10rpx;
				padding: 0 20rpx;
				font-size: 28rpx;
				box-sizing: border-box;
			}
		}
		
		.submit-btn {
			width: 100%;
			height: 80rpx;
			background: #2867ce;
			color: white;
			border: none;
			border-radius: 10rpx;
			font-size: 30rpx;
		}
	}
}
</style>
