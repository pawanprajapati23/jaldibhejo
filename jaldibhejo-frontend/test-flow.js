import puppeteer from 'puppeteer';

async function testJaldiBhejo() {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  
  console.log("Opening Sender Tab...");
  const senderPage = await browser.newPage();
  await senderPage.goto('http://localhost:3000');
  
  // Wait for IdleView to load
  await senderPage.waitForSelector('text/Send Files');
  
  // Click Send Files
  await senderPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const sendBtn = buttons.find(b => b.innerText.includes('Send Files'));
    if (sendBtn) sendBtn.click();
  });
  
  // Mock dropping a file
  await senderPage.waitForSelector('input[type="file"]');
  console.log("Uploading file as sender...");
  const fileInput = await senderPage.$('input[type="file"]');
  
  // Create a dummy file
  const fs = await import('fs');
  fs.writeFileSync('test.txt', 'Hello JaldiBhejo!');
  await fileInput?.uploadFile('test.txt');
  
  // Wait for room to be created and PIN to appear
  console.log("Waiting for PIN...");
  await senderPage.waitForSelector('.text-5xl');
  
  const pin = await senderPage.evaluate(() => {
    const el = document.querySelector('.text-5xl');
    return el ? el.textContent?.trim() : null;
  });
  
  console.log("Sender got PIN:", pin);
  
  if (!pin) {
    console.error("Failed to get PIN");
    await browser.close();
    return;
  }
  
  console.log("Opening Receiver Tab...");
  const receiverPage = await browser.newPage();
  await receiverPage.goto('http://localhost:3000');
  
  // Wait for IdleView
  await receiverPage.waitForSelector('text/Receive Files');
  await receiverPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const receiveBtn = buttons.find(b => b.innerText.includes('Receive Files'));
    if (receiveBtn) receiveBtn.click();
  });
  
  // Enter PIN
  await receiverPage.waitForSelector('input[type="text"]');
  console.log("Entering PIN:", pin);
  await receiverPage.type('input[type="text"]', pin);
  
  // Click Connect
  await receiverPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const connectBtn = buttons.find(b => b.innerText.includes('Connect'));
    if (connectBtn) connectBtn.click();
  });
  
  console.log("Waiting for 5 seconds to observe connection state...");
  await new Promise(r => setTimeout(r, 5000));
  
  // Check UI state on both
  const senderHtml = await senderPage.evaluate(() => document.body.innerHTML);
  const receiverHtml = await receiverPage.evaluate(() => document.body.innerHTML);
  
  if (senderHtml.includes('Waiting for receiver')) {
    console.log("❌ SENDER IS STUCK ON WAITING!");
  } else if (senderHtml.includes('Connecting')) {
    console.log("❌ SENDER IS STUCK ON CONNECTING!");
  } else if (senderHtml.includes('Transferring') || senderHtml.includes('Complete')) {
    console.log("✅ SENDER IS PROGRESSING!");
  } else {
    console.log("⚠️ SENDER STATE UNKNOWN");
  }
  
  if (receiverHtml.includes('Connecting')) {
    console.log("❌ RECEIVER IS STUCK ON CONNECTING!");
  } else if (receiverHtml.includes('Transferring') || receiverHtml.includes('Complete')) {
    console.log("✅ RECEIVER IS PROGRESSING!");
  } else {
    console.log("⚠️ RECEIVER STATE UNKNOWN");
  }

  await browser.close();
}

testJaldiBhejo().catch(console.error);
