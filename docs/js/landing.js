/* ============================================
   ENCRYPT WEBSITE — Landing Page JavaScript
   ============================================ */

// Hero word animation
(function() {
  const title = document.querySelector('.hero-title');
  if (!title) return;
  
  const text = title.innerHTML;
  const words = text.split(/(<[^>]+>)/).filter(Boolean);
  
  title.innerHTML = words.map((word, i) => {
    if (word.startsWith('<')) return word;
    return word.split(' ').map(w => 
      w ? `<span class="word" style="animation-delay: ${i * 0.1}s">${w}</span>` : ''
    ).join(' ');
  }).join('');
})();

// Terminal typing animation
(function() {
  const terminal = document.querySelector('.terminal-body');
  if (!terminal) return;
  
  const lines = [
    { type: 'command', text: 'envcrypt init', delay: 500 },
    { type: 'output', text: '', delay: 300 },
    { type: 'output', text: '🔐 envcrypt initialization', delay: 100 },
    { type: 'output', text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', delay: 50 },
    { type: 'output', text: '', delay: 50 },
    { type: 'output', text: '? Project name: my-awesome-api', delay: 200 },
    { type: 'output', text: '? Generate JWT secret? Yes', delay: 200 },
    { type: 'output', text: '? Database port (detected free: 5433): 5433', delay: 200 },
    { type: 'output', text: '? API port (detected free: 3001): 3001', delay: 200 },
    { type: 'output', text: '', delay: 100 },
    { type: 'success', text: '✓ Generated cryptographically secure secrets', delay: 300 },
    { type: 'success', text: '✓ Detected safe ports: 5433, 3001', delay: 200 },
    { type: 'success', text: '✓ Encrypted 8 variables into .env.enc', delay: 200 },
    { type: 'output', text: '', delay: 100 },
    { type: 'success', text: '🎉 Your environment is locked!', delay: 300 },
  ];
  
  let currentLine = 0;
  
  function addLine(line) {
    const div = document.createElement('div');
    div.className = 'terminal-line';
    
    if (line.type === 'command') {
      div.innerHTML = `<span class="prompt">$</span> <span class="command">${line.text}</span>`;
    } else if (line.type === 'success') {
      div.innerHTML = `<span class="success">${line.text}</span>`;
    } else {
      div.innerHTML = `<span class="output">${line.text}</span>`;
    }
    
    div.style.animationDelay = '0s';
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
  }
  
  function typeNext() {
    if (currentLine >= lines.length) {
      // Add cursor at end
      const cursorDiv = document.createElement('div');
      cursorDiv.className = 'terminal-line';
      cursorDiv.innerHTML = '<span class="prompt">$</span> <span class="terminal-cursor"></span>';
      terminal.appendChild(cursorDiv);
      return;
    }
    
    const line = lines[currentLine];
    currentLine++;
    
    setTimeout(() => {
      addLine(line);
      typeNext();
    }, line.delay);
  }
  
  // Start after a short delay
  setTimeout(typeNext, 1000);
})();

// Trust bar counter animation
(function() {
  const counters = document.querySelectorAll('.trust-number');
  if (!counters.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 2000;
        const start = performance.now();
        
        function update(currentTime) {
          const elapsed = currentTime - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          const current = Math.floor(eased * target);
          
          if (target >= 1000) {
            el.textContent = (current / 1000).toFixed(1) + 'k' + suffix;
          } else {
            el.textContent = current + suffix;
          }
          
          if (progress < 1) {
            requestAnimationFrame(update);
          }
        }
        
        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(counter => observer.observe(counter));
})();

// FAQ accordion
(function() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      
      // Close all others
      faqItems.forEach(other => {
        if (other !== item) other.classList.remove('open');
      });
      
      // Toggle current
      item.classList.toggle('open', !isOpen);
    });
  });
})();

// Install command copy
(function() {
  const installBtn = document.querySelector('.hero-install');
  if (!installBtn) return;
  
  installBtn.addEventListener('click', () => {
    const text = 'npm install -g envcrypt';
    copyToClipboard(text, installBtn);
  });
})();
