"use strict";

function renderSpiderWebHome(){
  if(inTeam())return;
  const hero=document.querySelector('#inicio');
  if(!hero)return;
  hero.innerHTML='<div class="spider-home-shell"><div class="spider-home-intro"><div class="eyebrow">AtlÃ©tica do Inteli</div><h1>Tantera.</h1><p>A comunidade se conecta por uma mesma teia: produtos, eventos, associados e encontros.</p></div><div class="spider-web-stage" aria-label="NavegaÃ§Ã£o principal da Tantera"><svg class="spider-web-lines" viewBox="0 0 900 720" role="img" aria-label="Teia Tantera"><g class="web-organic"><path d="M450 360 C365 290 270 250 84 120 M450 360 C335 345 210 350 30 350 M450 360 C350 405 225 470 85 625 M450 360 C392 270 370 175 350 35 M450 360 C395 440 355 535 350 700"/><path d="M450 360 C350 260 220 215 90 195 M450 360 C330 330 175 300 45 300 M450 360 C335 430 220 505 115 565 M450 360 C410 275 395 180 390 85 M450 360 C405 445 390 550 390 650"/><path d="M450 360 C315 280 180 270 60 270 M450 360 C330 380 215 420 100 500 M450 360 C425 270 420 180 420 110 M450 360 C425 450 425 555 420 640"/></g><g class="web-circuit"><path d="M450 360 L545 290 L650 250 L815 110 M450 360 L570 350 L700 345 L870 350 M450 360 L555 425 L670 500 L820 625 M450 360 L520 270 L555 145 L600 45 M450 360 L515 450 L560 575 L600 700"/><path d="M450 360 L580 300 L700 275 L840 195 M450 360 L600 390 L735 420 L855 500 M450 360 L570 470 L680 555 L785 565 M450 360 L540 260 L595 190 L670 125 M450 360 L535 475 L590 570 L665 650"/><circle cx="650" cy="250" r="7"/><circle cx="700" cy="345" r="7"/><circle cx="670" cy="500" r="7"/><circle cx="555" cy="145" r="7"/><circle cx="560" cy="575" r="7"/></g></svg><div class="spider-core"><span class="spider-core-ring"></span><img class="spider-mascot" src="emblema-tantera.jpg" alt="Mascote aranha da AtlÃ©tica Tantera"></div><a class="spider-node spider-node-shop" href="#shop">Shop</a><a class="spider-node spider-node-events" href="#ingressos">Eventos</a><a class="spider-node spider-node-members" href="#associados">Plano de associados</a><a class="spider-node spider-node-calendar" href="#calendario">CalendÃ¡rio</a><a class="spider-node spider-node-contact" href="#contato">Fale com a AtlÃ©tica</a><a class="spider-node spider-node-team" href="#equipe">Ãrea da equipe</a></div></div>';
}

const renderBeforeSpiderHome=render;
render=function(){renderBeforeSpiderHome();if(!inTeam())renderSpiderWebHome()};
const loadPublicEventsBeforeSpiderHome=loadPublicEvents;
loadPublicEvents=async function(){await loadPublicEventsBeforeSpiderHome();renderSpiderWebHome()};
if(!inTeam())renderSpiderWebHome();
