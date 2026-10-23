const Q=[
["Topologi jaringan yang semua perangkatnya terhubung ke satu titik pusat adalah…",["Star","Bus","Ring","Mesh"],0],
["Layer OSI yang bertugas melakukan pengalamatan logis (IP) adalah…",["Data Link","Network","Transport","Session"],1],
["Subnet mask default untuk IP kelas C adalah…",["255.0.0.0","255.255.0.0","255.255.255.0","255.255.255.255"],2],
["Perangkat yang menghubungkan dua jaringan berbeda adalah…",["Hub","Repeater","Switch","Router"],3],
["Port default protokol HTTP adalah…",["21","80","443","25"],1],
["Protokol yang digunakan untuk mengirim email adalah…",["POP3","IMAP","SMTP","FTP"],2],
["Protokol yang menerjemahkan nama domain menjadi alamat IP adalah…",["DHCP","DNS","ARP","SNMP"],1],
["Kabel UTP straight umumnya digunakan untuk menghubungkan…",["PC ke PC","Router ke router","PC ke switch","Switch ke switch (tanpa MDI-X)"],2],
["Urutan kabel standar T568B dimulai dari…",["Putih hijau","Putih oranye","Putih biru","Putih coklat"],1],
["Perintah untuk menguji konektivitas ke host lain adalah…",["ping","ls","chmod","format"],0],
["Jumlah host yang dapat digunakan pada jaringan /24 adalah…",["256","255","254","253"],2],
["Protokol yang memberikan alamat IP secara otomatis adalah…",["DNS","DHCP","NAT","HTTP"],1],
["Perintah Linux untuk menampilkan isi direktori adalah…",["cd","mkdir","ls","rm"],2],
["Port default layanan SSH adalah…",["20","22","23","53"],1],
["Konektor yang dipakai pada kabel UTP adalah…",["BNC","RJ-11","SC","RJ-45"],3],
["Perintah Windows untuk melihat konfigurasi IP adalah…",["ipconfig","ifconfig","netstat -r","dir"],0],
["Perangkat yang memancarkan sinyal WiFi ke klien adalah…",["Modem kabel","Access Point","Patch panel","Crimping tool"],1],
["Fungsi utama firewall adalah…",["Menambah kecepatan internet","Menyimpan data cadangan","Menyaring lalu lintas jaringan","Mengubah domain menjadi IP"],2],
["Panjang alamat IPv6 adalah…",["32 bit","64 bit","128 bit","256 bit"],2],
["Alamat IP 192.168.1.10 termasuk kelas…",["A","B","C","D"],2],
["Protokol pada layer Transport yang bersifat connection-oriented adalah…",["UDP","TCP","ICMP","IP"],1],
["Kabel fiber optik mengirim data menggunakan…",["Listrik","Gelombang radio","Cahaya","Magnet"],2],
["Perintah Linux untuk mengubah hak akses file adalah…",["chown","chmod","chgrp","passwd"],1],
["VLAN berfungsi untuk…",["Memperbesar bandwidth","Memisahkan jaringan logis dalam satu switch","Mengenkripsi data","Menggantikan router"],1],
["Alat untuk memasang konektor RJ-45 pada kabel UTP adalah…",["Tang crimping","Obeng","Solder","LAN tester"],0]];
const $=id=>document.getElementById(id),MAX=3,DUR=45*60;
const GOOGLE_SHEET_WEBAPP_URL="PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";
let order,perm,ans,cur,viol=0,log=[],run=false,locked=false,left=DUR,tt,ct,stream,fsOK=false,base,lastV=0,noFace=0,nm,ns;
const sh=a=>{for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const show=id=>["s0","s1","s2"].forEach(x=>$(x).classList.toggle("hide",x!==id));
const clock=()=>new Date().toLocaleTimeString("id-ID");
function modal(t,m,btns){$("ot").textContent=t;$("om").textContent=m;const b=$("ob");b.innerHTML="";btns.forEach(([l,f,c])=>{const e=document.createElement("button");e.className="btn "+(c||"");e.textContent=l;e.onclick=()=>{$("ov").classList.add("hide");locked=false;f&&f()};b.appendChild(e)});$("ov").classList.remove("hide");locked=true}
async function fs(){try{await document.documentElement.requestFullscreen();fsOK=true}catch(e){fsOK=false}}
function setBase(){setTimeout(()=>base={w:innerWidth,h:innerHeight},700)}
async function saveToGoogleSheet(payload){
 if(!GOOGLE_SHEET_WEBAPP_URL||GOOGLE_SHEET_WEBAPP_URL.includes("PASTE_"))return false;
 try{
  await fetch(GOOGLE_SHEET_WEBAPP_URL,{
   method:"POST",
   mode:"no-cors",
   headers:{"Content-Type":"text/plain;charset=utf-8"},
   body:JSON.stringify(payload)
  });
  return true;
 }catch(error){
  console.error("Gagal mengirim ke Google Sheets:",error);
  return false;
 }
}
$("go").onclick=async()=>{
 nm=$("nm").value.trim();ns=$("ns").value.trim();
 if(!nm||!ns){$("err").textContent="Isi nama dan NIS terlebih dahulu.";return}
 await fs();
 try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:320,height:240}});$("cam").srcObject=stream}catch(e){log.push(clock()+" · Kamera tidak aktif / ditolak");$("cam").style.display="none"}
 order=sh(Q.map((_,i)=>i));perm=order.map(()=>sh([0,1,2,3]));ans=Array(25).fill(-1);cur=0;left=DUR;
 show("s1");render();setBase();run=true;
 tt=setInterval(()=>{if(locked)return;left--;const m=Math.floor(left/60),s=left%60;$("tm").textContent=m+":"+String(s).padStart(2,"0");if(left<=0)finish("Waktu habis")},1000);
 ct=setInterval(camCheck,2000);
};
function render(){
 const q=Q[order[cur]];$("q").textContent=cur+1+". "+q[0];$("no").textContent=cur+1;
 const op=$("op");op.innerHTML="";
 perm[cur].forEach((oi,p)=>{const b=document.createElement("button");b.className="o"+(ans[cur]===oi?" on":"");b.textContent="ABCD"[p]+". "+q[1][oi];b.onclick=()=>{ans[cur]=oi;render()};op.appendChild(b)});
 const nv=$("nv");nv.innerHTML="";
 ans.forEach((a,i)=>{const b=document.createElement("button");b.textContent=i+1;b.className=(a>=0?"a ":"")+(i===cur?"cu":"");b.onclick=()=>{cur=i;render()};nv.appendChild(b)});
}
$("pv").onclick=()=>{if(cur>0){cur--;render()}};
$("nx").onclick=()=>{if(cur<24){cur++;render()}};
$("fn").onclick=()=>{if(locked)return;const n=ans.filter(a=>a<0).length;modal("Kumpulkan jawaban?",n?n+" soal belum dijawab.":"Semua soal sudah dijawab.",[["Kembali",null,"s"],["Kumpulkan",()=>finish("Dikumpulkan peserta")]])};
function violate(why){
 if(!run||Date.now()-lastV<2500)return;lastV=Date.now();viol++;$("vc").textContent=viol;
 log.push(clock()+" · "+why);
 if(viol>=MAX){finish("Dihentikan otomatis: pelanggaran "+MAX+"x");return}
 modal("Pelanggaran "+viol+"/"+MAX,why+". Pelanggaran berikutnya akan menghentikan ujian.",[["Kembali ke ujian",()=>{fs();setBase()}]]);
}
document.addEventListener("visibilitychange",()=>{if(document.hidden)violate("Berpindah aplikasi atau tab")});
addEventListener("blur",()=>setTimeout(()=>{if(run&&!document.hasFocus())violate("Fokus layar hilang (aplikasi mengambang, notifikasi, atau split-screen)")},300));
document.addEventListener("fullscreenchange",()=>{if(run&&fsOK&&!document.fullscreenElement)violate("Keluar dari mode layar penuh")});
addEventListener("resize",()=>setTimeout(()=>{if(run&&base&&!locked&&(Math.abs(innerHeight-base.h)>base.h*.15||Math.abs(innerWidth-base.w)>base.w*.15))violate("Ukuran jendela berubah (mode jendela mengambang atau split-screen)")},500));
addEventListener("pagehide",()=>{if(run)violate("Halaman ditutup atau dimuat ulang")});
["contextmenu","copy","cut","paste","dragstart"].forEach(e=>document.addEventListener(e,x=>{if(run)x.preventDefault()}));
document.addEventListener("selectstart",x=>{if(run&&!x.target.closest("input"))x.preventDefault()});
document.addEventListener("keydown",x=>{if(run&&(x.key==="F12"||x.key==="PrintScreen"||((x.ctrlKey||x.metaKey)&&"cvxuspai".includes(x.key.toLowerCase()))))x.preventDefault()});
addEventListener("beforeunload",x=>{if(run){x.preventDefault();x.returnValue=""}});
history.pushState(null,"",location.href);addEventListener("popstate",()=>{if(run){history.pushState(null,"",location.href);violate("Menekan tombol kembali")}});
const cv=document.createElement("canvas");cv.width=cv.height=32;
async function camCheck(){
 if(!run||locked||!stream)return;const v=$("cam");if(v.readyState<2)return;
 const x=cv.getContext("2d",{willReadFrequently:true});x.drawImage(v,0,0,32,32);const d=x.getImageData(0,0,32,32).data;let s=0;for(let i=0;i<d.length;i+=4)s+=d[i]+d[i+1]+d[i+2];
 if(s/(1024*3)<18){violate("Kamera tertutup atau terlalu gelap");return}
 if("FaceDetector" in window){try{const f=await new FaceDetector().detect(v);
  if(f.length===0){if(++noFace>=3){noFace=0;violate("Wajah tidak terdeteksi")}}else{noFace=0;if(f.length>1)violate("Terdeteksi lebih dari satu wajah")}}catch(e){}}
}
async function finish(reason){
 if(!run)return;run=false;clearInterval(tt);clearInterval(ct);
 stream&&stream.getTracks().forEach(t=>t.stop());
 try{document.fullscreenElement&&document.exitFullscreen()}catch(e){}
 $("ov").classList.add("hide");
 const ok=ans.filter((a,i)=>a===Q[order[i]][2]).length,sc=Math.round(ok/25*100);
 $("sc").textContent=sc;$("rt").textContent=nm+" ("+ns+")";
 $("rd").textContent="Benar "+ok+" dari 25 · "+reason;
 $("lg").innerHTML=log.length?log.map(l=>"<p>"+l+"</p>").join(""):"<p>Tidak ada pelanggaran tercatat.</p>";
 try{localStorage.setItem("tka-"+ns,JSON.stringify({nm,ns,sc,viol,log,reason}))}catch(e){}
 const payload={
  nama:nm,
  nis:ns,
  skor:sc,
  benar:ok,
  salah:25-ok,
  totalSoal:25,
  pelanggaran:viol,
  alasan:reason,
  tanggal:new Date().toISOString(),
  logs:log
 };
 const sheetSaved=await saveToGoogleSheet(payload);
 const statusNode=$("sheet-status");
 if(statusNode){statusNode.textContent=sheetSaved?"Permintaan pengiriman sudah dikirim. Periksa Google Sheet untuk memastikan nilai tercatat.":"Google Sheets belum terhubung atau pengiriman gagal. Periksa URL Apps Script dan koneksi internet.";}
 show("s2");
}
