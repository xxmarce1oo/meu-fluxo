// src/app/api/bot/pause-chronos-activity/route.ts
import { NextResponse } from "next/server";
import puppeteer from 'puppeteer';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  // A API agora espera receber o nome da atividade para pausar
  const { activityName } = await request.json();

  if (!activityName) {
    return NextResponse.json({ error: "O nome da atividade é obrigatório para pausar." }, { status: 400 });
  }

  const email = process.env.CHRONOS_EMAIL;
  const password = process.env.CHRONOS_PASSWORD;

  if (!email || !password) {
    return NextResponse.json({ error: "Credenciais do Chronos não configuradas." }, { status: 500 });
  }

  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // --- ETAPA DE LOGIN ---
    console.log("Pausar: Iniciando login no Chronos...");
    await page.goto('https://chronos.winaudio.cloud');
    await page.type('input#email', email);
    await page.type('input#password', password);
    await Promise.all([
      page.waitForNavigation(),
      page.click('button[type="submit"]')
    ]);
    console.log("Pausar: Login realizado com sucesso!");
    
    // --- ETAPA DE PAUSA DA TAREFA ATIVA ---
    await page.waitForSelector('table.table', { timeout: 15000 });
    console.log(`Procurando a tarefa "${activityName}" para pausar...`);
    
    // XPath para encontrar a tarefa com o nome exato e pelo ícone de 'pause'
    const pauseButtonXPath = `//td[contains(., "${activityName}")]/..//i[contains(@class, 'fa-pause')]/..`;
    const wasButtonClicked = await page.evaluate((xPath) => {
      const result = document.evaluate(xPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      const button = result.singleNodeValue as HTMLElement | null;
      if (button) {
        button.click();
        return true;
      }
      return false;
    }, pauseButtonXPath);
    
    if (wasButtonClicked) {
      console.log("Botão de 'pause' encontrado e clicado.");
      await delay(2000); 
    } else {
      throw new Error(`Não foi possível encontrar uma tarefa ativa com o nome "${activityName}" para pausar.`);
    }

    console.log("Pausar: Automação concluída com sucesso!");
    return NextResponse.json({ message: `Atividade "${activityName}" pausada no Chronos!` }, { status: 200 });

  } catch (error) {
    console.error("Erro no bot de pausa:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    if (browser) {
      try {
        const pages = await browser.pages();
        if(pages.length > 0){
          await pages[pages.length-1].screenshot({ path: 'error_screenshot_pause.png' });
          console.log("Screenshot de erro salvo em 'error_screenshot_pause.png'");
        }
      } catch (screenshotError) {
        console.error("Não foi possível tirar o screenshot:", screenshotError);
      }
    }
    return NextResponse.json({ error: `Falha na automação de pausa: ${errorMessage}` }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}