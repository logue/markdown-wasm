(function () {
  const l = document.createElement('link').relList;
  if (l && l.supports && l.supports('modulepreload')) return;
  for (const d of document.querySelectorAll('link[rel="modulepreload"]')) g(d);
  new MutationObserver(d => {
    for (const m of d)
      if (m.type === 'childList')
        for (const y of m.addedNodes)
          y.tagName === 'LINK' && y.rel === 'modulepreload' && g(y);
  }).observe(document, { childList: !0, subtree: !0 });
  function t(d) {
    const m = {};
    return (
      d.integrity && (m.integrity = d.integrity),
      d.referrerpolicy && (m.referrerPolicy = d.referrerpolicy),
      d.crossorigin === 'use-credentials'
        ? (m.credentials = 'include')
        : d.crossorigin === 'anonymous'
        ? (m.credentials = 'omit')
        : (m.credentials = 'same-origin'),
      m
    );
  }
  function g(d) {
    if (d.ep) return;
    d.ep = !0;
    const m = t(d);
    fetch(d.href, m);
  }
})();
const Kr = 'modulepreload',
  Gr = function (f, l) {
    return new URL(f, l).href;
  },
  Ne = {},
  $r = function (l, t, g) {
    if (!t || t.length === 0) return l();
    const d = document.getElementsByTagName('link');
    return Promise.all(
      t.map(m => {
        if (((m = Gr(m, g)), m in Ne)) return;
        Ne[m] = !0;
        const y = m.endsWith('.css'),
          R = y ? '[rel="stylesheet"]' : '';
        if (!!g)
          for (let F = d.length - 1; F >= 0; F--) {
            const A = d[F];
            if (A.href === m && (!y || A.rel === 'stylesheet')) return;
          }
        else if (document.querySelector(`link[href="${m}"]${R}`)) return;
        const v = document.createElement('link');
        if (
          ((v.rel = y ? 'stylesheet' : Kr),
          y || ((v.as = 'script'), (v.crossOrigin = '')),
          (v.href = m),
          document.head.appendChild(v),
          y)
        )
          return new Promise((F, A) => {
            v.addEventListener('load', F),
              v.addEventListener('error', () =>
                A(new Error(`Unable to preload CSS for ${m}`))
              );
          });
      })
    ).then(() => l());
  };
