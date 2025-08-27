"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      registerForm: {
        username: "",
        phone: "",
        password: "",
        confirmPassword: ""
      }
    };
  },
  methods: {
    // 处理注册
    async handleRegister() {
      if (!this.registerForm.username) {
        common_vendor.index.showToast({
          title: "请输入用户名",
          icon: "none"
        });
        return;
      }
      if (!this.registerForm.phone) {
        common_vendor.index.showToast({
          title: "请输入手机号",
          icon: "none"
        });
        return;
      }
      if (!this.registerForm.password) {
        common_vendor.index.showToast({
          title: "请输入密码",
          icon: "none"
        });
        return;
      }
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        common_vendor.index.showToast({
          title: "两次密码输入不一致",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "注册中..." });
        const result = await common_vendor.tr.callFunction({
          name: "user-register",
          data: {
            username: this.registerForm.username,
            phone: this.registerForm.phone,
            password: this.registerForm.password
          }
        });
        if (result.result.code === 0) {
          common_vendor.index.showToast({
            title: "注册成功",
            icon: "success"
          });
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          common_vendor.index.showToast({
            title: result.result.message || "注册失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/register/register.vue:120", "注册失败:", error);
        common_vendor.index.showToast({
          title: "注册失败，请重试",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    // 跳转到登录页
    goToLogin() {
      common_vendor.index.navigateBack();
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.registerForm.username,
    b: common_vendor.o(($event) => $data.registerForm.username = $event.detail.value),
    c: $data.registerForm.phone,
    d: common_vendor.o(($event) => $data.registerForm.phone = $event.detail.value),
    e: $data.registerForm.password,
    f: common_vendor.o(($event) => $data.registerForm.password = $event.detail.value),
    g: $data.registerForm.confirmPassword,
    h: common_vendor.o(($event) => $data.registerForm.confirmPassword = $event.detail.value),
    i: common_vendor.o((...args) => $options.handleRegister && $options.handleRegister(...args)),
    j: common_vendor.o((...args) => $options.goToLogin && $options.goToLogin(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/register/register.js.map
