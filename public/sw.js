if(!self.define){let e,t={};const s=(s,n)=>(s=new URL(s+".js",n).href,t[s]||new Promise((t=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=t,document.head.appendChild(e)}else e=s,importScripts(s),t()})).then((()=>{let e=t[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(n,r)=>{const i=e||("document"in self?document.currentScript.src:"")||location.href;if(t[i])return;let o={};const c=e=>s(e,i),u={module:{uri:i},exports:o,require:c};t[i]=Promise.all(n.map((e=>u[e]||c(e)))).then((e=>(r(...e),o)))}}define(["./workbox-87885932"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({response:e})=>e&&"opaqueredirect"===e.type?new Response(e.body,{status:200,statusText:"OK",headers:e.headers}):e}]}),"GET"),e.registerRoute(/.*/i,new e.NetworkOnly({cacheName:"dev",plugins:[]}),"GET")}));
//# sourceMappingURL=sw.js.map
