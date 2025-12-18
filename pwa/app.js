const state = {
  wallet: null,
  remoteUrl: 'https://electrowallet-sync.glitch.me',
  localLedger: [],
  isAuthenticated: false,
  recoveryPhrase: '',
};

const els = {
  authScreen: document.getElementById('authScreen'),
  createScreen: document.getElementById('createScreen'),
  loginScreen: document.getElementById('loginScreen'),
  recoveryScreen: document.getElementById('recoveryScreen'),
  mainApp: document.getElementById('mainApp'),
  createAccountBtn: document.getElementById('createAccountBtn'),
  loginBtn: document.getElementById('loginBtn'),
  createForm: document.getElementById('createForm'),
  loginForm: document.getElementById('loginForm'),
  cancelCreate: document.getElementById('cancelCreate'),
  cancelLogin: document.getElementById('cancelLogin'),
  recoveryPhrase: document.getElementById('recoveryPhrase'),
  confirmRecovery: document.getElementById('confirmRecovery'),
  logoutBtn: document.getElementById('logoutBtn'),
  address: document.getElementById('address'),
  copyAddress: document.getElementById('copyAddress'),
  balance: document.getElementById('balance'),
  sendBtn: document.getElementById('sendBtn'),
  receiveBtn: document.getElementById('receiveBtn'),
  sendCard: document.getElementById('sendCard'),
  receiveCard: document.getElementById('receiveCard'),
  sendForm: document.getElementById('sendForm'),
  cancelSend: document.getElementById('cancelSend'),
  closeReceive: document.getElementById('closeReceive'),
  receiveAddress: document.getElementById('receiveAddress'),
  copyReceive: document.getElementById('copyReceive'),
  qrCode: document.getElementById('qrCode'),
  txList: document.getElementById('txList'),
  emptyState: document.getElementById('emptyState'),
  status: document.getElementById('status'),
  txTemplate: document.getElementById('txTemplate'),
};

const LS_KEYS = {
  wallet: 'ew_wallet_v3',
  ledger: 'ew_ledger_v3',
  auth: 'ew_auth_v3',
};

function showStatus(msg, isError = false) {
  els.status.textContent = msg;
  els.status.style.background = isError ? 'rgba(220,50,50,0.9)' : 'rgba(0,0,0,0.85)';
  els.status.hidden = false;
  setTimeout(() => { els.status.hidden = true; }, 3000);
}

