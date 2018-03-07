// import puppeteer from 'puppeteer';
require('dotenv').config();
const moment = require('moment');

const fs = require('fs');
const assert = require('assert');
const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const { username, password } = process.env;

// 各フラグの設定
const isEmulateFlg = true;
const isGettingDOMFlg = true;
const isSearchUserProfileFlg = true;
// 投稿機能はしばらくfalse ↓
const isPostImageFlg = true;
// ↑
const isScreenshotFlg = true;

(async() => {
  // ヘッドレス制御
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: false});
  const page = await browser.newPage();

  // エミュレーターの設定
  if(isEmulateFlg){
    const iPhone = devices['iPhone 6'];
    await page.emulate(iPhone);
  }

  // 画面遷移
  await page.goto('https://www.instagram.com/accounts/login/',{waitUntil:'load'});

  // ログイン処理
  // await inputLoginInformation(page, username, password);
  inputLoginInformation(page, username, password);
  await page.waitFor(3000)

  // 検索ユーザーのプロフィール表示
  if(isSearchUserProfileFlg){
    const searchUsername = 'starbucks'
    await displayUserProfileSearched(page, searchUsername);
    await page.waitFor(3000)
  }

  // ファイルのアップロード
  if(isPostImageFlg) {
    await postImageToTimeLine(page)
    await page.waitFor(3000)
  }

  // DOMの取得
  if(isGettingDOMFlg){
    const itemSelector = 'body'; // どの要素が欲しいか
    await getDOMElement(page, itemSelector, moment);
    await page.waitFor(2000)
  }

  // スクリーンショットの取得
  isScreenshotFlg && await getScreenshot(page, moment);

  // ブラウザを閉じる
  await browser.close();
  await console.log('RUN SCRIPT COMPLETE!!')

})();

/** ログイン処理
 * @param {} page
 * @param {string} username
 * @param {string} password
 */
inputLoginInformation = async (page, username, password) => {
  //  usernameの入力処理
  const elm= await page.$('form');
  await page.focus('form > div:nth-child(1) > div > div > label');
  await page.type('form > div:nth-child(1) > div > div > input', username).catch(e => {console.log(e)});

  //  passwordの入力処理
  await page.focus('form > div:nth-child(2) > div > div > label');
  await page.type('form > div:nth-child(2) > div > div > input', password).catch(e => {console.log(e)});

  //  submitの押下
  await page.click('form > span > button')
}

/** 検索したいユーザープロフィールの表示
 * @param {} page
 * @param {string} searchUsername
 */
  displayUserProfileSearched = async (page, searchUsername) => {
  await page.goto(`https://www.instagram.com/${searchUsername}/`,{ waitUntil: ['domcontentloaded']})
  await page.waitFor(3000)
}

/** 画像の投稿
 * @param {} page
 */
postImageToTimeLine = async (page) => {
  const innerPage = await page.$('section > nav:nth-child(3) > div > div > div > div > div')
  await page.click('section > nav:nth-child(3) > div > div > div > div > div > div:nth-child(3)')
  const fileUpload = await page.$('section > nav:nth-child(3) > div > div > div > div > div > div:nth-child(3)')

  // TODO input要素がないため実現できていない
  // await fileUpload.uploadFile('./up_1.jpg').catch(e => {console.log(e)});
  await page.waitFor(2000)

}

/** スクリーンショットを取得する
 * @param {} page
 */
getScreenshot = async (page, moment) => {
  const jpDate = moment().format('YYYYMMDD__HHmmss__')
  await page.screenshot({path: `image/instagram/screenshot_${jpDate}.png`,fullPage: true}).catch(e => console.log(e));
  console.log('Take a Screenshot📸');
}

/** DOMの取得
 * @param {} page
 * @param {string} itemSelector
 */
getDOMElement = async (page,itemSelector, moment) =>{
  const item = await page.$(itemSelector);
  const domData = await (await item.getProperty('textContent')).jsonValue().catch(e => console.log(e));
  const date = moment().format('YYYYMMDD')
  const logDate = moment().format('YYYYMMDD HH:mm:ss')
  await fs.appendFileSync(`./logs/outputElements/${date}getDOMElement.txt` ,`[${logDate}]` + domData)
  console.log("Create DOMElement Log📃");
}