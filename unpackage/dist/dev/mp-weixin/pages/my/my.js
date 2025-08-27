"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      isLogin: false,
      userInfo: {},
      loginType: "",
      menuItems: [
        {
          title: "个人资料",
          desc: "编辑个人信息",
          icon: "icon-user",
          action: "profile"
        },
        {
          title: "我的收藏",
          desc: "查看收藏内容",
          icon: "icon-heart",
          action: "favorites"
        },
        {
          title: "设置",
          desc: "应用设置",
          icon: "icon-settings",
          action: "settings"
        },
        {
          title: "关于我们",
          desc: "了解更多信息",
          icon: "icon-info",
          action: "about"
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
        const userInfo = common_vendor.index.getStorageSync("userInfo");
        const token = common_vendor.index.getStorageSync("token");
        const loginType = common_vendor.index.getStorageSync("loginType");
        if (userInfo && token) {
          this.isLogin = true;
          this.userInfo = userInfo;
          this.loginType = loginType;
        } else {
          this.isLogin = false;
          this.userInfo = {};
          this.loginType = "";
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/my/my.vue:107", "检查登录状态失败:", error);
        this.isLogin = false;
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
      return typeMap[this.loginType] || "未知方式";
    },
    // 跳转到登录页面
    goToLogin() {
      common_vendor.index.navigateTo({
        url: "/pages/login/login"
      });
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
              await this.checkLoginStatus();
              common_vendor.index.showToast({
                title: "已退出登录",
                icon: "success"
              });
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/my/my.vue:159", "退出登录失败:", error);
              common_vendor.index.removeStorageSync("userInfo");
              common_vendor.index.removeStorageSync("token");
              common_vendor.index.removeStorageSync("loginType");
              common_vendor.index.removeStorageSync("openid");
              common_vendor.index.removeStorageSync("sessionKey");
              await this.checkLoginStatus();
              common_vendor.index.showToast({
                title: "已退出登录",
                icon: "success"
              });
            }
          }
        }
      });
    },
    // 处理菜单点击
    handleMenuClick(item) {
      if (!this.isLogin && item.action !== "about") {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      switch (item.action) {
        case "profile":
          this.goToProfile();
          break;
        case "favorites":
          this.goToFavorites();
          break;
        case "settings":
          this.goToSettings();
          break;
        case "about":
          this.goToAbout();
          break;
      }
    },
    // 跳转方法
    goToProfile() {
      common_vendor.index.navigateTo({ url: "/pages/profile/profile" });
    },
    goToFavorites() {
      common_vendor.index.navigateTo({ url: "/pages/favorites/favorites" });
    },
    goToSettings() {
      common_vendor.index.navigateTo({ url: "/pages/settings/settings" });
    },
    goToAbout() {
      common_vendor.index.navigateTo({ url: "/pages/about/about" });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.isLogin
  }, $data.isLogin ? {
    b: $data.userInfo.avatarUrl || "/static/default-avatar.png",
    c: common_vendor.o((...args) => $options.goToProfile && $options.goToProfile(...args)),
    d: common_vendor.t($data.userInfo.nickName || $data.userInfo.username || "用户"),
    e: common_vendor.t($data.userInfo.userId || $data.userInfo.openid || ""),
    f: common_vendor.t($options.getLoginTypeText()),
    g: common_vendor.o((...args) => $options.goToProfile && $options.goToProfile(...args)),
    h: common_vendor.o((...args) => $options.handleLogout && $options.handleLogout(...args))
  } : {
    i: common_vendor.o((...args) => $options.goToLogin && $options.goToLogin(...args))
  }, {
    j: common_vendor.f($data.menuItems, (item, index, i0) => {
      return {
        a: common_vendor.n(item.icon),
        b: common_vendor.t(item.title),
        c: common_vendor.t(item.desc),
        d: index,
        e: common_vendor.o(($event) => $options.handleMenuClick(item), index)
      };
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my/my.js.map