function randomHex(len) {
  const bytes = crypto.getRandomValues(new Uint8Array(len / 2));
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function generateMnemonic() {
  const words = ['abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance', 'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent', 'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among', 'amount', 'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry', 'animal', 'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique', 'anxiety', 'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arch', 'arctic', 'area', 'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around', 'arrange', 'arrest', 'arrive', 'arrow', 'art', 'artefact', 'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset', 'assist', 'assume', 'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction', 'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado', 'avoid', 'awake', 'aware', 'away', 'awesome', 'awful', 'awkward', 'axis', 'baby', 'bachelor', 'bacon', 'badge', 'bag', 'balance', 'balcony', 'ball', 'bamboo', 'banana', 'banner', 'bar', 'barely', 'bargain', 'barrel', 'base', 'basic', 'basket', 'battle', 'beach', 'bean', 'beauty', 'because', 'become', 'beef', 'before', 'begin', 'behave', 'behind', 'believe', 'below', 'belt', 'bench', 'benefit', 'best', 'betray', 'better', 'between', 'beyond', 'bicycle', 'bid', 'bike', 'bind', 'biology', 'bird', 'birth', 'bitter', 'black', 'blade', 'blame', 'blanket', 'blast', 'bleak', 'bless', 'blind', 'blood', 'blossom', 'blouse', 'blue', 'blur', 'blush', 'board', 'boat', 'body', 'boil', 'bomb', 'bone', 'bonus', 'book', 'boost', 'border', 'boring', 'borrow', 'boss', 'bottom', 'bounce', 'box', 'boy', 'bracket', 'brain', 'brand', 'brass', 'brave', 'bread', 'breeze', 'brick', 'bridge', 'brief', 'bright', 'bring', 'brisk', 'broccoli', 'broken', 'bronze', 'broom', 'brother', 'brown', 'brush', 'bubble', 'buddy', 'budget', 'buffalo', 'build', 'bulb', 'bulk', 'bullet', 'bundle', 'bunker', 'burden', 'burger', 'burst', 'bus', 'business', 'busy', 'butter', 'buyer', 'buzz'];
  const mnemonic = [];
  for (let i = 0; i < 12; i++) {
    mnemonic.push(words[Math.floor(Math.random() * words.length)]);
  }
  return mnemonic.join(' ');
}

function mnemonicToAddress(mnemonic) {
  const encoder = new TextEncoder();
  const data = encoder.encode(mnemonic);
  return crypto.subtle.digest('SHA-256', data).then(hash => {
    const hashArray = Array.from(new Uint8Array(hash));
    const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return 'bc1q' + hex.slice(0, 38);
  });
}

async function hashPin(pin) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function loadState() {
  const auth = JSON.parse(localStorage.getItem(LS_KEYS.auth) || 'null');
  const ledger = JSON.parse(localStorage.getItem(LS_KEYS.ledger) || '[]');
  state.localLedger = ledger;
  state.isAuthenticated = !!auth;
  
  if (auth) {
    state.wallet = { address: auth.address, mnemonic: auth.mnemonic };
  }
}

function persistAuth() {
  if (state.wallet && state.isAuthenticated) {
    localStorage.setItem(LS_KEYS.auth, JSON.stringify({
      address: state.wallet.address,
      mnemonic: state.wallet.mnemonic,
      pinHash: state.wallet.pinHash
    }));
  }
}

function persistLedger() {
  localStorage.setItem(LS_KEYS.ledger, JSON.stringify(state.localLedger));
}

function logout() {
  localStorage.removeItem(LS_KEYS.auth);
  state.wallet = null;
  state.isAuthenticated = false;
  showAuthScreen();
}

function showAuthScreen() {
  els.authScreen.hidden = false;
  els.createScreen.hidden = true;
  els.loginScreen.hidden = true;
  els.recoveryScreen.hidden = true;
  els.mainApp.hidden = true;
}

function showMainApp() {
  els.authScreen.hidden = true;
  els.createScreen.hidden = true;
  els.loginScreen.hidden = true;
  els.recoveryScreen.hidden = true;
  els.mainApp.hidden = false;
}

function computeBalance(ledger, address) {
  const incoming = ledger.filter(t => t.to === address).reduce((s, t) => s + t.amount, 0);
  const outgoing = ledger.filter(t => t.from === address).reduce((s, t) => s + t.amount + t.fee, 0);
  return incoming - outgoing;
}

function satsToBTC(sats) {
  return (sats / 100000000).toFixed(8);
}

function btcToSats(btc) {
  return Math.floor(Number(btc) * 100000000);
}

function mapLedger(ledger, address) {
  return ledger
    .filter(t => t.from === address || t.to === address)
    .sort((a, b) => b.timestamp - a.timestamp)
    .map(t => {
      const outgoing = t.from === address;
      return {
        id: t.id,
        amount: t.amount,
        fee: t.fee,
        timestamp: t.timestamp,
        type: outgoing ? 'Sent' : 'Received',
        counterparty: outgoing ? t.to : t.from,
        confirmed: !!t.confirmed,
      };
    });
}

async function fetchRemoteLedger() {
  const url = new URL('/ledger', state.remoteUrl).toString();
  const res = await fetch(url);
  if (!res.ok) throw new Error('Remote ledger error');
  return res.json();
}

async function postRemoteTx(tx) {
  const url = new URL('/tx', state.remoteUrl).toString();
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tx),
  });
  if (!res.ok) throw new Error('Remote tx failed');
}

function render() {
  els.address.textContent = state.wallet.address;
  els.receiveAddress.textContent = state.wallet.address;
}

function renderLedger(ledger) {
  const balanceSats = computeBalance(ledger, state.wallet.address);
  const balanceBTC = satsToBTC(balanceSats);
  const mapped = mapLedger(ledger, state.wallet.address);
  
  els.balance.textContent = balanceBTC;
  els.emptyState.hidden = mapped.length > 0;
  els.txList.innerHTML = '';
  
  mapped.forEach(tx => {
    const clone = els.txTemplate.content.cloneNode(true);
    const item = clone.querySelector('.tx-item');
    const icon = clone.querySelector('.tx-icon');
    icon.style.background = tx.type === 'Sent' ? '#ff6b6b' : '#51cf66';
    clone.querySelector('.tx-type').textContent = tx.type;
    clone.querySelector('.tx-address').textContent = tx.counterparty.slice(0, 20) + '...';
    const amountBTC = satsToBTC(tx.amount);
    clone.querySelector('.tx-amount').textContent = `${tx.type === 'Sent' ? '-' : '+'}${amountBTC} BTC`;
    clone.querySelector('.tx-amount').style.color = tx.type === 'Sent' ? '#ff6b6b' : '#51cf66';
    els.txList.appendChild(clone);
  });
}

