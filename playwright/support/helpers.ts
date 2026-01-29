export function generateOrderNumber(prefixo = "VLO", tamanho = 6) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let sufixo = "";
  
    for (let i = 0; i < tamanho; i++) {
      const idx = Math.floor(Math.random() * chars.length);
      sufixo += chars[idx];
    }
  
    return `${prefixo}-${sufixo}`;
  }