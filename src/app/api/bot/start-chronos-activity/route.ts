// src/app/api/bot/start-chronos-activity/route.ts
import { NextResponse } from "next/server";
import puppeteer from 'puppeteer';

// Função auxiliar para esperar um tempo
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  const { activityName } = await request.json();

  if (!activityName) {
    return NextResponse.json({ error: "O nome da atividade é obrigatório." }, { status: 400 });
  }

  const email = process.env.CHRONOS_EMAIL;
  const password = process.env.CHRONOS_PASSWORD;

  if (!email || !password) {
    return NextResponse.json({ error: "Credenciais do Chronos não configuradas no servidor." }, { status: 500 });
  }

  let browser;
  try {
    console.log("Iniciando o bot...");
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // --- ETAPA DE LOGIN ---
    console.log("Navegando para a página de login...");
    await page.goto('https://chronos.winaudio.cloud');
    
    console.log("Preenchendo credenciais...");
    await page.type('input#email', email);
    await page.type('input#password', password);
    
    console.log("Clicando para acessar...");
    await Promise.all([
      page.waitForNavigation(),
      page.click('button[type="submit"]')
    ]);
    console.log("Login realizado com sucesso!");

    // --- ETAPA DE CRIAÇÃO DA TAREFA ---
    console.log("Navegando para a página de criação de tarefa...");
    await page.goto('https://chronos.winaudio.cloud/tarefas/create');

    console.log(`Preenchendo título da tarefa: "${activityName}"`);
    await page.waitForSelector('input#titulo');
    await page.type('input#titulo', activityName);

    console.log("Salvando a tarefa...");
    await Promise.all([
      page.waitForNavigation(),
      page.click('button[type="submit"].btn-success') 
    ]);

    console.log("Tarefa salva. Procurando o botão de iniciar...");
    
    // --- ETAPA DE INÍCIO DA TAREFA ---
    await page.waitForSelector('.card-body');

    // ** CORREÇÃO APLICADA AQUI **
    // Usamos page.evaluate para executar o código de busca e clique diretamente no navegador.
    // Isso evita os problemas de tipo do TypeScript com '$x'.
    const wasButtonClicked = await page.evaluate((name) => {
      const xPath = `//td[contains(., "${name}")]/..//i[contains(@class, 'fa-play')]/..`;
      const result = document.evaluate(xPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      const playButton = result.singleNodeValue as HTMLElement | null;
      
      if (playButton) {
        playButton.click();
        return true; // Retorna true se encontrou e clicou
      }
      return false; // Retorna false se não encontrou
    }, activityName); // Passa 'activityName' como argumento para dentro do evaluate

    if (wasButtonClicked) {
      console.log("Botão de 'play' encontrado e clicado.");
      await delay(2000); // Espera a ação ser processada
    } else {
      throw new Error(`Não foi possível encontrar o botão 'play' para a tarefa "${activityName}".`);
    }

    console.log("Automação concluída com sucesso!");
    return NextResponse.json({ message: `Atividade "${activityName}" iniciada no Chronos!` }, { status: 200 });

  } catch (error) {
    console.error("Erro no bot de automação:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    if (browser) {
      try {
        const pages = await browser.pages();
        if(pages.length > 0){
          await pages[pages.length - 1].screenshot({ path: 'error_screenshot.png' });
          console.log("Screenshot de erro salvo em 'error_screenshot.png'");
        }
      } catch (screenshotError) {
        console.error("Não foi possível tirar o screenshot:", screenshotError);
      }
    }
    return NextResponse.json({ error: `Falha na automação: ${errorMessage}` }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}