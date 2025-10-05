(function(){
  const FAQ_URL = (window.CHATBOT_FAQ_URL || '/chatbot/faq.json');
  const bubble = document.createElement('div');
  bubble.id = 'hb-chat-bubble';
  bubble.style.cssText='position:fixed;right:16px;bottom:16px;width:56px;height:56px;border-radius:28px;box-shadow:0 8px 24px rgba(0,0,0,.2);background:#0b5bd3;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:99999;font:600 18px system-ui;';
  bubble.innerText='?';
  document.body.appendChild(bubble);

  const panel = document.createElement('div');
  panel.id='hb-chat-panel';
  panel.style.cssText='position:fixed;right:16px;bottom:80px;width:360px;max-width:90vw;height:480px;max-height:70vh;background:#fff;border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.24);display:none;flex-direction:column;overflow:hidden;z-index:99999;font:14px system-ui;';
  panel.innerHTML=`<div style="padding:10px 12px;background:#0b5bd3;color:#fff;font-weight:700">Hardonia Help</div>
  <div id="hb-chat-body" style="padding:10px;overflow:auto;flex:1"></div>
  <div style="display:flex;padding:8px;border-top:1px solid #eee"><input id="hb-input" placeholder="Ask a question…" style="flex:1;padding:8px;border:1px solid #ddd;border-radius:8px"/><button id="hb-send" style="margin-left:8px;padding:8px 12px;border:none;background:#0b5bd3;color:#fff;border-radius:8px">Ask</button></div>`;
  document.body.appendChild(panel);

  let data = {};
  fetch(FAQ_URL).then(r=>r.json()).then(j=>data=j).catch(()=>{data={general:[]}});

  function search(q){
    q=(q||'').toLowerCase();
    const all=[...(data.general||[]),...(data.suiteA||[]),...(data.suiteB||[]),...(data.suiteC||[])];
    const scored = all.map(qa=>({qa,score:(qa.q+" "+qa.a).toLowerCase().includes(q)?1:0})).filter(x=>x.score>0);
    return scored.length? scored.map(x=>x.qa) : [{q:'No exact answer found',a:'A support ticket has been prepared. We will reply by email shortly.'}];
  }

  function render(msg, who){
    const body=document.getElementById('hb-chat-body');
    const node=document.createElement('div');
    node.style.margin='8px 0';
    node.innerHTML = `<div style="font-weight:600;color:${who==='you'?'#0b5bd3':'#222'}">${who==='you'?'You':'Hardonia Bot'}</div><div>${msg}</div>`;
    body.appendChild(node); body.scrollTop=body.scrollHeight;
  }

  bubble.onclick=()=>{ panel.style.display = panel.style.display==='none'?'flex':'none'; };
  document.getElementById('hb-send').onclick=()=>{
    const inp=document.getElementById('hb-input');
    const q=inp.value.trim(); if(!q) return; inp.value='';
    render(q,'you');
    const hits=search(q); render(hits[0].a,'bot');
  };
})();
