(async()=>{(function(){const l=document.createElement("link").relList;if(l&&l.supports&&l.supports("modulepreload"))return;for(const d of document.querySelectorAll('link[rel="modulepreload"]'))p(d);new MutationObserver(d=>{for(const v of d)if(v.type==="childList")for(const g of v.addedNodes)g.tagName==="LINK"&&g.rel==="modulepreload"&&p(g)}).observe(document,{childList:!0,subtree:!0});function a(d){const v={};return d.integrity&&(v.integrity=d.integrity),d.referrerPolicy&&(v.referrerPolicy=d.referrerPolicy),d.crossOrigin==="use-credentials"?v.credentials="include":d.crossOrigin==="anonymous"?v.credentials="omit":v.credentials="same-origin",v}function p(d){if(d.ep)return;d.ep=!0;const v=a(d);fetch(d.href,v)}})();var Nr=(()=>{var c=import.meta.url;return function(l={}){var a;a||(a=typeof l<"u"?l:{});var p,d;a.ready=new Promise((r,e)=>{p=r,d=e});var v=Object.assign({},a),g="";typeof document<"u"&&document.currentScript&&(g=document.currentScript.src),c&&(g=c),g.indexOf("blob:")!==0?g=g.substr(0,g.replace(/[?#].*/,"").lastIndexOf("/")+1):g="";var T=void 0;Object.assign(a,v),v=null,typeof WebAssembly!="object"&&V("no native wasm support detected");var _,P=!1,S,w,O,j,H,W,tr,or;function ar(){var r=_.buffer;a.HEAP8=S=new Int8Array(r),a.HEAP16=O=new Int16Array(r),a.HEAP32=H=new Int32Array(r),a.HEAPU8=w=new Uint8Array(r),a.HEAPU16=j=new Uint16Array(r),a.HEAPU32=W=new Uint32Array(r),a.HEAPF32=tr=new Float32Array(r),a.HEAPF64=or=new Float64Array(r)}var C,Pr=[],ir=[],ur=[],R=0,N=null;function V(r){throw r="Aborted("+r+")",T(r),P=!0,r=new WebAssembly.RuntimeError(r+". Build with -sASSERTIONS for more info."),d(r),r}function sr(r){return r.startsWith("data:application/octet-stream;base64,")}var F;a.locateFile?(F="markdown.wasm",sr(F)||(F=g+F)):F=new URL(""+new URL("markdown-CcWdda9C.wasm",import.meta.url).href,import.meta.url).href;function fr(){try{throw"both async and sync fetching of the wasm failed"}catch(r){V(r)}}function Sr(r){return typeof fetch=="function"?fetch(r,{credentials:"same-origin"}).then(e=>{if(!e.ok)throw"failed to load wasm binary file at '"+r+"'";return e.arrayBuffer()}).catch(()=>fr()):Promise.resolve().then(()=>fr())}function cr(r,e,n){return Sr(r).then(t=>WebAssembly.instantiate(t,e)).then(t=>t).then(n,t=>{T("failed to asynchronously prepare wasm: "+t),V(t)})}function Wr(r,e){var n=F;return typeof WebAssembly.instantiateStreaming!="function"||sr(n)||typeof fetch!="function"?cr(n,r,e):fetch(n,{credentials:"same-origin"}).then(t=>WebAssembly.instantiateStreaming(t,r).then(e,function(o){return T("wasm streaming compile failed: "+o),T("falling back to ArrayBuffer instantiation"),cr(n,r,e)}))}function b(r){for(;0<r.length;)r.shift()(a)}function J(r){switch(r){case 1:return 0;case 2:return 1;case 4:return 2;case 8:return 3;default:throw new TypeError(`Unknown type size: ${r}`)}}var lr=void 0;function x(r){for(var e="";w[r];)e+=lr[w[r++]];return e}var X={},dr={};function xr(r){if(r===void 0)return"_unknown";r=r.replace(/[^a-zA-Z0-9_]/g,"$");var e=r.charCodeAt(0);return 48<=e&&57>=e?`_${r}`:r}function Ur(r,e){return r=xr(r),{[r]:function(){return e.apply(this,arguments)}}[r]}function hr(r){var e=Error,n=Ur(r,function(t){this.name=r,this.message=t,t=Error(t).stack,t!==void 0&&(this.stack=this.toString()+`
`+t.replace(/^Error(:[^\n]*)?\n/,""))});return n.prototype=Object.create(e.prototype),n.prototype.constructor=n,n.prototype.toString=function(){return this.message===void 0?this.name:`${this.name}: ${this.message}`},n}var pr=void 0;function B(r){throw new pr(r)}function U(r,e,n={}){if(!("argPackAdvance"in e))throw new TypeError("registerType registeredInstance requires argPackAdvance");var t=e.name;if(r||B(`type "${t}" must have a positive integer typeid pointer`),dr.hasOwnProperty(r)){if(n.H)return;B(`Cannot register type '${t}' twice`)}dr[r]=e,X.hasOwnProperty(r)&&(e=X[r],delete X[r],e.forEach(o=>o()))}var E=new function(){this.A=[void 0],this.C=[],this.get=function(r){return this.A[r]},this.has=function(r){return this.A[r]!==void 0},this.F=function(r){var e=this.C.pop()||this.A.length;return this.A[e]=r,e},this.G=function(r){this.A[r]=void 0,this.C.push(r)}},Lr=r=>{switch(r){case void 0:return 1;case null:return 2;case!0:return 3;case!1:return 4;default:return E.F({I:1,value:r})}};function Z(r){return this.fromWireType(H[r>>2])}function Hr(r,e){switch(e){case 2:return function(n){return this.fromWireType(tr[n>>2])};case 3:return function(n){return this.fromWireType(or[n>>3])};default:throw new TypeError("Unknown float type: "+r)}}function Ir(r,e,n){switch(e){case 0:return n?function(t){return S[t]}:function(t){return w[t]};case 1:return n?function(t){return O[t>>1]}:function(t){return j[t>>1]};case 2:return n?function(t){return H[t>>2]}:function(t){return W[t>>2]};default:throw new TypeError("Unknown integer type: "+r)}}var mr=typeof TextDecoder<"u"?new TextDecoder("utf8"):void 0;function yr(r,e,n){var t=e+n;for(n=e;r[n]&&!(n>=t);)++n;if(16<n-e&&r.buffer&&mr)return mr.decode(r.subarray(e,n));for(t="";e<n;){var o=r[e++];if(o&128){var u=r[e++]&63;if((o&224)==192)t+=String.fromCharCode((o&31)<<6|u);else{var i=r[e++]&63;o=(o&240)==224?(o&15)<<12|u<<6|i:(o&7)<<18|u<<12|i<<6|r[e++]&63,65536>o?t+=String.fromCharCode(o):(o-=65536,t+=String.fromCharCode(55296|o>>10,56320|o&1023))}}else t+=String.fromCharCode(o)}return t}var vr=typeof TextDecoder<"u"?new TextDecoder("utf-16le"):void 0;function kr(r,e){for(var n=r>>1,t=n+e/2;!(n>=t)&&j[n];)++n;if(n<<=1,32<n-r&&vr)return vr.decode(w.subarray(r,n));for(n="",t=0;!(t>=e/2);++t){var o=O[r+2*t>>1];if(o==0)break;n+=String.fromCharCode(o)}return n}function Or(r,e,n){if(n===void 0&&(n=2147483647),2>n)return 0;n-=2;var t=e;n=n<2*r.length?n/2:r.length;for(var o=0;o<n;++o)O[e>>1]=r.charCodeAt(o),e+=2;return O[e>>1]=0,e-t}function Fr(r){return 2*r.length}function Br(r,e){for(var n=0,t="";!(n>=e/4);){var o=H[r+4*n>>2];if(o==0)break;++n,65536<=o?(o-=65536,t+=String.fromCharCode(55296|o>>10,56320|o&1023)):t+=String.fromCharCode(o)}return t}function Mr(r,e,n){if(n===void 0&&(n=2147483647),4>n)return 0;var t=e;n=t+n-4;for(var o=0;o<r.length;++o){var u=r.charCodeAt(o);if(55296<=u&&57343>=u){var i=r.charCodeAt(++o);u=65536+((u&1023)<<10)|i&1023}if(H[e>>2]=u,e+=4,e+4>n)break}return H[e>>2]=0,e-t}function Dr(r){for(var e=0,n=0;n<r.length;++n){var t=r.charCodeAt(n);55296<=t&&57343>=t&&++n,e+=4}return e}var M=[];function gr(r){var e=M[r];return e||(r>=M.length&&(M.length=r+1),M[r]=e=C.get(r)),e}for(var I=void 0,q=[],wr=Array(256),G=0;256>G;++G)wr[G]=String.fromCharCode(G);lr=wr,pr=a.BindingError=hr("BindingError"),a.InternalError=hr("InternalError"),E.A.push({value:void 0},{value:null},{value:!0},{value:!1}),E.D=E.A.length,a.count_emval_handles=function(){for(var r=0,e=E.D;e<E.A.length;++e)E.A[e]!==void 0&&++r;return r};var Rr={i:function(){},j:function(r,e,n,t,o){var u=J(n);e=x(e),U(r,{name:e,fromWireType:function(i){return!!i},toWireType:function(i,s){return s?t:o},argPackAdvance:8,readValueFromPointer:function(i){if(n===1)var s=S;else if(n===2)s=O;else if(n===4)s=H;else throw new TypeError("Unknown boolean type size: "+e);return this.fromWireType(s[i>>u])},B:null})},h:function(r,e){e=x(e),U(r,{name:e,fromWireType:function(n){n||B("Cannot use deleted val. handle = "+n);var t=E.get(n).value;return n>=E.D&&--E.get(n).I===0&&E.G(n),t},toWireType:function(n,t){return Lr(t)},argPackAdvance:8,readValueFromPointer:Z,B:null})},d:function(r,e,n){n=J(n),e=x(e),U(r,{name:e,fromWireType:function(t){return t},toWireType:function(t,o){return o},argPackAdvance:8,readValueFromPointer:Hr(e,n),B:null})},b:function(r,e,n,t,o){e=x(e),o===-1&&(o=4294967295),o=J(n);var u=s=>s;if(t===0){var i=32-8*n;u=s=>s<<i>>>i}n=e.includes("unsigned")?function(s,f){return f>>>0}:function(s,f){return f},U(r,{name:e,fromWireType:u,toWireType:n,argPackAdvance:8,readValueFromPointer:Ir(e,o,t!==0),B:null})},a:function(r,e,n){function t(u){u>>=2;var i=W;return new o(i.buffer,i[u+1],i[u])}var o=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array][e];n=x(n),U(r,{name:n,fromWireType:t,argPackAdvance:8,readValueFromPointer:t},{H:!0})},e:function(r,e){e=x(e);var n=e==="std::string";U(r,{name:e,fromWireType:function(t){var o=W[t>>2],u=t+4;if(n)for(var i=u,s=0;s<=o;++s){var f=u+s;if(s==o||w[f]==0){if(i=i?yr(w,i,f-i):"",h===void 0)var h=i;else h+="\0",h+=i;i=f+1}}else{for(h=Array(o),s=0;s<o;++s)h[s]=String.fromCharCode(w[u+s]);h=h.join("")}return L(t),h},toWireType:function(t,o){o instanceof ArrayBuffer&&(o=new Uint8Array(o));var u,i=typeof o=="string";i||o instanceof Uint8Array||o instanceof Uint8ClampedArray||o instanceof Int8Array||B("Cannot pass non-string to std::string");var s;if(n&&i)for(u=s=0;u<o.length;++u){var f=o.charCodeAt(u);127>=f?s++:2047>=f?s+=2:55296<=f&&57343>=f?(s+=4,++u):s+=3}else s=o.length;if(u=s,s=Q(4+u+1),f=s+4,W[s>>2]=u,n&&i){if(i=f,f=u+1,u=w,0<f){f=i+f-1;for(var h=0;h<o.length;++h){var y=o.charCodeAt(h);if(55296<=y&&57343>=y){var A=o.charCodeAt(++h);y=65536+((y&1023)<<10)|A&1023}if(127>=y){if(i>=f)break;u[i++]=y}else{if(2047>=y){if(i+1>=f)break;u[i++]=192|y>>6}else{if(65535>=y){if(i+2>=f)break;u[i++]=224|y>>12}else{if(i+3>=f)break;u[i++]=240|y>>18,u[i++]=128|y>>12&63}u[i++]=128|y>>6&63}u[i++]=128|y&63}}u[i]=0}}else if(i)for(i=0;i<u;++i)h=o.charCodeAt(i),255<h&&(L(f),B("String has UTF-16 code units that do not fit in 8 bits")),w[f+i]=h;else for(i=0;i<u;++i)w[f+i]=o[i];return t!==null&&t.push(L,s),s},argPackAdvance:8,readValueFromPointer:Z,B:function(t){L(t)}})},c:function(r,e,n){if(n=x(n),e===2)var t=kr,o=Or,u=Fr,i=()=>j,s=1;else e===4&&(t=Br,o=Mr,u=Dr,i=()=>W,s=2);U(r,{name:n,fromWireType:function(f){for(var h=W[f>>2],y=i(),A,D=f+4,z=0;z<=h;++z){var Y=f+4+z*e;(z==h||y[Y>>s]==0)&&(D=t(D,Y-D),A===void 0?A=D:(A+="\0",A+=D),D=Y+e)}return L(f),A},toWireType:function(f,h){typeof h!="string"&&B(`Cannot pass non-string to C++ string type ${n}`);var y=u(h),A=Q(4+y+e);return W[A>>2]=y>>s,o(h,A+4,y+e),f!==null&&f.push(L,A),A},argPackAdvance:8,readValueFromPointer:Z,B:function(f){L(f)}})},k:function(r,e){e=x(e),U(r,{J:!0,name:e,argPackAdvance:0,fromWireType:function(){},toWireType:function(){}})},g:function(r,e,n){w.copyWithin(r,e,e+n)},f:function(r){var e=w.length;if(r>>>=0,2147483648<r)return!1;for(var n=1;4>=n;n*=2){var t=e*(1+.2/n);t=Math.min(t,r+100663296);var o=Math,u=o.min;t=Math.max(r,t),t+=(65536-t%65536)%65536;r:{var i=_.buffer;try{_.grow(u.call(o,2147483648,t)-i.byteLength+65535>>>16),ar();var s=1;break r}catch{}s=void 0}if(s)return!0}return!1}};(function(){var r={a:Rr};return R++,Wr(r,function(e){a.asm=e.instance.exports,_=a.asm.l,ar(),C=a.asm.w,ir.unshift(a.asm.m),R--,R==0&&N&&(e=N,N=null,e())}).catch(d),{}})(),a._wrealloc=function(){return(a._wrealloc=a.asm.n).apply(null,arguments)},a._wfree=function(){return(a._wfree=a.asm.o).apply(null,arguments)};function L(){return(L=a.asm.p).apply(null,arguments)}a._WErrGetCode=function(){return(a._WErrGetCode=a.asm.q).apply(null,arguments)},a._WErrGetMsg=function(){return(a._WErrGetMsg=a.asm.r).apply(null,arguments)},a._WErrClear=function(){return(a._WErrClear=a.asm.s).apply(null,arguments)},a._parseUTF8=function(){return(a._parseUTF8=a.asm.t).apply(null,arguments)};function Q(){return(Q=a.asm.u).apply(null,arguments)}a.__embind_initialize_bindings=function(){return(a.__embind_initialize_bindings=a.asm.v).apply(null,arguments)},a.addOnPostRun=function(r){ur.unshift(r)},a.addFunction=function(r,e){if(!I){I=new WeakMap;var n=C.length;if(I)for(var t=0;t<0+n;t++){var o=gr(t);o&&I.set(o,t)}}if(n=I.get(r)||0)return n;if(q.length)n=q.pop();else{try{C.grow(1)}catch(s){throw s instanceof RangeError?"Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.":s}n=C.length-1}try{t=n,C.set(t,r),M[t]=C.get(t)}catch(s){if(!(s instanceof TypeError))throw s;if(typeof WebAssembly.Function=="function"){t=WebAssembly.Function,o={i:"i32",j:"i64",f:"f32",d:"f64",p:"i32"};for(var u={parameters:[],results:e[0]=="v"?[]:[o[e[0]]]},i=1;i<e.length;++i)u.parameters.push(o[e[i]]);e=new t(u,r)}else{for(t=[1],o=e.slice(0,1),e=e.slice(1),u={i:127,p:127,j:126,f:125,d:124},t.push(96),i=e.length,128>i?t.push(i):t.push(i%128|128,i>>7),i=0;i<e.length;++i)t.push(u[e[i]]);o=="v"?t.push(0):t.push(1,u[o]),e=[0,97,115,109,1,0,0,0,1],o=t.length,128>o?e.push(o):e.push(o%128|128,o>>7),e.push.apply(e,t),e.push(2,7,1,1,101,1,102,0,0,7,5,1,1,102,0,0),e=new WebAssembly.Module(new Uint8Array(e)),e=new WebAssembly.Instance(e,{e:{f:r}}).exports.f}t=n,C.set(t,e),M[t]=C.get(t)}return I.set(r,n),n},a.removeFunction=function(r){I.delete(gr(r)),q.push(r)},a.UTF8ArrayToString=yr;var $;N=function r(){$||Ar(),$||(N=r)};function Ar(){0<R||(b(Pr),0<R||$||($=!0,a.calledRun=!0,P||(b(ir),p(a),b(ur))))}return Ar(),l.ready}})();let m,rr=0;const Kr=async()=>(m=await Nr(),m.addOnPostRun(()=>{rr=m._wrealloc(0,4)}),await m.ready),er={COLLAPSE_WHITESPACE:1,PERMISSIVE_ATX_HEADERS:2,PERMISSIVE_URL_AUTO_LINKS:4,PERMISSIVE_EMAIL_AUTO_LINKS:8,NO_INDENTED_CODE_BLOCKS:16,NO_HTML_BLOCKS:32,NO_HTML_SPANS:64,TABLES:256,STRIKETHROUGH:512,PERMISSIVE_WWW_AUTOLINKS:1024,TASK_LISTS:2048,LATEX_MATH_SPANS:4096,WIKI_LINKS:8192,UNDERLINE:16384,DEFAULT:2823,NO_HTML:96,COMMONMARK:0,GITHUB:2820},K={HTML:1,XHTML:2,AllowJSURI:4,DisableHeadlineAnchors:8};function jr(c,l={}){if(!m)throw new Error("[markdown-wasm] markdown-wasm does not initialized. Use `await ready();` before `parse()` function.");const a=l.parseFlags===void 0?er.DEFAULT:l.parseFlags;let p=l.allowJSURIs?K.AllowJSURI:0;switch(l.format){case"xhtml":p|=K.HTML|K.XHTML;break;case"html":case void 0:case null:p|=K.HTML;break;default:throw new Error(`[markdown-wasm] invalid format "${l.format}"`)}l.disableHeadlineAnchors&&(p|=K.DisableHeadlineAnchors);const d=l.onCodeBlock?Gr(l.onCodeBlock):0,v=Tr(c),g=$r(T=>zr(v,(_,P)=>m._parseUTF8(_,P,a,p,T,d)));return l.onCodeBlock&&m.removeFunction(d),Jr(),g?l.bytes?g:new TextDecoder("utf-8").decode(g):null}function Gr(c){return m.addFunction((a,p,d,v,g)=>{try{const T=p>0?new TextDecoder("utf-8").decode(m.HEAPU8.subarray(a,a+p)):"",_=m.HEAPU8.subarray(d,d+v),P=c(T,new TextDecoder("utf-8").decode(_));if(P==null)return-1;const S=Tr(P);if(S.length>0){const w=Cr(S,S.length);m.HEAPU32[g>>2]=w}return S.length}catch{return-1}},"iiiiii")}function Tr(c){return typeof c=="string"?new TextEncoder().encode(c):c instanceof Uint8Array?c:new Uint8Array(c)}function $r(c){const l=c(rr),a=m.HEAP32[rr>>2];if(a===0)return null;const p=m.HEAPU8.subarray(a,a+l);return p.heapAddr=a,p}function zr(c,l){const a=c.length,p=Cr(c,a),d=l(p,a);return m._wfree(p),d}function Cr(c,l){const a=m._wrealloc(0,l);return m.HEAPU8.set(c,a),a}class Vr extends Error{constructor(l,a,p,d){super(a,p||"wasm",d||0),this.name="WError",this.code=l}}function br(){const c=m._WErrGetCode();if(c!==0){const l=m._WErrGetMsg(),a=l!==""?m.UTF8ArrayToString(m.HEAPU8,l):"";return m._WErrClear(),new Vr(c,a)}}function Jr(){const c=br();if(c)throw c}const qr=await Kr(),k=document.getElementById("markdown-input"),Xr=document.getElementById("html-output");let nr=k.value.split(`
`).length;nr<=3&&(nr=3);k.rows=nr+1;let Er;function _r(){const c=k.value,l=jr(c,{parseFlags:er.DEFAULT|er.NO_HTML});Xr.innerHTML=l,Zr()}function Zr(){if(clearTimeout(Er),typeof hljs>"u"){Er=setTimeout(updateCodeSyntaxHighlighting,500);return}document.querySelectorAll('pre code[class^="language-"]').forEach(c=>{hljs.highlightElement(c)})}k.addEventListener("input",_r);_r();window.addEventListener("DOMContentLoaded",()=>{let c=k.value.split(`
`).length;c<=3&&(c=3),k.setAttribute("rows",c+1),k.addEventListener("input",l);function l(){this.style.height="auto",this.style.height=`${this.scrollHeight}px`}})})();