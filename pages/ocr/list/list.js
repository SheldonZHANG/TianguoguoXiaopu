// 引入 OCR SDK 文件
const ocrSdk = require('../../ocrsdk/index');
const { OcrType } = ocrSdk;
const { secretId, secretKey } = require('../config');

Page(Object.assign({}, {
  data: {
    ocr_api: "https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic",
    baidu_ocr_token: "24.26fa21103a7e2292f1372dacb936a385.2592000.1609841555.282335-23106369",
    cardList: [
      {
        type: OcrType.ID_CARD,
        title: '身份证',
        text: '识别身份证件',
        img: 'https://ocr-static-1254418846.file.myqcloud.com/mpsdk/images/card-id-front.svg',
        config: { CropIdCard: true, CropPortrait: true },
      },
      {
        type: OcrType.BANK_CARD,
        title: '银行卡',
        text: '识别银行卡号码等',
        img: 'https://ocr-static-1254418846.file.myqcloud.com/mpsdk/images/card-bank.svg',
      },
      {
        type: OcrType.BUSINESS_CARD,
        title: '名片',
        text: '扫描名片识别内容',
        img: 'https://ocr-static-1254418846.file.myqcloud.com/mpsdk/images/card-business.svg',
      },
    ],
  },

  onLoad() {
    const {
      theme,
      autoMode,
    } = wx.demoConfig;
    wx.setNavigationBarTitle({
      title: autoMode ? '自动识别模式' : '拍照识别模式',
    })
    this.setData({
      theme
    });
  },

  startOcr(event) {
    var image_path = null
    var image_content = null
    var a = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success (res) {
        // tempFilePath可以作为img标签的src属性显示图片
        var FSM = wx.getFileSystemManager(); 
        image_path = res.tempFilePaths[0]
        console.log("In Function startOcr: " + image_path)
        var image_content_base64 = FSM.readFileSync(image_path, "base64")
        console.log(image_content_base64)
        wx.request({
          url: a.data.ocr_api + "?access_token=" + a.data.baidu_ocr_token,
          method: 'post',
          header:{
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            image: image_content_base64,
          },
          success: function (t) {
            console.log("In Function startOcr success callback")
            console.log(t.data)
            wx.hideLoading()
            console.log(t.words)
            for(var i = 0; i < t.words.length; i++) {
              image_content = image_content + "\n" + t.words[i]
            }
            wx.setStorageSync('ocr_result', image_content)
          },
          fail: function (t) {
            console.log("failure function callback: " + t.data)
            wx.hideLoading(), a.showToast('解析失败')
          },
        })
      }
    })
    console.log("In Function startOcr image_path=" + image_path)
  },

  onItemTap(e) {
    const { item } = e.currentTarget.dataset;
    const { type, config } = item;
    const {
      theme,
      autoMode,
      maxTry,
      resultPage,
      modifiable,
      disableAlbum,
    } = wx.demoConfig;
    ocrSdk.start({
      secretId,
      secretKey,
      ocrType: type,
      ocrOption: {
        Config: config,
      },
      cameraConfig: {
        autoMode,
        maxTry,
        disableAlbum,
      },
      resultPage,
      resultPageConfig: {
        modifiable,
      },
      theme,
      success: (res) => {
        console.log('ocr result is:', res);
        if (!resultPage) {
          wx.showToast({
            icon: 'success',
            duration: 3000,
            title: '识别成功',
          });
          setTimeout(() => {
            wx.navigateBack();
          }, 3000);
        } else {
          wx.navigateBack();
        }
      },
      fail: (error) => {
        console.log('ocr failed:', error);
      },
    });
  },
}));
