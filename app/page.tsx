
"use client";
import { useState, useEffect, useMemo } from "react";

type Photo = {id:string, url:string, date:string, fromCamera?:boolean};
type MilestoneEntry = {checked:boolean; date:string; details:string};
type PromptDone = {done:boolean; date:string; details:string; witnesses:string};
type WeekData = {photos:Photo[], milestones:Record<string,MilestoneEntry>, promptsDone:Record<string,PromptDone>};
type LetterEntry = {id:string, date:string, time:string, title:string, content:string, week:number, includeInBook:boolean};

function getPrompts(week:number){
  const all = [
    {t:"First Hours", d:"Skin-to-skin, bracelet, footprints"},
    {t:"Name Story", d:"Why you chose name, meaning"},
    {t:"Tiny Details", d:"Fingers, toes, ear curls"},
    {t:"Homecoming", d:"Outfit, car seat, front door"},
    {t:"One Month", d:"Same blanket monthly"},
    {t:"Social Smile", d:"Gummy smile emerging"},
    {t:"Tummy Time", d:"Neck strength, push-ups"},
    {t:"Two Months", d:"Milestone photo"},
    {t:"Three Months", d:"Personality emerging"},
    {t:"First Laugh", d:"Giggle, belly laugh"},
    {t:"Four Months", d:"Rolling? Drool? New sounds"},
    {t:"Sitting Support", d:"Boppy, high chair"},
    {t:"Six Months", d:"Half birthday celebration"},
    {t:"First Solids", d:"Purees, faces, mess"},
    {t:"Crawling", d:"First crawl"},
    {t:"Eight Months", d:"Busy, curious"},
    {t:"Cruising", d:"Side-stepping couch"},
    {t:"Nine Months", d:"Almost toddler"},
    {t:"One Year", d:"Official portrait"},
    {t:"ONE! Birthday", d:"Party, cake, candle"},
  ];
  return [all[week % all.length], all[(week+3) % all.length]];
}
const MILESTONES = ["First smile","First laugh","Tracked eyes","Held head 45°","Held head 90°","Rolled tummy to back","Rolled back to tummy","Cooed","Babbled","Grasped toy","Passed toy","Reached","Sat support","Sat alone","Army crawl","Crawled","Pulled to stand","Cruised","Stood alone","First steps","Walked","Waved bye","Clapped","Pointed","Pincer grasp","First solid","Self-fed","Straw cup","First tooth","Slept 5h","Slept through","Mama/dada","First word","First bath","First outing","First playdate","Grandparents","First trip","First haircut","First shoes"];

// 3. High contrast themes
const THEMES:any = {
  sage:{bg:"#FFFEFB",card:"#FFFFFF",accent:"#6B7D6C",text:"#111111",border:"#D9D0C0",name:"Sage", contrast:"12.5:1"},
  blush:{bg:"#FFFBF8",card:"#FFFFFF",accent:"#B86B6B",text:"#1A0A0A",border:"#E8C4C4",name:"Blush", contrast:"14:1"},
  sky:{bg:"#FBFDFF",card:"#FFFFFF",accent:"#3A6B8A",text:"#0A1A25",border:"#B8D4E8",name:"Sky", contrast:"15:1"},
  honey:{bg:"#FFFEF8",card:"#FFFFFF",accent:"#8B6B2F",text:"#1A1200",border:"#E8D8B8",name:"Honey", contrast:"13:1"},
  noir:{bg:"#121212",card:"#1E1E1E",accent:"#8A9A8B",text:"#FFFFFF",border:"#333333",name:"Noir", contrast:"18:1"},
  linen:{bg:"#FDF9F3",card:"#FFFFFF",accent:"#7A6B5A",text:"#14100C",border:"#E8DDD0",name:"Linen", contrast:"13.5:1"},
};
// 4. 10 font styles
const FONTS:any = {
  serif:{name:"Heirloom Serif", family:"'Cormorant Garamond', serif", style:"elegant"},
  sans:{name:"Modern Sans", family:"'Inter', sans-serif", style:"clean"},
  handwritten:{name:"Handwritten Story", family:"'Caveat', cursive", style:"casual"},
  classic:{name:"Classic Book", family:"'EB Garamond', serif", style:"traditional"},
  cozy:{name:"Cozy Lora", family:"'Lora', serif", style:"warm"},
  silly:{name:"Silly Bubble", family:"'Fredoka', 'Comic Sans MS', cursive", style:"playful"},
  comic:{name:"Playful Comic", family:"'Comic Neue', 'Comic Sans MS', cursive", style:"fun"},
  script:{name:"Elegant Script", family:"'Great Vibes', 'Dancing Script', cursive", style:"fancy"},
  typewriter:{name:"Typewriter", family:"'Courier Prime', 'Courier New', monospace", style:"vintage"},
  bold:{name:"Bold Display", family:"'Playfair Display', serif", style:"strong", weight:"700"},
};
// 5. 6 cover styles + 4 photo covers $25 extra
const COVER_STYLES = [
  {id:"minimal", name:"Minimal", desc:"Centered clean", border:"none", font:"serif", premium:false},
  {id:"classic", name:"Classic Frame", desc:"Thin border", border:"thin", font:"classic", premium:false},
  {id:"modern", name:"Modern Bold", desc:"Left big type", border:"none", font:"bold", premium:false},
  {id:"heirloom", name:"Heirloom Gold", desc:"Gold line luxury", border:"gold", font:"serif", premium:false},
  {id:"vintage", name:"Vintage Linen", desc:"Double border", border:"double", font:"typewriter", premium:false},
  {id:"botanical", name:"Botanical", desc:"Floral border", border:"floral", font:"cozy", premium:false},
];
const PHOTO_COVERS = [
  {id:"photo-full", name:"Photo Full Bleed", desc:"Edge to edge photo", border:"none", font:"sans", premium:true, cost:25},
  {id:"photo-polaroid", name:"Photo Polaroid", desc:"White border shadow", border:"polaroid", font:"handwritten", premium:true, cost:25},
  {id:"photo-frame", name:"Photo Frame", desc:"Thick classic frame", border:"thick", font:"classic", premium:true, cost:25},
  {id:"photo-collage", name:"Photo Collage", desc:"4 photos grid", border:"collage", font:"cozy", premium:true, cost:25},
];
const PHOTO_STYLES = [{id:"grid",name:"Grid"},{id:"masonry",name:"Masonry"},{id:"polaroid",name:"Polaroid"},{id:"full",name:"Full Bleed"},{id:"classic",name:"Classic"}];
const BORDERS:any = {
  none:{class:"", style:{}},
  thin:{class:"border", style:{borderWidth:"1px"}},
  thick:{class:"border-4", style:{borderWidth:"4px"}},
  double:{class:"border-4 double", style:{borderStyle:"double", borderWidth:"4px"}},
  gold:{class:"border-2", style:{borderColor:"#D4AF37", borderWidth:"2px"}},
  floral:{class:"border-2", style:{borderImage:"linear-gradient(45deg, #8A9A8B, #D4A5A5) 1"}},
  polaroid:{class:"border-[12px] border-b-[40px]", style:{borderColor:"white", boxShadow:"0 4px 12px rgba(0,0,0,0.15)"}},
  collage:{class:"border-2", style:{borderStyle:"dashed"}},
};

