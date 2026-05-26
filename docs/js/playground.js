/* ============================================
   ENCRYPT WEBSITE — Playground JavaScript
   Real interactive demos using Web Crypto API
   ============================================ */

// ============================================
// SECRET GENERATOR
// ============================================
(function() {
  const generateBtn = document.getElementById('generateSecretBtn');
  const output = document.getElementById('secretOutput');
  const entropyDisplay = document.getElementById('entropyDisplay');
  const typeSelect = document.getElementById('secretType');
  
  if (!generateBtn) return;
  
  generateBtn.addEventListener('click', async () => {
    const type = typeSelect.value;
    let length, encoding;
    
    switch(type) {
      case 'jwt': length = 64; encoding = 'hex'; break;
      case 'session': length = 32; encoding = 'hex'; break;
      case 'api_key': length = 32; encoding = 'base64url'; break;
      case 'password': length = 16; encoding = 'password'; break;
      default: length = 32; encoding = 'hex';
    }
    
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    let secret;
    if (encoding === 'hex') {
      secret = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    } else if (encoding === 'base64url') {
      const base64 = btoa(String.fromCharCode(...array));
      secret = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } else {
      const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*-_=+';
      secret = Array.from(array, b => charset[b % charset.length]).join('');
    }
    
    // Animate reveal
    output.style.opacity = '0';
    setTimeout(() => {
      output.textContent = secret;
      output.style.opacity = '1';
    }, 150);
    
    // Calculate entropy
    const entropy = length * 8;
    entropyDisplay.textContent = `${entropy} bits of entropy`;
    entropyDisplay.style.color = entropy >= 256 ? 'var(--success)' : 'var(--cyan)';
  });
  
  // Copy secret
  const copyBtn = document.getElementById('copySecretBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      copyToClipboard(output.textContent, copyBtn);
    });
  }
})();

// ============================================
// PORT SCANNER SIMULATOR
// ============================================
(function() {
  const portInput = document.getElementById('portInput');
  const checkBtn = document.getElementById('checkPortBtn');
  const result = document.getElementById('portResult');
  const visual = document.getElementById('portVisual');
  
  if (!checkBtn) return;
  
  // Common ports and their typical usage
  const commonPorts = {
    22: 'SSH', 80: 'HTTP', 443: 'HTTPS', 3000: 'Node.js',
    3306: 'MySQL', 5432: 'PostgreSQL', 6379: 'Redis',
    8080: 'HTTP Alt', 27017: 'MongoDB', 9200: 'Elasticsearch'
  };
  
  checkBtn.addEventListener('click', () => {
    const port = parseInt(portInput.value, 10);
    
    if (!port || port < 1 || port > 65535) {
      showPortResult('invalid', 'Please enter a valid port (1-65535)');
      return;
    }
    
    // Simulate scan with animation
    visual.innerHTML = '<div style="color:var(--cyan);font-family:var(--font-mono)">Scanning...</div>';
    result.style.opacity = '0';
    
    setTimeout(() => {
      const isWellKnown = port <= 1023;
      const isCommon = commonPorts[port];
      const isAvailable = !isCommon && port > 1024;
      
      if (isWellKnown) {
        showPortResult('warning', `Port ${port} is a well-known system port. Requires root privileges.`);
      } else if (isCommon) {
        showPortResult('error', `Port ${port} is commonly used by ${commonPorts[port]}. Consider using a different port.`);
      } else {
        const suggestions = [port + 1, port + 2].filter(p => p <= 65535);
        showPortResult('success', `Port ${port} appears available! Alternative suggestions: ${suggestions.join(', ')}`);
      }
    }, 800);
  });
  
  function showPortResult(status, message) {
    const colors = {
      success: 'var(--success)',
      warning: '#F59E0B',
      error: 'var(--error)',
      invalid: 'var(--slate)'
    };
    
    const icons = {
      success: 'check-circle',
      warning: 'alert-triangle',
      error: 'x-circle',
      invalid: 'help-circle'
    };
    
    visual.innerHTML = `<i data-lucide="${icons[status]}" style="width:48px;height:48px;color:${colors[status]}"></i>`;
    result.innerHTML = `<span style="color:${colors[status]};font-weight:600">${message}</span>`;
    result.style.opacity = '1';
    lucide.createIcons();
  }
})();

