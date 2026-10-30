document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('.dhg-signup-bar button').forEach(button=>button.addEventListener('click',()=>{
  button.closest('.dhg-signup-bar').hidden=true;
  window.dispatchEvent(new Event('scroll'));
 }));
});
