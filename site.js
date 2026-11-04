document.addEventListener('DOMContentLoaded',()=>{
 const menu=document.querySelector('.menu'),links=document.querySelector('.links');
 const heroHeader=document.querySelector('.header.over-hero');
 if(heroHeader){const updateHeader=()=>heroHeader.classList.toggle('scrolled',window.scrollY>40);updateHeader();window.addEventListener('scroll',updateHeader,{passive:true})}
 if(menu&&links)menu.addEventListener('click',()=>{const open=links.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'×':'☰'});
 const safeStorage={get(key){try{return window.localStorage.getItem(key)}catch{return null}},set(key,value){try{window.localStorage.setItem(key,value);return true}catch{return false}}};
 const banner=document.querySelector('.cookie');
 if(banner&&!safeStorage.get('digibenz-cookie-choice'))banner.classList.add('show');
 document.querySelectorAll('[data-cookie]').forEach(b=>b.addEventListener('click',()=>{safeStorage.set('digibenz-cookie-choice',b.dataset.cookie);banner?.classList.remove('show')}));
 const form=document.querySelector('#enquiry-form');
 if(form)form.addEventListener('submit',async e=>{
  e.preventDefault();if(!form.reportValidity())return;
  const data=new FormData(form),phone=String(data.get('phone')||'').replace(/\D/g,'');
  if(phone.length<10||phone.length>13){alert('Please enter a valid mobile number including country code if needed.');return}
  const button=form.querySelector('[type=submit]');if(button){button.disabled=true;button.textContent='Sending securely…'}
  const payload={full_name:data.get('name'),business_name:data.get('business'),mobile_number:data.get('phone'),email_address:data.get('email'),industry:data.get('industry'),services_required:data.getAll('services'),monthly_budget:data.get('budget'),website_url:data.get('website'),message:data.get('message'),consent:true,company_fax:data.get('company_fax')};
  let timeoutId;
  try{
   const controller=new AbortController();timeoutId=setTimeout(()=>controller.abort(),20000);
   const response=await fetch('https://isezeiucecnxteiiqdzd.supabase.co/functions/v1/submit-website-enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
   const result=await response.json().catch(()=>({}));
   clearTimeout(timeoutId);if(!response.ok)throw new Error(result.error||'Submission failed');
   const notice=document.createElement('div');notice.className='noticeblock';const heading=document.createElement('strong');heading.textContent='Thank you — your enquiry was received.';notice.append(heading,document.createElement('br'),document.createTextNode('We have saved your details securely and the Digibenz team can follow up with you.'));form.replaceChildren(notice);
  }catch(error){clearTimeout(timeoutId);if(button){button.disabled=false;button.textContent='Try again →'}let msg=form.querySelector('.submit-error');if(!msg){msg=document.createElement('p');msg.className='submit-error';msg.setAttribute('role','alert');button?.after(msg)}msg.textContent=(error.name==='AbortError'?'The request timed out. Please try again.':error.message)+' You can also contact info@digibenz.com or WhatsApp us.'}
 });
 const preview=document.querySelector('.industry-lightbox');
 if(preview){
  const image=document.querySelector('#industry-lightbox-image'),title=document.querySelector('#industry-lightbox-title'),platform=document.querySelector('#industry-lightbox-platform'),description=document.querySelector('#industry-lightbox-description');
  document.querySelectorAll('[data-demo-open]').forEach(button=>button.addEventListener('click',()=>{
   image.src=button.dataset.src;image.alt=button.dataset.title+' — illustrative concept';title.textContent=button.dataset.title;platform.textContent=button.dataset.platform;description.textContent=button.dataset.description;preview.showModal();
  }));
  preview.querySelector('[data-demo-close]')?.addEventListener('click',()=>preview.close());
  preview.addEventListener('click',event=>{if(event.target===preview)preview.close()});
 }

 const portfolioPreview=document.querySelector('.portfolio-lightbox');
 if(portfolioPreview){
  const previewImage=portfolioPreview.querySelector('#portfolio-preview-image'),previewTitle=portfolioPreview.querySelector('#portfolio-preview-title');
  document.querySelectorAll('[data-portfolio-open]').forEach(button=>button.addEventListener('click',()=>{previewImage.src=button.dataset.src;previewImage.alt=button.dataset.title+' design direction';previewTitle.textContent=button.dataset.title;portfolioPreview.showModal()}));
  portfolioPreview.querySelector('[data-portfolio-close]')?.addEventListener('click',()=>portfolioPreview.close());
  portfolioPreview.addEventListener('click',event=>{if(event.target===portfolioPreview)portfolioPreview.close()});
 }

 document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>b.classList.remove('active'));button.classList.add('active');const category=button.dataset.filter;document.querySelectorAll('[data-category]').forEach(card=>card.classList.toggle('hide',category!=='all'&&card.dataset.category!==category))}));
});