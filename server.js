// STS Translator — Render-ready Node.js server with configurable remote LibreTranslate API.
const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;
const LIBRE_URL = (process.env.LIBRETRANSLATE_URL || 'http://127.0.0.1:5000').replace(/\/$/, '');
const LIBRETRANSLATE_API_KEY = process.env.LIBRETRANSLATE_API_KEY || '';
const HOST = '0.0.0.0';
const LANGUAGES = { English:'en', Hindi:'hi', Arabic:'ar', German:'de', Irish:'ga', Spanish:'es', French:'fr', Italian:'it', Japanese:'ja', Korean:'ko', Portuguese:'pt', Russian:'ru', Chinese:'zh', Bengali:'bn', Urdu:'ur', Tamil:'ta', Telugu:'te', Marathi:'mr', Punjabi:'pa' };
const json=(res,status,obj)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify(obj));};
async function readBody(req){let body='';for await(const chunk of req){body+=chunk;if(body.length>20000)throw new Error('Request too large.');}return JSON.parse(body||'{}');}
http.createServer(async(req,res)=>{
 if(req.method==='GET'&&req.url==='/health') return json(res,200,{ok:true,service:'sts-translator'});
 if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,OPTIONS'});return res.end();}
 if(req.method==='GET'&&req.url==='/api/languages') {try{const r=await fetch(LIBRE_URL+'/languages',{headers:LIBRETRANSLATE_API_KEY?{'x-api-key':LIBRETRANSLATE_API_KEY}:{}});const data=await r.json().catch(()=>[]);return json(res,r.ok?200:502,data);}catch(e){return json(res,502,{error:'LibreTranslate is not running. Start it on port 5000 first.'});}}
 if(req.method==='POST'&&req.url==='/api/translate'){
  try{
   const body=await readBody(req); let q=String(body.text||''); let source=String(body.source||'auto'); let target=String(body.target||'');
   if(!q&&body.prompt){const p=String(body.prompt);const tm=p.match(/Translate the text between <t> tags into ([^.]+)\./i);const payload=p.match(/\n<t>([\s\S]*?)<\/t>\s*$/i);const sm=p.match(/The source language is ([^.]+)\./i);if(tm)target=LANGUAGES[tm[1].trim()]||'';if(sm)source=LANGUAGES[sm[1].trim()]||'auto';if(payload)q=payload[1];}
   if(!q.trim())return json(res,400,{error:'Type or speak some text first.'});if(!target)return json(res,400,{error:'Choose a supported target language.'});
   const r=await fetch(LIBRE_URL+'/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q,source,target,format:'text',...(LIBRETRANSLATE_API_KEY?{api_key:LIBRETRANSLATE_API_KEY}:{})})});const data=await r.json().catch(()=>({}));if(!r.ok)return json(res,502,{error:data.error||'LibreTranslate returned HTTP '+r.status});
   const code=data.detectedLanguage&&data.detectedLanguage.language;const detected=Object.entries(LANGUAGES).find(([,v])=>v===code)?.[0]||code||'Unknown';return json(res,200,{text:JSON.stringify({translation:data.translatedText||'',detected})});
  }catch(e){return json(res,502,{error:e.message||'Translation failed. Check that LibreTranslate is running.'});}
 }
 fs.readFile(path.join(__dirname,'index.html'),(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(data);});
}).listen(PORT,HOST,()=>console.log('STS Translator listening on '+HOST+':'+PORT+'; LibreTranslate: '+LIBRE_URL));