var Xr = (() => {
  var f = import.meta.url;
  return async function (t) {
    t = t || {};
    var t = typeof t < 'u' ? t : {},
      g,
      d;
    t.ready = new Promise(function (e, r) {
      (g = e), (d = r);
    });
    var m = Object.assign({}, t),
      y = typeof window == 'object',
      R = typeof importScripts == 'function',
      P =
        typeof process == 'object' &&
        typeof process.versions == 'object' &&
        typeof process.versions.node == 'string',
      v = '';
    function F(e) {
      return t.locateFile ? t.locateFile(e, v) : v + e;
    }
    var A, N, G;
    if (P) {
      const { createRequire: e } = await $r(
        () =>
          Promise.resolve().then(function () {
            return an;
          }),
        void 0,
        import.meta.url
      );
      var Q = e(import.meta.url),
        ve = Q('fs'),
        ee = Q('path');
      R
        ? (v = ee.dirname(v) + '/')
        : (v = Q('url').fileURLToPath(new URL('./', self.location))),
        (A = (r, n) => (
          (r = q(r) ? new URL(r) : ee.normalize(r)),
          ve.readFileSync(r, n ? void 0 : 'utf8')
        )),
        (G = r => {
          var n = A(r, !0);
          return n.buffer || (n = new Uint8Array(n)), n;
        }),
        (N = (r, n, i) => {
          (r = q(r) ? new URL(r) : ee.normalize(r)),
            ve.readFile(r, function (o, s) {
              o ? i(o) : n(s.buffer);
            });
        }),
        process.argv.length > 1 && process.argv[1].replace(/\\/g, '/'),
        process.argv.slice(2),
        process.on('uncaughtException', function (r) {
          if (!(r instanceof ir)) throw r;
        }),
        process.on('unhandledRejection', function (r) {
          throw r;
        }),
        (t.inspect = function () {
          return '[Emscripten Module object]';
        });
    } else
      (y || R) &&
        (R
          ? (v = self.location.href)
          : typeof document < 'u' &&
            document.currentScript &&
            (v = document.currentScript.src),
        f && (v = f),
        v.indexOf('blob:') !== 0
          ? (v = v.substr(0, v.replace(/[?#].*/, '').lastIndexOf('/') + 1))
          : (v = ''),
        (A = e => {
          var r = new XMLHttpRequest();
          return r.open('GET', e, !1), r.send(null), r.responseText;
        }),
        R &&
          (G = e => {
            var r = new XMLHttpRequest();
            return (
              r.open('GET', e, !1),
              (r.responseType = 'arraybuffer'),
              r.send(null),
              new Uint8Array(r.response)
            );
          }),
        (N = (e, r, n) => {
          var i = new XMLHttpRequest();
          i.open('GET', e, !0),
            (i.responseType = 'arraybuffer'),
            (i.onload = () => {
              if (i.status == 200 || (i.status == 0 && i.response)) {
                r(i.response);
                return;
              }
              n();
            }),
            (i.onerror = n),
            i.send(null);
        }));
    t.print;
    var D = t.printErr || void 0;
    Object.assign(t, m),
      (m = null),
      t.arguments && t.arguments,
      t.thisProgram && t.thisProgram,
      t.quit && t.quit;
    var V;
    t.wasmBinary && (V = t.wasmBinary),
      t.noExitRuntime,
      typeof WebAssembly != 'object' && te('no native wasm support detected');
    var $,
      ge = !1,
      he = typeof TextDecoder < 'u' ? new TextDecoder('utf8') : void 0;
    function je(e, r, n) {
      for (var i = r + n, o = r; e[o] && !(o >= i); ) ++o;
      if (o - r > 16 && e.buffer && he) return he.decode(e.subarray(r, o));
      for (var s = ''; r < o; ) {
        var a = e[r++];
        if (!(a & 128)) {
          s += String.fromCharCode(a);
          continue;
        }
        var u = e[r++] & 63;
        if ((a & 224) == 192) {
          s += String.fromCharCode(((a & 31) << 6) | u);
          continue;
        }
        var c = e[r++] & 63;
        if (
          ((a & 240) == 224
            ? (a = ((a & 15) << 12) | (u << 6) | c)
            : (a = ((a & 7) << 18) | (u << 12) | (c << 6) | (e[r++] & 63)),
          a < 65536)
        )
          s += String.fromCharCode(a);
        else {
          var p = a - 65536;
          s += String.fromCharCode(55296 | (p >> 10), 56320 | (p & 1023));
        }
      }
      return s;
    }
    function Ke(e, r) {
      return e ? je(T, e, r) : '';
    }
    function Ge(e, r, n, i) {
      if (!(i > 0)) return 0;
      for (var o = n, s = n + i - 1, a = 0; a < e.length; ++a) {
        var u = e.charCodeAt(a);
        if (u >= 55296 && u <= 57343) {
          var c = e.charCodeAt(++a);
          u = (65536 + ((u & 1023) << 10)) | (c & 1023);
        }
        if (u <= 127) {
          if (n >= s) break;
          r[n++] = u;
        } else if (u <= 2047) {
          if (n + 1 >= s) break;
          (r[n++] = 192 | (u >> 6)), (r[n++] = 128 | (u & 63));
        } else if (u <= 65535) {
          if (n + 2 >= s) break;
          (r[n++] = 224 | (u >> 12)),
            (r[n++] = 128 | ((u >> 6) & 63)),
            (r[n++] = 128 | (u & 63));
        } else {
          if (n + 3 >= s) break;
          (r[n++] = 240 | (u >> 18)),
            (r[n++] = 128 | ((u >> 12) & 63)),
            (r[n++] = 128 | ((u >> 6) & 63)),
            (r[n++] = 128 | (u & 63));
        }
      }
      return (r[n] = 0), n - o;
    }
    function $e(e, r, n) {
      return Ge(e, T, r, n);
    }
    function Xe(e) {
      for (var r = 0, n = 0; n < e.length; ++n) {
        var i = e.charCodeAt(n);
        i <= 127
          ? r++
          : i <= 2047
          ? (r += 2)
          : i >= 55296 && i <= 57343
          ? ((r += 4), ++n)
          : (r += 3);
      }
      return r;
    }
    var re, ne, T, B, X, W, S, ye, _e;
    function we(e) {
      (re = e),
        (t.HEAP8 = ne = new Int8Array(e)),
        (t.HEAP16 = B = new Int16Array(e)),
        (t.HEAP32 = W = new Int32Array(e)),
        (t.HEAPU8 = T = new Uint8Array(e)),
        (t.HEAPU16 = X = new Uint16Array(e)),
        (t.HEAPU32 = S = new Uint32Array(e)),
        (t.HEAPF32 = ye = new Float32Array(e)),
        (t.HEAPF64 = _e = new Float64Array(e));
    }
    t.INITIAL_MEMORY;
    var M,
      Ee = [],
      Ae = [],
      Te = [];
    function qe() {
      if (t.preRun)
        for (
          typeof t.preRun == 'function' && (t.preRun = [t.preRun]);
          t.preRun.length;

        )
          Ye(t.preRun.shift());
      ie(Ee);
    }
    function Je() {
      ie(Ae);
    }
    function ze() {
      if (t.postRun)
        for (
          typeof t.postRun == 'function' && (t.postRun = [t.postRun]);
          t.postRun.length;

        )
          be(t.postRun.shift());
      ie(Te);
    }
    function Ye(e) {
      Ee.unshift(e);
    }
    function Ze(e) {
      Ae.unshift(e);
    }
    function be(e) {
      Te.unshift(e);
    }
    var H = 0,
      j = null;
    function Qe(e) {
      H++, t.monitorRunDependencies && t.monitorRunDependencies(H);
    }
    function er(e) {
      if (
        (H--,
        t.monitorRunDependencies && t.monitorRunDependencies(H),
        H == 0 && j)
      ) {
        var r = j;
        (j = null), r();
      }
    }
    function te(e) {
      t.onAbort && t.onAbort(e),
        (e = 'Aborted(' + e + ')'),
        D(e),
        (ge = !0),
        (e += '. Build with -sASSERTIONS for more info.');
      var r = new WebAssembly.RuntimeError(e);
      throw (d(r), r);
    }
    var rr = 'data:application/octet-stream;base64,';
    function Re(e) {
      return e.startsWith(rr);
    }
    function q(e) {
      return e.startsWith('file://');
    }
    var w;
    t.locateFile
      ? ((w = 'markdown.wasm'), Re(w) || (w = F(w)))
      : (w = new URL(
          '' + new URL('markdown-e0577192.wasm', import.meta.url).href,
          self.location
        ).href);
    function Fe(e) {
      try {
        if (e == w && V) return new Uint8Array(V);
        if (G) return G(e);
        throw 'both async and sync fetching of the wasm failed';
      } catch (r) {
        te(r);
      }
    }
    function nr() {
      if (!V && (y || R)) {
        if (typeof fetch == 'function' && !q(w))
          return fetch(w, { credentials: 'same-origin' })
            .then(function (e) {
              if (!e.ok) throw "failed to load wasm binary file at '" + w + "'";
              return e.arrayBuffer();
            })
            .catch(function () {
              return Fe(w);
            });
        if (N)
          return new Promise(function (e, r) {
            N(
              w,
              function (n) {
                e(new Uint8Array(n));
              },
              r
            );
          });
      }
      return Promise.resolve().then(function () {
        return Fe(w);
      });
    }
    function tr() {
      var e = { a: Vr };
      function r(a, u) {
        var c = a.exports;
        (t.asm = c),
          ($ = t.asm.l),
          we($.buffer),
          (M = t.asm.t),
          Ze(t.asm.m),
          er();
      }
      Qe();
      function n(a) {
        r(a.instance);
      }
      function i(a) {
        return nr()
          .then(function (u) {
            return WebAssembly.instantiate(u, e);
          })
          .then(function (u) {
            return u;
          })
          .then(a, function (u) {
            D('failed to asynchronously prepare wasm: ' + u), te(u);
          });
      }
      function o() {
        return !V &&
          typeof WebAssembly.instantiateStreaming == 'function' &&
          !Re(w) &&
          !q(w) &&
          !P &&
          typeof fetch == 'function'
          ? fetch(w, { credentials: 'same-origin' }).then(function (a) {
              var u = WebAssembly.instantiateStreaming(a, e);
              return u.then(n, function (c) {
                return (
                  D('wasm streaming compile failed: ' + c),
                  D('falling back to ArrayBuffer instantiation'),
                  i(n)
                );
              });
            })
          : i(n);
      }
      if (t.instantiateWasm)
        try {
          var s = t.instantiateWasm(e, r);
          return s;
        } catch (a) {
          D('Module.instantiateWasm callback failed with error: ' + a), d(a);
        }
      return o().catch(d), {};
    }
    function ir(e) {
      (this.name = 'ExitStatus'),
        (this.message = 'Program terminated with exit(' + e + ')'),
        (this.status = e);
    }
    function ie(e) {
      for (; e.length > 0; ) e.shift()(t);
    }
    function or(e, r, n, i, o) {}
    function oe(e) {
      switch (e) {
        case 1:
          return 0;
        case 2:
          return 1;
        case 4:
          return 2;
        case 8:
          return 3;
        default:
          throw new TypeError('Unknown type size: ' + e);
      }
    }
    function ar() {
      for (var e = new Array(256), r = 0; r < 256; ++r)
        e[r] = String.fromCharCode(r);
      Ue = e;
    }
    var Ue = void 0;
    function C(e) {
      for (var r = '', n = e; T[n]; ) r += Ue[T[n++]];
      return r;
    }
    var ae = {},
      Pe = {},
      sr = 48,
      ur = 57;
    function fr(e) {
      if (e === void 0) return '_unknown';
      e = e.replace(/[^a-zA-Z0-9_]/g, '$');
      var r = e.charCodeAt(0);
      return r >= sr && r <= ur ? '_' + e : e;
    }
    function cr(e, r) {
      return (
        (e = fr(e)),
        new Function(
          'body',
          'return function ' +
            e +
            `() {
    "use strict";    return body.apply(this, arguments);
};
`
        )(r)
      );
    }
    function Se(e, r) {
      var n = cr(r, function (i) {
        (this.name = r), (this.message = i);
        var o = new Error(i).stack;
        o !== void 0 &&
          (this.stack =
            this.toString() +
            `
` +
            o.replace(/^Error(:[^\n]*)?\n/, ''));
      });
      return (
        (n.prototype = Object.create(e.prototype)),
        (n.prototype.constructor = n),
        (n.prototype.toString = function () {
          return this.message === void 0
            ? this.name
            : this.name + ': ' + this.message;
        }),
        n
      );
    }
    var Ce = void 0;
    function x(e) {
      throw new Ce(e);
    }
    function k(e, r, n = {}) {
      if (!('argPackAdvance' in r))
        throw new TypeError(
          'registerType registeredInstance requires argPackAdvance'
        );
      var i = r.name;
      if (
        (e || x('type "' + i + '" must have a positive integer typeid pointer'),
        Pe.hasOwnProperty(e))
      ) {
        if (n.ignoreDuplicateRegistrations) return;
        x("Cannot register type '" + i + "' twice");
      }
      if (((Pe[e] = r), ae.hasOwnProperty(e))) {
        var o = ae[e];
        delete ae[e], o.forEach(s => s());
      }
    }
    function lr(e, r, n, i, o) {
      var s = oe(n);
      (r = C(r)),
        k(e, {
          name: r,
          fromWireType: function (a) {
            return !!a;
          },
          toWireType: function (a, u) {
            return u ? i : o;
          },
          argPackAdvance: 8,
          readValueFromPointer: function (a) {
            var u;
            if (n === 1) u = ne;
            else if (n === 2) u = B;
            else if (n === 4) u = W;
            else throw new TypeError('Unknown boolean type size: ' + r);
            return this.fromWireType(u[a >> s]);
          },
          destructorFunction: null,
        });
    }
    var se = [],
      U = [
        {},
        { value: void 0 },
        { value: null },
        { value: !0 },
        { value: !1 },
      ];
    function dr(e) {
      e > 4 && --U[e].refcount === 0 && ((U[e] = void 0), se.push(e));
    }
    function pr() {
      for (var e = 0, r = 5; r < U.length; ++r) U[r] !== void 0 && ++e;
      return e;
    }
    function mr() {
      for (var e = 5; e < U.length; ++e) if (U[e] !== void 0) return U[e];
      return null;
    }
    function vr() {
      (t.count_emval_handles = pr), (t.get_first_emval = mr);
    }
    var ke = {
      toValue: e => (
        e || x('Cannot use deleted val. handle = ' + e), U[e].value
      ),
      toHandle: e => {
        switch (e) {
          case void 0:
            return 1;
          case null:
            return 2;
          case !0:
            return 3;
          case !1:
            return 4;
          default: {
            var r = se.length ? se.pop() : U.length;
            return (U[r] = { refcount: 1, value: e }), r;
          }
        }
      },
    };
    function ue(e) {
      return this.fromWireType(W[e >> 2]);
    }
    function gr(e, r) {
      (r = C(r)),
        k(e, {
          name: r,
          fromWireType: function (n) {
            var i = ke.toValue(n);
            return dr(n), i;
          },
          toWireType: function (n, i) {
            return ke.toHandle(i);
          },
          argPackAdvance: 8,
          readValueFromPointer: ue,
          destructorFunction: null,
        });
    }
    function hr(e, r) {
      switch (r) {
        case 2:
          return function (n) {
            return this.fromWireType(ye[n >> 2]);
          };
        case 3:
          return function (n) {
            return this.fromWireType(_e[n >> 3]);
          };
        default:
          throw new TypeError('Unknown float type: ' + e);
      }
    }
    function yr(e, r, n) {
      var i = oe(n);
      (r = C(r)),
        k(e, {
          name: r,
          fromWireType: function (o) {
            return o;
          },
          toWireType: function (o, s) {
            return s;
          },
          argPackAdvance: 8,
          readValueFromPointer: hr(r, i),
          destructorFunction: null,
        });
    }
    function _r(e, r, n) {
      switch (r) {
        case 0:
          return n
            ? function (o) {
                return ne[o];
              }
            : function (o) {
                return T[o];
              };
        case 1:
          return n
            ? function (o) {
                return B[o >> 1];
              }
            : function (o) {
                return X[o >> 1];
              };
        case 2:
          return n
            ? function (o) {
                return W[o >> 2];
              }
            : function (o) {
                return S[o >> 2];
              };
        default:
          throw new TypeError('Unknown integer type: ' + e);
      }
    }
    function wr(e, r, n, i, o) {
      r = C(r);
      var s = oe(n),
        a = h => h;
      if (i === 0) {
        var u = 32 - 8 * n;
        a = h => (h << u) >>> u;
      }
      var c = r.includes('unsigned'),
        p = (h, b) => {},
        E;
      c
        ? (E = function (h, b) {
            return p(b, this.name), b >>> 0;
          })
        : (E = function (h, b) {
            return p(b, this.name), b;
          }),
        k(e, {
          name: r,
          fromWireType: a,
          toWireType: E,
          argPackAdvance: 8,
          readValueFromPointer: _r(r, s, i !== 0),
          destructorFunction: null,
        });
    }
    function Er(e, r, n) {
      var i = [
          Int8Array,
          Uint8Array,
          Int16Array,
          Uint16Array,
          Int32Array,
          Uint32Array,
          Float32Array,
          Float64Array,
        ],
        o = i[r];
      function s(a) {
        a = a >> 2;
        var u = S,
          c = u[a],
          p = u[a + 1];
        return new o(re, p, c);
      }
      (n = C(n)),
        k(
          e,
          {
            name: n,
            fromWireType: s,
            argPackAdvance: 8,
            readValueFromPointer: s,
          },
          { ignoreDuplicateRegistrations: !0 }
        );
    }
    function Ar(e, r) {
      r = C(r);
      var n = r === 'std::string';
      k(e, {
        name: r,
        fromWireType: function (i) {
          var o = S[i >> 2],
            s = i + 4,
            a;
          if (n)
            for (var u = s, c = 0; c <= o; ++c) {
              var p = s + c;
              if (c == o || T[p] == 0) {
                var E = p - u,
                  h = Ke(u, E);
                a === void 0
                  ? (a = h)
                  : ((a += String.fromCharCode(0)), (a += h)),
                  (u = p + 1);
              }
            }
          else {
            for (var b = new Array(o), c = 0; c < o; ++c)
              b[c] = String.fromCharCode(T[s + c]);
            a = b.join('');
          }
          return I(i), a;
        },
        toWireType: function (i, o) {
          o instanceof ArrayBuffer && (o = new Uint8Array(o));
          var s,
            a = typeof o == 'string';
          a ||
            o instanceof Uint8Array ||
            o instanceof Uint8ClampedArray ||
            o instanceof Int8Array ||
            x('Cannot pass non-string to std::string'),
            n && a ? (s = Xe(o)) : (s = o.length);
          var u = ce(4 + s + 1),
            c = u + 4;
          if (((S[u >> 2] = s), n && a)) $e(o, c, s + 1);
          else if (a)
            for (var p = 0; p < s; ++p) {
              var E = o.charCodeAt(p);
              E > 255 &&
                (I(c),
                x('String has UTF-16 code units that do not fit in 8 bits')),
                (T[c + p] = E);
            }
          else for (var p = 0; p < s; ++p) T[c + p] = o[p];
          return i !== null && i.push(I, u), u;
        },
        argPackAdvance: 8,
        readValueFromPointer: ue,
        destructorFunction: function (i) {
          I(i);
        },
      });
    }
    var Le = typeof TextDecoder < 'u' ? new TextDecoder('utf-16le') : void 0;
    function Tr(e, r) {
      for (var n = e, i = n >> 1, o = i + r / 2; !(i >= o) && X[i]; ) ++i;
      if (((n = i << 1), n - e > 32 && Le)) return Le.decode(T.subarray(e, n));
      for (var s = '', a = 0; !(a >= r / 2); ++a) {
        var u = B[(e + a * 2) >> 1];
        if (u == 0) break;
        s += String.fromCharCode(u);
      }
      return s;
    }
    function br(e, r, n) {
      if ((n === void 0 && (n = 2147483647), n < 2)) return 0;
      n -= 2;
      for (
        var i = r, o = n < e.length * 2 ? n / 2 : e.length, s = 0;
        s < o;
        ++s
      ) {
        var a = e.charCodeAt(s);
        (B[r >> 1] = a), (r += 2);
      }
      return (B[r >> 1] = 0), r - i;
    }
    function Rr(e) {
      return e.length * 2;
    }
    function Fr(e, r) {
      for (var n = 0, i = ''; !(n >= r / 4); ) {
        var o = W[(e + n * 4) >> 2];
        if (o == 0) break;
        if ((++n, o >= 65536)) {
          var s = o - 65536;
          i += String.fromCharCode(55296 | (s >> 10), 56320 | (s & 1023));
        } else i += String.fromCharCode(o);
      }
      return i;
    }
    function Ur(e, r, n) {
      if ((n === void 0 && (n = 2147483647), n < 4)) return 0;
      for (var i = r, o = i + n - 4, s = 0; s < e.length; ++s) {
        var a = e.charCodeAt(s);
        if (a >= 55296 && a <= 57343) {
          var u = e.charCodeAt(++s);
          a = (65536 + ((a & 1023) << 10)) | (u & 1023);
        }
        if (((W[r >> 2] = a), (r += 4), r + 4 > o)) break;
      }
      return (W[r >> 2] = 0), r - i;
    }
    function Pr(e) {
      for (var r = 0, n = 0; n < e.length; ++n) {
        var i = e.charCodeAt(n);
        i >= 55296 && i <= 57343 && ++n, (r += 4);
      }
      return r;
    }
    function Sr(e, r, n) {
      n = C(n);
      var i, o, s, a, u;
      r === 2
        ? ((i = Tr), (o = br), (a = Rr), (s = () => X), (u = 1))
        : r === 4 && ((i = Fr), (o = Ur), (a = Pr), (s = () => S), (u = 2)),
        k(e, {
          name: n,
          fromWireType: function (c) {
            for (var p = S[c >> 2], E = s(), h, b = c + 4, z = 0; z <= p; ++z) {
              var le = c + 4 + z * r;
              if (z == p || E[le >> u] == 0) {
                var jr = le - b,
                  Oe = i(b, jr);
                h === void 0
                  ? (h = Oe)
                  : ((h += String.fromCharCode(0)), (h += Oe)),
                  (b = le + r);
              }
            }
            return I(c), h;
          },
          toWireType: function (c, p) {
            typeof p != 'string' &&
              x('Cannot pass non-string to C++ string type ' + n);
            var E = a(p),
              h = ce(4 + E + r);
            return (
              (S[h >> 2] = E >> u),
              o(p, h + 4, E + r),
              c !== null && c.push(I, h),
              h
            );
          },
          argPackAdvance: 8,
          readValueFromPointer: ue,
          destructorFunction: function (c) {
            I(c);
          },
        });
    }
    function Cr(e, r) {
      (r = C(r)),
        k(e, {
          isVoid: !0,
          name: r,
          argPackAdvance: 0,
          fromWireType: function () {},
          toWireType: function (n, i) {},
        });
    }
    function kr(e, r, n) {
      T.copyWithin(e, r, r + n);
    }
    function Lr() {
      return 2147483648;
    }
    function Ir(e) {
      try {
        return $.grow((e - re.byteLength + 65535) >>> 16), we($.buffer), 1;
      } catch {}
    }
    function Wr(e) {
      var r = T.length;
      e = e >>> 0;
      var n = Lr();
      if (e > n) return !1;
      let i = (c, p) => c + ((p - (c % p)) % p);
      for (var o = 1; o <= 4; o *= 2) {
        var s = r * (1 + 0.2 / o);
        s = Math.min(s, e + 100663296);
        var a = Math.min(n, i(Math.max(e, s), 65536)),
          u = Ir(a);
        if (u) return !0;
      }
      return !1;
    }
    function Ie(e, r) {
      e < 128 ? r.push(e) : r.push(e % 128 | 128, e >> 7);
    }
    function Mr(e) {
      for (
        var r = { i: 'i32', j: 'i32', f: 'f32', d: 'f64', p: 'i32' },
          n = { parameters: [], results: e[0] == 'v' ? [] : [r[e[0]]] },
          i = 1;
        i < e.length;
        ++i
      )
        n.parameters.push(r[e[i]]), e[i] === 'j' && n.parameters.push('i32');
      return n;
    }
    function Hr(e, r) {
      var n = e.slice(0, 1),
        i = e.slice(1),
        o = { i: 127, p: 127, j: 126, f: 125, d: 124 };
      r.push(96), Ie(i.length, r);
      for (var s = 0; s < i.length; ++s) r.push(o[i[s]]);
      n == 'v' ? r.push(0) : r.push(1, o[n]);
    }
    function Or(e, r) {
      if (typeof WebAssembly.Function == 'function')
        return new WebAssembly.Function(Mr(r), e);
      var n = [1];
      Hr(r, n);
      var i = [0, 97, 115, 109, 1, 0, 0, 0, 1];
      Ie(n.length, i),
        i.push.apply(i, n),
        i.push(2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);
      var o = new WebAssembly.Module(new Uint8Array(i)),
        s = new WebAssembly.Instance(o, { e: { f: e } }),
        a = s.exports.f;
      return a;
    }
    var K = [];
    function We(e) {
      var r = K[e];
      return (
        r || (e >= K.length && (K.length = e + 1), (K[e] = r = M.get(e))), r
      );
    }
    function Nr(e, r) {
      if (L)
        for (var n = e; n < e + r; n++) {
          var i = We(n);
          i && L.set(i, n);
        }
    }
    var L = void 0,
      fe = [];
    function Br() {
      if (fe.length) return fe.pop();
      try {
        M.grow(1);
      } catch (e) {
        throw e instanceof RangeError
          ? 'Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.'
          : e;
      }
      return M.length - 1;
    }
    function Me(e, r) {
      M.set(e, r), (K[e] = M.get(e));
    }
    function xr(e, r) {
      if ((L || ((L = new WeakMap()), Nr(0, M.length)), L.has(e)))
        return L.get(e);
      var n = Br();
      try {
        Me(n, e);
      } catch (o) {
        if (!(o instanceof TypeError)) throw o;
        var i = Or(e, r);
        Me(n, i);
      }
      return L.set(e, n), n;
    }
    function Dr(e) {
      L.delete(We(e)), fe.push(e);
    }
    ar(),
      (Ce = t.BindingError = Se(Error, 'BindingError')),
      (t.InternalError = Se(Error, 'InternalError')),
      vr();
    var Vr = {
      i: or,
      j: lr,
      h: gr,
      e: yr,
      b: wr,
      a: Er,
      d: Ar,
      c: Sr,
      k: Cr,
      g: kr,
      f: Wr,
    };
    tr(),
      (t.___wasm_call_ctors = function () {
        return (t.___wasm_call_ctors = t.asm.m).apply(null, arguments);
      }),
      (t._wrealloc = function () {
        return (t._wrealloc = t.asm.n).apply(null, arguments);
      }),
      (t._wfree = function () {
        return (t._wfree = t.asm.o).apply(null, arguments);
      });
    var I = (t._free = function () {
      return (I = t._free = t.asm.p).apply(null, arguments);
    });
    (t._WErrGetCode = function () {
      return (t._WErrGetCode = t.asm.q).apply(null, arguments);
    }),
      (t._WErrGetMsg = function () {
        return (t._WErrGetMsg = t.asm.r).apply(null, arguments);
      }),
      (t._WErrClear = function () {
        return (t._WErrClear = t.asm.s).apply(null, arguments);
      }),
      (t._parseUTF8 = function () {
        return (t._parseUTF8 = t.asm.u).apply(null, arguments);
      });
    var ce = (t._malloc = function () {
      return (ce = t._malloc = t.asm.v).apply(null, arguments);
    });
    (t.___getTypeName = function () {
      return (t.___getTypeName = t.asm.w).apply(null, arguments);
    }),
      (t.__embind_initialize_bindings = function () {
        return (t.__embind_initialize_bindings = t.asm.x).apply(
          null,
          arguments
        );
      }),
      (t.addOnPostRun = be),
      (t.addFunction = xr),
      (t.removeFunction = Dr);
    var J;
    j = function e() {
      J || He(), J || (j = e);
    };
    function He(e) {
      if (H > 0 || (qe(), H > 0)) return;
      function r() {
        J ||
          ((J = !0),
          (t.calledRun = !0),
          !ge &&
            (Je(),
            g(t),
            t.onRuntimeInitialized && t.onRuntimeInitialized(),
            ze()));
      }
      t.setStatus
        ? (t.setStatus('Running...'),
          setTimeout(function () {
            setTimeout(function () {
              t.setStatus('');
            }, 1),
              r();
          }, 1))
        : r();
    }
    if (t.preInit)
      for (
        typeof t.preInit == 'function' && (t.preInit = [t.preInit]);
        t.preInit.length > 0;

      )
        t.preInit.pop()();
    return He(), t.ready;
  };
})();
let _,
  de = 0;
const qr = async () => (
    (_ = await Xr()),
    _.addOnPostRun(() => {
      de = _._wrealloc(0, 4);
    }),
    await _.ready
  ),
  pe = {
    COLLAPSE_WHITESPACE: 1,
    PERMISSIVE_ATX_HEADERS: 2,
    PERMISSIVE_URL_AUTO_LINKS: 4,
    PERMISSIVE_EMAIL_AUTO_LINKS: 8,
    NO_INDENTED_CODE_BLOCKS: 16,
    NO_HTML_BLOCKS: 32,
    NO_HTML_SPANS: 64,
    TABLES: 256,
    STRIKETHROUGH: 512,
    PERMISSIVE_WWW_AUTOLINKS: 1024,
    TASK_LISTS: 2048,
    LATEX_MATH_SPANS: 4096,
    WIKI_LINKS: 8192,
    UNDERLINE: 16384,
    DEFAULT: 2823,
    NO_HTML: 96,
    COMMONMARK: 0,
    GITHUB: 2820,
  },
  Y = { HTML: 1 << 0, XHTML: 1 << 1, AllowJSURI: 1 << 2 };
function Jr(f, l) {
  l = l || {};
  const t = l.parseFlags === void 0 ? pe.COMMONMARK : l.parseFlags;
  let g = l.allowJSURIs ? Y.AllowJSURI : 0;
  switch (l.format) {
    case 'xhtml':
      g |= Y.HTML | Y.XHTML;
      break;
    case 'html':
    case void 0:
    case null:
    case '':
      g |= Y.HTML;
      break;
    default:
      throw new Error(`[markdown-wasm] invalid format "${l.format}"`);
  }
  const d = l.onCodeBlock ? zr(l.onCodeBlock) : 0,
    m = xe(f),
    y = Yr(R => Zr(m, (P, v) => _._parseUTF8(P, v, t, g, R, d)));
  return l.onCodeBlock && _.removeFunction(d), rn(), l.bytes ? y : Z.decode(y);
}
async function zr(f) {
  return _.addFunction((t, g, d, m, y) => {
    try {
      const R = g > 0 ? Z.decode(HEAPU8.subarray(t, t + g)) : '',
        P = HEAPU8.subarray(d, d + m);
      let v;
      P.toString = () => v || (v = Z.decode(P));
      let F = null;
      if (((F = f(R, P)), F == null)) return -1;
      let A = xe(F);
      if (A.length > 0) {
        const N = De(A, A.length);
        HEAPU32[y >> 2] = N;
      }
      return A.length;
    } catch {
      return -1;
    }
  }, 'iiiiii');
}
function xe(f) {
  return typeof f == 'string'
    ? Z.encode(f)
    : f instanceof Uint8Array
    ? f
    : new Uint8Array(f);
}
const Z = (() => {
  const f = new TextEncoder('utf-8'),
    l = new TextDecoder('utf-8');
  return { encode: t => f.encode(t), decode: t => l.decode(t) };
})();
function Yr(f) {
  const l = f(de);
  let t = _.HEAP32[de >> 2];
  if (t == 0) return null;
  const g = _.HEAPU8.subarray(t, t + l);
  return (g.heapAddr = t), g;
}
function Zr(f, l) {
  const t = f.length,
    g = De(f, t),
    d = l(g, t);
  return _._wfree(g), d;
}
function De(f, l) {
  const t = _._wrealloc(0, l);
  return _.HEAPU8.set(f, t), t;
}
class Qr extends Error {
  constructor(l, t, g, d) {
    super(t, g || 'wasm', d || 0), (this.name = 'WError'), (this.code = l);
  }
}
function en() {
  const f = _._WErrGetCode();
  if (f !== 0) {
    const l = _._WErrGetMsg(),
      t = l != 0 ? UTF8ArrayToString(_.HEAPU8, l) : '';
    return _._WErrClear(), new Qr(f, t);
  }
}
function rn() {
  const f = en();
  if (f) throw f;
}
const sn = await qr(),
  O = document.getElementById('markdown-input'),
  nn = document.getElementById('html-output');
let me = O.value.split(`
`).length;
me <= 3 && (me = 3);
O.rows = me + 1;
let Be;
function Ve() {
  const f = O.value,
    l = Jr(f, { parseFlags: pe.DEFAULT | pe.NO_HTML });
  (nn.innerHTML = l), tn();
}
function tn() {
  if ((clearTimeout(Be), typeof hljs > 'u')) {
    Be = setTimeout(updateCodeSyntaxHighlighting, 500);
    return;
  }
  document.querySelectorAll('pre code[class^="language-"]').forEach(f => {
    hljs.highlightBlock(f);
  });
}
O.addEventListener('input', Ve);
Ve();
window.addEventListener('DOMContentLoaded', () => {
  let f = O.value.split(`
`).length;
  f <= 3 && (f = 3),
    O.setAttribute('rows', f + 1),
    O.addEventListener('input', l);
  function l() {
    (this.style.height = 'auto'),
      (this.style.height = `${this.scrollHeight}px`);
  }
});
var on = {},
  an = Object.freeze({ __proto__: null, default: on });
//# sourceMappingURL=index-f86f14ad.js.map
