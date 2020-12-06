const WXAPI = require('apifm-wxapi')
const AUTH = require('utils/auth')
var starscore = require("./templates/starscore/starscore.js");
App({
  async getMallName(){
    if (this.globalData.initOk) {
      return wx.getStorageSync('mallName')
    }
    const res = await WXAPI.queryConfigBatch('mallName,recharge_amount_min,couponsTitlePicStr,hotSearchWords,gps,logo,shareProfile')
    if (res.code == 0) {
      res.data.forEach(config => {
        wx.setStorageSync(config.key, config.value)
      })
    }
    this.globalData.initOk = true
    return wx.getStorageSync('mallName')
  },
  async getToolsCategory() {
    return this.globalToolsList
  },
  async getGoodsCategory(){
    console.log("hello world")
    //const res = await WXAPI.goodsCategory()
    const data = [{id:182455, name:"pdf转word、html"}, {id:162544, name: "视频去水印"}, {id:165327, name: "图片ocr"}, {id:166370, name:"人脸融合"}, {id:162473, name:"口语评测"}, {id:166222, name:"语音识别"}, {id:166223, name:"机器人电话"}]
    const res = {code:0, data:data}
    
    const categories = []; //{ id: 0, name: "全品类" }
    if (res.code == 0) {
      for (var i = 0; i < res.data.length; i++) {
        categories.push(res.data[i]);
        console.log(res.data[i].id);
      }
      this.globalData.categories = categories
      // this.getGoods(0);//获取全品类商品
      return categories
    }
  },
  onLaunch: function () {
    WXAPI.init(this.globalData.subDomain)
  },
  onShow(e) {
    // 保存邀请人
    if (e && e.query && e.query.inviter_id) {
      wx.setStorageSync('referrer', e.query.inviter_id)
    }
    // 自动登录
    AUTH.checkHasLogined().then(isLogined => {
      if (!isLogined) {
        AUTH.login()
      }
    })
  },
  async getGoods(categoryId) {
    if (categoryId == 0) {
      categoryId = "";
    }
    let res = await WXAPI.goods({
      page: this.globalData.page,
      pageSize: this.globalData.pageSize,
      categoryId: categoryId
    })
    this.globalData.goods = []
    var goods = [];
    if (res.code != 0 || res.data.length == 0) {
      /*that.setData({
        prePageBtn: false,
        nextPageBtn: true,
        toBottom: true
      });*/
      return;
    }
    var temp;
    for (var i = 0; i < res.data.length; i++) {
      temp = res.data[i];
      temp.minPrice = temp.minPrice.toFixed(2);
      temp.originalPrice = temp.originalPrice.toFixed(2);
      goods.push(temp);
    }
    

    var page = this.globalData.page;
    var pageSize = this.globalData.pageSize;
    for (let i = 0; i < goods.length; i++) {
      goods[i].starscore = (goods[i].numberGoodReputation / goods[i].numberOrders) * 5
      goods[i].starscore = Math.ceil(goods[i].starscore / 0.5) * 0.5
      goods[i].starpic = starscore.picStr(goods[i].starscore)
      console.log("In getGoods() Function goods[" + i + "].pic = " + goods[i].pic)

    }
    this.globalData.goods = goods
    res = await WXAPI.goods({
      page: this.globalData.page,
      pageSize: this.globalData.pageSize,
      categoryId: categoryId
    })
    var categories = this.globalData.categories
    var goodsList = [],
      id,
      key,
      name,
      typeStr,
      goodsTemp = []
    for (let i = 0; i < categories.length; i++) {
      id = categories[i].id;
      key = categories[i].key;
      name = categories[i].name;
      typeStr = categories[i].type;
      goodsTemp = [];
      for (let j = 0; j < goods.length; j++) {
        if (goods[j].categoryId === id) {
          goodsTemp.push(goods[j])
        }
      }
      if ((this.globalData.activeCategoryId === null) & (goodsTemp.length > 0)) {
        this.globalData.activeCategoryId = categories[i].id
      }
      goodsList.push({ 'id': id, 'key': key, 'name': name, 'type': typeStr, 'goods': goodsTemp })
      console.log("你好," + categories[i].name)
    }

    this.globalData.goodsList = goodsList
    this.globalData.onLoadStatus = true
    console.log('categories:', categories)
    //that.globalData.activeCategoryId = categories[0].id   改为第一个不为null的类
  },
  globalData:{
    page: 1, //初始加载商品时的页面号
    pageSize: 10000, //初始加载时的商品数，设置为10000保证小商户能加载完全部商品
    categories: [],
    goods: [], //所有商品无序的集合
    goodsName: [], 
    goodsList: [], //所有商品按照categoryID为索引的集合
    onLoadStatus: true,
    activeCategoryId: null,

    globalBGColor: '#00afb4',
    bgRed: 0,
    bgGreen: 175,
    bgBlue: 180,
    userInfo: null,
    subDomain: "cjns",// 商城后台个性域名 tggnew
    version: "2.3.0",
    userInfo: null,
    remove_watermark_videosrc: null,
    globalToolsList: [
    {'category_label': 'pdf2word',         'display_class_name':"pdf转word、html",  'tools_list': [
                                                                                  {'tool_name': 'pdf2word',          'pv_cnt': 100, 'starpic': starscore.picStr(3.5), 'starscore': 3.5, 'pic': ' https://dcdn.it120.cc/2020/08/30/10561173-bc82-4be0-a4c9-fbfdf048612a.jpg'}
                                                                                ]},
    {'category_label': 'remove-watermark', 'display_class_name': "视频去水印",       'tools_list': [
                                                                                  {'tool_name': 'remove-watermark', 'pv_cnt': 100, 'starpic': starscore.picStr(3.5), 'starscore': 3.5, 'pic':'https://dcdn.it120.cc/2020/08/30/41e45996-ce45-45a5-b2e6-cb31df9ccab4.png'}
                                                                                  ]},
    {'category_label': 'ocr',              'display_class_name': "图片ocr",         'tools_list': [
                                                                                  {'tool_name': 'ocr',              'pv_cnt': 100, 'starpic': starscore.picStr(3.5), 'starscore': 3.5, 'pic':'https://dcdn.it120.cc/2020/11/29/6150db0a-db52-4a25-a811-3d28a183549c.jpg'},
                                                                                  ]}, 
    {'category_label': 'face-fusion',      'display_class_name':"人脸融合",          'tools_list': [
                                                                                  {'tool_name': 'face-fusion',      'pv_cnt': 100, 'starpic': starscore.picStr(3.5), 'starscore': 3.5, 'pic':'https://dcdn.it120.cc/2020/11/19/cf47d71b-f3cb-4bb8-bc53-35e34c54e254.jpg'}, 
                                                                                  ]},
    {'category_label': 'language-grading', 'display_class_name':"口语评测",          'tools_list': [
                                                                                  {'tool_name': 'language-grading',      'pv_cnt': 100, 'starpic': starscore.picStr(3.5), 'starscore': 3.5, 'pic':'https://dcdn.it120.cc/2020/09/07/b25c2d5a-4681-490a-9910-2331ee04caa3.jpg'}, 
                                                                                  ]},
    {'category_label': 'language-recognition',      'display_class_name':"人脸融合",  'tools_list': [
                                                                                  {'tool_name': 'language-recognition',      'pv_cnt': 100, 'starpic': starscore.picStr(3.5), 'starscore': 3.5, 'pic':'https://dcdn.it120.cc/2020/09/03/c63964fc-7f67-4be0-9743-d063dcf586d1.jpg'}, 
                                                                                  ]},
    {'category_label': 'robot-calls',      'display_class_name':"机器人电话",            'tools_list': [
                                                                                  {'tool_name': 'AI-calls',      'pv_cnt': 100, 'starpic': starscore.picStr(3.5), 'starscore': 3.5, 'pic': 'https://dcdn.it120.cc/2020/09/03/c63964fc-7f67-4be0-9743-d063dcf586d1.jpg'}, 
                                                                                  ]},
  ]
},
  // 根据自己需要修改下单时候的模板消息内容设置，可增加关闭订单、收货时候模板消息提醒
})
