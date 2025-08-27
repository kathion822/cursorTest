"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      showPasswordLogin: false,
      showSmsLogin: false,
      passwordLoginForm: {
        username: "",
        password: ""
      },
      smsLoginForm: {
        phone: "",
        code: ""
      },
      smsCountdown: 0
    };
  },
  methods: {
    // 微信登录
    async handleWechatLogin() {
      try {
        common_vendor.index.showLoading({ title: "登录中..." });
        const userInfo = await this.getWechatUserInfo();
        if (!userInfo)
          return;
        common_vendor.index.__f__("log", "at pages/login/login.vue:150", "获取到微信用户信息:", userInfo);
        const loginResult = await this.getWechatLoginCode();
        common_vendor.index.__f__("log", "at pages/login/login.vue:154", "微信登录结果:", loginResult);
        if (loginResult.code === 0) {
          const statusText = loginResult.isNewUser ? "注册并登录中..." : "登录中...";
          common_vendor.index.showLoading({ title: statusText });
          const unifiedResult = await this.handleUnifiedLogin("wechat", {
            ...userInfo,
            openid: loginResult.openid,
            sessionKey: loginResult.sessionKey,
            userId: loginResult.userId,
            isNewUser: loginResult.isNewUser
          });
          if (unifiedResult) {
            const successText = loginResult.isNewUser ? "注册并登录成功！" : "登录成功！";
            common_vendor.index.showToast({
              title: successText,
              icon: "success",
              duration: 1500
            });
            setTimeout(() => {
              common_vendor.index.__f__("log", "at pages/login/login.vue:181", "准备跳转到个人资料页");
              common_vendor.index.redirectTo({
                url: "/pages/profile/profile",
                success: () => {
                  common_vendor.index.__f__("log", "at pages/login/login.vue:185", "跳转成功");
                },
                fail: (err) => {
                  common_vendor.index.__f__("error", "at pages/login/login.vue:188", "跳转失败:", err);
                  common_vendor.index.navigateTo({
                    url: "/pages/profile/profile",
                    fail: (err2) => {
                      common_vendor.index.__f__("error", "at pages/login/login.vue:193", "navigateTo也失败:", err2);
                      common_vendor.index.showToast({
                        title: "页面跳转失败",
                        icon: "none"
                      });
                    }
                  });
                }
              });
            }, 1e3);
          }
        } else {
          common_vendor.index.showToast({
            title: loginResult.message || "微信登录失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:211", "微信登录失败:", error);
        common_vendor.index.showToast({
          title: "登录失败，请重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    // 获取微信用户信息
    getWechatUserInfo() {
      return new Promise((resolve, reject) => {
        common_vendor.index.__f__("log", "at pages/login/login.vue:224", "开始获取微信用户信息...");
        common_vendor.index.__f__("log", "at pages/login/login.vue:225", "当前运行环境:", common_vendor.index.getSystemInfoSync());
        if (!common_vendor.index.getUserProfile) {
          common_vendor.index.__f__("error", "at pages/login/login.vue:229", "当前环境不支持getUserProfile");
          common_vendor.index.showToast({
            title: "当前环境不支持微信登录",
            icon: "none"
          });
          reject(new Error("不支持getUserProfile"));
          return;
        }
        common_vendor.index.getUserProfile({
          desc: "用于完善用户资料",
          success: (res) => {
            common_vendor.index.__f__("log", "at pages/login/login.vue:241", "getUserProfile成功:", res);
            resolve(res.userInfo);
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/login/login.vue:245", "getUserProfile失败:", err);
            common_vendor.index.__f__("error", "at pages/login/login.vue:246", "错误详情:", {
              errMsg: err.errMsg,
              errCode: err.errCode,
              platform: common_vendor.index.getSystemInfoSync().platform
            });
            if (err.errMsg && err.errMsg.includes("deny")) {
              common_vendor.index.showToast({
                title: "用户拒绝授权，请在微信中重新授权",
                icon: "none",
                duration: 3e3
              });
            } else {
              common_vendor.index.showToast({
                title: "获取用户信息失败",
                icon: "none"
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
        common_vendor.index.__f__("log", "at pages/login/login.vue:274", "开始调用uni.login...");
        common_vendor.index.__f__("log", "at pages/login/login.vue:275", "当前运行环境:", common_vendor.index.getSystemInfoSync());
        if (!common_vendor.index.login) {
          common_vendor.index.__f__("error", "at pages/login/login.vue:279", "当前环境不支持uni.login");
          common_vendor.index.showToast({
            title: "当前环境不支持微信登录",
            icon: "none"
          });
          reject(new Error("不支持uni.login"));
          return;
        }
        common_vendor.index.login({
          provider: "weixin",
          success: async (loginRes) => {
            try {
              common_vendor.index.__f__("log", "at pages/login/login.vue:292", "uni.login成功:", loginRes);
              common_vendor.index.__f__("log", "at pages/login/login.vue:293", "登录code长度:", loginRes.code ? loginRes.code.length : 0);
              common_vendor.index.__f__("log", "at pages/login/login.vue:294", "登录code前10位:", loginRes.code ? loginRes.code.substring(0, 10) + "***" : "null");
              common_vendor.index.__f__("log", "at pages/login/login.vue:296", "开始调用微信登录云函数...");
              const result = await common_vendor.tr.callFunction({
                name: "wechat-login",
                data: { code: loginRes.code }
              });
              common_vendor.index.__f__("log", "at pages/login/login.vue:302", "微信登录云函数返回结果:", result);
              common_vendor.index.__f__("log", "at pages/login/login.vue:303", "云函数result字段:", result.result);
              if (result.result && result.result.code === 0) {
                resolve(result.result);
              } else {
                common_vendor.index.__f__("error", "at pages/login/login.vue:308", "微信登录云函数返回错误:", result.result);
                reject(new Error(result.result ? result.result.message : "微信登录失败"));
              }
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/login/login.vue:312", "调用云函数失败:", error);
              common_vendor.index.__f__("error", "at pages/login/login.vue:313", "错误详情:", {
                message: error.message,
                stack: error.stack,
                platform: common_vendor.index.getSystemInfoSync().platform
              });
              reject(error);
            }
          },
          fail: (error) => {
            common_vendor.index.__f__("error", "at pages/login/login.vue:322", "uni.login失败:", error);
            common_vendor.index.__f__("error", "at pages/login/login.vue:323", "登录失败详情:", {
              errMsg: error.errMsg,
              errCode: error.errCode,
              platform: common_vendor.index.getSystemInfoSync().platform
            });
            if (error.errMsg && error.errMsg.includes("deny")) {
              common_vendor.index.showToast({
                title: "用户拒绝登录，请在微信中重新授权",
                icon: "none",
                duration: 3e3
              });
            } else {
              common_vendor.index.showToast({
                title: "微信登录失败",
                icon: "none"
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
        common_vendor.index.showLoading({ title: "登录中..." });
        const result = await common_vendor.tr.callFunction({
          name: "quick-login",
          data: {}
        });
        if (result.result.code === 0) {
          await this.handleUnifiedLogin("quick", result.result.userInfo);
        } else {
          common_vendor.index.showToast({
            title: result.result.message || "一键登录失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:368", "一键登录失败:", error);
        common_vendor.index.showToast({
          title: "登录失败，请重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    // 账号密码登录
    async handlePasswordLogin() {
      if (!this.passwordLoginForm.username || !this.passwordLoginForm.password) {
        common_vendor.index.showToast({
          title: "请输入用户名和密码",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "登录中..." });
        const result = await common_vendor.tr.callFunction({
          name: "password-login",
          data: this.passwordLoginForm
        });
        if (result.result.code === 0) {
          await this.handleUnifiedLogin("password", result.result.userInfo);
          this.showPasswordLogin = false;
          this.passwordLoginForm = { username: "", password: "" };
        } else {
          common_vendor.index.showToast({
            title: result.result.message || "登录失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:407", "账号密码登录失败:", error);
        common_vendor.index.showToast({
          title: "登录失败，请重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    // 发送短信验证码
    async sendSmsCode() {
      if (!this.smsLoginForm.phone) {
        common_vendor.index.showToast({
          title: "请输入手机号",
          icon: "none"
        });
        return;
      }
      try {
        const result = await common_vendor.tr.callFunction({
          name: "send-sms-code",
          data: { phone: this.smsLoginForm.phone }
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
        common_vendor.index.__f__("error", "at pages/login/login.vue:446", "发送验证码失败:", error);
        common_vendor.index.showToast({
          title: "发送失败，请重试",
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
    // 手机验证码登录
    async handleSmsLogin() {
      if (!this.smsLoginForm.phone || !this.smsLoginForm.code) {
        common_vendor.index.showToast({
          title: "请输入手机号和验证码",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "登录中..." });
        const result = await common_vendor.tr.callFunction({
          name: "sms-login",
          data: this.smsLoginForm
        });
        if (result.result.code === 0) {
          await this.handleUnifiedLogin("sms", result.result.userInfo);
          this.showSmsLogin = false;
          this.smsLoginForm = { phone: "", code: "" };
        } else {
          common_vendor.index.showToast({
            title: result.result.message || "登录失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:494", "手机验证码登录失败:", error);
        common_vendor.index.showToast({
          title: "登录失败，请重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    // 统一登录处理
    async handleUnifiedLogin(loginType, userData) {
      try {
        common_vendor.index.__f__("log", "at pages/login/login.vue:507", "开始统一登录处理:", { loginType, userData });
        const result = await common_vendor.tr.callFunction({
          name: "unified-login",
          data: {
            loginType,
            userData
          }
        });
        common_vendor.index.__f__("log", "at pages/login/login.vue:518", "统一登录云函数返回结果:", result);
        if (result.result && result.result.code === 0) {
          common_vendor.index.setStorageSync("userInfo", result.result.userInfo);
          common_vendor.index.setStorageSync("token", result.result.token);
          common_vendor.index.setStorageSync("loginType", loginType);
          common_vendor.index.__f__("log", "at pages/login/login.vue:526", "登录信息已保存到本地存储");
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success"
          });
          return true;
        } else {
          const errorMsg = result.result ? result.result.message : "登录失败";
          common_vendor.index.__f__("error", "at pages/login/login.vue:536", "统一登录失败:", errorMsg);
          common_vendor.index.showToast({
            title: errorMsg || "登录失败",
            icon: "none"
          });
          return false;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:544", "统一登录处理失败:", error);
        common_vendor.index.showToast({
          title: "登录失败，请重试",
          icon: "none"
        });
        return false;
      }
    },
    // 测试跳转方法
    testJump() {
      common_vendor.index.__f__("log", "at pages/login/login.vue:555", "测试跳转方法被调用");
      common_vendor.index.showToast({
        title: "测试跳转",
        icon: "none"
      });
      setTimeout(() => {
        common_vendor.index.__f__("log", "at pages/login/login.vue:563", "准备跳转到个人资料页");
        common_vendor.index.redirectTo({
          url: "/pages/profile/profile",
          success: () => {
            common_vendor.index.__f__("log", "at pages/login/login.vue:567", "跳转成功");
          },
          fail: (err) => {
            common_vendor.index.__f__("error", "at pages/login/login.vue:570", "跳转失败:", err);
            common_vendor.index.navigateTo({
              url: "/pages/profile/profile",
              success: () => {
                common_vendor.index.__f__("log", "at pages/login/login.vue:575", "navigateTo成功");
              },
              fail: (err2) => {
                common_vendor.index.__f__("error", "at pages/login/login.vue:578", "navigateTo也失败:", err2);
                common_vendor.index.showToast({
                  title: "页面跳转失败",
                  icon: "none"
                });
              }
            });
          }
        });
      }, 1e3);
    },
    // 跳转方法
    goToRegister() {
      common_vendor.index.navigateTo({ url: "/pages/register/register" });
    },
    goToForgotPassword() {
      common_vendor.index.navigateTo({ url: "/pages/forgot-password/forgot-password" });
    }
  }
};
if (!Array) {
  const _component_uni_popup = common_vendor.resolveComponent("uni-popup");
  _component_uni_popup();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.handleWechatLogin && $options.handleWechatLogin(...args)),
    b: common_vendor.o((...args) => $options.handleQuickLogin && $options.handleQuickLogin(...args)),
    c: common_vendor.o(($event) => $data.showPasswordLogin = true),
    d: common_vendor.o(($event) => $data.showSmsLogin = true),
    e: common_vendor.o((...args) => $options.goToRegister && $options.goToRegister(...args)),
    f: common_vendor.o((...args) => $options.goToForgotPassword && $options.goToForgotPassword(...args)),
    g: common_vendor.o((...args) => $options.testJump && $options.testJump(...args)),
    h: common_vendor.o(($event) => $data.showPasswordLogin = false),
    i: $data.passwordLoginForm.username,
    j: common_vendor.o(($event) => $data.passwordLoginForm.username = $event.detail.value),
    k: $data.passwordLoginForm.password,
    l: common_vendor.o(($event) => $data.passwordLoginForm.password = $event.detail.value),
    m: common_vendor.o((...args) => $options.handlePasswordLogin && $options.handlePasswordLogin(...args)),
    n: common_vendor.sr("passwordLoginPopup", "457d529c-0"),
    o: common_vendor.p({
      type: "center",
      ["mask-click"]: false
    }),
    p: common_vendor.o(($event) => $data.showSmsLogin = false),
    q: $data.smsLoginForm.phone,
    r: common_vendor.o(($event) => $data.smsLoginForm.phone = $event.detail.value),
    s: $data.smsLoginForm.code,
    t: common_vendor.o(($event) => $data.smsLoginForm.code = $event.detail.value),
    v: common_vendor.t($data.smsCountdown > 0 ? `${$data.smsCountdown}s` : "发送验证码"),
    w: $data.smsCountdown > 0,
    x: common_vendor.o((...args) => $options.sendSmsCode && $options.sendSmsCode(...args)),
    y: common_vendor.o((...args) => $options.handleSmsLogin && $options.handleSmsLogin(...args)),
    z: common_vendor.sr("smsLoginPopup", "457d529c-1"),
    A: common_vendor.p({
      type: "center",
      ["mask-click"]: false
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
