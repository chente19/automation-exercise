import express from "express";
import puppeteer from "puppeteer";

const domain = "https://trello.com/b/QvHVksDa/personal-work-goals";

async function scrapFunction() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
  });
  const page = await browser.newPage();

  await page.goto(domain);
  // await page.screenshot({ path: "screenshot.png" });
  await page.click('button[data-testid="about-this-board-modal-cta-button"]');
  await page.click(
    'a.board-menu-header-close-button[title="Cerrar el menú del tablero."]'
  );

  const testList = await page.evaluate(() => {
    const myMainList = document.querySelector(
      'li[data-list-id="55d39827b8629b45cb9c722c"]'
    );
    const myHeaderH2 = myMainList.querySelector('h2[data-testid="list-name"]');
    const cleanHeader = myHeaderH2.innerText;

    const allItemMainList = myMainList.querySelectorAll("ol > li");
    const taskList = [];

    allItemMainList.forEach((element) => {
      const simpleSpan = element.querySelector("a");
      const contentSpan = simpleSpan.innerText;
      taskList.push(contentSpan);
    });
    return taskList;
  });

  console.log(testList);

  await new Promise((r) => setTimeout(r, 2000));
  await browser.close();
}

scrapFunction();

/* const app = express();

app.get("/", (req, res) => {
  res.send("Hello world");
});

const portNumber = 4000;
app.listen(portNumber);
console.log(`Ìs working on port: ${portNumber}`); */
