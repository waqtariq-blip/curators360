!function(){let e=document.currentScript;if(e){let t,r,o=e.getAttribute("data-short"),i=e.getAttribute("data-path"),n=e.getAttribute("data-is-self-hosted"),a=e.getAttribute("width"),l=e.getAttribute("height"),d=new URL(e.getAttribute("src"));if(o){let e=o.split("?");t=e[0],r=e[1]?`?${e[1]}`:""}if(t){let o=/[0-9]*\.?[0-9]+(px|%)/i,s="tours";i&&(s=i);let p=i=>{let p={allowfullscreen:"",frameborder:0,allow:"camera;microphone;vr;accelerometer;gyroscope;fullscreen",width:a&&o.test(a)?a:"100%",height:l&&o.test(l)?l:"500px","aria-label":t,"aria-labelledby":t,role:"presentation",title:i||"View 360 Tour"},c=document.createElement("iframe");for(let e in c.src=n?`${d.origin}${r}`:`${d.origin}/${s}/${t}${r}`,p)c.setAttribute(e,p[e]);e.parentNode.insertBefore(c,e),document.getElementById(`cp-splash-screen-${t}`)?.remove()};"tours"!==s||n?p():fetch(`${d.origin}/api/tours/${t}/embeddedConfig`).then(e=>{if(200===e.status)return e.json();throw e}).then(r=>{if(r.data.showSplashScreen){var i;let n,s,c,u,h,g;i=r.data,(n=document.createElement("div")).id=`cp-splash-screen-${t}`,n.onclick=()=>p(i.title),n.style=`
          background-color: #000;
          background-image: url(${i.thumbUrl});
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center center;
          width: ${a&&o.test(a)?a:"100%"};
          height: ${l&&o.test(l)?l:"500px"};
          position: relative;
          cursor: pointer;
        `,(s=document.createElement("div")).style=`
          background-color: rgba(0, 0, 0, 0.5);
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          position: absolute;
          z-index: 1;
      `,(c=document.createElement("h3")).innerText=i.title,c.style=`
          color: #fff;
          font-weight: 700;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: 'Lato';
          position: absolute;
          top: 15%;
          left: 20%;
          right: 20%;
          font-size: 30px;
          margin: 0;
          z-index: 2;
        `,(u=document.createElement("div")).style=`
          background-color: #000;
          border-radius: 4px;
          width: 65px;
          height: 65px;
          position: absolute;
          left: 50%;
          z-index: 1;
          transform: translate(-50%, -50%);
          top: 50%;
          z-index: 2;
        `,(h=document.createElement("div")).style=`
          width: 0px;
          height: 0px;
          border-left: 20px solid transparent;
          border-right: 20px solid transparent;
          border-bottom: 30px solid rgb(255, 255, 255);
          position: absolute;
          left: 50%;
          z-index: 2;
          transform: translate(-50%, -50%) rotate(90deg);
          top: 50%;
          margin-left: 3px;
        `,(g=document.createElement("img")).style=`
          position: absolute;
          bottom: 5%;
          left: 50%;
          transform: translateX(-50%);
          width: 200px;
          z-index: 2;
        `,g.src=`${d.origin}/public/powered-by-cp.png`,n.appendChild(c),n.appendChild(s),u.appendChild(h),n.appendChild(u),n.appendChild(g),e.parentNode.insertBefore(n,e)}else p(r.data.title)}).catch(()=>{p()})}}}();