async function refresh() {
  try {
    const remoteLedger = await fetchRemoteLedger();
    const merged = mergeLedgers(state.localLedger, remoteLedger);
    state.localLedger = merged;
    persistLedger();
    renderLedger(merged);
  } catch (e) {
    renderLedger(state.localLedger);
  }
}

function mergeLedgers(local, remote) {
  const seen = new Set(local.map(t => t.id));
  const newTxs = remote.filter(t => !seen.has(t.id));
  return [...local, ...newTxs].sort((a, b) => b.timestamp - a.timestamp);
}

function addLocalTx(tx) {
  state.localLedger.push(tx);
  persistLedger();
}

function buildTx({ from, to, amount, fee = null, confirmed = false }) {
  const id = randomHex(64);
  const now = Math.floor(Date.now() / 1000);
  const calcFee = fee !== null ? fee : Math.max(100, Math.floor(amount / 1000));
  return { id, from, to, amount: Number(amount), fee: calcFee, timestamp: now, confirmed };
}

async function handleSend(to, amountBTC) {
  if (!to || !amountBTC || amountBTC <= 0) throw new Error('Amount and recipient required');
  const amountSats = btcToSats(amountBTC);
  const balance = computeBalance(state.localLedger, state.wallet.address);
  if (amountSats > balance) throw new Error('Insufficient balance');
  
  const tx = buildTx({ from: state.wallet.address, to, amount: amountSats, confirmed: false });
  addLocalTx(tx);
  
  try {
    await postRemoteTx(tx);
  } catch (e) {
    console.warn('Failed to sync tx', e);
  }
  
  await refresh();
}

function setupEvents() {
  els.createAccountBtn.addEventListener('click', () => {
    els.authScreen.hidden = true;
    els.createScreen.hidden = false;
  });

  els.loginBtn.addEventListener('click', () => {
    els.authScreen.hidden = true;
    els.loginScreen.hidden = false;
  });

  els.cancelCreate.addEventListener('click', showAuthScreen);
  els.cancelLogin.addEventListener('click', showAuthScreen);

  els.createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const pin = data.get('pin');
    const confirmPin = data.get('confirmPin');
    
    if (pin !== confirmPin) {
      showStatus('PINs do not match', true);
      return;
    }

    const mnemonic = generateMnemonic();
    const address = await mnemonicToAddress(mnemonic);
    const pinHash = await hashPin(pin);
    
    state.wallet = { address, mnemonic, pinHash };
    state.recoveryPhrase = mnemonic;
    
    els.createScreen.hidden = true;
    els.recoveryScreen.hidden = false;
    els.recoveryPhrase.textContent = mnemonic;
  });

  els.confirmRecovery.addEventListener('click', () => {
    state.isAuthenticated = true;
    persistAuth();
    showMainApp();
    render();
    refresh();
  });

  els.loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const phrase = data.get('phrase').trim();
    const pin = data.get('pin');
    
    const address = await mnemonicToAddress(phrase);
    const pinHash = await hashPin(pin);
    
    state.wallet = { address, mnemonic: phrase, pinHash };
    state.isAuthenticated = true;
    persistAuth();
    
    showMainApp();
    render();
    refresh();
    showStatus('Wallet imported successfully!');
  });

  els.logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout? Make sure you have saved your recovery phrase.')) {
      logout();
    }
  });

  els.copyAddress.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(state.wallet.address);
      showStatus('Address copied!');
    } catch {
      showStatus('Copy failed', true);
    }
  });

  els.copyReceive.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(state.wallet.address);
      showStatus('Address copied!');
    } catch {
      showStatus('Copy failed', true);
    }
  });

  els.sendBtn.addEventListener('click', () => {
    els.sendCard.hidden = false;
    els.receiveCard.hidden = true;
  });

  els.receiveBtn.addEventListener('click', () => {
    els.receiveCard.hidden = false;
    els.sendCard.hidden = true;
  });

  els.cancelSend.addEventListener('click', () => {
    els.sendCard.hidden = true;
    els.sendForm.reset();
  });

  els.closeReceive.addEventListener('click', () => {
    els.receiveCard.hidden = true;
  });

  els.sendForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const to = data.get('to').toString().trim();
    const amount = data.get('amount');
    try {
      await handleSend(to, amount);
      showStatus('Transaction sent!');
      e.target.reset();
      els.sendCard.hidden = true;
    } catch (err) {
      showStatus(err.message, true);
    }
  });

  setInterval(refresh, 5000);
}

async function main() {
  loadState();
  setupEvents();
  
  if (state.isAuthenticated && state.wallet) {
    showMainApp();
    render();
    await refresh();
  } else {
    showAuthScreen();
  }
}

main();
