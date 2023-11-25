import express from "express";
import puppeteer from "puppeteer";

const domain = "https://trello.com/b/QvHVksDa/personal-work-goals";
const todoistDomain = "https://app.todoist.com/auth/login";
const userTodoist = process.env.TODOIST_EMAIL_USER;
const passwordTodoist = process.env.TODOIST_PASSWORD_USER;

async function scrapFunction() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 200,
  });
  const page = await browser.newPage();

  await page.goto(domain);
  // await page.screenshot({ path: "screenshot.png" });
  await page.click('button[data-testid="about-this-board-modal-cta-button"]');
  await page.click(
    'a.board-menu-header-close-button[title="Cerrar el menú del tablero."]'
  );

  const trelloJsonArray = await page.evaluate(() => {
    const listOfList = document.querySelectorAll('ol[id="board"] > li');
    const objDataList = [];

    listOfList.forEach((childli) => {
      const taskList = [];
      const myHeaderH2 = childli.querySelector('h2[data-testid="list-name"]');
      const cleanHeader = myHeaderH2.innerText;

      const lastLiChildArray = childli.querySelectorAll(
        'ol[data-testid="list-cards"] > li'
      );

      lastLiChildArray.forEach((element) => {
        const someAnchor = element.querySelector("a");
        const contentAnchor = someAnchor.innerText;
        taskList.push(contentAnchor);
      });

      objFullList = {
        headerList: cleanHeader,
        taskNames: taskList,
      };
      objDataList.push(objFullList);
    });
    return objDataList;
  });

  await new Promise((r) => setTimeout(r, 2000));
  await browser.close();
  return trelloJsonArray;
}

async function sendTodoist(jsonTodoist) {
  console.log(jsonTodoist);
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 200,
  });
  const page = await browser.newPage();
  await page.goto(todoistDomain);

  await page.waitForSelector("#element-0");
  await page.type("#element-0", userTodoist);
  await new Promise((r) => setTimeout(r, 2000));
  await browser.close();
}

scrapFunction().then((jsonTodoist) => {
  sendTodoist(jsonTodoist);
});

/* const app = express();

app.get("/", (req, res) => {
  res.send("Hello world");
});

const portNumber = 4000;
app.listen(portNumber);
console.log(`Ìs working on port: ${portNumber}`); */
