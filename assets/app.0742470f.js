import{a5 as i,l as u,Q as o,a6 as l,u as c,S as d,h as f,a7 as m,a8 as h,a9 as A,aa as g,ab as y,ac as P,ad as v,ae as b,af as w,ag as C,ah as _,ai as R,W as D}from"./chunks/framework.9824a806.js";import{t as r}from"./chunks/theme.83ee6c27.js";const E={extends:r,Layout:()=>i(r.Layout,null,{}),enhanceApp(){}};function p(e){if(e.extends){const a=p(e.extends);return{...a,...e,async enhanceApp(t){a.enhanceApp&&await a.enhanceApp(t),e.enhanceApp&&await e.enhanceApp(t)}}}return e}const s=p(E),L=u({name:"VitePressApp",setup(){const{site:e}=c();return d(()=>{f(()=>{document.documentElement.lang=e.value.lang,document.documentElement.dir=e.value.dir})}),m(),h(),A(),s.setup&&s.setup(),()=>i(s.Layout)}});async function T(){const e=O(),a=x();a.provide(g,e);const t=y(e.route);return a.provide(P,t),a.component("Content",v),a.component("ClientOnly",b),Object.defineProperties(a.config.globalProperties,{$frontmatter:{get(){return t.frontmatter.value}},$params:{get(){return t.page.value.params}}}),s.enhanceApp&&await s.enhanceApp({app:a,router:e,siteData:w}),{app:a,router:e,data:t}}function x(){return C(L)}function O(){let e=o,a;return _(t=>{let n=R(t);return n?(e&&(a=n),(e||a===n)&&(n=n.replace(/\.js$/,".lean.js")),o&&(e=!1),D(()=>import(n),[])):null},s.NotFound)}o&&T().then(({app:e,router:a,data:t})=>{a.go().then(()=>{l(a.route,t.site),e.mount("#app")})});export{T as createApp};