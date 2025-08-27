"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      userInfo: {},
      editNickname: "",
      editPhone: "",
      smsCode: "",
      smsCountdown: 0
    };
  },
  onShow() {
    this.loadUserInfo();
  },
  methods: {
    // 加载用户信息
    loadUserInfo() {
      const userInfo = common_vendor.index.getStorageSync("userInfo");
      if (userInfo) {
        this.userInfo = userInfo;
      }
    },
    // 获取登录方式文本
    getLoginTypeText() {
      const typeMap = {
        "wechat": "微信登录",
        "quick": "一键登录",
        "password": "账号密码",
        "sms": "手机验证码"
      };
      return typeMap[this.userInfo.loginType] || "未知方式";
    },
    // 处理头像点击
    handleAvatarClick() {
      this.chooseAvatar();
    },
    // 选择头像
    async chooseAvatar() {
      try {
        if (!common_vendor.index.chooseImage) {
          common_vendor.index.showToast({
            title: "当前环境不支持头像选择",
            icon: "none"
          });
          return;
        }
        common_vendor.index.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
          success: async (res) => {
            try {
              common_vendor.index.__f__("log", "at pages/profile/profile.vue:175", "选择头像成功:", res);
              const tempFilePath = res.tempFilePaths[0];
              common_vendor.index.showLoading({ title: "上传头像中..." });
              const uploadResult = await this.uploadAvatar(tempFilePath);
              if (uploadResult) {
                this.userInfo.avatarUrl = uploadResult;
                common_vendor.index.setStorageSync("userInfo", this.userInfo);
                await this.updateUserInfo({ avatarUrl: this.userInfo.avatarUrl });
                common_vendor.index.showToast({
                  title: "头像更新成功",
                  icon: "success"
                });
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/profile/profile.vue:199", "处理头像失败:", error);
              common_vendor.index.showToast({
                title: "头像处理失败",
                icon: "none"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          },
          fail: (error) => {
            common_vendor.index.__f__("error", "at pages/profile/profile.vue:209", "选择头像失败:", error);
            if (error.errMsg && error.errMsg.includes("cancel")) {
              return;
            }
            common_vendor.index.showToast({
              title: "选择头像失败",
              icon: "none"
            });
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/profile.vue:221", "头像选择失败:", error);
        common_vendor.index.showToast({
          title: "头像选择失败",
          icon: "none"
        });
      }
    },
    // 上传头像到云存储
    async uploadAvatar(filePath) {
      try {
        common_vendor.index.__f__("log", "at pages/profile/profile.vue:232", "开始上传头像:", filePath);
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 11);
        const fileName = `avatar_${this.userInfo.userId}_${timestamp}_${random}.jpg`;
        const uploadResult = await common_vendor.tr.uploadFile({
          filePath,
          cloudPath: `avatars/${fileName}`,
          onUploadProgress: (progressEvent) => {
            common_vendor.index.__f__("log", "at pages/profile/profile.vue:244", "上传进度:", progressEvent);
          }
        });
        common_vendor.index.__f__("log", "at pages/profile/profile.vue:248", "头像上传成功:", uploadResult);
        return uploadResult.fileID;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/profile.vue:252", "头像上传失败:", error);
        throw error;
      }
    },
    // 处理昵称点击
    handleNicknameClick() {
      this.editNickname = this.userInfo.nickName || this.userInfo.username || "";
      this.$refs.nicknamePopup.open();
    },
    // 关闭昵称弹窗
    closeNicknamePopup() {
      this.$refs.nicknamePopup.close();
    },
    // 确认昵称修改
    async confirmNickname() {
      if (!this.editNickname.trim()) {
        common_vendor.index.showToast({
          title: "昵称不能为空",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "保存中..." });
        this.userInfo.nickName = this.editNickname.trim();
        common_vendor.index.setStorageSync("userInfo", this.userInfo);
        await this.updateUserInfo({ nickName: this.userInfo.nickName });
        this.closeNicknamePopup();
        common_vendor.index.showToast({
          title: "昵称保存成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/profile.vue:297", "保存昵称失败:", error);
        common_vendor.index.showToast({
          title: "保存失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    // 处理手机号点击
    handlePhoneClick() {
      this.editPhone = this.userInfo.phone || "";
      this.smsCode = "";
      this.$refs.phonePopup.open();
    },
    // 关闭手机号弹窗
    closePhonePopup() {
      this.$refs.phonePopup.close();
    },
    // 发送短信验证码
    async sendSmsCode() {
      if (!this.editPhone) {
        common_vendor.index.showToast({
          title: "请输入手机号",
          icon: "none"
        });
        return;
      }
      try {
        const result = await common_vendor.tr.callFunction({
          name: "send-sms-code",
          data: { phone: this.editPhone }
        });
        if (result.result.code === 0) {
          common_vendor.index.showToast({
            title: "验证码已发送",
            icon: "success"
          });
          this.startSmsCountdown();
        } else {
          common_vendor.index.showToast({
            title: result.result.message || "发送失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/profile.vue:348", "发送验证码失败:", error);
        common_vendor.index.showToast({
          title: "发送失败",
          icon: "none"
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
      }, 1e3);
    },
    // 确认手机号绑定
    async confirmPhone() {
      if (!this.editPhone) {
        common_vendor.index.showToast({
          title: "请输入手机号",
          icon: "none"
        });
        return;
      }
      if (!this.smsCode) {
        common_vendor.index.showToast({
          title: "请输入验证码",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "绑定中..." });
        const result = await common_vendor.tr.callFunction({
          name: "verify-sms-code",
          data: {
            phone: this.editPhone,
            code: this.smsCode
          }
        });
        if (result.result.code === 0) {
          this.userInfo.phone = this.editPhone;
          common_vendor.index.setStorageSync("userInfo", this.userInfo);
          await this.updateUserInfo({ phone: this.userInfo.phone });
          this.closePhonePopup();
          common_vendor.index.showToast({
            title: "手机号绑定成功",
            icon: "success"
          });
        } else {
          common_vendor.index.showToast({
            title: result.result.message || "验证码错误",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/profile.vue:420", "绑定手机号失败:", error);
        common_vendor.index.showToast({
          title: "绑定失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    // 更新用户信息到云数据库
    async updateUserInfo(updateData) {
      try {
        const result = await common_vendor.tr.callFunction({
          name: "update-user-info",
          data: {
            userId: this.userInfo.userId,
            updateData
          }
        });
        common_vendor.index.__f__("log", "at pages/profile/profile.vue:441", "用户信息更新成功:", result);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/profile/profile.vue:443", "更新用户信息失败:", error);
        throw error;
      }
    },
    // 退出登录
    async handleLogout() {
      common_vendor.index.showModal({
        title: "确认退出",
        content: "确定要退出登录吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              await common_vendor.tr.callFunction({
                name: "logout",
                data: { token: common_vendor.index.getStorageSync("token") }
              });
              common_vendor.index.removeStorageSync("userInfo");
              common_vendor.index.removeStorageSync("token");
              common_vendor.index.removeStorageSync("loginType");
              common_vendor.index.removeStorageSync("openid");
              common_vendor.index.removeStorageSync("sessionKey");
              common_vendor.index.showToast({
                title: "已退出登录",
                icon: "success"
              });
              setTimeout(() => {
                common_vendor.index.navigateBack();
              }, 1500);
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/profile/profile.vue:480", "退出登录失败:", error);
              common_vendor.index.removeStorageSync("userInfo");
              common_vendor.index.removeStorageSync("token");
              common_vendor.index.removeStorageSync("loginType");
              common_vendor.index.removeStorageSync("openid");
              common_vendor.index.removeStorageSync("sessionKey");
              common_vendor.index.showToast({
                title: "已退出登录",
                icon: "success"
              });
              setTimeout(() => {
                common_vendor.index.navigateBack();
              }, 1500);
            }
          }
        }
      });
    }
  }
};
if (!Array) {
  const _component_uni_popup = common_vendor.resolveComponent("uni-popup");
  _component_uni_popup();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.userInfo.avatarUrl || "/static/default-avatar.png",
    b: common_vendor.o((...args) => $options.handleAvatarClick && $options.handleAvatarClick(...args)),
    c: common_vendor.t($data.userInfo.nickName || $data.userInfo.username || "未设置"),
    d: common_vendor.o((...args) => $options.handleNicknameClick && $options.handleNicknameClick(...args)),
    e: common_vendor.t($data.userInfo.phone || "未绑定"),
    f: common_vendor.o((...args) => $options.handlePhoneClick && $options.handlePhoneClick(...args)),
    g: common_vendor.t($options.getLoginTypeText()),
    h: common_vendor.t($data.userInfo.userId || ""),
    i: common_vendor.o((...args) => $options.handleLogout && $options.handleLogout(...args)),
    j: common_vendor.o((...args) => $options.closeNicknamePopup && $options.closeNicknamePopup(...args)),
    k: $data.editNickname,
    l: common_vendor.o(($event) => $data.editNickname = $event.detail.value),
    m: common_vendor.o((...args) => $options.closeNicknamePopup && $options.closeNicknamePopup(...args)),
    n: common_vendor.o((...args) => $options.confirmNickname && $options.confirmNickname(...args)),
    o: common_vendor.sr("nicknamePopup", "7f2c3932-0"),
    p: common_vendor.p({
      type: "center",
      ["mask-click"]: false
    }),
    q: common_vendor.o((...args) => $options.closePhonePopup && $options.closePhonePopup(...args)),
    r: $data.editPhone,
    s: common_vendor.o(($event) => $data.editPhone = $event.detail.value),
    t: $data.smsCode,
    v: common_vendor.o(($event) => $data.smsCode = $event.detail.value),
    w: common_vendor.t($data.smsCountdown > 0 ? `${$data.smsCountdown}s` : "发送验证码"),
    x: $data.smsCountdown > 0,
    y: common_vendor.o((...args) => $options.sendSmsCode && $options.sendSmsCode(...args)),
    z: common_vendor.o((...args) => $options.closePhonePopup && $options.closePhonePopup(...args)),
    A: common_vendor.o((...args) => $options.confirmPhone && $options.confirmPhone(...args)),
    B: common_vendor.sr("phonePopup", "7f2c3932-1"),
    C: common_vendor.p({
      type: "center",
      ["mask-click"]: false
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/profile/profile.js.map
