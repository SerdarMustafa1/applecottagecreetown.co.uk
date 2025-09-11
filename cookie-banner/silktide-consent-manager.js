(function(){
  var KEY = 'silktideCookieBanner_InitialChoice';
  function hide(el){ if(el && el.parentNode){ el.parentNode.removeChild(el); } }
  function createBanner(cfg){
    if (localStorage.getItem(KEY)) return;
    var banner = document.createElement('div');
    banner.id = 'cookieBanner';
    banner.setAttribute('role','dialog');
    banner.setAttribute('aria-live','polite');
    var wrap = document.createElement('div'); wrap.className='wrap';
    var p = document.createElement('p');
    p.innerHTML = (cfg && cfg.text && cfg.text.banner && cfg.text.banner.description) || 'We use cookies to improve your experience.';
    var actions = document.createElement('div'); actions.className = 'actions';
    var accept = document.createElement('button'); accept.className='btn primary';
    accept.textContent = (cfg && cfg.text && cfg.text.banner && cfg.text.banner.acceptAllButtonText) || 'Accept all';
    var reject = document.createElement('button'); reject.className='btn';
    reject.textContent = (cfg && cfg.text && cfg.text.banner && cfg.text.banner.rejectNonEssentialButtonText) || 'Reject non-essential';
    accept.addEventListener('click', function(){
      try{ localStorage.setItem(KEY,'1'); }catch(e){}
      hide(banner);
      document.dispatchEvent(new CustomEvent('cookie-consent-accepted'));
    });
    reject.addEventListener('click', function(){
      try{ localStorage.setItem(KEY,'0'); }catch(e){}
      hide(banner);
      document.dispatchEvent(new CustomEvent('cookie-consent-rejected'));
    });
    actions.appendChild(accept); actions.appendChild(reject);
    wrap.appendChild(p); wrap.appendChild(actions); banner.appendChild(wrap);
    document.body.appendChild(banner);
  }
  function addPrefs(){
    var btn = document.createElement('button'); btn.id='cookiePrefsBtn'; btn.type='button'; btn.textContent='Cookie preferences';
    btn.addEventListener('click', function(){
      try{ localStorage.removeItem(KEY);}catch(e){}
      var cfg = (window.silktideCookieBannerManager && window.silktideCookieBannerManager.__cfg) || {};
      createBanner(cfg);
    });
    document.body.appendChild(btn);
  }
  window.silktideCookieBannerManager = window.silktideCookieBannerManager || {};
  window.silktideCookieBannerManager.updateCookieBannerConfig = function(cfg){
    window.silktideCookieBannerManager.__cfg = cfg || {};
  };
  document.addEventListener('DOMContentLoaded', function(){
    var cfg = (window.silktideCookieBannerManager && window.silktideCookieBannerManager.__cfg) || {};
    createBanner(cfg);
    addPrefs();
  });
})();

