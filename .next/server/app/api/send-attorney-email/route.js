(()=>{var a={};a.id=352,a.ids=[352],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},31785:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>H,patchFetch:()=>G,routeModule:()=>C,serverHooks:()=>F,workAsyncStorage:()=>D,workUnitAsyncStorage:()=>E});var d={};c.r(d),c.d(d,{POST:()=>B});var e=c(19225),f=c(84006),g=c(8317),h=c(99373),i=c(34775),j=c(98564),k=c(48575),l=c(261),m=c(54365),n=c(90771),o=c(73461),p=c(67798),q=c(92280),r=c(62018),s=c(45696),t=c(47929),u=c(86439),v=c(37527),w=c(45592),x=c(731),y=c(59307);let z=process.env.SUPABASE_SERVICE_ROLE_KEY,A=new y.u(process.env.RESEND_API_KEY);async function B(a){try{let b,{certificateId:c}=await a.json();if(!c)return w.NextResponse.json({error:"Certificate ID required"},{status:400});let d=(0,x.UU)("https://qclacxcgfprkswuiboop.supabase.co",z,{auth:{autoRefreshToken:!1,persistSession:!1}}),{data:e}=await d.from("certificates").select("*").eq("id",c).single();if(!e)return w.NextResponse.json({error:"Certificate not found"},{status:404});let{data:f}=await d.from("profiles").select("legal_name, court_state, court_county, case_number, attorney_name, attorney_email").eq("id",e.user_id).single();if(!f?.attorney_email)return w.NextResponse.json({success:!0,skipped:!0,reason:"No attorney email provided"});let{data:g}=await d.from("course_progress").select("completed_at").eq("user_id",e.user_id).eq("course_type",e.course_type).single(),h=g?.completed_at||e.issued_at,i={coparenting:"Co-Parenting Class",parenting:"Parenting Class",bundle:"Co-Parenting & Parenting Classes"}[e.course_type]||e.course_type,j=`https://www.cursoparapadres.org/verificar/${e.verification_code}`,k=`https://www.cursoparapadres.org/api/certificate/${e.id}`,{data:l,error:m}=await A.emails.send({from:"Putting Kids First <certificates@cursoparapadres.org>",to:[f.attorney_email],subject:`Certificate of Completion - ${f.legal_name}`,html:`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1e40af; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Putting Kids First\xae</h1>
          </div>
          
          <div style="padding: 32px; background-color: #f8fafc;">
            <p style="font-size: 16px; color: #334155;">Dear ${f.attorney_name||"Counselor"},</p>
            
            <p style="font-size: 16px; color: #334155;">
              Your client, <strong>${f.legal_name}</strong>, has successfully completed the 
              <strong>${i}</strong> through Putting Kids First\xae.
            </p>
            
            <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 24px 0;">
              <h2 style="margin-top: 0; color: #1e40af; font-size: 18px;">Certificate Details</h2>
              <table style="width: 100%; font-size: 14px; color: #334155;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Participant:</strong></td>
                  <td style="padding: 8px 0;">${f.legal_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Course:</strong></td>
                  <td style="padding: 8px 0;">${i}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Completion Date:</strong></td>
                  <td style="padding: 8px 0;">${(b=new Date(h),`${(b.getMonth()+1).toString().padStart(2,"0")}/${b.getDate().toString().padStart(2,"0")}/${b.getFullYear()}`)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Certificate #:</strong></td>
                  <td style="padding: 8px 0;">${e.certificate_number}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>State:</strong></td>
                  <td style="padding: 8px 0;">${f.court_state||"N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>County:</strong></td>
                  <td style="padding: 8px 0;">${f.court_county||"N/A"}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Case Number:</strong></td>
                  <td style="padding: 8px 0;">${f.case_number||"N/A"}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${k}" 
                 style="display: inline-block; background-color: #1e40af; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Download Certificate PDF
              </a>
            </div>
            
            <div style="background-color: #eff6ff; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; font-size: 14px; color: #1e40af;">
                <strong>Verify Online:</strong><br>
                <a href="${j}" style="color: #1e40af;">${j}</a>
              </p>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b;">
                Verification Code: <strong>${e.verification_code}</strong>
              </p>
            </div>
            
            <p style="font-size: 14px; color: #64748b; margin-top: 32px;">
              Putting Kids First\xae has been providing court-accepted parenting education since 1993. 
              If you have any questions, please contact us at info@cursoparapadres.org.
            </p>
          </div>
          
          <div style="background-color: #334155; padding: 16px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">
              \xa9 2025 Putting Kids First\xae | 888-777-2298 | info@cursoparapadres.org
            </p>
          </div>
        </div>
      `});if(m)return console.error("Failed to send attorney email:",m),w.NextResponse.json({error:"Failed to send email"},{status:500});return w.NextResponse.json({success:!0,emailId:l?.id})}catch(a){return console.error("Attorney email error:",a),w.NextResponse.json({error:"Internal server error"},{status:500})}}let C=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/send-attorney-email/route",pathname:"/api/send-attorney-email",filename:"route",bundlePath:"app/api/send-attorney-email/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/Users/craigjones/Desktop/cursoparapadres/app/api/send-attorney-email/route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:D,workUnitAsyncStorage:E,serverHooks:F}=C;function G(){return(0,g.patchFetch)({workAsyncStorage:D,workUnitAsyncStorage:E})}async function H(a,b,c){C.isDev&&(0,h.addRequestMeta)(a,"devRequestTimingInternalsEnd",process.hrtime.bigint());let d="/api/send-attorney-email/route";"/index"===d&&(d="/");let e=await C.prepare(a,b,{srcPage:d,multiZoneDraftMode:!1});if(!e)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:g,params:w,nextConfig:x,parsedUrl:y,isDraftMode:z,prerenderManifest:A,routerServerContext:B,isOnDemandRevalidate:D,revalidateOnlyGenerated:E,resolvedPathname:F,clientReferenceManifest:G,serverActionsManifest:H}=e,I=(0,l.normalizeAppPath)(d),J=!!(A.dynamicRoutes[I]||A.routes[F]),K=async()=>((null==B?void 0:B.render404)?await B.render404(a,b,y,!1):b.end("This page could not be found"),null);if(J&&!z){let a=!!A.routes[F],b=A.dynamicRoutes[I];if(b&&!1===b.fallback&&!a){if(x.experimental.adapterPath)return await K();throw new u.NoFallbackError}}let L=null;!J||C.isDev||z||(L="/index"===(L=F)?"/":L);let M=!0===C.isDev||!J,N=J&&!M;H&&G&&(0,j.setReferenceManifestsSingleton)({page:d,clientReferenceManifest:G,serverActionsManifest:H,serverModuleMap:(0,k.createServerModuleMap)({serverActionsManifest:H})});let O=a.method||"GET",P=(0,i.getTracer)(),Q=P.getActiveScopeSpan(),R={params:w,prerenderManifest:A,renderOpts:{experimental:{authInterrupts:!!x.experimental.authInterrupts},cacheComponents:!!x.cacheComponents,supportsDynamicResponse:M,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:x.cacheLife,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>C.onRequestError(a,b,d,B)},sharedContext:{buildId:g}},S=new m.NodeNextRequest(a),T=new m.NodeNextResponse(b),U=n.NextRequestAdapter.fromNodeNextRequest(S,(0,n.signalFromNodeResponse)(b));try{let e=async a=>C.handle(U,R).finally(()=>{if(!a)return;a.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let c=P.getRootSpanAttributes();if(!c)return;if(c.get("next.span_type")!==o.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${c.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=c.get("next.route");if(e){let b=`${O} ${e}`;a.setAttributes({"next.route":e,"http.route":e,"next.span_name":b}),a.updateName(b)}else a.updateName(`${O} ${d}`)}),g=!!(0,h.getRequestMeta)(a,"minimalMode"),j=async h=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!g&&D&&E&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let d=await e(h);a.fetchMetrics=R.renderOpts.fetchMetrics;let i=R.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=R.renderOpts.collectedTags;if(!J)return await (0,q.I)(S,T,d,R.renderOpts.pendingWaitUntil),null;{let a=await d.blob(),b=(0,r.toNodeOutgoingHttpHeaders)(d.headers);j&&(b[t.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==R.renderOpts.collectedRevalidate&&!(R.renderOpts.collectedRevalidate>=t.INFINITE_CACHE)&&R.renderOpts.collectedRevalidate,e=void 0===R.renderOpts.collectedExpire||R.renderOpts.collectedExpire>=t.INFINITE_CACHE?void 0:R.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:d.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:e}}}}catch(b){throw(null==f?void 0:f.isStale)&&await C.onRequestError(a,b,{routerKind:"App Router",routePath:d,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:N,isOnDemandRevalidate:D})},B),b}},l=await C.handleResponse({req:a,nextConfig:x,cacheKey:L,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:D,revalidateOnlyGenerated:E,responseGenerator:k,waitUntil:c.waitUntil,isMinimalMode:g});if(!J)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});g||b.setHeader("x-nextjs-cache",D?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),z&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,r.fromNodeOutgoingHttpHeaders)(l.value.headers);return g&&J||m.delete(t.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,s.getCacheControlHeader)(l.cacheControl)),await (0,q.I)(S,T,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};Q?await j(Q):await P.withPropagatedContext(a.headers,()=>P.trace(o.BaseServerSpan.handleRequest,{spanName:`${O} ${d}`,kind:i.SpanKind.SERVER,attributes:{"http.method":O,"http.target":a.url}},j))}catch(b){if(b instanceof u.NoFallbackError||await C.onRequestError(a,b,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,p.c)({isStaticGeneration:N,isOnDemandRevalidate:D})}),J)throw b;return await (0,q.I)(S,T,new Response(null,{status:500})),null}}},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},77598:a=>{"use strict";a.exports=require("node:crypto")},78335:()=>{},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},96487:()=>{}};var b=require("../../../webpack-runtime.js");b.C(a);var c=b.X(0,[134,813,731,688],()=>b(b.s=31785));module.exports=c})();