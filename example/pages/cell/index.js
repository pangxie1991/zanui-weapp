Page(Object.assign({}, {
  data: {
    checked: false,
    show: true
  },

  onLoad() {
  },

  onShow() {
  },

  handleZanSwitchChange(e) {
    this.setData({
      checked: e.checked
    });
  }
}));
