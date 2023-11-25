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
  /* 
    <ol id= board
      <li X child ## Contenidos en ARRAY 
        <ol data-testid="list-cards"   
          <li * n --> data-list-id="55d39827b8629b45cb9c722c"
            <a

  */

  const jsonDataList = await page.evaluate(() => {
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

  console.log(jsonDataList);

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
