import puppeteer from "puppeteer";

const domain = "https://trello.com/b/QvHVksDa/personal-work-goals";
const todoistDomain = "https://app.todoist.com/auth/login";
const userTodoist = process.env.TODOIST_EMAIL_USER;
const passwordTodoist = process.env.TODOIST_PASSWORD_USER;
const newNameProjectTodoist = "Automation Test";

async function scrapFunction() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
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

async function caseOne(page, headerName, sectionNameSwitch) {
  await page.waitForSelector(sectionNameSwitch);
  await page.type(sectionNameSwitch, headerName);
  await page.waitForSelector('button[type="submit"]');
  await page.click('button[type="submit"]');
}

async function caseTwo(page, headerName, sectionNameSwitch) {
  await page.waitForSelector(sectionNameSwitch);
  await page.click(sectionNameSwitch);
  await page.waitForSelector(
    'input[aria-label="Dale un nombre a esta sección"]'
  );
  await page.type(
    'input[aria-label="Dale un nombre a esta sección"]',
    headerName
  );
  await page.waitForSelector('button[type="submit"]');
  await page.click('button[type="submit"]');
}

async function fillCaseZeroList(page, taskAddSelector, taskName) {
  await page.waitForSelector(taskAddSelector);
  await page.click(taskAddSelector);
  await page.waitForSelector('p[data-placeholder="Nombre de la tarea"]');
  await page.type('p[data-placeholder="Nombre de la tarea"]', taskName);
  await page.waitForSelector('button[data-testid="task-editor-submit-button"]');
  await page.click('button[data-testid="task-editor-submit-button"]');
}

async function fillTodoistList(page, element, indexList) {
  let headerName = element.headerList;
  let onlyTaskArray = element.taskNames;
  let ariaLabelIntro = "Añadir tarea a ";
  let fullariaLabel = '"' + ariaLabelIntro + headerName + '"';
  let taskAddSelector = "button[aria-label=" + fullariaLabel + "]";
  // type header list
  if (indexList == 0) {
    await caseOne(
      page,
      headerName,
      'input[aria-label="Dale un nombre a esta sección"]'
    );
    console.log("1.- Case ");
  } else {
    await caseTwo(page, headerName, 'button[class="board_add_section_button"]');
    console.log("2.- Case");
  }

  // loops for add task names
  for (const [indexTask, taskName] of onlyTaskArray.entries()) {
    console.log(`Index Lista: ${indexList} --> Index Tarea: ${indexTask}`);
    console.log(headerName);
    console.log(taskAddSelector);
    console.log(taskName);
    await fillCaseZeroList(page, taskAddSelector, taskName);
    await page.keyboard.press("Escape");
  }
  console.log("-----------------------------");
  console.log("Try next list !!!!!!");
}

async function sendTodoist(jsonTodoist) {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
  });
  const page = await browser.newPage();
  await page.goto(todoistDomain);

  await page.waitForSelector("#element-0");
  await page.type("#element-0", userTodoist);
  await page.waitForSelector("#element-3");
  await page.type("#element-3", passwordTodoist);
  await page.click('button[data-gtm-id="start-email-login"]');
  await page.waitForSelector('button[aria-label="Añadir un proyecto"]');
  await page.click('button[aria-label="Añadir un proyecto"]');
  await page.waitForSelector("#edit_project_modal_field_name");
  await page.type("#edit_project_modal_field_name", newNameProjectTodoist);
  await page.waitForSelector('label[for="BOARD"]');
  await page.click('label[for="BOARD"]');
  await page.waitForSelector('button[type="submit"]');
  await page.click('button[type="submit"]');
  // Here fill all lists
  for (const [index, element] of jsonTodoist.entries()) {
    await fillTodoistList(page, element, index);
  }

  await new Promise((r) => setTimeout(r, 2000));
  await browser.close();
  console.log("Automation DONE !! :)");
}

scrapFunction().then((jsonTodoist) => {
  sendTodoist(jsonTodoist);
});
