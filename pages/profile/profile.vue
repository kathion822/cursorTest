<template>
	<view class="profile-container">
		<!-- 页面标题 -->
		<view class="profile-header">
			<text class="profile-title">个人资料</text>
		</view>
		
		<!-- 用户信息区域 -->
		<view class="user-info-section">
			<!-- 头像 -->
			<view class="avatar-section" @click="handleAvatarClick">
				<view class="avatar-container">
					<image class="avatar" :src="userInfo.avatarUrl || '/static/default-avatar.png'" mode="aspectFill"></image>
					<view class="avatar-edit-icon">
						<text>📷</text>
					</view>
				</view>
				<text class="avatar-tip">点击更换头像</text>
			</view>
			
			<!-- 昵称 -->
			<view class="info-item" @click="handleNicknameClick">
				<view class="info-label">
					<text class="label-text">昵称</text>
				</view>
				<view class="info-content">
					<text class="content-text">{{ userInfo.nickName || userInfo.username || '未设置' }}</text>
					<text class="edit-icon">✏️</text>
				</view>
			</view>
			
			<!-- 手机号 -->
			<view class="info-item" @click="handlePhoneClick">
				<view class="info-label">
					<text class="label-text">手机号</text>
				</view>
				<view class="info-content">
					<text class="content-text">{{ userInfo.phone || '未绑定' }}</text>
					<text class="edit-icon">✏️</text>
				</view>
			</view>
			
			<!-- 登录方式 -->
			<view class="info-item">
				<view class="info-label">
					<text class="label-text">登录方式</text>
				</view>
				<view class="info-content">
					<text class="content-text">{{ getLoginTypeText() }}</text>
				</view>
			</view>
			
			<!-- 用户ID -->
			<view class="info-item">
				<view class="info-label">
					<text class="label-text">用户ID</text>
				</view>
				<view class="info-content">
					<text class="content-text">{{ userInfo.userId || '' }}</text>
				</view>
			</view>
		</view>
		
		<!-- 退出登录按钮 -->
		<view class="logout-section">
			<button class="logout-btn" @click="handleLogout">退出登录</button>
		</view>
		
		<!-- 昵称编辑弹窗 -->
		<uni-popup ref="nicknamePopup" type="center" :mask-click="false">
			<view class="edit-modal">
				<view class="modal-header">
					<text class="modal-title">编辑昵称</text>
					<text class="close-btn" @click="closeNicknamePopup">×</text>
				</view>
				<view class="modal-body">
					<view class="input-group">
						<input class="input-field" v-model="editNickname" placeholder="请输入昵称" maxlength="20" />
					</view>
					<view class="button-group">
						<button class="cancel-btn" @click="closeNicknamePopup">取消</button>
						<button class="confirm-btn" @click="confirmNickname">确定</button>
					</view>
				</view>
			</view>
		</uni-popup>
		
		<!-- 手机号绑定弹窗 -->
		<uni-popup ref="phonePopup" type="center" :mask-click="false">
			<view class="edit-modal">
				<view class="modal-header">
					<text class="modal-title">绑定手机号</text>
					<text class="close-btn" @click="closePhonePopup">×</text>
				</view>
				<view class="modal-body">
					<view class="input-group">
						<input class="input-field" v-model="editPhone" placeholder="请输入手机号" maxlength="11" />
					</view>
					<view class="input-group sms-group">
						<input class="input-field sms-input" v-model="smsCode" placeholder="请输入验证码" maxlength="6" />
						<button class="send-sms-btn" :disabled="smsCountdown > 0" @click="sendSmsCode">
							{{ smsCountdown > 0 ? `${smsCountdown}s` : '发送验证码' }}
						</button>
					</view>
					<view class="button-group">
						<button class="cancel-btn" @click="closePhonePopup">取消</button>
						<button class="confirm-btn" @click="confirmPhone">确定</button>
					</view>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userInfo: {},
			editNickname: '',
			editPhone: '',
			smsCode: '',
			smsCountdown: 0
		};
	},
	
	onShow() {
		this.loadUserInfo();
	},
	
	methods: {
		// 加载用户信息
		loadUserInfo() {
			const userInfo = uni.getStorageSync('userInfo');
			if (userInfo) {
				this.userInfo = userInfo;
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
			return typeMap[this.userInfo.loginType] || '未知方式';
		},
		
		// 处理头像点击
		handleAvatarClick() {
			// 使用微信头像选择器
			this.chooseAvatar();
		},
		
		// 选择头像
		async chooseAvatar() {
			try {
				// 检查是否支持头像选择
				if (!uni.chooseImage) {
					uni.showToast({
						title: '当前环境不支持头像选择',
						icon: 'none'
					});
					return;
				}
				
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: async (res) => {
						try {
							console.log('选择头像成功:', res);
							const tempFilePath = res.tempFilePaths[0];
							
							uni.showLoading({ title: '上传头像中...' });
							
							// 上传头像到云存储
							const uploadResult = await this.uploadAvatar(tempFilePath);
							
							if (uploadResult) {
								// 更新用户头像
								this.userInfo.avatarUrl = uploadResult;
								
								// 保存到本地存储
								uni.setStorageSync('userInfo', this.userInfo);
								
								// 更新到云数据库
								await this.updateUserInfo({ avatarUrl: this.userInfo.avatarUrl });
								
								uni.showToast({
									title: '头像更新成功',
									icon: 'success'
								});
							}
						} catch (error) {
							console.error('处理头像失败:', error);
							uni.showToast({
								title: '头像处理失败',
								icon: 'none'
							});
						} finally {
							uni.hideLoading();
						}
					},
					fail: (error) => {
						console.error('选择头像失败:', error);
						if (error.errMsg && error.errMsg.includes('cancel')) {
							// 用户取消选择
							return;
						}
						uni.showToast({
							title: '选择头像失败',
							icon: 'none'
						});
					}
				});
			} catch (error) {
				console.error('头像选择失败:', error);
				uni.showToast({
					title: '头像选择失败',
					icon: 'none'
				});
			}
		},
		
		// 上传头像到云存储
		async uploadAvatar(filePath) {
			try {
				console.log('开始上传头像:', filePath);
				
				// 生成唯一的文件名
				const timestamp = Date.now();
				const random = Math.random().toString(36).substring(2, 11);
				const fileName = `avatar_${this.userInfo.userId}_${timestamp}_${random}.jpg`;
				
				// 上传到云存储
				const uploadResult = await uniCloud.uploadFile({
					filePath: filePath,
					cloudPath: `avatars/${fileName}`,
					onUploadProgress: (progressEvent) => {
						console.log('上传进度:', progressEvent);
					}
				});
				
				console.log('头像上传成功:', uploadResult);
				return uploadResult.fileID;
				
			} catch (error) {
				console.error('头像上传失败:', error);
				throw error;
			}
		},
		
		// 处理昵称点击
		handleNicknameClick() {
			this.editNickname = this.userInfo.nickName || this.userInfo.username || '';
			this.$refs.nicknamePopup.open();
		},
		
		// 关闭昵称弹窗
		closeNicknamePopup() {
			this.$refs.nicknamePopup.close();
		},
		
		// 确认昵称修改
		async confirmNickname() {
			if (!this.editNickname.trim()) {
				uni.showToast({
					title: '昵称不能为空',
					icon: 'none'
				});
				return;
			}
			
			try {
				uni.showLoading({ title: '保存中...' });
				
				// 更新昵称
				this.userInfo.nickName = this.editNickname.trim();
				
				// 保存到本地存储
				uni.setStorageSync('userInfo', this.userInfo);
				
				// 更新到云数据库
				await this.updateUserInfo({ nickName: this.userInfo.nickName });
				
				this.closeNicknamePopup();
				
				uni.showToast({
					title: '昵称保存成功',
					icon: 'success'
				});
			} catch (error) {
				console.error('保存昵称失败:', error);
				uni.showToast({
					title: '保存失败',
					icon: 'none'
				});
			} finally {
				uni.hideLoading();
			}
		},
		
		// 处理手机号点击
		handlePhoneClick() {
			this.editPhone = this.userInfo.phone || '';
			this.smsCode = '';
			this.$refs.phonePopup.open();
		},
		
		// 关闭手机号弹窗
		closePhonePopup() {
			this.$refs.phonePopup.close();
		},
		
		// 发送短信验证码
		async sendSmsCode() {
			if (!this.editPhone) {
				uni.showToast({
					title: '请输入手机号',
					icon: 'none'
				});
				return;
			}
			
			try {
				const result = await uniCloud.callFunction({
					name: 'send-sms-code',
					data: { phone: this.editPhone }
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
					title: '发送失败',
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
		
		// 确认手机号绑定
		async confirmPhone() {
			if (!this.editPhone) {
				uni.showToast({
					title: '请输入手机号',
					icon: 'none'
				});
				return;
			}
			
			if (!this.smsCode) {
				uni.showToast({
					title: '请输入验证码',
					icon: 'none'
				});
				return;
			}
			
			try {
				uni.showLoading({ title: '绑定中...' });
				
				// 验证短信验证码
				const result = await uniCloud.callFunction({
					name: 'verify-sms-code',
					data: {
						phone: this.editPhone,
						code: this.smsCode
					}
				});
				
				if (result.result.code === 0) {
					// 更新手机号
					this.userInfo.phone = this.editPhone;
					
					// 保存到本地存储
					uni.setStorageSync('userInfo', this.userInfo);
					
					// 更新到云数据库
					await this.updateUserInfo({ phone: this.userInfo.phone });
					
					this.closePhonePopup();
					
					uni.showToast({
						title: '手机号绑定成功',
						icon: 'success'
					});
				} else {
					uni.showToast({
						title: result.result.message || '验证码错误',
						icon: 'none'
					});
				}
			} catch (error) {
				console.error('绑定手机号失败:', error);
				uni.showToast({
					title: '绑定失败',
					icon: 'none'
				});
			} finally {
				uni.hideLoading();
			}
		},
		
		// 更新用户信息到云数据库
		async updateUserInfo(updateData) {
			try {
				const result = await uniCloud.callFunction({
					name: 'update-user-info',
					data: {
						userId: this.userInfo.userId,
						updateData: updateData
					}
				});
				
				console.log('用户信息更新成功:', result);
			} catch (error) {
				console.error('更新用户信息失败:', error);
				throw error;
			}
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
							
							uni.showToast({
								title: '已退出登录',
								icon: 'success'
							});
							
							// 返回上一页
							setTimeout(() => {
								uni.navigateBack();
							}, 1500);
							
						} catch (error) {
							console.error('退出登录失败:', error);
							// 即使云函数调用失败，也要清除本地数据
							uni.removeStorageSync('userInfo');
							uni.removeStorageSync('token');
							uni.removeStorageSync('loginType');
							uni.removeStorageSync('openid');
							uni.removeStorageSync('sessionKey');
							
							uni.showToast({
								title: '已退出登录',
								icon: 'success'
							});
							
							setTimeout(() => {
								uni.navigateBack();
							}, 1500);
						}
					}
				}
			});
		}
	}
}
</script>

