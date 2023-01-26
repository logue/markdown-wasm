
var Module = (() => {
  var _scriptDir = import.meta.url;
  
  return (
async function(Module) {
  Module = Module || {};


var e;e||(e=typeof Module !== 'undefined' ? Module : {});var aa,p;e.ready=new Promise(function(b,a){aa=b;p=a});var ba=Object.assign({},e),ca="object"==typeof window,q="function"==typeof importScripts,da="object"==typeof process&&"object"==typeof process.versions&&"string"==typeof process.versions.node,t="",u,v;
if(da){const {createRequire:b}=await import("module");var require=b(import.meta.url),fs=require("fs"),fa=require("path");q?t=fa.dirname(t)+"/":t=require("url").fileURLToPath(new URL("./",import.meta.url));u=(a,c)=>{a=a.startsWith("file://")?new URL(a):fa.normalize(a);return fs.readFileSync(a,c?void 0:"utf8")};v=a=>{a=u(a,!0);a.buffer||(a=new Uint8Array(a));return a};1<process.argv.length&&process.argv[1].replace(/\\/g,"/");process.argv.slice(2);process.on("uncaughtException",
function(a){throw a;});process.on("unhandledRejection",function(a){throw a;});e.inspect=function(){return"[Emscripten Module object]"}}else if(ca||q)q?t=self.location.href:"undefined"!=typeof document&&document.currentScript&&(t=document.currentScript.src),_scriptDir&&(t=_scriptDir),0!==t.indexOf("blob:")?t=t.substr(0,t.replace(/[?#].*/,"").lastIndexOf("/")+1):t="",u=b=>{var a=new XMLHttpRequest;a.open("GET",b,!1);a.send(null);return a.responseText},q&&(v=b=>{var a=new XMLHttpRequest;a.open("GET",
b,!1);a.responseType="arraybuffer";a.send(null);return new Uint8Array(a.response)});e.print||console.log.bind(console);var w=e.printErr||console.warn.bind(console);Object.assign(e,ba);ba=null;var x;e.wasmBinary&&(x=e.wasmBinary);var noExitRuntime=e.noExitRuntime||!0;"object"!=typeof WebAssembly&&y("no native wasm support detected");var z,ha=!1,ia="undefined"!=typeof TextDecoder?new TextDecoder("utf8"):void 0;
function ja(b,a,c){var d=a+c;for(c=a;b[c]&&!(c>=d);)++c;if(16<c-a&&b.buffer&&ia)return ia.decode(b.subarray(a,c));for(d="";a<c;){var f=b[a++];if(f&128){var h=b[a++]&63;if(192==(f&224))d+=String.fromCharCode((f&31)<<6|h);else{var g=b[a++]&63;f=224==(f&240)?(f&15)<<12|h<<6|g:(f&7)<<18|h<<12|g<<6|b[a++]&63;65536>f?d+=String.fromCharCode(f):(f-=65536,d+=String.fromCharCode(55296|f>>10,56320|f&1023))}}else d+=String.fromCharCode(f)}return d}var A,B,C,D,E,F,H,ka,la;
function ma(){var b=z.buffer;A=b;e.HEAP8=B=new Int8Array(b);e.HEAP16=D=new Int16Array(b);e.HEAP32=F=new Int32Array(b);e.HEAPU8=C=new Uint8Array(b);e.HEAPU16=E=new Uint16Array(b);e.HEAPU32=H=new Uint32Array(b);e.HEAPF32=ka=new Float32Array(b);e.HEAPF64=la=new Float64Array(b)}var I,na=[],oa=[],pa=[];function qa(){var b=e.preRun.shift();na.unshift(b)}function ra(b){pa.unshift(b)}var J=0,K=null,L=null;
function y(b){if(e.onAbort)e.onAbort(b);b="Aborted("+b+")";w(b);ha=!0;b=new WebAssembly.RuntimeError(b+". Build with -sASSERTIONS for more info.");p(b);throw b;}function sa(){return M.startsWith("data:application/octet-stream;base64,")}var M;if(e.locateFile){if(M="markdown.wasm",!sa()){var ta=M;M=e.locateFile?e.locateFile(ta,t):t+ta}}else M=(new URL("markdown.wasm",import.meta.url)).href;
function ua(){var b=M;try{if(b==M&&x)return new Uint8Array(x);if(v)return v(b);throw"both async and sync fetching of the wasm failed";}catch(a){y(a)}}function va(){return x||!ca&&!q||"function"!=typeof fetch?Promise.resolve().then(function(){return ua()}):fetch(M,{credentials:"same-origin"}).then(function(b){if(!b.ok)throw"failed to load wasm binary file at '"+M+"'";return b.arrayBuffer()}).catch(function(){return ua()})}function N(b){for(;0<b.length;)b.shift()(e)}
function O(b){switch(b){case 1:return 0;case 2:return 1;case 4:return 2;case 8:return 3;default:throw new TypeError("Unknown type size: "+b);}}var wa=void 0;function Q(b){for(var a="";C[b];)a+=wa[C[b++]];return a}var R={},xa={},ya={};function za(b,a){if(void 0===b)b="_unknown";else{b=b.replace(/[^a-zA-Z0-9_]/g,"$");var c=b.charCodeAt(0);b=48<=c&&57>=c?"_"+b:b}return(new Function("body","return function "+b+'() {\n    "use strict";    return body.apply(this, arguments);\n};\n'))(a)}
function Aa(b){var a=Error,c=za(b,function(d){this.name=b;this.message=d;d=Error(d).stack;void 0!==d&&(this.stack=this.toString()+"\n"+d.replace(/^Error(:[^\n]*)?\n/,""))});c.prototype=Object.create(a.prototype);c.prototype.constructor=c;c.prototype.toString=function(){return void 0===this.message?this.name:this.name+": "+this.message};return c}var Ba=void 0;function S(b){throw new Ba(b);}
function T(b,a,c={}){if(!("argPackAdvance"in a))throw new TypeError("registerType registeredInstance requires argPackAdvance");var d=a.name;b||S('type "'+d+'" must have a positive integer typeid pointer');if(xa.hasOwnProperty(b)){if(c.B)return;S("Cannot register type '"+d+"' twice")}xa[b]=a;delete ya[b];R.hasOwnProperty(b)&&(a=R[b],delete R[b],a.forEach(f=>f()))}
var Ca=[],U=[{},{value:void 0},{value:null},{value:!0},{value:!1}],Da=b=>{switch(b){case void 0:return 1;case null:return 2;case !0:return 3;case !1:return 4;default:var a=Ca.length?Ca.pop():U.length;U[a]={C:1,value:b};return a}};function Ea(b){return this.fromWireType(F[b>>2])}function Fa(b,a){switch(a){case 2:return function(c){return this.fromWireType(ka[c>>2])};case 3:return function(c){return this.fromWireType(la[c>>3])};default:throw new TypeError("Unknown float type: "+b);}}
function Ga(b,a,c){switch(a){case 0:return c?function(d){return B[d]}:function(d){return C[d]};case 1:return c?function(d){return D[d>>1]}:function(d){return E[d>>1]};case 2:return c?function(d){return F[d>>2]}:function(d){return H[d>>2]};default:throw new TypeError("Unknown integer type: "+b);}}var Ha="undefined"!=typeof TextDecoder?new TextDecoder("utf-16le"):void 0;
function Ia(b,a){var c=b>>1;for(var d=c+a/2;!(c>=d)&&E[c];)++c;c<<=1;if(32<c-b&&Ha)return Ha.decode(C.subarray(b,c));c="";for(d=0;!(d>=a/2);++d){var f=D[b+2*d>>1];if(0==f)break;c+=String.fromCharCode(f)}return c}function Ja(b,a,c){void 0===c&&(c=2147483647);if(2>c)return 0;c-=2;var d=a;c=c<2*b.length?c/2:b.length;for(var f=0;f<c;++f)D[a>>1]=b.charCodeAt(f),a+=2;D[a>>1]=0;return a-d}function Ka(b){return 2*b.length}
function La(b,a){for(var c=0,d="";!(c>=a/4);){var f=F[b+4*c>>2];if(0==f)break;++c;65536<=f?(f-=65536,d+=String.fromCharCode(55296|f>>10,56320|f&1023)):d+=String.fromCharCode(f)}return d}function Ma(b,a,c){void 0===c&&(c=2147483647);if(4>c)return 0;var d=a;c=d+c-4;for(var f=0;f<b.length;++f){var h=b.charCodeAt(f);if(55296<=h&&57343>=h){var g=b.charCodeAt(++f);h=65536+((h&1023)<<10)|g&1023}F[a>>2]=h;a+=4;if(a+4>c)break}F[a>>2]=0;return a-d}
function Na(b){for(var a=0,c=0;c<b.length;++c){var d=b.charCodeAt(c);55296<=d&&57343>=d&&++c;a+=4}return a}var V=[];function Oa(b){var a=V[b];a||(b>=V.length&&(V.length=b+1),V[b]=a=I.get(b));return a}for(var W=void 0,Pa=[],Qa=Array(256),X=0;256>X;++X)Qa[X]=String.fromCharCode(X);wa=Qa;Ba=e.BindingError=Aa("BindingError");e.InternalError=Aa("InternalError");e.count_emval_handles=function(){for(var b=0,a=5;a<U.length;++a)void 0!==U[a]&&++b;return b};
e.get_first_emval=function(){for(var b=5;b<U.length;++b)if(void 0!==U[b])return U[b];return null};
var Sa={i:function(){},j:function(b,a,c,d,f){var h=O(c);a=Q(a);T(b,{name:a,fromWireType:function(g){return!!g},toWireType:function(g,k){return k?d:f},argPackAdvance:8,readValueFromPointer:function(g){if(1===c)var k=B;else if(2===c)k=D;else if(4===c)k=F;else throw new TypeError("Unknown boolean type size: "+a);return this.fromWireType(k[g>>h])},A:null})},h:function(b,a){a=Q(a);T(b,{name:a,fromWireType:function(c){c||S("Cannot use deleted val. handle = "+c);var d=U[c].value;4<c&&0===--U[c].C&&(U[c]=
void 0,Ca.push(c));return d},toWireType:function(c,d){return Da(d)},argPackAdvance:8,readValueFromPointer:Ea,A:null})},e:function(b,a,c){c=O(c);a=Q(a);T(b,{name:a,fromWireType:function(d){return d},toWireType:function(d,f){return f},argPackAdvance:8,readValueFromPointer:Fa(a,c),A:null})},b:function(b,a,c,d,f){a=Q(a);-1===f&&(f=4294967295);f=O(c);var h=k=>k;if(0===d){var g=32-8*c;h=k=>k<<g>>>g}c=a.includes("unsigned")?function(k,l){return l>>>0}:function(k,l){return l};T(b,{name:a,fromWireType:h,toWireType:c,
argPackAdvance:8,readValueFromPointer:Ga(a,f,0!==d),A:null})},a:function(b,a,c){function d(h){h>>=2;var g=H;return new f(A,g[h+1],g[h])}var f=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array][a];c=Q(c);T(b,{name:c,fromWireType:d,argPackAdvance:8,readValueFromPointer:d},{B:!0})},d:function(b,a){a=Q(a);var c="std::string"===a;T(b,{name:a,fromWireType:function(d){var f=H[d>>2],h=d+4;if(c)for(var g=h,k=0;k<=f;++k){var l=h+k;if(k==f||0==C[l]){g=g?ja(C,g,l-g):
"";if(void 0===m)var m=g;else m+=String.fromCharCode(0),m+=g;g=l+1}}else{m=Array(f);for(k=0;k<f;++k)m[k]=String.fromCharCode(C[h+k]);m=m.join("")}Y(d);return m},toWireType:function(d,f){f instanceof ArrayBuffer&&(f=new Uint8Array(f));var h,g="string"==typeof f;g||f instanceof Uint8Array||f instanceof Uint8ClampedArray||f instanceof Int8Array||S("Cannot pass non-string to std::string");if(c&&g){var k=0;for(h=0;h<f.length;++h){var l=f.charCodeAt(h);127>=l?k++:2047>=l?k+=2:55296<=l&&57343>=l?(k+=4,++h):
k+=3}h=k}else h=f.length;k=Ra(4+h+1);l=k+4;H[k>>2]=h;if(c&&g){if(g=l,l=h+1,h=C,0<l){l=g+l-1;for(var m=0;m<f.length;++m){var n=f.charCodeAt(m);if(55296<=n&&57343>=n){var r=f.charCodeAt(++m);n=65536+((n&1023)<<10)|r&1023}if(127>=n){if(g>=l)break;h[g++]=n}else{if(2047>=n){if(g+1>=l)break;h[g++]=192|n>>6}else{if(65535>=n){if(g+2>=l)break;h[g++]=224|n>>12}else{if(g+3>=l)break;h[g++]=240|n>>18;h[g++]=128|n>>12&63}h[g++]=128|n>>6&63}h[g++]=128|n&63}}h[g]=0}}else if(g)for(g=0;g<h;++g)m=f.charCodeAt(g),255<
m&&(Y(l),S("String has UTF-16 code units that do not fit in 8 bits")),C[l+g]=m;else for(g=0;g<h;++g)C[l+g]=f[g];null!==d&&d.push(Y,k);return k},argPackAdvance:8,readValueFromPointer:Ea,A:function(d){Y(d)}})},c:function(b,a,c){c=Q(c);if(2===a){var d=Ia;var f=Ja;var h=Ka;var g=()=>E;var k=1}else 4===a&&(d=La,f=Ma,h=Na,g=()=>H,k=2);T(b,{name:c,fromWireType:function(l){for(var m=H[l>>2],n=g(),r,G=l+4,P=0;P<=m;++P){var ea=l+4+P*a;if(P==m||0==n[ea>>k])G=d(G,ea-G),void 0===r?r=G:(r+=String.fromCharCode(0),
r+=G),G=ea+a}Y(l);return r},toWireType:function(l,m){"string"!=typeof m&&S("Cannot pass non-string to C++ string type "+c);var n=h(m),r=Ra(4+n+a);H[r>>2]=n>>k;f(m,r+4,n+a);null!==l&&l.push(Y,r);return r},argPackAdvance:8,readValueFromPointer:Ea,A:function(l){Y(l)}})},k:function(b,a){a=Q(a);T(b,{D:!0,name:a,argPackAdvance:0,fromWireType:function(){},toWireType:function(){}})},g:function(b,a,c){C.copyWithin(b,a,a+c)},f:function(b){var a=C.length;b>>>=0;if(2147483648<b)return!1;for(var c=1;4>=c;c*=2){var d=
a*(1+.2/c);d=Math.min(d,b+100663296);var f=Math;d=Math.max(b,d);f=f.min.call(f,2147483648,d+(65536-d%65536)%65536);a:{try{z.grow(f-A.byteLength+65535>>>16);ma();var h=1;break a}catch(g){}h=void 0}if(h)return!0}return!1}};
(function(){function b(f){e.asm=f.exports;z=e.asm.l;ma();I=e.asm.t;oa.unshift(e.asm.m);J--;e.monitorRunDependencies&&e.monitorRunDependencies(J);0==J&&(null!==K&&(clearInterval(K),K=null),L&&(f=L,L=null,f()))}function a(f){b(f.instance)}function c(f){return va().then(function(h){return WebAssembly.instantiate(h,d)}).then(function(h){return h}).then(f,function(h){w("failed to asynchronously prepare wasm: "+h);y(h)})}var d={a:Sa};J++;e.monitorRunDependencies&&e.monitorRunDependencies(J);if(e.instantiateWasm)try{return e.instantiateWasm(d,
b)}catch(f){w("Module.instantiateWasm callback failed with error: "+f),p(f)}(function(){return x||"function"!=typeof WebAssembly.instantiateStreaming||sa()||da||"function"!=typeof fetch?c(a):fetch(M,{credentials:"same-origin"}).then(function(f){return WebAssembly.instantiateStreaming(f,d).then(a,function(h){w("wasm streaming compile failed: "+h);w("falling back to ArrayBuffer instantiation");return c(a)})})})().catch(p);return{}})();
e.___wasm_call_ctors=function(){return(e.___wasm_call_ctors=e.asm.m).apply(null,arguments)};e._wrealloc=function(){return(e._wrealloc=e.asm.n).apply(null,arguments)};e._wfree=function(){return(e._wfree=e.asm.o).apply(null,arguments)};var Y=e._free=function(){return(Y=e._free=e.asm.p).apply(null,arguments)};e._WErrGetCode=function(){return(e._WErrGetCode=e.asm.q).apply(null,arguments)};e._WErrGetMsg=function(){return(e._WErrGetMsg=e.asm.r).apply(null,arguments)};
e._WErrClear=function(){return(e._WErrClear=e.asm.s).apply(null,arguments)};e._parseUTF8=function(){return(e._parseUTF8=e.asm.u).apply(null,arguments)};var Ra=e._malloc=function(){return(Ra=e._malloc=e.asm.v).apply(null,arguments)};e.___getTypeName=function(){return(e.___getTypeName=e.asm.w).apply(null,arguments)};e.__embind_initialize_bindings=function(){return(e.__embind_initialize_bindings=e.asm.x).apply(null,arguments)};e.UTF8ArrayToString=ja;e.addOnPostRun=ra;
e.addFunction=function(b,a){if(!W){W=new WeakMap;var c=I.length;if(W)for(var d=0;d<0+c;d++){var f=Oa(d);f&&W.set(f,d)}}if(W.has(b))return W.get(b);if(Pa.length)c=Pa.pop();else{try{I.grow(1)}catch(k){if(!(k instanceof RangeError))throw k;throw"Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";}c=I.length-1}try{d=c,I.set(d,b),V[d]=I.get(d)}catch(k){if(!(k instanceof TypeError))throw k;if("function"==typeof WebAssembly.Function){d=WebAssembly.Function;f={i:"i32",j:"i32",f:"f32",d:"f64",p:"i32"};for(var h=
{parameters:[],results:"v"==a[0]?[]:[f[a[0]]]},g=1;g<a.length;++g)h.parameters.push(f[a[g]]),"j"===a[g]&&h.parameters.push("i32");a=new d(h,b)}else{d=[1];f=a.slice(0,1);a=a.slice(1);h={i:127,p:127,j:126,f:125,d:124};d.push(96);g=a.length;128>g?d.push(g):d.push(g%128|128,g>>7);for(g=0;g<a.length;++g)d.push(h[a[g]]);"v"==f?d.push(0):d.push(1,h[f]);a=[0,97,115,109,1,0,0,0,1];f=d.length;128>f?a.push(f):a.push(f%128|128,f>>7);a.push.apply(a,d);a.push(2,7,1,1,101,1,102,0,0,7,5,1,1,102,0,0);a=new WebAssembly.Module(new Uint8Array(a));
a=(new WebAssembly.Instance(a,{e:{f:b}})).exports.f}d=c;I.set(d,a);V[d]=I.get(d)}W.set(b,c);return c};e.removeFunction=function(b){W.delete(Oa(b));Pa.push(b)};var Z;L=function Ta(){Z||Ua();Z||(L=Ta)};
function Ua(){function b(){if(!Z&&(Z=!0,e.calledRun=!0,!ha)){N(oa);aa(e);if(e.onRuntimeInitialized)e.onRuntimeInitialized();if(e.postRun)for("function"==typeof e.postRun&&(e.postRun=[e.postRun]);e.postRun.length;)ra(e.postRun.shift());N(pa)}}if(!(0<J)){if(e.preRun)for("function"==typeof e.preRun&&(e.preRun=[e.preRun]);e.preRun.length;)qa();N(na);0<J||(e.setStatus?(e.setStatus("Running..."),setTimeout(function(){setTimeout(function(){e.setStatus("")},1);b()},1)):b())}}
if(e.preInit)for("function"==typeof e.preInit&&(e.preInit=[e.preInit]);0<e.preInit.length;)e.preInit.pop()();Ua();


  return Module.ready
}
);
})();
export default Module;