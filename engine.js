/* Data Atelier — deterministic tabular operations, no network or dynamic evaluation. */
(function(root){
'use strict';
const missing=v=>v===null||v===undefined||v===''||(typeof v==='number'&&!Number.isFinite(v));
const num=v=>missing(v)?null:(typeof v==='boolean'?null:(Number.isFinite(Number(v))?Number(v):null));
const clone=x=>JSON.parse(JSON.stringify(x));
function parseCSV(text,delimiter){
 text=text.replace(/^\uFEFF/,''); if(!delimiter){const line=text.split(/\r?\n/)[0];delimiter=line.includes('\t')?'\t':',';}
 let rows=[],row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else if(quoted||cell==='')quoted=!quoted;else cell+=c;}
 else if(c===delimiter&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v!==''))rows.push(row);row=[];cell='';}else cell+=c;}
 if(quoted)throw new Error('Unclosed quoted field');if(cell!==''||row.length){row.push(cell);rows.push(row);}if(rows.length<2)throw new Error('A header and at least one data row are required');
 const cols=rows.shift().map(v=>v.trim());if(cols.some(v=>!v)||new Set(cols).size!==cols.length)throw new Error('Column names must be non-empty and unique');
 if(rows.some(r=>r.length!==cols.length))throw new Error('Inconsistent column count');
 return normalize(rows.map(r=>Object.fromEntries(cols.map((c,i)=>[c,r[i]===''?null:r[i]]))));
}
function normalize(rows){if(!Array.isArray(rows)||!rows.length||rows.some(r=>!r||Array.isArray(r)||typeof r!=='object'))throw new Error('Expected a non-empty array of row objects');
 const cols=[...new Set(rows.flatMap(r=>Object.keys(r)))];if(!cols.length||cols.length>100||rows.length>50000)throw new Error('Limit: 50,000 rows and 100 columns');
 const result=rows.map(r=>Object.fromEntries(cols.map(c=>[c,missing(r[c])?null:(typeof r[c]==='object'?JSON.stringify(r[c]):r[c])])));
 for(const c of cols){const vals=result.map(r=>r[c]).filter(v=>!missing(v));if(vals.length&&vals.every(v=>num(v)!==null))result.forEach(r=>{if(!missing(r[c]))r[c]=num(r[c]);});}return result;
}
const cols=rows=>rows.length?Object.keys(rows[0]):[];
const numbers=(rows,c)=>rows.map(r=>num(r[c])).filter(v=>v!==null);
function quantile(a,q){if(!a.length)return null;const s=[...a].sort((a,b)=>a-b),p=(s.length-1)*q,k=Math.floor(p);return s[k]+(s[Math.min(k+1,s.length-1)]-s[k])*(p-k);}
function describe(values){const a=values.map(num).filter(v=>v!==null),n=a.length;if(!n)return {count:0,mean:null,std:null,min:null,q25:null,median:null,q75:null,max:null,sum:0};const sum=a.reduce((s,v)=>s+v,0),mean=sum/n;return {count:n,mean,std:n>1?Math.sqrt(a.reduce((s,v)=>s+(v-mean)**2,0)/(n-1)):null,min:Math.min(...a),q25:quantile(a,.25),median:quantile(a,.5),q75:quantile(a,.75),max:Math.max(...a),sum};}
const validDate=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(v)&&!Number.isNaN(Date.parse(v))&&new Date(v.slice(0,10)).toISOString().slice(0,10)===v.slice(0,10);
function type(rows,c){const a=rows.map(r=>r[c]).filter(v=>!missing(v));return a.length&&a.every(v=>typeof v==='number')?'number':a.length&&a.every(v=>validDate(String(v)))?'date':'text';}
function profile(rows){return cols(rows).map(c=>{const a=rows.map(r=>r[c]),m=a.filter(missing).length,t=type(rows,c);return {column:c,type:t,missing:m,unique:new Set(a.filter(v=>!missing(v)).map(v=>JSON.stringify(v))).size,...(t==='number'?describe(a):{})};});}
function aggregate(a,op){if(op==='count')return a.filter(v=>!missing(v)).length;if(op==='nunique')return new Set(a.filter(v=>!missing(v)).map(v=>JSON.stringify(v))).size;const d=describe(a);return ({sum:d.sum,mean:d.mean,min:d.min,max:d.max,median:d.median,std:d.std})[op]??null;}
function group(rows,keys,value,op){const map=new Map();for(const r of rows){const key=JSON.stringify(keys.map(c=>r[c]));if(!map.has(key))map.set(key,{values:keys.map(c=>r[c]),a:[]});map.get(key).a.push(r[value]);}return [...map.values()].map(g=>Object.fromEntries([...keys.map((c,i)=>[c,g.values[i]]),[`${value}_${op}`,aggregate(g.a,op)]]));}
function pivot(rows,index,column,value,op){
 const categoryKeys=[...new Set(rows.map(r=>JSON.stringify(r[column])))];if(categoryKeys.length>50)throw new Error('Pivot allows at most 50 categories');
 const used=new Set([index]),levels=categoryKeys.map(k=>{const v=JSON.parse(k),base=missing(v)?'(missing)':String(v);let label=base,i=1;while(used.has(label))label=base+'_'+i++;used.add(label);return {key:k,label};});
 const keys=[...new Set(rows.map(r=>JSON.stringify(r[index])))],map=new Map();for(const r of rows){const k=JSON.stringify([r[index],r[column]]);if(!map.has(k))map.set(k,[]);map.get(k).push(r[value]);}
 return keys.map(k=>Object.fromEntries([[index,JSON.parse(k)],...levels.map(l=>{const key=JSON.stringify([JSON.parse(k),JSON.parse(l.key)]);return [l.label,map.has(key)?aggregate(map.get(key),op):null];})]));
}
function dedupe(rows){const seen=new Set();return rows.filter(r=>{const k=JSON.stringify(r);if(seen.has(k))return false;seen.add(k);return true;});}
function fill(rows,column,method,value){const out=clone(rows);let replacement=value;if(method==='mean'||method==='median')replacement=describe(rows.map(r=>r[column]))[method];if(method==='zero')replacement=0;if((method==='mean'||method==='median')&&replacement===null)throw new Error('No numeric values in selected column');for(let i=0;i<out.length;i++)if(missing(out[i][column])){if(method==='forward'){if(i>0)out[i][column]=out[i-1][column];}else out[i][column]=replacement;}return out;}
function filter(rows,column,op,value){return rows.filter(r=>{const a=r[column],b=type(rows,column)==='number'?num(value):value;if(op==='missing')return missing(a);if(op==='notmissing')return !missing(a);if(op==='contains')return !missing(a)&&String(a).toLowerCase().includes(String(value).toLowerCase());if(op==='eq')return !missing(a)&&String(a)===String(b);if(op==='ne')return missing(a)||String(a)!==String(b);if(missing(a)||missing(b))return false;return op==='gt'?a>b:op==='ge'?a>=b:op==='lt'?a<b:a<=b;});}
function sort(rows,c,desc=false){return [...rows].sort((a,b)=>missing(a[c])?missing(b[c])?0:1:missing(b[c])?-1:((typeof a[c]==='number'&&typeof b[c]==='number')?a[c]-b[c]:String(a[c]).localeCompare(String(b[c])))*(desc?-1:1));}
function corr(rows,a,b){const pairs=rows.map(r=>[num(r[a]),num(r[b])]).filter(p=>p.every(v=>v!==null)),n=pairs.length;if(n<2)return {r:null,n};const ma=pairs.reduce((s,p)=>s+p[0],0)/n,mb=pairs.reduce((s,p)=>s+p[1],0)/n;let top=0,aa=0,bb=0;for(const [x,y]of pairs){top+=(x-ma)*(y-mb);aa+=(x-ma)**2;bb+=(y-mb)**2;}return {r:aa&&bb?top/Math.sqrt(aa*bb):null,n};}
function merge(left,right,key,how='left'){const rc=cols(right).filter(c=>c!==key),lc=cols(left);const names=rc.map(c=>lc.includes(c)?c+'_right':c);if(new Set([...lc,...names]).size!==lc.length+names.length)throw new Error('Conflicting suffix column names');const map=new Map();for(const r of right){const k=JSON.stringify(r[key]);if(!map.has(k))map.set(k,[]);map.get(k).push(r);}let out=[];for(const l of left){const matches=map.get(JSON.stringify(l[key]));if(matches){for(const r of matches)out.push({...l,...Object.fromEntries(rc.map((c,i)=>[names[i],r[c]]))});}else if(how==='left')out.push({...l,...Object.fromEntries(names.map(c=>[c,null]))});if(out.length>50000)throw new Error('Join exceeds 50,000 rows');}return out;}
function compute(rows,name,a,op,b){if(!name||cols(rows).includes(name))throw new Error('Use a new, non-empty column name');return rows.map(r=>{const x=num(r[a]),y=num(r[b]);return {...r,[name]:x===null||y===null||op==='/'&&y===0?null:op==='+'?x+y:op==='-'?x-y:op==='*'?x*y:x/y};});}
function convert(rows,c,t){return rows.map(r=>({...r,[c]:missing(r[c])?null:t==='number'?num(r[c]):t==='date'?(Number.isNaN(Date.parse(r[c]))?null:new Date(r[c]).toISOString().slice(0,10)):String(r[c])}));}
function resample(rows,date,value,period,op){let skipped=0;const converted=rows.flatMap(r=>{const d=String(r[date]??'');if(!validDate(d)){skipped++;return [];}return [{__period__:period==='year'?d.slice(0,4):period==='month'?d.slice(0,7):d.slice(0,10),__value__:r[value]}];});const grouped=group(converted,['__period__'],'__value__',op).map(r=>({period:r.__period__,[value+'_'+op]:r['__value__'+'_'+op]}));return {rows:sort(grouped,'period'),skipped};}
function csv(rows){const cs=cols(rows),esc=v=>{if(missing(v))return '';let s=String(v);if(typeof v==='string'&&/^[=+@\-\t\r]/.test(s))s="'"+s;return /[",\r\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};return '\uFEFF'+[cs.map(esc).join(','),...rows.map(r=>cs.map(c=>esc(r[c])).join(','))].join('\r\n');}
const api={missing,num,clone,parseCSV,normalize,cols,numbers,quantile,describe,type,profile,aggregate,group,pivot,dedupe,fill,filter,sort,corr,merge,compute,convert,resample,csv};if(typeof module!=='undefined')module.exports=api;else root.Engine=api;
})(typeof window!=='undefined'?window:globalThis);