// ============================================
// ENCRYPT/DECRYPT DEMO (Web Crypto API)
// ============================================
(function() {
  const plaintextInput = document.getElementById('plaintextInput');
  const passwordInput = document.getElementById('passwordInput');
  const encryptBtn = document.getElementById('encryptBtn');
  const decryptBtn = document.getElementById('decryptBtn');
  const encryptedOutput = document.getElementById('encryptedOutput');
  const decryptedOutput = document.getElementById('decryptedOutput');
  const encryptStatus = document.getElementById('encryptStatus');
  
  let encryptedData = null;
  let iv = null;
  let salt = null;
  
  if (!encryptBtn) return;
  
  async function deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits', 'deriveKey']
    );
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  encryptBtn.addEventListener('click', async () => {
    const plaintext = plaintextInput.value;
    const password = passwordInput.value;
    
    if (!plaintext || !password) {
      encryptStatus.textContent = 'Please enter both text and password';
      encryptStatus.style.color = 'var(--error)';
      return;
    }
    
    encryptStatus.textContent = 'Encrypting...';
    encryptStatus.style.color = 'var(--cyan)';
    
    try {
      salt = crypto.getRandomValues(new Uint8Array(16));
      iv = crypto.getRandomValues(new Uint8Array(12));
      
      const key = await deriveKey(password, salt);
      const encoder = new TextEncoder();
      const data = encoder.encode(plaintext);
      
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        data
      );
      
      encryptedData = new Uint8Array(encrypted);
      
      // Display as hex
      const hex = Array.from(encryptedData)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      encryptedOutput.textContent = hex.substring(0, 64) + (hex.length > 64 ? '...' : '');
      encryptedOutput.style.opacity = '1';
      encryptStatus.textContent = '✓ Encrypted with AES-256-GCM';
      encryptStatus.style.color = 'var(--success)';
      
      // Enable decrypt
      decryptBtn.disabled = false;
      decryptBtn.style.opacity = '1';
      
    } catch (err) {
      encryptStatus.textContent = 'Encryption failed: ' + err.message;
      encryptStatus.style.color = 'var(--error)';
    }
  });
  
  decryptBtn.addEventListener('click', async () => {
    if (!encryptedData || !iv || !salt) return;
    
    const password = passwordInput.value;
    
    encryptStatus.textContent = 'Decrypting...';
    encryptStatus.style.color = 'var(--cyan)';
    
    try {
      const key = await deriveKey(password, salt);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encryptedData
      );
      
      const decoder = new TextDecoder();
      const plaintext = decoder.decode(decrypted);
      
      decryptedOutput.textContent = plaintext;
      decryptedOutput.style.opacity = '1';
      encryptStatus.textContent = '✓ Decrypted successfully';
      encryptStatus.style.color = 'var(--success)';
      
    } catch (err) {
      encryptStatus.textContent = '✗ Decryption failed — wrong password or corrupted data';
      encryptStatus.style.color = 'var(--error)';
      decryptedOutput.textContent = '';
    }
  });
})();

