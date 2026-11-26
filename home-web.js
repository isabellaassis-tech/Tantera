"use strict";

const referenceHome=()=>location.hash===""||location.hash==="#inicio";
function syncReferenceHome(){
  const app=document.querySelector('#app'),hero=document.querySelector('#inicio');
  if(!app||!hero){document.querySelector('header')?.removeAttribute('hidden');document.querySelector('footer')?.removeAttribute('hidden');return;}
  if(!referenceHome()){
    app.querySelectorAll(':scope > *').forEach(node=>node.hidden=false);
    document.querySelector('header')?.removeAttribute('hidden');
    document.querySelector('footer')?.removeAttribute('hidden');
    return;
  }
  document.querySelector('header')?.setAttribute('hidden','');
  document.querySelector('footer')?.setAttribute('hidden','');
  app.querySelectorAll(':scope > *').forEach(node=>{node.hidden=node!==hero});
  hero.className='reference-home-hero';
  hero.innerHTML='<div class="reference-art-frame"><img class="reference-home-art" src="assets/tantera-spider-web.png?v=1" alt="Interface da Teia Tantera"><a class="reference-hotspot reference-shop" href="#shop" aria-label="Loja"></a><a class="reference-hotspot reference-events" href="#ingressos" aria-label="Eventos"></a><a class="reference-hotspot reference-members" href="#associados" aria-label="Plano de associados"></a><a class="reference-hotspot reference-calendar" href="#calendario" aria-label="Calendário"></a><a class="reference-hotspot reference-contact" href="#contato" aria-label="Fale com a Atlética"></a><a class="reference-hotspot reference-team" href="#equipe" aria-label="Área da equipe"></a><button class="reference-hotspot reference-cart" type="button" aria-label="Carrinho"></button></div>';
}
const renderBeforeReferenceHome=render;
render=function(){renderBeforeReferenceHome();syncReferenceHome()};
const studentBeforeReferenceHome=student;
student=function(){studentBeforeReferenceHome();syncReferenceHome()};
const loadPublicEventsBeforeReferenceHome=loadPublicEvents;
loadPublicEvents=async function(){await loadPublicEventsBeforeReferenceHome();syncReferenceHome()};
document.addEventListener('click',event=>{if(event.target.closest('.reference-cart')){event.preventDefault();cartModal()}});
syncReferenceHome();
