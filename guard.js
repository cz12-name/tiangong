((function(){
'use strict';
var MAX=2*1024*1024;
var OK=['txt','md','doc','docx','ppt','pptx','pdf','png','jpg','jpeg','gif','webp'];
function tip(m){try{var d=document.createElement('div');d.textContent=m;
d.style.cssText='position:fixed;left:50%;bottom:30px;transform:translateX(-50%);background:#0e7490;color:#fff;padding:12px 18px;border-radius:10px;font-size:13px;z-index:99999;max-width:80vw;text-align:center;line-height:1.6';
document.body.appendChild(d);setTimeout(function(){d.remove()},3200)}catch(e){}}
var raw=Storage.prototype.setItem;
Storage.prototype.setItem=function(k,v){
try{return raw.call(this,k,v)}
catch(e){tip('⚠️ 存储满了，这次没存进去。去「我的→设置」清理一下');return}
};
document.addEventListener('change',function(e){
var el=e.target;
if(!el||el.type!=='file'||!el.files)return;
for(var i=0;i<el.files.length;i++){
var f=el.files[i];
var ext=(f.name.split('.').pop()||'').toLowerCase();
if(f.size>MAX){e.stopImmediatePropagation();e.preventDefault();el.value='';
tip('🚫 「'+f.name+'」太大（'+(f.size/1048576).toFixed(1)+'MB），最多 2MB');return}
if(OK.indexOf(ext)<0){e.stopImmediatePropagation();e.preventDefault();el.value='';
tip('🚫 不支持 .'+ext+' 这种格式');return}
}
},true);
})();