// ============================================
// TEMPLATE PREVIEW
// ============================================
(function() {
  const presetSelect = document.getElementById('presetSelect');
  const previewOutput = document.getElementById('presetPreview');
  
  if (!presetSelect) return;
  
  const presets = {
    'node-jwt-postgres': {
      name: 'Node.js + JWT + PostgreSQL',
      vars: [
        { name: 'JWT_SECRET', type: 'secret', desc: 'JWT signing secret (auto-generated)' },
        { name: 'SESSION_SECRET', type: 'secret', desc: 'Session encryption secret (auto-generated)' },
        { name: 'DB_HOST', type: 'text', value: 'localhost', desc: 'Database host' },
        { name: 'DB_PORT', type: 'port', value: '5433', desc: 'Database port (auto-detected)' },
        { name: 'DB_NAME', type: 'text', value: 'myapp', desc: 'Database name' },
        { name: 'DB_USER', type: 'text', value: 'postgres', desc: 'Database user' },
        { name: 'DB_PASSWORD', type: 'password', desc: 'Database password' },
        { name: 'API_PORT', type: 'port', value: '3001', desc: 'API server port (auto-detected)' },
        { name: 'NODE_ENV', type: 'text', value: 'development', desc: 'Node environment' }
      ]
    },
    'node-mongodb': {
      name: 'Node.js + MongoDB',
      vars: [
        { name: 'JWT_SECRET', type: 'secret', desc: 'JWT signing secret (auto-generated)' },
        { name: 'MONGODB_URI', type: 'text', value: 'mongodb://localhost:27017/myapp', desc: 'MongoDB connection URI' },
        { name: 'API_PORT', type: 'port', value: '3001', desc: 'API server port (auto-detected)' },
        { name: 'REDIS_URL', type: 'text', value: 'redis://localhost:6379', desc: 'Redis connection URL' },
        { name: 'NODE_ENV', type: 'text', value: 'development', desc: 'Node environment' }
      ]
    },
    'python-django': {
      name: 'Python Django',
      vars: [
        { name: 'SECRET_KEY', type: 'secret', desc: 'Django secret key (auto-generated)' },
        { name: 'DATABASE_URL', type: 'text', value: 'postgres://localhost:5432/myapp', desc: 'Database URL' },
        { name: 'DEBUG', type: 'boolean', value: 'false', desc: 'Debug mode' },
        { name: 'ALLOWED_HOSTS', type: 'text', value: 'localhost,127.0.0.1', desc: 'Allowed hosts' },
        { name: 'DJANGO_SETTINGS_MODULE', type: 'text', value: 'myapp.settings', desc: 'Settings module' }
      ]
    },
    'go-standard': {
      name: 'Go Standard',
      vars: [
        { name: 'JWT_SECRET', type: 'secret', desc: 'JWT signing secret (auto-generated)' },
        { name: 'DB_DSN', type: 'text', value: 'host=localhost port=5432 dbname=myapp', desc: 'Database DSN' },
        { name: 'API_PORT', type: 'port', value: '3001', desc: 'API server port (auto-detected)' },
        { name: 'LOG_LEVEL', type: 'text', value: 'info', desc: 'Log level' },
        { name: 'GO_ENV', type: 'text', value: 'development', desc: 'Go environment' }
      ]
    }
  };
  
  function renderPreset(presetKey) {
    const preset = presets[presetKey];
    if (!preset) return;
    
    let html = `<div style="margin-bottom:1rem;font-family:var(--font-display);font-weight:600;font-size:1.1rem;color:var(--black)">${preset.name}</div>`;
    html += '<div style="display:flex;flex-direction:column;gap:0.5rem">';
    
    preset.vars.forEach((v, i) => {
      const typeColor = v.type === 'secret' ? 'var(--cyan)' : v.type === 'port' ? 'var(--success)' : 'var(--slate)';
      const typeIcon = v.type === 'secret' ? '🔐' : v.type === 'port' ? '🔌' : v.type === 'password' ? '🔑' : '📝';
      
      html += `
        <div style="display:flex;align-items:center;gap:0.75rem;padding:0.625rem 0.875rem;background:var(--off-white);border-radius:10px;border:1px solid var(--border);animation:fadeInUp 0.3s ease-out ${i * 0.05}s both">
          <span style="font-size:1.1rem">${typeIcon}</span>
          <div style="flex:1">
            <div style="font-family:var(--font-mono);font-size:0.8125rem;font-weight:600;color:var(--black)">${v.name}</div>
            <div style="font-size:0.75rem;color:var(--slate)">${v.desc}</div>
          </div>
          <span style="font-size:0.6875rem;padding:0.125rem 0.5rem;border-radius:100px;background:${typeColor}15;color:${typeColor};font-weight:600;text-transform:uppercase">${v.type}</span>
        </div>
      `;
    });
    
    html += '</div>';
    previewOutput.innerHTML = html;
  }
  
  presetSelect.addEventListener('change', () => renderPreset(presetSelect.value));
  renderPreset(presetSelect.value);
})();

