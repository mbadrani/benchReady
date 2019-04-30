'use strict';

const puppeteer = require('puppeteer');
require('events').EventEmitter.prototype._maxListeners = Infinity;
const faker = require('faker')
let argv = require('minimist')(process.argv.slice(2));

let URLBO = argv.URLBO || 'http://localhost/prestashop_1.7.5.0-rc.1/admin5556xamdw/';
let EMAIL = argv.EMAIL || 'demo@prestashop.com';
let PASSWORD = argv.PASSWORD || 'prestashop_demo';

const getAllUrl = async (browser, page) => {
	const hrefs = await page.evaluate(
    () => Array.from(document.body.querySelectorAll('nav.nav-bar.d-none.d-md-block ul li a.link[href]'), ({ href }) => href)
    );
	return hrefs
}

const checkStatusUrls = async (browser, page, hrefs) => {

	for (const href of hrefs) {
		const pagename = await page.title()
		let date_debut =new Date()
		await page.goto(href, { waitUntil: 'domcontentloaded' }).catch(e => console.error(e))
		let date_fin_dom =new Date()
//    await page.waitForNavigation({ waitUntil: 'load' })
		await page.goto(href, { waitUntil: 'load' }).catch(e => console.error(e))
		let date_fin_load =new Date()
		console.log(pagename + '| ' + 'response time: '+ 'DOM ' + '| ' + ((date_fin_dom.getTime() - date_debut.getTime())/1000) + '| ' + 'sec '+ '| ' + 'Load '
		+ '| ' + ((date_fin_load.getTime() - date_debut.getTime())/1000) + '| ' + 'sec ')
    page.on('response', response => {
    	if(response.status().toString().startsWith("4") || response.status().toString().startsWith("5")) {
    		const urlStatus = ["--HTTP CODE--", response.status(),"URL:" ,response.url()];
      	throw ('page error catched:'+ urlStatus)
      	}
    	});
	}
}

const run = async () => {

	const browser = await puppeteer.launch({ headless: false })
	const page = await browser.newPage()

	await page.goto(URLBO, { waitUntil: 'networkidle0' })
	await page.type('#email', EMAIL)
  await page.type('#passwd', PASSWORD)
  await page.click('#submit_login')
  await page.waitForNavigation({ waitUntil: 'domcontentloaded' })

	const urlList = await getAllUrl(browser, page)
  const checkUrls = await checkStatusUrls(browser, page, urlList)

  browser.close()
}

run()
  .then(value => {
    console.log("--------End Of Script :-* --------")
  })
  .catch(e => console.log(`error: ${e}`))
