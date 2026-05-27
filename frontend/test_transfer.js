const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const senderPage = await browser.newPage();
  const receiverPage = await browser.newPage();
  
  senderPage.on('console', msg => console.log('SENDER LOG:', msg.text()));
  receiverPage.on('console', msg => console.log('RECEIVER LOG:', msg.text()));
  
  await senderPage.goto('http://localhost:3000');
  
  await senderPage.waitForSelector('button');
  // SENDER: click send text
  const senderBtns = await senderPage.$$('button');
  await senderBtns[0].click(); // Send Files
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Find Text tab
  const tabs = await senderPage.$$('button');
  for (let t of tabs) {
    const text = await senderPage.evaluate(el => el.textContent, t);
    if (text.includes('Text')) {
      await t.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 500));
  await senderPage.type('textarea', 'hello test message');
  
  // Find Send Text button
  const sendBtns = await senderPage.$$('button');
  for (let b of sendBtns) {
    const text = await senderPage.evaluate(el => el.textContent, b);
    if (text.includes('Send Text')) {
      await b.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Get Room ID from sender
  const senderHtml = await senderPage.evaluate(() => document.body.innerHTML);
  // parse 6-digit pin
  const match = senderHtml.match(/text-5xl[^>]*>(\d{6})</);
  if (!match) {
    console.log("PIN not found!");
    await browser.close();
    return;
  }
  const pin = match[1];
  console.log("PIN found:", pin);
  
  // RECEIVER:
  await receiverPage.goto('http://localhost:3000');
  await receiverPage.waitForSelector('button');
  const receiverBtns = await receiverPage.$$('button');
  await receiverBtns[1].click(); // Receive
  
  await new Promise(r => setTimeout(r, 1000));
  await receiverPage.type('input[type="text"]', pin);
  
  const connectBtns = await receiverPage.$$('button');
  await connectBtns[connectBtns.length - 1].click(); // Connect Device
  
  await new Promise(r => setTimeout(r, 5000)); // wait for connection
  
  const finalReceiverHtml = await receiverPage.evaluate(() => document.body.innerHTML);
  console.log("Receiver HTML contains Transfer Complete?", finalReceiverHtml.includes("Transfer Complete"));
  console.log("Receiver HTML contains Copied?", finalReceiverHtml.includes("hello test message"));
  console.log("Receiver HTML snippet:", finalReceiverHtml.substring(0, 1000));
  
  await browser.close();
})();
