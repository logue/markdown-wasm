
var Module = (() => {
  var _scriptDir = import.meta.url;
  
  return (
async function(Module = {})  {

var h;h||(h=typeof Module !== 'undefined' ? Module : {});var aa,p;h.ready=new Promise((b,a)=>{aa=b;p=a});var ca=Object.assign({},h),da="object"==typeof window,q="function"==typeof importScripts,ea="object"==typeof process&&"object"==typeof process.versions&&"string"==typeof process.versions.node,t="",u,v;
if(ea){const {createRequire:b}=await import("module");var require=b(import.meta.url),fs=require("fs"),fa=require("path");q?t=fa.dirname(t)+"/":t=require("url").fileURLToPath(new URL("./",import.meta.url));u=(a,c)=>{a=a.startsWith("file://")?new URL(a):fa.normalize(a);return fs.readFileSync(a,c?void 0:"utf8")};v=a=>{a=u(a,!0);a.buffer||(a=new Uint8Array(a));return a};process.argv.slice(2);h.inspect=()=>"[Emscripten Module object]"}else if(da||q)q?t=self.location.href:
"undefined"!=typeof document&&document.currentScript&&(t=document.currentScript.src),_scriptDir&&(t=_scriptDir),0!==t.indexOf("blob:")?t=t.substr(0,t.replace(/[?#].*/,"").lastIndexOf("/")+1):t="",u=b=>{var a=new XMLHttpRequest;a.open("GET",b,!1);a.send(null);return a.responseText},q&&(v=b=>{var a=new XMLHttpRequest;a.open("GET",b,!1);a.responseType="arraybuffer";a.send(null);return new Uint8Array(a.response)});console.log.bind(console);var w=console.error.bind(console);Object.assign(h,ca);ca=null;
"object"!=typeof WebAssembly&&x("no native wasm support detected");var y,ha=!1,z,A,B,C,D,E,ia,ja;function ka(){var b=y.buffer;h.HEAP8=z=new Int8Array(b);h.HEAP16=B=new Int16Array(b);h.HEAP32=D=new Int32Array(b);h.HEAPU8=A=new Uint8Array(b);h.HEAPU16=C=new Uint16Array(b);h.HEAPU32=E=new Uint32Array(b);h.HEAPF32=ia=new Float32Array(b);h.HEAPF64=ja=new Float64Array(b)}var G,la=[],ma=[],na=[],H=0,I=null,J=null;
function x(b){b="Aborted("+b+")";w(b);ha=!0;b=new WebAssembly.RuntimeError(b+". Build with -sASSERTIONS for more info.");p(b);throw b;}function oa(b){return b.startsWith("data:application/octet-stream;base64,")}var K;h.locateFile?(K="markdown.wasm",oa(K)||(K=t+K)):K=(new URL("markdown.wasm",import.meta.url)).href;function pa(b){try{if(v)return v(b);throw"both async and sync fetching of the wasm failed";}catch(a){x(a)}}
function qa(b){return(da||q)&&"function"==typeof fetch?fetch(b,{credentials:"same-origin"}).then(a=>{if(!a.ok)throw"failed to load wasm binary file at '"+b+"'";return a.arrayBuffer()}).catch(()=>pa(b)):Promise.resolve().then(()=>pa(b))}function ra(b,a,c){return qa(b).then(d=>WebAssembly.instantiate(d,a)).then(d=>d).then(c,d=>{w("failed to asynchronously prepare wasm: "+d);x(d)})}
function sa(b,a){var c=K;return"function"!=typeof WebAssembly.instantiateStreaming||oa(c)||ea||"function"!=typeof fetch?ra(c,b,a):fetch(c,{credentials:"same-origin"}).then(d=>WebAssembly.instantiateStreaming(d,b).then(a,function(e){w("wasm streaming compile failed: "+e);w("falling back to ArrayBuffer instantiation");return ra(c,b,a)}))}function L(b){for(;0<b.length;)b.shift()(h)}
function M(b){switch(b){case 1:return 0;case 2:return 1;case 4:return 2;case 8:return 3;default:throw new TypeError(`Unknown type size: ${b}`);}}var ta=void 0;function N(b){for(var a="";A[b];)a+=ta[A[b++]];return a}var P={},ua={},va={};function wa(b){if(void 0===b)return"_unknown";b=b.replace(/[^a-zA-Z0-9_]/g,"$");var a=b.charCodeAt(0);return 48<=a&&57>=a?`_${b}`:b}function xa(b,a){b=wa(b);return{[b]:function(){return a.apply(this,arguments)}}[b]}
function ya(b){var a=Error,c=xa(b,function(d){this.name=b;this.message=d;d=Error(d).stack;void 0!==d&&(this.stack=this.toString()+"\n"+d.replace(/^Error(:[^\n]*)?\n/,""))});c.prototype=Object.create(a.prototype);c.prototype.constructor=c;c.prototype.toString=function(){return void 0===this.message?this.name:`${this.name}: ${this.message}`};return c}var za=void 0;function Q(b){throw new za(b);}
function R(b,a,c={}){if(!("argPackAdvance"in a))throw new TypeError("registerType registeredInstance requires argPackAdvance");var d=a.name;b||Q(`type "${d}" must have a positive integer typeid pointer`);if(ua.hasOwnProperty(b)){if(c.H)return;Q(`Cannot register type '${d}' twice`)}ua[b]=a;delete va[b];P.hasOwnProperty(b)&&(a=P[b],delete P[b],a.forEach(e=>e()))}
var S=new function(){this.A=[void 0];this.C=[];this.get=function(b){return this.A[b]};this.has=function(b){return void 0!==this.A[b]};this.F=function(b){var a=this.C.pop()||this.A.length;this.A[a]=b;return a};this.G=function(b){this.A[b]=void 0;this.C.push(b)}},Aa=b=>{switch(b){case void 0:return 1;case null:return 2;case !0:return 3;case !1:return 4;default:return S.F({I:1,value:b})}};function T(b){return this.fromWireType(D[b>>2])}
function Ba(b,a){switch(a){case 2:return function(c){return this.fromWireType(ia[c>>2])};case 3:return function(c){return this.fromWireType(ja[c>>3])};default:throw new TypeError("Unknown float type: "+b);}}
function Ca(b,a,c){switch(a){case 0:return c?function(d){return z[d]}:function(d){return A[d]};case 1:return c?function(d){return B[d>>1]}:function(d){return C[d>>1]};case 2:return c?function(d){return D[d>>2]}:function(d){return E[d>>2]};default:throw new TypeError("Unknown integer type: "+b);}}var Da="undefined"!=typeof TextDecoder?new TextDecoder("utf8"):void 0;
function Ea(b,a,c){var d=a+c;for(c=a;b[c]&&!(c>=d);)++c;if(16<c-a&&b.buffer&&Da)return Da.decode(b.subarray(a,c));for(d="";a<c;){var e=b[a++];if(e&128){var g=b[a++]&63;if(192==(e&224))d+=String.fromCharCode((e&31)<<6|g);else{var f=b[a++]&63;e=224==(e&240)?(e&15)<<12|g<<6|f:(e&7)<<18|g<<12|f<<6|b[a++]&63;65536>e?d+=String.fromCharCode(e):(e-=65536,d+=String.fromCharCode(55296|e>>10,56320|e&1023))}}else d+=String.fromCharCode(e)}return d}
var Fa="undefined"!=typeof TextDecoder?new TextDecoder("utf-16le"):void 0;function Ga(b,a){var c=b>>1;for(var d=c+a/2;!(c>=d)&&C[c];)++c;c<<=1;if(32<c-b&&Fa)return Fa.decode(A.subarray(b,c));c="";for(d=0;!(d>=a/2);++d){var e=B[b+2*d>>1];if(0==e)break;c+=String.fromCharCode(e)}return c}function Ha(b,a,c){void 0===c&&(c=2147483647);if(2>c)return 0;c-=2;var d=a;c=c<2*b.length?c/2:b.length;for(var e=0;e<c;++e)B[a>>1]=b.charCodeAt(e),a+=2;B[a>>1]=0;return a-d}function Ia(b){return 2*b.length}
function Ja(b,a){for(var c=0,d="";!(c>=a/4);){var e=D[b+4*c>>2];if(0==e)break;++c;65536<=e?(e-=65536,d+=String.fromCharCode(55296|e>>10,56320|e&1023)):d+=String.fromCharCode(e)}return d}function Ka(b,a,c){void 0===c&&(c=2147483647);if(4>c)return 0;var d=a;c=d+c-4;for(var e=0;e<b.length;++e){var g=b.charCodeAt(e);if(55296<=g&&57343>=g){var f=b.charCodeAt(++e);g=65536+((g&1023)<<10)|f&1023}D[a>>2]=g;a+=4;if(a+4>c)break}D[a>>2]=0;return a-d}
function La(b){for(var a=0,c=0;c<b.length;++c){var d=b.charCodeAt(c);55296<=d&&57343>=d&&++c;a+=4}return a}var U=[];function Ma(b){var a=U[b];a||(b>=U.length&&(U.length=b+1),U[b]=a=G.get(b));return a}for(var V=void 0,W=[],Na=Array(256),X=0;256>X;++X)Na[X]=String.fromCharCode(X);ta=Na;za=h.BindingError=ya("BindingError");h.InternalError=ya("InternalError");S.A.push({value:void 0},{value:null},{value:!0},{value:!1});S.D=S.A.length;
h.count_emval_handles=function(){for(var b=0,a=S.D;a<S.A.length;++a)void 0!==S.A[a]&&++b;return b};
var Pa={i:function(){},j:function(b,a,c,d,e){var g=M(c);a=N(a);R(b,{name:a,fromWireType:function(f){return!!f},toWireType:function(f,k){return k?d:e},argPackAdvance:8,readValueFromPointer:function(f){if(1===c)var k=z;else if(2===c)k=B;else if(4===c)k=D;else throw new TypeError("Unknown boolean type size: "+a);return this.fromWireType(k[f>>g])},B:null})},h:function(b,a){a=N(a);R(b,{name:a,fromWireType:function(c){c||Q("Cannot use deleted val. handle = "+c);var d=S.get(c).value;c>=S.D&&0===--S.get(c).I&&
S.G(c);return d},toWireType:function(c,d){return Aa(d)},argPackAdvance:8,readValueFromPointer:T,B:null})},d:function(b,a,c){c=M(c);a=N(a);R(b,{name:a,fromWireType:function(d){return d},toWireType:function(d,e){return e},argPackAdvance:8,readValueFromPointer:Ba(a,c),B:null})},b:function(b,a,c,d,e){a=N(a);-1===e&&(e=4294967295);e=M(c);var g=k=>k;if(0===d){var f=32-8*c;g=k=>k<<f>>>f}c=a.includes("unsigned")?function(k,l){return l>>>0}:function(k,l){return l};R(b,{name:a,fromWireType:g,toWireType:c,argPackAdvance:8,
readValueFromPointer:Ca(a,e,0!==d),B:null})},a:function(b,a,c){function d(g){g>>=2;var f=E;return new e(f.buffer,f[g+1],f[g])}var e=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array][a];c=N(c);R(b,{name:c,fromWireType:d,argPackAdvance:8,readValueFromPointer:d},{H:!0})},e:function(b,a){a=N(a);var c="std::string"===a;R(b,{name:a,fromWireType:function(d){var e=E[d>>2],g=d+4;if(c)for(var f=g,k=0;k<=e;++k){var l=g+k;if(k==e||0==A[l]){f=f?Ea(A,f,l-f):"";if(void 0===
m)var m=f;else m+=String.fromCharCode(0),m+=f;f=l+1}}else{m=Array(e);for(k=0;k<e;++k)m[k]=String.fromCharCode(A[g+k]);m=m.join("")}Y(d);return m},toWireType:function(d,e){e instanceof ArrayBuffer&&(e=new Uint8Array(e));var g,f="string"==typeof e;f||e instanceof Uint8Array||e instanceof Uint8ClampedArray||e instanceof Int8Array||Q("Cannot pass non-string to std::string");var k;if(c&&f)for(g=k=0;g<e.length;++g){var l=e.charCodeAt(g);127>=l?k++:2047>=l?k+=2:55296<=l&&57343>=l?(k+=4,++g):k+=3}else k=
e.length;g=k;k=Oa(4+g+1);l=k+4;E[k>>2]=g;if(c&&f){if(f=l,l=g+1,g=A,0<l){l=f+l-1;for(var m=0;m<e.length;++m){var n=e.charCodeAt(m);if(55296<=n&&57343>=n){var r=e.charCodeAt(++m);n=65536+((n&1023)<<10)|r&1023}if(127>=n){if(f>=l)break;g[f++]=n}else{if(2047>=n){if(f+1>=l)break;g[f++]=192|n>>6}else{if(65535>=n){if(f+2>=l)break;g[f++]=224|n>>12}else{if(f+3>=l)break;g[f++]=240|n>>18;g[f++]=128|n>>12&63}g[f++]=128|n>>6&63}g[f++]=128|n&63}}g[f]=0}}else if(f)for(f=0;f<g;++f)m=e.charCodeAt(f),255<m&&(Y(l),Q("String has UTF-16 code units that do not fit in 8 bits")),
A[l+f]=m;else for(f=0;f<g;++f)A[l+f]=e[f];null!==d&&d.push(Y,k);return k},argPackAdvance:8,readValueFromPointer:T,B:function(d){Y(d)}})},c:function(b,a,c){c=N(c);if(2===a){var d=Ga;var e=Ha;var g=Ia;var f=()=>C;var k=1}else 4===a&&(d=Ja,e=Ka,g=La,f=()=>E,k=2);R(b,{name:c,fromWireType:function(l){for(var m=E[l>>2],n=f(),r,F=l+4,O=0;O<=m;++O){var ba=l+4+O*a;if(O==m||0==n[ba>>k])F=d(F,ba-F),void 0===r?r=F:(r+=String.fromCharCode(0),r+=F),F=ba+a}Y(l);return r},toWireType:function(l,m){"string"!=typeof m&&
Q(`Cannot pass non-string to C++ string type ${c}`);var n=g(m),r=Oa(4+n+a);E[r>>2]=n>>k;e(m,r+4,n+a);null!==l&&l.push(Y,r);return r},argPackAdvance:8,readValueFromPointer:T,B:function(l){Y(l)}})},k:function(b,a){a=N(a);R(b,{J:!0,name:a,argPackAdvance:0,fromWireType:function(){},toWireType:function(){}})},g:function(b,a,c){A.copyWithin(b,a,a+c)},f:function(b){var a=A.length;b>>>=0;if(2147483648<b)return!1;for(var c=1;4>=c;c*=2){var d=a*(1+.2/c);d=Math.min(d,b+100663296);var e=Math,g=e.min;d=Math.max(b,
d);d+=(65536-d%65536)%65536;a:{var f=y.buffer;try{y.grow(g.call(e,2147483648,d)-f.byteLength+65535>>>16);ka();var k=1;break a}catch(l){}k=void 0}if(k)return!0}return!1}};(function(){var b={a:Pa};H++;sa(b,function(a){h.asm=a.instance.exports;y=h.asm.l;ka();G=h.asm.w;ma.unshift(h.asm.m);H--;0==H&&(null!==I&&(clearInterval(I),I=null),J&&(a=J,J=null,a()))}).catch(p);return{}})();h._wrealloc=function(){return(h._wrealloc=h.asm.n).apply(null,arguments)};
h._wfree=function(){return(h._wfree=h.asm.o).apply(null,arguments)};function Y(){return(Y=h.asm.p).apply(null,arguments)}h._WErrGetCode=function(){return(h._WErrGetCode=h.asm.q).apply(null,arguments)};h._WErrGetMsg=function(){return(h._WErrGetMsg=h.asm.r).apply(null,arguments)};h._WErrClear=function(){return(h._WErrClear=h.asm.s).apply(null,arguments)};h._parseUTF8=function(){return(h._parseUTF8=h.asm.t).apply(null,arguments)};function Oa(){return(Oa=h.asm.u).apply(null,arguments)}
h.__embind_initialize_bindings=function(){return(h.__embind_initialize_bindings=h.asm.v).apply(null,arguments)};h.addOnPostRun=function(b){na.unshift(b)};
h.addFunction=function(b,a){if(!V){V=new WeakMap;var c=G.length;if(V)for(var d=0;d<0+c;d++){var e=Ma(d);e&&V.set(e,d)}}if(c=V.get(b)||0)return c;if(W.length)c=W.pop();else{try{G.grow(1)}catch(k){if(!(k instanceof RangeError))throw k;throw"Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";}c=G.length-1}try{d=c,G.set(d,b),U[d]=G.get(d)}catch(k){if(!(k instanceof TypeError))throw k;if("function"==typeof WebAssembly.Function){d=WebAssembly.Function;e={i:"i32",j:"i64",f:"f32",d:"f64",p:"i32"};for(var g=
{parameters:[],results:"v"==a[0]?[]:[e[a[0]]]},f=1;f<a.length;++f)g.parameters.push(e[a[f]]);a=new d(g,b)}else{d=[1];e=a.slice(0,1);a=a.slice(1);g={i:127,p:127,j:126,f:125,d:124};d.push(96);f=a.length;128>f?d.push(f):d.push(f%128|128,f>>7);for(f=0;f<a.length;++f)d.push(g[a[f]]);"v"==e?d.push(0):d.push(1,g[e]);a=[0,97,115,109,1,0,0,0,1];e=d.length;128>e?a.push(e):a.push(e%128|128,e>>7);a.push.apply(a,d);a.push(2,7,1,1,101,1,102,0,0,7,5,1,1,102,0,0);a=new WebAssembly.Module(new Uint8Array(a));a=(new WebAssembly.Instance(a,
{e:{f:b}})).exports.f}d=c;G.set(d,a);U[d]=G.get(d)}V.set(b,c);return c};h.removeFunction=function(b){V.delete(Ma(b));W.push(b)};h.UTF8ArrayToString=Ea;var Z;J=function Qa(){Z||Ra();Z||(J=Qa)};function Ra(){0<H||(L(la),0<H||Z||(Z=!0,h.calledRun=!0,ha||(L(ma),aa(h),L(na))))}Ra();


  return Module.ready
}

);
})();
export default Module;