<style lang="scss">
.profile-container {
	min-height: 100vh;
	background-color: #f5f5f5;
}

.profile-header {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	padding: 40rpx 30rpx;
	text-align: center;
	
	.profile-title {
		font-size: 36rpx;
		font-weight: bold;
		color: white;
	}
}

.user-info-section {
	background: white;
	margin: 20rpx;
	border-radius: 20rpx;
	overflow: hidden;
	
	.avatar-section {
		padding: 40rpx;
		text-align: center;
		border-bottom: 1rpx solid #f0f0f0;
		
		.avatar-container {
			position: relative;
			display: inline-block;
			margin-bottom: 20rpx;
			
			.avatar {
				width: 120rpx;
				height: 120rpx;
				border-radius: 60rpx;
				border: 4rpx solid rgba(102, 126, 234, 0.3);
			}
			
			.avatar-edit-icon {
				position: absolute;
				bottom: 0;
				right: 0;
				width: 40rpx;
				height: 40rpx;
				background: #667eea;
				border-radius: 20rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				font-size: 20rpx;
				color: white;
			}
		}
		
		.avatar-tip {
			font-size: 24rpx;
			color: #999;
		}
	}
	
	.info-item {
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
		
		.info-label {
			width: 200rpx;
			
			.label-text {
				font-size: 28rpx;
				color: #333;
				font-weight: 500;
			}
		}
		
		.info-content {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: space-between;
			
			.content-text {
				font-size: 28rpx;
				color: #666;
			}
			
			.edit-icon {
				font-size: 24rpx;
				color: #999;
			}
		}
	}
}

.logout-section {
	margin: 40rpx 20rpx;
	
	.logout-btn {
		width: 100%;
		height: 80rpx;
		background: #ff4757;
		color: white;
		border: none;
		border-radius: 10rpx;
		font-size: 30rpx;
	}
}

.edit-modal {
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
			
			&.sms-group {
				display: flex;
				gap: 20rpx;
				
				.sms-input {
					flex: 1;
				}
				
				.send-sms-btn {
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
				
				&:focus {
					border-color: #2867ce;
				}
			}
		}
		
		.button-group {
			display: flex;
			gap: 20rpx;
			
			.cancel-btn, .confirm-btn {
				flex: 1;
				height: 80rpx;
				border: none;
				border-radius: 10rpx;
				font-size: 30rpx;
			}
			
			.cancel-btn {
				background: #f0f0f0;
				color: #666;
			}
			
			.confirm-btn {
				background: #2867ce;
				color: white;
			}
		}
	}
}
</style>
