// Palette Studio configuration
// Change this number whenever you want WhatsApp enquiries sent to another number.
// Use the full international country code, without +, spaces or dashes.
const WHATSAPP_NUMBER = "918884986006"; // India: +91 8884986006

const loader = document.querySelector(".loader");
window.addEventListener("load", () => setTimeout(() => loader?.classList.add("hide"), 500));

const header = document.querySelector(".site-header");
const nav = document.getElementById("nav");
const toggle = document.getElementById("menuToggle");
let lockedScrollY = 0;

function openMenu(){
  if(!nav || !toggle) return;
  lockedScrollY = window.scrollY;
  nav.classList.add("open");
  toggle.setAttribute("aria-expanded","true");
  toggle.setAttribute("aria-label","Close menu");
  document.documentElement.classList.add("menu-open");
  document.body.classList.add("menu-open");
  document.body.style.top = `-${lockedScrollY}px`;
}
function closeMenu(){
  if(!nav || !toggle) return;
  nav.classList.remove("open");
  toggle.setAttribute("aria-expanded","false");
  toggle.setAttribute("aria-label","Open menu");
  document.documentElement.classList.remove("menu-open");
  document.body.classList.remove("menu-open");
  document.body.style.top = "";
  window.scrollTo(0, lockedScrollY);
}

toggle?.addEventListener("click", () => nav.classList.contains("open") ? closeMenu() : openMenu());

document.querySelectorAll(".nav a").forEach(link => {
  link.addEventListener("click", () => closeMenu());
});

// Close with Escape.
document.addEventListener("keydown", e => { if(e.key === "Escape") closeMenu(); });

// Header state on scroll; it remains fixed and never participates in page flow.
function updateHeader(){ header?.classList.toggle("scrolled", window.scrollY > 30); }
window.addEventListener("scroll", updateHeader, {passive:true});
updateHeader();

// Reveal animations.
const reveals = document.querySelectorAll(".reveal");
if("IntersectionObserver" in window){
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){ entry.target.classList.add("visible"); observer.unobserve(entry.target); }
    });
  }, {threshold:.12});
  reveals.forEach(el => observer.observe(el));
} else { reveals.forEach(el => el.classList.add("visible")); }

// Cursor on desktop.
const dot = document.getElementById("cursorDot");
const ring = document.getElementById("cursorRing");
if(dot && ring && matchMedia("(pointer:fine)").matches){
  window.addEventListener("mousemove", e => {
    dot.style.left = e.clientX + "px"; dot.style.top = e.clientY + "px";
    ring.style.left = e.clientX + "px"; ring.style.top = e.clientY + "px";
  });
  document.querySelectorAll("a,button,.service-card,.gallery-item").forEach(el => {
    el.addEventListener("mouseenter", () => ring.classList.add("active"));
    el.addEventListener("mouseleave", () => ring.classList.remove("active"));
  });
}

// Contact form -> WhatsApp
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const dateInput = document.getElementById("eventDate");
if(dateInput){
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth()+1).padStart(2,"0");
  const dd = String(now.getDate()).padStart(2,"0");
  dateInput.min = `${yyyy}-${mm}-${dd}`;
}
const getFieldError = id => document.querySelector(`[data-error-for="${id}"]`);
function setFieldError(field,message=""){
  const error=getFieldError(field.id);
  field.classList.toggle("invalid",!!message);
  field.setAttribute("aria-invalid",String(!!message));
  if(error) error.textContent=message;
}
function validateField(field){
  const value=field.value.trim();
  if(field.required && !value){ setFieldError(field,"This field is required."); return false; }
  if(field.type === "tel" && value && !/^[0-9 +()-]{10,15}$/.test(value)){ setFieldError(field,"Enter a valid phone number."); return false; }
  if(field.type === "email" && value && !field.validity.valid){ setFieldError(field,"Enter a valid email address."); return false; }
  setFieldError(field); return true;
}
contactForm?.querySelectorAll("input,select,textarea").forEach(field=>{
  field.addEventListener("blur",()=>validateField(field));
  field.addEventListener("input",()=>{if(field.classList.contains("invalid")) validateField(field);});
  field.addEventListener("change",()=>validateField(field));
});
contactForm?.addEventListener("submit",e=>{
  e.preventDefault();
  if(formStatus) formStatus.textContent="";
  const fields=[...contactForm.querySelectorAll("input,select,textarea")];
  if(!fields.map(validateField).every(Boolean)){
    fields.find(f=>f.classList.contains("invalid"))?.focus();
    if(formStatus) formStatus.textContent="Please complete the required fields.";
    return;
  }
  const data=new FormData(contactForm);
  const message=[
    "*New Palette Studio Enquiry*", "",
    `*Name:* ${data.get("name")}`,
    `*Phone / WhatsApp:* ${data.get("phone")}`,
    data.get("email") ? `*Email:* ${data.get("email")}` : null,
    `*Service:* ${data.get("service")}`,
    `*Event Date:* ${data.get("date")}`,
    data.get("message") ? `*Message / Requirements:* ${data.get("message")}` : null
  ].filter(Boolean).join("\n");
  const url=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.location.href=url;
  if(formStatus) formStatus.textContent="Opening WhatsApp with your enquiry…";
});
