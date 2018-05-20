import componentsConfig from './config';

Page({
  data: {
    list: componentsConfig
  },

  handleCellTap({ target = {}}) {
    const { dataset = {} } = target;
    const { url = '' } = dataset;

    wx.navigateTo({
      url
    });
  }
});
