document.addEventListener('DOMContentLoaded',()=>{
 const menu=document.querySelector('.menu'),links=document.querySelector('.links');
 const heroHeader=document.querySelector('.header.over-hero');
 if(heroHeader){const updateHeader=()=>heroHeader.classList.toggle('scrolled',window.scrollY>40);updateHeader();window.addEventListener('scroll',updateHeader,{passive:true})}
 if(menu&&links)menu.addEventListener('click',()=>{const open=links.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.textContent=open?'×':'☰'});
 const enquiryForms=document.querySelectorAll('form#enquiry-form');
 const web3formsAccessKey='15075c22-b165-42af-bcba-9b6cd1253469';
 enquiryForms.forEach(form=>{
  let isSubmitting=false,databaseSaved=false,pendingPayload=null,pendingEmailData=null;
  if(!form.querySelector('[name="botcheck"]')){
   const botcheck=document.createElement('input');botcheck.type='checkbox';botcheck.name='botcheck';botcheck.style.display='none';botcheck.tabIndex=-1;botcheck.autocomplete='off';form.append(botcheck);
  }
  form.addEventListener('submit',async e=>{
   e.preventDefault();if(isSubmitting)return;
   if(!databaseSaved&&!form.reportValidity())return;
   const button=form.querySelector('[type=submit]');
   const data=databaseSaved?pendingEmailData:new FormData(form);
   const phone=String(data?.get('phone')||'').replace(/\D/g,'');
   if(!databaseSaved&&(phone.length<10||phone.length>13)){alert('Please enter a valid mobile number including country code if needed.');return}
   if(!databaseSaved&&(String(data?.get('company_fax')||'').trim()||data?.get('botcheck')))return;
   if(!databaseSaved){
    pendingPayload={full_name:data.get('name'),business_name:data.get('business'),mobile_number:data.get('phone'),email_address:data.get('email'),industry:data.get('industry'),services_required:data.getAll('services'),monthly_budget:data.get('budget'),website_url:data.get('website'),message:data.get('message'),consent:true,company_fax:data.get('company_fax')};
    pendingEmailData=new FormData();for(const [key,value] of data.entries())pendingEmailData.append(key,value);
    pendingEmailData.set('access_key',web3formsAccessKey);
    pendingEmailData.set('subject','New Lead from DigiBenz Website');
    pendingEmailData.set('from_name','Digibenz Technologies Website');
    pendingEmailData.delete('company_fax');
   }
   isSubmitting=true;if(button){button.disabled=true;button.textContent=databaseSaved?'Sending email notification…':'Sending securely…'}
   let timeoutId;
   try{
    if(!databaseSaved){
     const controller=new AbortController();timeoutId=setTimeout(()=>controller.abort(),20000);
     const response=await fetch('https://isezeiucecnxteiiqdzd.supabase.co/functions/v1/submit-website-enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(pendingPayload),signal:controller.signal});
     const result=await response.json().catch(()=>({}));clearTimeout(timeoutId);timeoutId=null;
     if(!response.ok)throw new Error(result.error||'We could not save your enquiry. Please try again.');
     databaseSaved=true;
    }
    const controller=new AbortController();timeoutId=setTimeout(()=>controller.abort(),20000);
    const response=await fetch('https://api.web3forms.com/submit',{method:'POST',body:pendingEmailData,signal:controller.signal});
    const result=await response.json().catch(()=>({}));clearTimeout(timeoutId);timeoutId=null;
    if(!response.ok||result.success!==true)throw new Error(result.message||'The email notification could not be sent.');
    const notice=document.createElement('div');notice.className='noticeblock';const heading=document.createElement('strong');heading.textContent='Thank you — your enquiry was received.';notice.append(heading,document.createElement('br'),document.createTextNode('Your details have been saved securely and the Digibenz team has been notified.'));form.replaceChildren(notice);
   }catch(error){
    clearTimeout(timeoutId);
    if(button){button.disabled=false;button.textContent=databaseSaved?'Retry email notification →':'Try again →'}
    if(databaseSaved)form.querySelectorAll('input,select,textarea').forEach(field=>{field.disabled=true});
    let msg=form.querySelector('.submit-error');if(!msg){msg=document.createElement('p');msg.className='submit-error';msg.setAttribute('role','alert');button?.after(msg)}
    const detail=error.name==='AbortError'?'The request timed out. Please try again.':error.message;
    msg.textContent=(databaseSaved?'We saved your enquiry, but the email notification is still pending. '+detail+' Use the retry button to try again. ':detail+' ')+ 'You can also contact info@digibenz.com or WhatsApp us.';
   }finally{isSubmitting=false}
  });
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