export default function Home(){
  const [auth,setAuth]=useState('landing');
  const [user,setUser]=useState<any>(null);
  const [baby,setBaby]=useState({name:"",birthDate:"",coverTitle:"Little Chapters", dedication:""});
  const [weeks,setWeeks]=useState<Record<number,WeekData>>({});
  const [letters,setLetters]=useState<LetterEntry[]>([]);
  const [curWeek,setCurWeek]=useState(12);
  const [theme,setTheme]=useState('sage');
  const [font,setFont]=useState('serif');
  const [coverStyle,setCoverStyle]=useState('minimal');
  const [photoCoverStyle,setPhotoCoverStyle]=useState('');
  const [borderStyle,setBorderStyle]=useState('none');
  const [tab,setTab]=useState<'weeks'|'book'|'letters'|'settings'>('weeks');
  const [showSheet,setShowSheet]=useState(false);
  const [login,setLogin]=useState({email:"",pass:"",pass2:""});
  const [photosPerPage,setPhotosPerPage]=useState(4);
  const [photoStyle,setPhotoStyle]=useState('grid');
  const [showPrompts,setShowPrompts]=useState(true);
  const [showMiles,setShowMiles]=useState(true);
  const [showLettersInBook,setShowLettersInBook]=useState(true);
  const [sortByDate,setSortByDate]=useState(true);
  const [newLetter,setNewLetter]=useState({title:"",content:""});
  const [toast,setToast]=useState("");

  const th = THEMES[theme] || THEMES.sage;
  const sf = FONTS[font] || FONTS.serif;

  useEffect(()=>{
    try{
      const a=localStorage.getItem('lc_auth'); if(a) setAuth(a as any);
      const u=localStorage.getItem('lc_user'); if(u) setUser(JSON.parse(u));
      const b=localStorage.getItem('lc_baby'); if(b) setBaby(JSON.parse(b));
      const w=localStorage.getItem('lc_weeks'); if(w) setWeeks(JSON.parse(w));
      const l=localStorage.getItem('lc_letters'); if(l) setLetters(JSON.parse(l));
      const t=localStorage.getItem('lc_theme'); if(t) setTheme(t);
      const f=localStorage.getItem('lc_font'); if(f) setFont(f);
      const cs=localStorage.getItem('lc_coverStyle'); if(cs) setCoverStyle(cs);
      const pcs=localStorage.getItem('lc_photoCoverStyle'); if(pcs) setPhotoCoverStyle(pcs);
      const bs=localStorage.getItem('lc_borderStyle'); if(bs) setBorderStyle(bs);
    }catch{}
  },[]);
  useEffect(()=>{localStorage.setItem('lc_auth',auth);},[auth]);
  useEffect(()=>{if(user) localStorage.setItem('lc_user',JSON.stringify(user));},[user]);
  useEffect(()=>{localStorage.setItem('lc_baby',JSON.stringify(baby));},[baby]);
  useEffect(()=>{localStorage.setItem('lc_weeks',JSON.stringify(weeks));},[weeks]);
  useEffect(()=>{localStorage.setItem('lc_letters',JSON.stringify(letters));},[letters]);
  useEffect(()=>{localStorage.setItem('lc_theme',theme);},[theme]);
  useEffect(()=>{localStorage.setItem('lc_font',font);},[font]);
  useEffect(()=>{localStorage.setItem('lc_coverStyle',coverStyle);},[coverStyle]);
  useEffect(()=>{localStorage.setItem('lc_photoCoverStyle',photoCoverStyle);},[photoCoverStyle]);
  useEffect(()=>{localStorage.setItem('lc_borderStyle',borderStyle);},[borderStyle]);
  useEffect(()=>{
    if(baby.birthDate){
      const d=Math.floor((Date.now()-new Date(baby.birthDate).getTime())/(1000*60*60*24*7));
      setCurWeek(Math.max(0,Math.min(52,d)));
    }
  },[baby.birthDate]);

  const totalPhotos = Object.values(weeks).reduce((s,w)=>s+(w.photos?.length||0),0);
  const weeksFilled = Object.keys(weeks).filter(k=> (weeks as any)[k].photos?.length>0).length;
  const curData = weeks[curWeek] || {photos:[],milestones:{},promptsDone:{}};
  const prompts = useMemo(()=>getPrompts(curWeek),[curWeek]);

  // Migrate old per-week letters to new letters sub-menu
  useEffect(()=>{
    if(letters.length===0){
      const migrated:LetterEntry[]=[];
      Object.keys(weeks).forEach(wk=>{
        const wd:any = (weeks as any)[wk];
        if(wd?.letter){
          migrated.push({id:Math.random().toString(36).slice(2), date:new Date().toISOString().slice(0,10), time:new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), title:`Week ${wk} Letter`, content:wd.letter, week:parseInt(wk), includeInBook:true});
        }
      });
      if(migrated.length>0) setLetters(migrated);
    }
  },[]);

  function handleFiles(files:File[], cam=false){
    if(curData.photos.length+files.length>10){ alert(`Max 10, have ${curData.photos.length}`); return; }
    files.forEach(f=>{
      const r=new FileReader();
      r.onload=(ev)=>{
        const url=ev.target?.result as string;
        const today=new Date().toISOString().slice(0,10);
        setWeeks(w=>{
          const cd=w[curWeek]||{photos:[],milestones:{},promptsDone:{}} as any;
          if(cd.photos.length>=10) return w;
          return {...w,[curWeek]:{...cd,photos:[...cd.photos,{id:Math.random().toString(36).slice(2),url,date:today,fromCamera:cam}]}};
        });
      };
      r.readAsDataURL(f);
    });
  }
  function openCam(){ const i=document.createElement('input'); i.type='file'; i.accept='image/*'; i.setAttribute('capture','environment'); i.onchange=(e:any)=>handleFiles(Array.from(e.target.files||[]),true); i.click(); setShowSheet(false); }
  function openLib(){ const i=document.createElement('input'); i.type='file'; i.accept='image/*'; i.multiple=true; i.onchange=(e:any)=>handleFiles(Array.from(e.target.files||[]),false); i.click(); setShowSheet(false); }
  function weekRange(w:number){
    if(!baby.birthDate) return `Week ${w}`;
    const b=new Date(baby.birthDate);
    const s=new Date(b.getTime()+w*7*24*60*60*1000);
    const e=new Date(s.getTime()+6*24*60*60*1000);
    return `${s.toLocaleDateString()} - ${e.toLocaleDateString()}`;
  }
  function addLetter(){
    if(!newLetter.content.trim()) return;
    const now=new Date();
    const entry:LetterEntry = {id:Math.random().toString(36).slice(2), date:now.toISOString().slice(0,10), time:now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), title:newLetter.title||`Letter ${letters.length+1}`, content:newLetter.content, week:curWeek, includeInBook:true};
    setLetters([...letters, entry]);
    setNewLetter({title:"",content:""});
    setToast("Letter saved ✓"); setTimeout(()=>setToast(""),1500);
  }

  const bookPages = useMemo(()=>{
    const pages:any[]=[];
    Object.keys(weeks).map(Number).sort((a,b)=>a-b).forEach(w=>{
      const wd=weeks[w];
      if(!wd) return;
      const has=wd.photos.length>0 || Object.values(wd.milestones).some((m:any)=>m.checked) || Object.values(wd.promptsDone).some((p:any)=>p.done);
      if(!has) return;
      const pList=getPrompts(w);
      const donePrompts=pList.map((p:any,idx:number)=>{
        const k=`${w}-${idx}`;
        const d=wd.promptsDone?.[k];
        return {...p, idx, done:d, date:d?.date||"", details:d?.details||"", witnesses:d?.witnesses||""};
      }).filter((p:any)=>p.done?.done);
      if(sortByDate) donePrompts.sort((a:any,b:any)=>(a.date||"").localeCompare(b.date||""));
      const miles=Object.entries(wd.milestones).filter(([,v]:any)=>v.checked).map(([k,v]:any)=>({name:k,...v})).sort((a:any,b:any)=> sortByDate ? (a.date||"").localeCompare(b.date||"") : 0);
      const photos=[...wd.photos].sort((a,b)=> sortByDate ? (a.date||"").localeCompare(b.date||"") : 0).slice(0,photosPerPage);
      pages.push({week:w, range:weekRange(w), photos, prompts:donePrompts, milestones:miles});
    });
    return pages;
  },[weeks, photosPerPage, sortByDate, baby.birthDate]);

  const sortedLetters = useMemo(()=> [...letters].sort((a,b)=> (a.date+" "+a.time).localeCompare(b.date+" "+b.time)), [letters]);

  if(auth==='landing'){
    return <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{background:th.bg,color:th.text}}><div className="text-center max-w-[400px]"><div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{background:th.accent, color:"#FFF"}}>📖</div><h1 className="text-4xl" style={{fontFamily:sf.family, color:th.text}}>{baby.coverTitle||"Little Chapters"}</h1><p className="opacity-80 mt-2 text-sm" style={{color:th.text}}>Weeks → Book → Letters → Settings</p><div className="mt-8 grid gap-3"><button onClick={()=>setAuth('login')} className="rounded-full py-3 text-white" style={{background:th.text}}>Log in</button><button onClick={()=>setAuth('signup')} className="rounded-full py-3 border" style={{borderColor:th.border, color:th.text}}>Create account</button></div></div></div>
  }
  if(auth==='login' || auth==='signup'){
    const isLogin=auth==='login';
    return <div className="min-h-screen flex items-center justify-center p-6" style={{background:th.bg}}><div className="w-full max-w-[360px] bg-white rounded-[24px] p-7 border" style={{borderColor:th.border}}><div className="text-xl" style={{fontFamily:sf.family, color:"#111"}}>{isLogin?'Welcome back':'Create account'}</div><div className="mt-6 space-y-3"><input placeholder="Email" className="w-full rounded-xl border px-4 py-3 text-sm" value={login.email} onChange={e=>setLogin({...login,email:e.target.value})} style={{color:"#111"}} /><input placeholder="Password" type="password" className="w-full rounded-xl border px-4 py-3 text-sm" value={login.pass} onChange={e=>setLogin({...login,pass:e.target.value})} style={{color:"#111"}} />{!isLogin && <input placeholder="Confirm" type="password" className="w-full rounded-xl border px-4 py-3 text-sm" value={login.pass2} onChange={e=>setLogin({...login,pass2:e.target.value})} style={{color:"#111"}} />}<button onClick={()=>{ if(!login.email||!login.pass) return; if(!isLogin&&login.pass!==login.pass2) return; setUser({email:login.email}); setAuth('onboarding'); }} className="w-full rounded-full py-3 text-white text-sm" style={{background:th.text}}> {isLogin?'Log in':'Create'}</button><button onClick={()=>setAuth(isLogin?'signup':'login')} className="w-full text-xs opacity-70" style={{color:"#111"}}>{isLogin?'Need account?':'Have account?'}</button></div></div></div>
  }
  if(auth==='onboarding'){
    return <div className="min-h-screen flex items-center justify-center p-6" style={{background:th.bg}}><div className="w-full max-w-[400px] bg-white rounded-[24px] p-7 border" style={{borderColor:th.border}}><div className="text-xl" style={{fontFamily:sf.family, color:"#111"}}>About baby</div><div className="mt-6 space-y-3"><input placeholder="Baby name" className="w-full rounded-xl border px-4 py-3 text-sm" value={baby.name} onChange={e=>setBaby({...baby,name:e.target.value})} style={{color:"#111"}} /><input type="date" className="w-full rounded-xl border px-4 py-3 text-sm" value={baby.birthDate} onChange={e=>setBaby({...baby,birthDate:e.target.value})} style={{color:"#111"}} /><input placeholder="Book title" className="w-full rounded-xl border px-4 py-3 text-sm" value={baby.coverTitle} onChange={e=>setBaby({...baby,coverTitle:e.target.value})} style={{color:"#111"}} /><textarea placeholder="Dedication" className="w-full rounded-xl border px-4 py-3 text-sm" value={baby.dedication} onChange={e=>setBaby({...baby,dedication:e.target.value})} style={{color:"#111"}} /><button onClick={()=>{ if(!baby.name||!baby.birthDate) return; setAuth('app'); }} className="w-full rounded-full py-3 text-white" style={{background:th.text}}>Start</button></div></div></div>
  }

  const activeCover = [...COVER_STYLES, ...PHOTO_COVERS].find(c=>c.id===(photoCoverStyle||coverStyle));
  const isPremiumCover = PHOTO_COVERS.some(c=>c.id===photoCoverStyle);

  return (
    <div className="min-h-screen" style={{background:th.bg,color:th.text}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Caveat:wght@400;600&family=EB+Garamond:wght@400;600&family=Inter:wght@400;600&family=Lora:wght@400;600&family=Fredoka:wght@400;600&family=Comic+Neue:wght@400;700&family=Great+Vibes&family=Dancing+Script:wght@400;700&family=Courier+Prime&family=Playfair+Display:wght@400;700&display=swap');`}</style>
      <div className="sticky top-0 z-20 backdrop-blur border-b" style={{background:`${th.card}ee`,borderColor:th.border}}>
        <div className="max-w-[1024px] mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{background:th.accent}}>📖</div><div><div className="text-sm font-bold" style={{fontFamily:sf.family, color:th.text}}>{baby.coverTitle||"Little Chapters"}</div><div className="text-[10px] font-medium" style={{color:th.text, opacity:0.8}}>{baby.name} • {weeksFilled}w • {totalPhotos} pics • {letters.length} letters</div></div></div>
          <div className="flex gap-1 bg-[#F5F1EA] rounded-full p-1 overflow-x-auto">
            <button onClick={()=>setTab('weeks')} className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${tab==='weeks'?'bg-[#111] text-white':'text-[#111]'}`}>Weeks</button>
            <button onClick={()=>setTab('book')} className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${tab==='book'?'bg-[#111] text-white':'text-[#111]'}`}>Book</button>
            <button onClick={()=>setTab('letters')} className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${tab==='letters'?'bg-[#111] text-white':'text-[#111]'}`}>Letters ({letters.length})</button>
            <button onClick={()=>setTab('settings')} className={`px-3 py-1.5 rounded-full text-[11px] font-bold ${tab==='settings'?'bg-[#111] text-white':'text-[#111]'}`}>Settings</button>
          </div>
        </div>
      </div>

      <div className="max-w-[1024px] mx-auto px-4 py-6">
        {tab==='weeks' && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2">{Array.from({length:53},(_,i)=>i).map(w=>{ const has=weeks[w]?.photos?.length>0; return <button key={w} onClick={()=>setCurWeek(w)} className={`shrink-0 rounded-full px-3 py-2 text-xs border font-bold ${curWeek===w?'bg-[#111] text-white':'bg-white text-[#111]'}`} style={{borderColor:has?th.accent:th.border}}>{w}{has?'•':''}</button>})}</div>
            <div className="mt-4 rounded-[24px] p-6 border" style={{background:th.card,borderColor:th.border}}><div className="text-[11px] font-bold tracking-widest" style={{color:th.text}}>WEEK {curWeek} • {weekRange(curWeek)}</div><div className="grid md:grid-cols-2 gap-4 mt-4">{prompts.map((pr:any,idx:number)=>{ const k=`${curWeek}-${idx}`; const done=curData.promptsDone?.[k]; return <div key={idx} className={`rounded-[16px] border p-4 ${done?.done?'bg-[#F7FAFD]':''}`} style={{borderColor:done?.done?th.accent:th.border}}><div className="flex justify-between"><div className="text-[10px] font-bold" style={{color:th.text}}>PROMPT {idx+1}</div><label className="text-[10px] flex items-center gap-1 font-bold" style={{color:th.text}}><input type="checkbox" checked={!!done?.done} onChange={e=>{ const c=e.target.checked; const today=new Date().toISOString().slice(0,10); setWeeks(w=>{ const cd=w[curWeek]||{photos:[],milestones:{},promptsDone:{}} as any; return {...w,[curWeek]:{...cd,promptsDone:{...cd.promptsDone,[k]:{done:c,date:c?(done?.date||today):"",details:done?.details||"",witnesses:done?.witnesses||""}}}}; }); }} /> done</label></div><div className="font-bold mt-1" style={{fontFamily:sf.family, color:th.text}}>{pr.t}</div><div className="text-xs mt-1" style={{color:th.text, opacity:0.9}}>{pr.d}</div>
            {done?.done && (
              <div className="mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2"><div><div className="text-[10px] font-bold" style={{color:th.text}}>Date of event</div><input type="date" value={done.date} onChange={e=>{ setWeeks(w=>{ const cd=w[curWeek]||{photos:[],milestones:{},promptsDone:{}} as any; return {...w,[curWeek]:{...cd,promptsDone:{...cd.promptsDone,[k]:{...done,date:e.target.value}}}}; }); }} className="mt-1 w-full rounded-lg border px-2 py-2 text-xs font-medium" style={{borderColor:th.border, color:"#111"}} /></div><div><div className="text-[10px] font-bold" style={{color:th.text}}>Witnesses</div><input placeholder="Grandma, dad, etc" value={done.witnesses} onChange={e=>{ setWeeks(w=>{ const cd=w[curWeek]||{photos:[],milestones:{},promptsDone:{}} as any; return {...w,[curWeek]:{...cd,promptsDone:{...cd.promptsDone,[k]:{...done,witnesses:e.target.value}}}}; }); }} className="mt-1 w-full rounded-lg border px-2 py-2 text-xs" style={{borderColor:th.border, color:"#111"}} /></div></div>
                <div><div className="text-[10px] font-bold" style={{color:th.text}}>Details - explanation of event</div><textarea placeholder="What happened? Details, explanation, who was there..." value={done.details} onChange={e=>{ setWeeks(w=>{ const cd=w[curWeek]||{photos:[],milestones:{},promptsDone:{}} as any; return {...w,[curWeek]:{...cd,promptsDone:{...cd.promptsDone,[k]:{...done,details:e.target.value}}}}; }); }} className="mt-1 w-full rounded-lg border px-2 py-2 text-xs h-[60px]" style={{borderColor:th.border, color:"#111"}} /></div>
              </div>
            )}
            </div>})}</div></div>
            <div className="mt-6"><div className="flex justify-between"><div className="text-sm font-bold" style={{color:th.text}}>Photos {curData.photos.length}/10</div></div><div className="grid grid-cols-3 gap-2 mt-3">{curData.photos.map((p:any)=><div key={p.id} className="relative rounded-xl overflow-hidden aspect-square bg-[#EEE]"><img src={p.url} className="w-full h-full object-cover" /><div className="absolute bottom-1 left-1 text-[9px] bg-black text-white px-1 rounded font-bold">{p.date}</div><button onClick={()=>{ setWeeks(w=>{ const cd=w[curWeek]||{photos:[]}; return {...w,[curWeek]:{...cd,photos:cd.photos.filter((x:any)=>x.id!==p.id)}}; }); }} className="absolute top-1 right-1 w-5 h-5 bg-black text-white rounded-full text-xs">✕</button></div>)}{curData.photos.length<10 && <div onClick={()=>setShowSheet(true)} className="rounded-xl border-2 border-dashed aspect-square flex flex-col items-center justify-center cursor-pointer" style={{borderColor:th.border}}><span>📸</span><span className="text-xs font-bold" style={{color:th.text}}>Add</span></div>}</div></div>
            <div className="mt-6 rounded-[20px] p-5 border" style={{background:th.card,borderColor:th.border}}><div className="text-sm font-bold" style={{color:th.text}}>Milestones • {Object.values(curData.milestones||{}).filter((m:any)=>m.checked).length}/{MILESTONES.length}</div><div className="mt-3 space-y-2 max-h-[400px] overflow-auto">{MILESTONES.map(m=>{ const en=curData.milestones?.[m]||{checked:false,date:"",details:""}; return <div key={m} className={`rounded-xl border p-3 ${en.checked?'bg-[#FFFBF0]':''}`} style={{borderColor:en.checked?th.accent:th.border}}><label className="flex gap-2 text-sm font-medium" style={{color:th.text}}><input type="checkbox" checked={!!en.checked} onChange={e=>{ const c=e.target.checked; const today=new Date().toISOString().slice(0,10); setWeeks(w=>{ const cd=w[curWeek]||{photos:[],milestones:{},promptsDone:{}} as any; return {...w,[curWeek]:{...cd,milestones:{...cd.milestones,[m]:{checked:c,date:c?(en.date||today):"",details:en.details||""}}}}; }); }} />{m}{en.checked&&en.date&&<span className="ml-auto text-[10px] bg-white border px-2 py-0.5 rounded-full font-bold text-[#111]">{en.date}</span>}</label>{en.checked && <div className="mt-2 grid grid-cols-[120px_1fr] gap-2"><input type="date" value={en.date} onChange={e=>{ setWeeks(w=>{ const cd=w[curWeek]||{photos:[],milestones:{},promptsDone:{}} as any; return {...w,[curWeek]:{...cd,milestones:{...cd.milestones,[m]:{...en,date:e.target.value}}}}; }); }} className="rounded border px-2 py-1 text-xs font-bold" style={{color:"#111"}} /><textarea value={en.details} onChange={e=>{ setWeeks(w=>{ const cd=w[curWeek]||{photos:[],milestones:{},promptsDone:{}} as any; return {...w,[curWeek]:{...cd,milestones:{...cd.milestones,[m]:{...en,details:e.target.value}}}}; }); }} placeholder="Details, witnesses" className="rounded border px-2 py-1 text-xs h-[40px]" style={{color:"#111"}} /></div>}</div>})}</div></div>
          </>
        )}

        {tab==='letters' && (
          <div className="space-y-6">
            <div className="rounded-[24px] border p-6" style={{background:th.card,borderColor:th.border}}>
              <div className="text-[11px] font-bold tracking-widest" style={{color:th.text}}>LETTERS TO BABY • SUB-MENU • CHRONOLOGICAL</div>
              <div className="mt-4 grid md:grid-cols-[1fr_2fr] gap-4">
                <div><div className="text-xs font-bold" style={{color:th.text}}>Add new letter</div><input placeholder="Title (optional)" value={newLetter.title} onChange={e=>setNewLetter({...newLetter,title:e.target.value})} className="mt-2 w-full rounded-xl border px-3 py-2 text-sm font-medium" style={{borderColor:th.border, color:"#111"}} /><textarea placeholder="Dear baby, today..." value={newLetter.content} onChange={e=>setNewLetter({...newLetter,content:e.target.value})} className="mt-2 w-full rounded-xl border px-3 py-2 text-sm h-[120px]" style={{borderColor:th.border, color:"#111"}} /><button onClick={addLetter} className="mt-2 w-full rounded-full py-2 text-white text-sm font-bold" style={{background:th.text}}>Add Letter • {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</button><div className="text-[10px] mt-2" style={{color:th.text, opacity:0.7}}>Week {curWeek} • Will be cataloged chronologically</div></div>
                <div><div className="text-xs font-bold" style={{color:th.text}}>All letters • {letters.length} • Chronological order</div><div className="mt-3 space-y-3 max-h-[600px] overflow-auto pr-1">{sortedLetters.length===0 ? <div className="text-xs opacity-60" style={{color:th.text}}>No letters yet. Write your first!</div> : sortedLetters.map(l=>(
                  <div key={l.id} className="rounded-xl border p-4" style={{background:l.includeInBook? "#FFFBF0" : "#FFF", borderColor: l.includeInBook? th.accent : th.border}}>
                    <div className="flex justify-between items-start"><div><div className="text-sm font-bold" style={{color:th.text}}>{l.title}</div><div className="text-[10px] font-medium" style={{color:th.text, opacity:0.7}}>{l.date} • {l.time} • Week {l.week}</div></div><div className="flex gap-1"><label className="text-[10px] flex items-center gap-1 font-bold" style={{color:th.text}}><input type="checkbox" checked={l.includeInBook} onChange={e=>{ setLetters(letters.map(x=> x.id===l.id ? {...x, includeInBook:e.target.checked} : x)); }} /> In book</label><button onClick={()=>{ if(confirm('Delete letter?')) setLetters(letters.filter(x=>x.id!==l.id)); }} className="text-[10px] px-2 py-1 rounded-full border" style={{color:"#111"}}>Delete</button></div></div>
                    <div className="text-sm mt-2 whitespace-pre-wrap" style={{color:th.text}}>{l.content}</div>
                  </div>
                ))}</div></div>
              </div>
            </div>
          </div>
        )}

        {tab==='book' && (
          <>
            <div className="rounded-[24px] border p-6" style={{background:th.card,borderColor:th.border}}>
              <div className="text-[11px] font-bold tracking-widest" style={{color:th.text}}>BOOK PREVIEW • ASSEMBLED FROM WEEKLY ENTRIES • CUSTOMIZABLE COVERS</div>
              <div className="mt-4 grid md:grid-cols-3 gap-6">
                <div><div className="text-[11px] font-bold" style={{color:th.text}}>6 Base Covers (included)</div><div className="grid grid-cols-2 gap-2 mt-2">{COVER_STYLES.map(cs=>{ const isActive = coverStyle===cs.id && !photoCoverStyle; return <button key={cs.id} onClick={()=>{setCoverStyle(cs.id); setPhotoCoverStyle(''); setBorderStyle(cs.border); setFont(cs.font);}} className={`rounded-xl border p-3 text-left ${isActive?'ring-2 ring-black':''}`} style={{borderColor:th.border}}><div className="text-xs font-bold" style={{color:"#111"}}>{cs.name}</div><div className="text-[10px]" style={{color:"#111", opacity:0.7}}>{cs.desc}</div><div className="text-[9px] mt-1 font-bold" style={{color:"#111"}}>Border: {cs.border} • Font: {cs.font}</div></button>})}</div></div>
                <div><div className="text-[11px] font-bold" style={{color:th.text}}>4 Photo Covers (+$25 extra)</div><div className="grid grid-cols-2 gap-2 mt-2">{PHOTO_COVERS.map(cs=>{ const isActive = photoCoverStyle===cs.id; return <button key={cs.id} onClick={()=>{setPhotoCoverStyle(cs.id); setCoverStyle(''); setBorderStyle(cs.border); setFont(cs.font);}} className={`rounded-xl border p-3 text-left ${isActive?'ring-2 ring-[#B86B6B]':''} ${isActive?'bg-[#FFF0F0]':''}`} style={{borderColor: isActive? "#B86B6B" : th.border}}><div className="text-xs font-bold flex justify-between" style={{color:"#111"}}>{cs.name} <span className="bg-[#111] text-white text-[9px] px-1.5 py-0.5 rounded-full">+${cs.cost}</span></div><div className="text-[10px]" style={{color:"#111", opacity:0.7}}>{cs.desc}</div><div className="text-[9px] mt-1 font-bold" style={{color:"#111"}}>Border: {cs.border} • Font: {cs.font}</div></button>})}</div>{isPremiumCover && <div className="mt-2 text-[10px] font-bold bg-[#111] text-white px-2 py-1 rounded-full text-center">Premium photo cover +$25 added to book</div>}</div>
                <div><div className="text-[11px] font-bold" style={{color:th.text}}>Photo section & content</div><div className="mt-2 space-y-3"><div><div className="text-[10px] font-bold" style={{color:th.text}}>Quantity per page</div><div className="flex gap-1 mt-1">{[1,2,4,6].map(n=><button key={n} onClick={()=>setPhotosPerPage(n)} className={`px-3 py-1 rounded-full border text-xs font-bold ${photosPerPage===n?'bg-black text-white':'bg-white text-[#111]'}`}>{n}</button>)}</div></div><div><div className="text-[10px] font-bold" style={{color:th.text}}>Photo style</div><div className="flex gap-1 flex-wrap mt-1">{PHOTO_STYLES.map(s=><button key={s.id} onClick={()=>setPhotoStyle(s.id)} className={`px-2 py-1 rounded-full border text-[10px] font-bold ${photoStyle===s.id?'bg-black text-white':'bg-white text-[#111]'}`}>{s.name}</button>)}</div></div><div><div className="text-[10px] font-bold" style={{color:th.text}}>Border style</div><div className="flex gap-1 flex-wrap mt-1">{Object.keys(BORDERS).slice(0,6).map(b=><button key={b} onClick={()=>setBorderStyle(b)} className={`px-2 py-1 rounded-full border text-[10px] font-bold ${borderStyle===b?'bg-black text-white':'bg-white text-[#111]'}`}>{b}</button>)}</div></div><div className="space-y-1 text-xs font-medium" style={{color:th.text}}><label className="flex gap-2"><input type="checkbox" checked={showPrompts} onChange={e=>setShowPrompts(e.target.checked)} />Prompts by date</label><label className="flex gap-2"><input type="checkbox" checked={showMiles} onChange={e=>setShowMiles(e.target.checked)} />Milestones by date</label><label className="flex gap-2"><input type="checkbox" checked={showLettersInBook} onChange={e=>setShowLettersInBook(e.target.checked)} />Letters ({letters.filter(l=>l.includeInBook).length} in book)</label><label className="flex gap-2"><input type="checkbox" checked={sortByDate} onChange={e=>setSortByDate(e.target.checked)} />Sort by date within week</label></div></div></div>
              </div>
            </div>
            <div className="mt-6 grid md:grid-cols-[260px_1fr] gap-6">
              <div className="rounded-[16px] shadow-xl p-6 aspect-[3/4] flex flex-col items-center text-center" style={{background:th.card, color:th.text, fontFamily:sf.family, ...(BORDERS[borderStyle]?.style||{}), borderColor:th.border, borderWidth: BORDERS[borderStyle]?.style?.borderWidth || '1px', borderStyle: BORDERS[borderStyle]?.style?.borderStyle || 'solid'}}>
                <div className="text-[9px] font-bold tracking-widest uppercase" style={{color:th.text, opacity:0.7}}>{activeCover?.name} • {th.name} • {borderStyle}</div>
                <div className="mt-8 text-[26px] font-bold leading-tight" style={{fontFamily:sf.family, color:th.text}}>{baby.coverTitle||"Little Chapters"}</div>
                <div className="h-px w-12 my-4" style={{background:th.text, opacity:0.2}} />
                <div className="text-[13px] font-medium" style={{color:th.text}}>{baby.name} • First Year</div>
                <div className="text-[10px] mt-3 font-bold" style={{color:th.text, opacity:0.8}}>{baby.birthDate ? new Date(baby.birthDate).toLocaleDateString() : ''}</div>
                {isPremiumCover && <div className="mt-2 text-[8px] bg-[#111] text-white px-2 py-1 rounded-full font-bold">PHOTO COVER +$25</div>}
                <div className="mt-auto text-[9px] font-medium" style={{color:th.text, opacity:0.6}}>{baby.dedication?.slice(0,50)}</div>
              </div>
              <div className="rounded-[16px] border p-4 bg-white max-h-[700px] overflow-auto" style={{borderColor:th.border}}>
                <div className="text-[11px] font-bold" style={{color:"#111"}}>Interior • {bookPages.length} pages • {totalPhotos} photos • {letters.filter(l=>l.includeInBook).length} letters in book • {isPremiumCover ? "Base $79 + $25 photo cover = $104" : "Base $79"}</div>
                {bookPages.length===0 ? <div className="text-xs mt-4 font-medium" style={{color:"#111", opacity:0.6}}>Add photos & check prompts - they appear here sorted by date.</div> : <div className="mt-4 space-y-6">{bookPages.map((pg:any)=><div key={pg.week} className="border-b pb-4" style={{borderColor:"#EEE"}}><div className="text-[11px] font-bold" style={{color:"#111"}}>WEEK {pg.week} • {pg.range}</div><div className={`mt-2 grid gap-2 ${photosPerPage===1?'grid-cols-1':photosPerPage===2?'grid-cols-2':'grid-cols-2'}`}>{pg.photos.map((ph:any)=><div key={ph.id} className={`${photoStyle==='polaroid'?'bg-white p-2 shadow':''} overflow-hidden`} style={BORDERS[borderStyle]?.style}><img src={ph.url} className="w-full aspect-square object-cover" /><div className="text-[9px] mt-1 font-bold" style={{color:"#111"}}>{ph.date}</div></div>)}</div>{showPrompts && pg.prompts.length>0 && <div className="mt-3"><div className="text-[10px] font-bold" style={{color:"#111"}}>Prompts • by date of event</div>{pg.prompts.map((pr:any)=><div key={pr.idx} className="text-xs mt-2 p-2 rounded bg-[#F9F9F9]"><div className="font-bold" style={{color:"#111"}}>{pr.t} • {pr.date}</div><div className="text-[11px]" style={{color:"#111"}}>{pr.d}</div>{pr.details && <div className="text-[11px] mt-1 italic" style={{color:"#111"}}>"{pr.details}"</div>}{pr.witnesses && <div className="text-[10px] mt-1 font-medium" style={{color:"#111"}}>Witnesses: {pr.witnesses}</div>}</div>)}</div>}{showMiles && pg.milestones.length>0 && <div className="mt-3"><div className="text-[10px] font-bold" style={{color:"#111"}}>Milestones • by date</div>{pg.milestones.map((ms:any)=><div key={ms.name} className="text-xs mt-1" style={{color:"#111"}}>✓ {ms.name} • {ms.date}{ms.details && <div className="italic">"{ms.details}"</div>}</div>)}</div>}</div>)}</div>}
                {showLettersInBook && sortedLetters.filter(l=>l.includeInBook).length>0 && (
                  <div className="mt-6 border-t pt-4" style={{borderColor:"#EEE"}}><div className="text-[11px] font-bold" style={{color:"#111"}}>Letters • Chronological • {sortedLetters.filter(l=>l.includeInBook).length} included in book</div><div className="mt-3 space-y-3">{sortedLetters.filter(l=>l.includeInBook).map(l=><div key={l.id} className="text-xs p-3 rounded border bg-[#FFFEF8]" style={{borderColor:th.border}}><div className="font-bold" style={{color:"#111"}}>{l.title} • {l.date} {l.time}</div><div className="mt-1 whitespace-pre-wrap" style={{color:"#111"}}>{l.content}</div></div>)}</div></div>
                )}
              </div>
            </div>
          </>
        )}

        {tab==='settings' && (
          <div className="space-y-6">
            <div className="rounded-[24px] border p-6" style={{background:th.card,borderColor:th.border}}><div className="text-[11px] font-bold tracking-widest" style={{color:th.text}}>ACCOUNT INFO</div><div className="mt-3 text-sm font-medium" style={{color:th.text}}><div>Email: {user?.email}</div><div>Baby: {baby.name} • {baby.birthDate}</div><div>Book: {baby.coverTitle} • {weeksFilled}w • {totalPhotos} pics • {letters.length} letters</div><div className="flex gap-2 mt-4"><button onClick={()=>{ setAuth('landing'); setUser(null); }} className="text-xs px-4 py-2 rounded-full border font-bold" style={{borderColor:th.border, color:th.text}}>Log out</button><button onClick={()=>{ if(confirm('Clear all?')){ localStorage.clear(); location.reload(); } }} className="text-xs px-4 py-2 rounded-full bg-black text-white font-bold">Clear data</button></div></div></div>
            <div className="rounded-[24px] border p-6" style={{background:th.card,borderColor:th.border}}><div className="text-[11px] font-bold tracking-widest" style={{color:th.text}}>APP SETTINGS • THEME • HIGH CONTRAST</div><div className="mt-4 grid md:grid-cols-2 gap-6"><div><div className="text-[11px] font-bold" style={{color:th.text}}>Theme • High contrast text</div><div className="grid grid-cols-3 gap-2 mt-2">{Object.entries(THEMES).map(([k,v]:any)=><button key={k} onClick={()=>setTheme(k)} className={`rounded-xl border p-2 text-left ${theme===k?'ring-2 ring-black':''}`} style={{background:v.bg,borderColor:v.border}}><div className="w-6 h-6 rounded-full" style={{background:v.accent}} /><div className="text-xs font-bold mt-1" style={{color:v.text}}>{v.name}</div><div className="text-[9px] font-bold" style={{color:v.text, opacity:0.7}}>{v.contrast} • {v.text}</div></button>)}</div></div><div><div className="text-[11px] font-bold" style={{color:th.text}}>10 Font Styles</div><div className="grid grid-cols-2 gap-2 mt-2">{Object.entries(FONTS).map(([k,v]:any)=><button key={k} onClick={()=>setFont(k)} className={`rounded-xl border p-2 text-left ${font===k?'ring-2 ring-black':''}`} style={{borderColor:th.border}}><div style={{fontFamily:v.family, fontWeight:(v as any).weight||400}} className="text-sm font-bold" style={{color:"#111"}}>{v.name}</div><div className="text-[10px]" style={{color:"#111", opacity:0.7}}>{v.style}</div></button>)}</div></div></div><div className="mt-6"><div className="text-[11px] font-bold" style={{color:th.text}}>Cover Styles • 6 included + 4 photo +$25</div><div className="grid grid-cols-3 gap-2 mt-2">{[...COVER_STYLES, ...PHOTO_COVERS].map(cs=>{ const isActive = (coverStyle===cs.id || photoCoverStyle===cs.id); return <button key={cs.id} onClick={()=>{ if((cs as any).premium){ setPhotoCoverStyle(cs.id); setCoverStyle(''); } else { setCoverStyle(cs.id); setPhotoCoverStyle(''); } setBorderStyle((cs as any).border); setFont((cs as any).font); }} className={`rounded-xl border p-3 text-left ${isActive?'ring-2 ring-black':''} ${(cs as any).premium?'bg-[#FFF0F0]':''}`} style={{borderColor:isActive?"#111":th.border}}><div className="text-xs font-bold flex justify-between" style={{color:"#111"}}>{cs.name} {(cs as any).premium && <span className="bg-black text-white text-[8px] px-1 rounded">+$25</span>}</div><div className="text-[10px]" style={{color:"#111", opacity:0.7}}>{cs.desc}</div><div className="text-[9px] mt-1" style={{color:"#111"}}>Border:{(cs as any).border} Font:{(cs as any).font}</div></button>})}</div></div><div className="mt-6 grid grid-cols-2 gap-3"><div><div className="text-[11px] font-bold" style={{color:th.text}}>Title</div><input value={baby.coverTitle} onChange={e=>setBaby({...baby,coverTitle:e.target.value})} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm font-bold" style={{borderColor:th.border, color:"#111"}} /></div><div><div className="text-[11px] font-bold" style={{color:th.text}}>Dedication</div><input value={baby.dedication} onChange={e=>setBaby({...baby,dedication:e.target.value})} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm font-bold" style={{borderColor:th.border, color:"#111"}} /></div></div></div>
          </div>
        )}
      </div>
      {showSheet && <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center p-4" onClick={()=>setShowSheet(false)}><div className="bg-white rounded-t-[24px] w-full max-w-[400px] p-6" onClick={e=>e.stopPropagation()}><div className="text-lg font-bold" style={{color:"#111"}}>Add photo Week {curWeek}</div><div className="grid grid-cols-2 gap-3 mt-6"><button onClick={openCam} className="rounded-2xl border p-5 flex flex-col items-center"><span>📷</span><span className="text-sm font-bold" style={{color:"#111"}}>Camera</span></button><button onClick={openLib} className="rounded-2xl border p-5 flex flex-col items-center"><span>🖼️</span><span className="text-sm font-bold" style={{color:"#111"}}>Library</span></button></div><button onClick={()=>setShowSheet(false)} className="w-full rounded-xl border py-3 text-sm mt-4 font-bold" style={{color:"#111"}}>Cancel</button></div></div>}
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-4 py-2 rounded-full font-bold">{toast}</div>}
    </div>
  )
}
