// SwiftShip demo data is stored in this browser using localStorage.
const read = (key) => JSON.parse(localStorage.getItem(key) || "[]");
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const makeId = (prefix, list) => prefix + String(10001 + list.length).padStart(4, "0");
const today = new Date().toISOString().slice(0,10);

const bookingForm = document.getElementById("bookingForm");
if (bookingForm) {
  bookingForm.elements.bookingDate.value = today;
  bookingForm.addEventListener("submit", e => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(bookingForm).entries());
    const parcels = read("ss_parcels");
    const parcel = {id:makeId("SS",parcels), customerName:f.senderName, email:f.email, phone:f.phone,
      senderAddress:f.senderAddress, receiverName:f.receiverName, receiverPhone:f.receiverPhone,
      receiverAddress:f.receiverAddress, weight:Number(f.weight), bookingDate:f.bookingDate, status:"Booked"};
    parcels.push(parcel); save("ss_parcels",parcels);
    const updates = read("ss_updates"); updates.push({parcelId:parcel.id,location:f.senderAddress,status:"Booked",note:"Booking created",updatedAt:new Date().toLocaleString()}); save("ss_updates",updates);
    document.getElementById("bookingMessage").textContent = `Booking successful! Your parcel ID is ${parcel.id}. Save this ID to track your parcel.`;
    bookingForm.reset(); bookingForm.elements.bookingDate.value=today;
  });
}

const trackForm = document.getElementById("trackForm");
if (trackForm) trackForm.addEventListener("submit", e => {
  e.preventDefault(); const id=document.getElementById("trackId").value.trim().toUpperCase();
  const parcel=read("ss_parcels").find(p=>p.id===id); const updates=read("ss_updates").filter(u=>u.parcelId===id).reverse();
  const area=document.getElementById("trackingResult");
  if(!parcel){area.innerHTML='<div class="empty-state">No parcel found. Check the ID or create a booking first.</div>';return;}
  area.innerHTML=`<div class="tracking-card"><h3>Parcel ${parcel.id}</h3><p>Receiver: ${escapeHtml(parcel.receiverName)} · Booked: ${escapeHtml(parcel.bookingDate)}</p><span class="status-tag">${escapeHtml(parcel.status)}</span><h3 style="margin-top:22px">Tracking history</h3>${updates.map(u=>`<p><strong>${escapeHtml(u.status)}</strong> — ${escapeHtml(u.location)}<br><small>${escapeHtml(u.updatedAt)} ${u.note?'· '+escapeHtml(u.note):''}</small></p>`).join("")}</div>`;
});

const customerForm=document.getElementById("customerForm");
if(customerForm){renderCustomers();customerForm.addEventListener("submit",e=>{e.preventDefault();const f=Object.fromEntries(new FormData(customerForm).entries());const list=read("ss_customers");list.push({id:list.length+1,...f});save("ss_customers",list);customerForm.reset();document.getElementById("customerMessage").textContent="Customer saved successfully.";renderCustomers();});}
function renderCustomers(){const el=document.getElementById("customersTable");if(!el)return;const list=read("ss_customers");el.innerHTML=list.length?list.map(c=>`<tr><td>${c.id}</td><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.email)}</td><td>${escapeHtml(c.phone)}</td><td>${escapeHtml(c.address)}</td></tr>`).join(""):'<tr><td colspan="5">No customer records yet.</td></tr>';}

const updateForm=document.getElementById("updateForm");
if(updateForm){renderUpdates();updateForm.addEventListener("submit",e=>{e.preventDefault();const f=Object.fromEntries(new FormData(updateForm).entries());const parcels=read("ss_parcels");const parcel=parcels.find(p=>p.id===f.parcelId.trim().toUpperCase());if(!parcel){document.getElementById("updateMessage").textContent="Parcel ID not found. Book the parcel first.";return;}parcel.status=f.status;save("ss_parcels",parcels);const list=read("ss_updates");list.push({parcelId:parcel.id,location:f.location,status:f.status,note:f.note,updatedAt:new Date().toLocaleString()});save("ss_updates",list);document.getElementById("updateMessage").textContent="Tracking update saved.";updateForm.reset();renderUpdates();});}
function renderUpdates(){const el=document.getElementById("updatesTable");if(!el)return;const list=read("ss_updates").slice().reverse();el.innerHTML=list.length?list.map(u=>`<tr><td>${escapeHtml(u.parcelId)}</td><td>${escapeHtml(u.location)}</td><td>${escapeHtml(u.status)}</td><td>${escapeHtml(u.updatedAt)}</td></tr>`).join(""):'<tr><td colspan="4">No updates yet.</td></tr>';}

const paymentForm=document.getElementById("paymentForm");
if(paymentForm){renderPayments();paymentForm.addEventListener("submit",e=>{e.preventDefault();const f=Object.fromEntries(new FormData(paymentForm).entries());const parcel=read("ss_parcels").find(p=>p.id===f.parcelId.trim().toUpperCase());if(!parcel){document.getElementById("paymentMessage").textContent="Parcel ID not found. Book the parcel first.";return;}const list=read("ss_payments");list.push({id:list.length+1,parcelId:parcel.id,amount:Number(f.amount),method:f.method,status:f.status});save("ss_payments",list);document.getElementById("paymentMessage").textContent="Payment record saved.";paymentForm.reset();renderPayments();});}
function renderPayments(){const el=document.getElementById("paymentsTable");if(!el)return;const list=read("ss_payments");el.innerHTML=list.length?list.map(p=>`<tr><td>${p.id}</td><td>${escapeHtml(p.parcelId)}</td><td>₹${p.amount.toFixed(2)}</td><td>${escapeHtml(p.method)}</td><td>${escapeHtml(p.status)}</td></tr>`).join(""):'<tr><td colspan="5">No payment records yet.</td></tr>';}
function escapeHtml(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
